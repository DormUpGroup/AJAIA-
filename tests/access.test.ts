import { describe, expect, it } from "vitest";

import {
  canAccessDocument,
  canEditDocument,
  canManageSharing,
  isOwner,
} from "@/lib/access";

const ownerId = "11111111-1111-1111-1111-111111111111";
const editorId = "22222222-2222-2222-2222-222222222222";
const strangerId = "33333333-3333-3333-3333-333333333333";
const document = { owner_id: ownerId };
const shares = [{ user_id: editorId, role: "editor" as const }];

describe("document access", () => {
  it("lets the owner access, edit, and manage sharing without a share row", () => {
    expect(isOwner(ownerId, document)).toBe(true);
    expect(canAccessDocument(ownerId, document, [])).toBe(true);
    expect(canEditDocument(ownerId, document, [])).toBe(true);
    expect(canManageSharing(ownerId, document)).toBe(true);
  });

  it("does not treat the owner as a shared editor", () => {
    expect(shares.some((share) => share.user_id === ownerId)).toBe(false);
    expect(isOwner(ownerId, document)).toBe(true);
    expect(canAccessDocument(ownerId, document, shares)).toBe(true);
    expect(canEditDocument(ownerId, document, shares)).toBe(true);
    expect(canManageSharing(ownerId, document)).toBe(true);
  });

  it("lets a shared editor access and edit, but not manage sharing", () => {
    expect(isOwner(editorId, document)).toBe(false);
    expect(canAccessDocument(editorId, document, shares)).toBe(true);
    expect(canEditDocument(editorId, document, shares)).toBe(true);
    expect(canManageSharing(editorId, document)).toBe(false);
  });

  it("blocks an unrelated user from access, edit, and sharing", () => {
    expect(isOwner(strangerId, document)).toBe(false);
    expect(canAccessDocument(strangerId, document, shares)).toBe(false);
    expect(canEditDocument(strangerId, document, shares)).toBe(false);
    expect(canManageSharing(strangerId, document)).toBe(false);
  });
});
