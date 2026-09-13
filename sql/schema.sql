-- Ajaia Docs schema + seed
-- Run this in the Supabase SQL Editor.
-- No RLS policies (deliberate timebox tradeoff).

-- users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  owner_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- document_shares
create table if not exists document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('editor')),
  created_at timestamptz not null default now(),
  unique (document_id, user_id)
);

create index if not exists idx_documents_owner on documents(owner_id);
create index if not exists idx_shares_user on document_shares(user_id);
create index if not exists idx_shares_document on document_shares(document_id);

-- seed mock users (fixed UUIDs for the app switcher)
insert into users (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Michael', 'bilmike1543@gmail.com'),
  ('22222222-2222-2222-2222-222222222222', 'Alex', 'alex@example.com')
on conflict (email) do nothing;
