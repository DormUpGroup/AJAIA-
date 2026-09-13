import "server-only";

import {
  canAccessDocument,
  canEditDocument,
  canManageSharing,
  isOwner,
} from "@/lib/access";
import { getMockUserById } from "@/lib/auth/mock-users";
import { normalizeDocumentTitle } from "@/lib/document-title";
import type {
  ActionError,
  ActionResult,
  DocumentEditorData,
  DocumentListItem,
  DocumentPerson,
} from "@/lib/document-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Document, Json } from "@/lib/supabase/types";
import { EMPTY_TIPTAP_DOC } from "@/lib/tiptap-doc";
import { textToTiptapDoc, titleFromFilename, validateTxtFile } from "@/lib/upload";

export function requireMockUserId(userId: string): ActionError | null {
  if (!getMockUserById(userId)) {
    return { error: "Unknown user" };
  }
  return null;
}

function asError(message: string): ActionError {
  return { error: message };
}

async function ownerNamesById(ownerIds: string[]) {
  const uniqueIds = [...new Set(ownerIds)];
  if (uniqueIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .in("id", uniqueIds);

  if (error) {
    throw new Error("Could not load documents");
  }

  return new Map((data ?? []).map((user) => [user.id, user.name]));
}

async function toListItems(
  rows: Pick<Document, "id" | "title" | "owner_id" | "created_at" | "updated_at">[],
): Promise<DocumentListItem[]> {
  const names = await ownerNamesById(rows.map((row) => row.owner_id));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    owner_id: row.owner_id,
    owner_name: names.get(row.owner_id) ?? "Unknown",
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function listOwnedDocuments(
  userId: string,
): Promise<ActionResult<DocumentListItem[]>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, owner_id, created_at, updated_at")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return asError("Could not load owned documents");
  }

  return { data: await toListItems(data ?? []) };
}

export async function listSharedDocuments(
  userId: string,
): Promise<ActionResult<DocumentListItem[]>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const supabase = createSupabaseServerClient();
  const { data: shares, error: shareError } = await supabase
    .from("document_shares")
    .select("document_id")
    .eq("user_id", userId);

  if (shareError) {
    return asError("Could not load shared documents");
  }

  const ids = (shares ?? []).map((share) => share.document_id);
  if (ids.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, owner_id, created_at, updated_at")
    .in("id", ids)
    .neq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return asError("Could not load shared documents");
  }

  return { data: await toListItems(data ?? []) };
}

export async function createDocument(
  userId: string,
): Promise<ActionResult<{ id: string }>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: "Untitled",
      owner_id: userId,
      content: EMPTY_TIPTAP_DOC,
    })
    .select("id")
    .single();

  if (error || !data) {
    return asError("Could not create document");
  }

  return { data: { id: data.id } };
}

export async function importTxtDocument(
  userId: string,
  file: File,
): Promise<ActionResult<{ id: string }>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const fileError = validateTxtFile(file);
  if (fileError) {
    return asError(fileError);
  }

  const text = await file.text();
  const title = normalizeDocumentTitle(titleFromFilename(file.name));
  const content = textToTiptapDoc(text);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      owner_id: userId,
      content,
    })
    .select("id")
    .single();

  if (error || !data) {
    return asError("Could not import document");
  }

  return { data: { id: data.id } };
}

export async function getAccessibleDocument(
  userId: string,
  documentId: string,
): Promise<ActionResult<DocumentEditorData>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const loaded = await loadDocumentAndShares(documentId);
  if (!loaded.ok) {
    return asError(loaded.message);
  }

  if (!canAccessDocument(userId, loaded.document, loaded.shares)) {
    return asError("You do not have access to this document");
  }

  return { data: toEditorData(userId, loaded.document, loaded.shares) };
}

