import type { JSONContent } from "@tiptap/react";

import { FALLBACK_DOCUMENT_TITLE } from "@/lib/document-title";
import { EMPTY_TIPTAP_DOC } from "@/lib/tiptap-doc";

export const TXT_MAX_BYTES = 1_048_576;
export const TXT_ACCEPT = ".txt,text/plain";

export function validateTxtFile(file: { name: string; size: number }): string | null {
  const name = file.name.trim();
  if (!name.toLowerCase().endsWith(".txt")) {
    return "Only .txt files are supported.";
  }

  if (file.size > TXT_MAX_BYTES) {
    return "File is too large. Maximum size is 1 MB.";
  }

  return null;
}

export function titleFromFilename(filename: string) {
  const base = filename.replace(/\\/g, "/").split("/").pop()?.trim() ?? "";
  const withoutExt = base.replace(/\.txt$/i, "").trim();
  return withoutExt.length > 0 ? withoutExt : FALLBACK_DOCUMENT_TITLE;
}

export function textToTiptapDoc(text: string): JSONContent {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  if (lines.length === 1 && lines[0] === "") {
    return EMPTY_TIPTAP_DOC;
  }

  return {
    type: "doc",
    content: lines.map((line) =>
      line.length > 0
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" },
    ),
  };
}
