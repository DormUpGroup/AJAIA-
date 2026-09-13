# AI-Native Workflow

## Tools Used

- **Cursor** (AI coding assistant in the project workspace)

ChatGPT was not used for this assignment. Work stayed in Cursor: planning the phased implementation, writing code, reviewing diffs, running commands, and drafting documentation.

## Where AI Accelerated Work

- Translating the assignment into implementation phases (foundation → dashboard → editor → sharing → import → tests → polish → docs)
- Project scaffolding (Next.js App Router, Tailwind, env layout)
- Supabase schema review (`users`, `documents`, `document_shares`, seed UUIDs)
- Tiptap setup (StarterKit, underline, JSON content, toolbar)
- Server-side CRUD and sharing via Server Actions
- Permission helper review (`lib/access.ts`) and keeping those helpers pure for tests
- Vitest setup and focused unit tests
- UI polish (hierarchy, demo-user switcher, editor canvas, share modal)
- Documentation drafting (this folder)
- Debugging TypeScript / ESLint / build failures as they appeared

AI was used as a pair-programming tool, not as an unsupervised generator.

## Human Decisions

AI did not decide scope autonomously. The assignment phases and explicit “do not implement” lists constrained the work.

Key human decisions:

- Mocked auth instead of OAuth / Supabase Auth
- Application-level server authorization (not RLS in this timebox)
- Store Tiptap JSON, not HTML
- Import `.txt` only, max 1 MB
- No realtime collaboration
- Prioritize a complete document lifecycle over feature breadth
- Owner / editor sharing only (no role dropdown, no public links)

## AI Output Changed or Rejected

Generated output was reviewed and edited. Several directions were rejected or avoided:

- Realtime WebSocket / Yjs / Liveblocks — out of scope and would fake collaboration without auth
- Full authentication inside the timebox — would have delayed the lifecycle demo
- DOCX / PDF parsers — assignment specified `.txt`
- Playwright / Cypress — unit tests on pure helpers were enough for Phase 6
- Unnecessary abstractions (extra state libraries, generic repositories, client Supabase SDK)
- Feature expansion after the core loop worked (comments, history, search, dark mode, folders)

Examples of review, not blind accept:

- A `useSyncExternalStore` mock-user attempt caused a hydration error and was reverted
- Permission helpers were kept pure rather than wrapping every test in Supabase mocks
- Error messages return generic strings, not raw Postgres errors
- Default create-next-app README was replaced with assignment-specific docs

## Verification

Verification was human-driven, using the assistant to run commands and exercise the UI. AI did **not** independently sign off the app.

Included:

- Manual end-to-end testing (create → edit → save → share → switch user → reopen)
- Cross-user sharing (Michael owns, Alex edits, Michael sees the change)
- Refresh / reopen persistence
- Formatting persistence (toolbar + Tiptap JSON)
- Invalid upload cases (`.pdf`, oversized file)
- Access-denied behavior for an unshared document
- `npm test` — **9 tests** passing
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
