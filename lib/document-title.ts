export const FALLBACK_DOCUMENT_TITLE = "Untitled document";

export function normalizeDocumentTitle(title: string) {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_DOCUMENT_TITLE;
}
