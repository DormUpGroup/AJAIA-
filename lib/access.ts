import type { Document, DocumentShare } from "@/lib/supabase/types";

type ShareRef = Pick<DocumentShare, "user_id" | "role">;

export function isOwner(userId: string, document: Pick<Document, "owner_id">) {
  return document.owner_id === userId;
}

export function canManageSharing(
  userId: string,
  document: Pick<Document, "owner_id">,
) {
  return isOwner(userId, document);
}

export function canEditDocument(
  userId: string,
  document: Pick<Document, "owner_id">,
  shares: ShareRef[],
) {
  return (
    isOwner(userId, document) ||
    shares.some((share) => share.user_id === userId && share.role === "editor")
  );
}

export function canAccessDocument(
  userId: string,
  document: Pick<Document, "owner_id">,
  shares: ShareRef[],
) {
  return (
    isOwner(userId, document) || shares.some((share) => share.user_id === userId)
  );
}