function toEditorData(
  userId: string,
  document: Document,
  shares: { user_id: string; role: "editor" }[],
): DocumentEditorData {
  const owner = getMockUserById(document.owner_id);
  const people: DocumentPerson[] = [
    {
      id: document.owner_id,
      name: owner?.name ?? "Unknown",
      email: owner?.email ?? "",
      role: "owner",
    },
  ];

  for (const share of shares) {
    const user = getMockUserById(share.user_id);
    if (!user || user.id === document.owner_id) {
      continue;
    }
    people.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "editor",
    });
  }

  return {
    document,
    owner_name: owner?.name ?? "Unknown",
    is_owner: isOwner(userId, document),
    people,
  };
}

async function loadDocumentAndShares(documentId: string) {
  const supabase = createSupabaseServerClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("id, title, content, owner_id, created_at, updated_at")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    return { ok: false as const, message: "Could not load document" };
  }

  if (!document) {
    return { ok: false as const, message: "Document not found" };
  }

  const { data: shares, error: shareError } = await supabase
    .from("document_shares")
    .select("user_id, role")
    .eq("document_id", documentId);

  if (shareError) {
    return { ok: false as const, message: "Could not load document" };
  }

  return { ok: true as const, document, shares: shares ?? [] };
}

export async function shareDocument(
  userId: string,
  documentId: string,
  targetUserId: string,
): Promise<ActionResult<{ people: DocumentPerson[] }>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  if (!getMockUserById(targetUserId)) {
    return asError("Unknown user");
  }

  const loaded = await loadDocumentAndShares(documentId);
  if (!loaded.ok) {
    return asError(loaded.message);
  }

  const { document, shares } = loaded;

  if (!canManageSharing(userId, document)) {
    return asError("Only the owner can share this document");
  }

  if (targetUserId === document.owner_id) {
    return asError("You cannot share this document with yourself");
  }

  if (shares.some((share) => share.user_id === targetUserId)) {
    return asError("Already shared with this user");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("document_shares").insert({
    document_id: documentId,
    user_id: targetUserId,
    role: "editor",
  });

  if (error) {
    if (error.code === "23505") {
      return asError("Already shared with this user");
    }
    return asError("Could not share document");
  }

  const nextShares = [...shares, { user_id: targetUserId, role: "editor" as const }];
  return { data: { people: toEditorData(userId, document, nextShares).people } };
}

export async function unshareDocument(
  userId: string,
  documentId: string,
  targetUserId: string,
): Promise<ActionResult<{ people: DocumentPerson[] }>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const loaded = await loadDocumentAndShares(documentId);
  if (!loaded.ok) {
    return asError(loaded.message);
  }

  const { document, shares } = loaded;

  if (!canManageSharing(userId, document)) {
    return asError("Only the owner can manage sharing");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("document_shares")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", targetUserId);

  if (error) {
    return asError("Could not update sharing");
  }

  const nextShares = shares.filter((share) => share.user_id !== targetUserId);
  return { data: { people: toEditorData(userId, document, nextShares).people } };
}

export async function updateDocument(
  userId: string,
  documentId: string,
  patch: { title: string; content: Json },
): Promise<ActionResult<{ updated_at: string }>> {
  const invalid = requireMockUserId(userId);
  if (invalid) {
    return invalid;
  }

  const supabase = createSupabaseServerClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("id, title, content, owner_id, created_at, updated_at")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    return asError("Could not save document");
  }

  if (!document) {
    return asError("Document not found");
  }

  const { data: shares, error: shareError } = await supabase
    .from("document_shares")
    .select("user_id, role")
    .eq("document_id", documentId);

  if (shareError) {
    return asError("Could not save document");
  }

  if (!canEditDocument(userId, document, shares ?? [])) {
    return asError("You cannot edit this document");
  }

  const updatedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("documents")
    .update({
      title: normalizeDocumentTitle(patch.title),
      content: patch.content,
      updated_at: updatedAt,
    })
    .eq("id", documentId);

  if (updateError) {
    return asError("Could not save document");
  }

  return { data: { updated_at: updatedAt } };
}
