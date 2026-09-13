# Ajaia Docs

A lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer assignment.

## Features

- Create documents
- Rename documents (empty title falls back to `Untitled document`)
- Rich-text editing with Tiptap
- Bold, italic, underline
- H1 / H2
- Bullet and numbered lists
- Debounced autosave (~700ms)
- Persistent storage in Supabase Postgres
- Mock user switching (Michael / Alex)
- Owned vs Shared document sections
- Owner-to-editor sharing
- Shared-user editing
- Remove access
- `.txt` import
- Client + server validation for upload
- Save state feedback (Saving / Saved / Save failed)
- Loading, empty, access-denied, and error states
- Automated tests (Vitest)

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Tiptap
- Supabase Postgres
- Vitest
- Vercel

## Demo Users

These are **seeded demo users**, not real authentication.

| Name | Email |
|---|---|
| Michael | `bilmike1543@gmail.com` |
| Alex | `alex@example.com` |

The header **Demo user** switcher stores the selected user ID in `localStorage` and sends it to server actions. That ID is **not** a trusted identity boundary.

## Local Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is **server-only**. Never prefix it with `NEXT_PUBLIC_`. The Supabase client that uses it lives in `lib/supabase/server.ts` (`import "server-only"`).

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Execute `sql/schema.sql` (creates `users`, `documents`, `document_shares`, and seeds Michael / Alex).
4. Set the env vars above.
5. Start the app with `npm run dev`.

The schema does **not** enable RLS. That is a deliberate assignment tradeoff, not a production default.

## Tests

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

`npm test` runs Vitest (`vitest run`). Current suite: **9 tests** covering access helpers, `.txt` validation, and empty-title fallback.

## File Import

- Supported: `.txt` only
- Maximum size: 1 MB

Other types (for example `.pdf`) and files over 1 MB are **intentionally rejected**, on both the client and the server.

## Deployment

Live URL: [https://ajaiadocs-roan.vercel.app/](https://ajaiadocs-roan.vercel.app/)

## Known Limitations

- Mocked authentication (localStorage + seeded users)
- Client-selected demo user ID is not a trusted identity boundary
- Service role + application-level authorization used for assignment simplicity
- No Supabase Auth / OAuth
- No RLS
- No realtime collaboration
- Only the two seeded demo users
- Upload is `.txt` only
- No comments, version history, public links, or export

## Production Next Steps

- Real authentication and a trusted user session
- RLS / defense-in-depth
- Realtime collaboration
- Richer sharing roles
- Version history
