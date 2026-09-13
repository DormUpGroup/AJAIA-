import { describe, expect, it } from "vitest";

import { FALLBACK_DOCUMENT_TITLE, normalizeDocumentTitle } from "@/lib/document-title";

describe("document title", () => {
  it("falls back to Untitled document when empty", () => {
    expect(normalizeDocumentTitle("")).toBe(FALLBACK_DOCUMENT_TITLE);
    expect(normalizeDocumentTitle("   ")).toBe("Untitled document");
    expect(normalizeDocumentTitle("Phase 3 Notes")).toBe("Phase 3 Notes");
  });
});
