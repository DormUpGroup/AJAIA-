"use server";

import {
  createDocument,
  getAccessibleDocument,
  importTxtDocument,
  listOwnedDocuments,
  listSharedDocuments,
  shareDocument,
  unshareDocument,
  updateDocument,
} from "@/lib/documents";
import type { Json } from "@/lib/supabase/types";

export async function importTxtDocumentAction(
  currentUserId: string,
  formData: FormData,
) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a .txt file." };
  }

  return importTxtDocument(currentUserId, file);
}

export async function createDocumentAction(currentUserId: string) {
  return createDocument(currentUserId);
}

export async function listDashboardDocumentsAction(currentUserId: string) {
  const [owned, shared] = await Promise.all([
    listOwnedDocuments(currentUserId),
    listSharedDocuments(currentUserId),
  ]);

  if ("error" in owned) {
    return owned;
  }

  if ("error" in shared) {
    return shared;
  }

  return {
    data: {
      owned: owned.data,
      shared: shared.data,
    },
  };
}

export async function getDocumentAction(currentUserId: string, documentId: string) {
  return getAccessibleDocument(currentUserId, documentId);
}

export async function updateDocumentAction(
  currentUserId: string,
  documentId: string,
  patch: { title: string; content: Json },
) {
  return updateDocument(currentUserId, documentId, patch);
}

export async function shareDocumentAction(
  currentUserId: string,
  documentId: string,
  targetUserId: string,
) {
  return shareDocument(currentUserId, documentId, targetUserId);
}

export async function unshareDocumentAction(
  currentUserId: string,
  documentId: string,
  targetUserId: string,
) {
  return unshareDocument(currentUserId, documentId, targetUserId);
}
