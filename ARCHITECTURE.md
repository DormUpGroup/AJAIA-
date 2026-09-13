# Architecture

Request flow:

```
Browser
  → Next.js UI
  → Server Actions
  → centralized access checks
  → Supabase server client (service role)
  → Postgres
```

Document CRUD and sharing are **not** performed from the browser against the database. UI components call `"use server"` actions in `app/actions/documents.ts`, which delegate to `lib/documents.ts`. The only Supabase client is created in `lib/supabase/server.ts` (`import "server-only"`).

## Data Model

**`users`** — seeded demo identities (fixed UUIDs matching the in-app switcher).

**`documents`** — `title`, `owner_id`, timestamps, and `content`.

**`document_shares`** — one row per shared user. `role` is constrained to `'editor'`. Unique on `(document_id, user_id)`.

`documents.content` is Tiptap JSON stored as `jsonb`, not HTML.

## Document Lifecycle

```
create → edit → autosave → persist → share → reopen
```

We prioritized a complete document lifecycle over feature breadth.

A new document starts empty, can be titled and formatted, autosaves to Postgres, can be shared with the other seeded user, and reopens with the same content after refresh or a user switch.

## Editor

Tiptap was chosen because it is a focused rich-text editor for React, with the exact formatting set the assignment needed (StarterKit + underline) and a first-class JSON document model.

Structured JSON is stored instead of raw HTML because it:

- preserves document structure
- matches the editor-native representation
- is easier to extend later without scraping HTML

The editor is not written back from save responses. The client keeps its own document; the server confirms persistence.

## Autosave

- Debounce: **700ms** (`AUTOSAVE_DEBOUNCE_MS` in `DocumentEditor`)
- Status: Saving / Saved / Save failed
- A generation counter ignores stale save responses so an older request cannot overwrite a newer status
- Pending changes flush on unmount / `pagehide`

This is per-tab autosave, not distributed multiplayer consistency.

## Sharing

| Actor | Access | Edit | Manage sharing |
|---|---|---|---|
| Owner | yes | yes | yes |
| Shared editor | yes | yes | no |
| Unrelated user | no | no | no |

Decision helpers live in `lib/access.ts` and are used on the server:

- `canAccessDocument`
- `canEditDocument`
- `canManageSharing` (owner only; equivalent to `isOwner`)

The owner does **not** need a share row. Sharing with yourself is rejected. Duplicate shares return a friendly error (`23505` mapped to “Already shared”).

## File Import

- `.txt` only, max **1 MB** (`TXT_MAX_BYTES = 1_048_576`)
- Validated in the browser (`UploadTxtButton`) and again in `importTxtDocument`
- Filename (without `.txt`) becomes the title; empty names fall back to `Untitled document`
- File text is converted to Tiptap paragraph JSON
- Server Actions body size limit is `2mb` to leave room for multipart overhead

## Security Tradeoff

This assignment uses mocked users selected from `localStorage`. The client-provided user ID is therefore **not** a production-grade authenticated identity.

Server actions still check that the ID is one of the seeded users and then apply `canAccessDocument` / `canEditDocument` / `canManageSharing` before mutating data. That demonstrates an authorization **structure**, but it is not a substitute for a trusted session.

Production should use a real authenticated session and preferably Supabase RLS as defense in depth. The current service-role client bypasses RLS; RLS is also not enabled on the schema.

This is **not** production-secure.

## Scope Decisions

Intentionally not built, as a timebox:

- Realtime collaboration (Yjs / WebSockets / Liveblocks)
- OAuth / Supabase Auth
- DOCX / PDF parsing
- Comments
- Version history
- Public links
- Export

The assignment asked for a complete create → persist → share → reopen loop. Extra surfaces would have diluted that.

## Another 2–4 Hours

1. Supabase Auth / trusted session (stop trusting `currentUserId` from the client)
2. RLS as defense in depth
3. E2E tests for create / share / switch-user / import
4. Clearer sharing UX (still two users, better empty/error copy)
5. Realtime collaboration **only after** auth and access foundations
