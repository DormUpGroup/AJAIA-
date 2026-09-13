import { describe, expect, it } from "vitest";

import { TXT_MAX_BYTES, titleFromFilename, validateTxtFile } from "@/lib/upload";

describe("txt upload validation", () => {
  it("accepts a valid .txt file", () => {
    expect(validateTxtFile({ name: "notes.txt", size: 128 })).toBeNull();
    expect(validateTxtFile({ name: "Notes.TXT", size: 1 })).toBeNull();
  });

  it("rejects a .pdf file", () => {
    expect(validateTxtFile({ name: "notes.pdf", size: 128 })).toBe(
      "Only .txt files are supported.",
    );
  });

  it("rejects a file over 1 MB", () => {
    expect(validateTxtFile({ name: "huge.txt", size: TXT_MAX_BYTES + 1 })).toBe(
      "File is too large. Maximum size is 1 MB.",
    );
  });

  it("converts the filename into a document title", () => {
    expect(titleFromFilename("meeting-notes.txt")).toBe("meeting-notes");
    expect(titleFromFilename("folder/Q3 Notes.TXT")).toBe("Q3 Notes");
  });
});
