# Ajaia Docs Submission

Candidate: Michael Bilak

## Links

Live Product:  
https://ajaiadocs-roan.vercel.app/

Source Repository:  
https://github.com/DormUpGroup/AJAIA-

Walkthrough Video:  
[ADD LOOM URL]

Google Drive Submission:  
[ADD GOOGLE DRIVE URL]

## Demo Users

Seeded identities — **not** real login.

- Michael — `bilmike1543@gmail.com`
- Alex — `alex@example.com`

Switch users from the header **Demo user** control.

## Included

- source code
- README.md
- ARCHITECTURE.md
- AI_WORKFLOW.md
- SUBMISSION.md
- sql/schema.sql
- automated tests (`tests/`, Vitest)

## Working Features

- [x] Create document
- [x] Rename document
- [x] Rich-text editing
- [x] Formatting (bold, italic, underline, H1/H2, lists)
- [x] Autosave (~700ms debounce)
- [x] Persistence (Supabase Postgres)
- [x] Owned / shared lists
- [x] Share with another seeded user (role: editor)
- [x] Shared-user editing
- [x] Remove access
- [x] .txt import (max 1 MB)
- [x] Validation (client + server)
- [x] Automated tests (9)

## Intentional Limitations

- Mock auth (`localStorage` + seeded users); client-selected user ID is not trusted identity
- No Supabase Auth, OAuth, or RLS
- No realtime collaboration
- `.txt` upload only
- Two seeded users
- No comments, version history, public links, or export

## Quality Checks

Verified locally:

- `npm test` — 9 tests passing
- `npx tsc --noEmit` — passing
- `npm run lint` — passing
- `npm run build` — passing

## What I Would Build Next

- Replace mock users with Supabase Auth and a trusted session
- Add RLS as defense in depth (stop relying on service role alone)
- Cover create / share / switch-user / import with E2E tests
- Realtime collaboration only after auth and access are solid
