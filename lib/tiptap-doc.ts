import type { JSONContent } from "@tiptap/react";

import type { Json } from "@/lib/supabase/types";

export const EMPTY_TIPTAP_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function toEditorContent(content: Json): JSONContent {
  if (
    content &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    "type" in content &&
    content.type === "doc"
  ) {
    return content as JSONContent;
  }

  return EMPTY_TIPTAP_DOC;
}
