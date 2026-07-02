# OurLife

A private, two-user relationship hub for Tyler & Lauren. Vite + React +
TypeScript on the frontend, Supabase (Postgres + Auth + Storage + Realtime)
on the backend. Installable as a PWA.

## Modules

- **Important Dates** — anniversaries, birthdays, recurring days worth remembering
- **Ask Me Anything** — trade questions, answer at your own pace
- **Been & Going** — places visited and places planned
- **Ratings** — rate movies, shows, restaurants, and cities together
- **Wishlist** — things you're hoping for, with a claimed flag
- **Games** — route/folder stub only, not built yet

## Stack

- Vite, React 18, TypeScript
- Tailwind CSS + hand-rolled shadcn/ui-style primitives (`src/components/ui`)
- react-router-dom v6
- @tanstack/react-query v5 for server state
- zustand for local UI state (auth session, display name preferences)
- @supabase/supabase-js for auth + data access
- vite-plugin-pwa for installability

## Getting started

```bash
npm install
cp .env.example .env.development   # then fill in real Supabase values
npm run dev
```

Without real Supabase credentials, the app throws a clear startup error
("Missing Supabase environment variables...") instead of failing silently —
that's expected until the project below is connected.

## Backend

This project uses Supabase (Postgres + Auth + Storage + Realtime) instead of
a custom backend. To connect it to a real project:

1. Create a project at supabase.com
2. Run the schema below in the SQL editor
3. Copy the project URL and anon key into `.env.development`
4. Manually create two auth users (Tyler, Lauren) via Supabase Dashboard >
   Authentication > Users — no public signup flow needed for a 2-user app
5. Regenerate `src/types/supabase.ts` using the Supabase CLI (command in that file)

## Draft schema (reference only — not yet applied)

```sql
create table ratings (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('movie','show','restaurant','city')),
  title text not null,
  tyler_score numeric,
  lauren_score numeric,
  note text,
  created_at timestamptz default now()
);

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null check (status in ('visited','planned')),
  city text,
  notes text,
  created_at timestamptz default now()
);

create table important_dates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  date date not null,
  recurring boolean default false
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  asked_by text not null,
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz default now()
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  added_by text not null,
  title text not null,
  url text,
  notes text,
  claimed boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security: only authenticated users (Tyler, Lauren) can read/write.
-- Enable RLS on every table above, then:
alter table ratings enable row level security;
create policy "authenticated users full access" on ratings
  for all using (auth.role() = 'authenticated');
-- repeat the same enable + policy pair for places, important_dates,
-- quiz_questions, wishlist_items
```

## Not built yet

- The Supabase project itself — nothing above has been created or applied
- Push notifications — needs a `push_subscriptions` table, VAPID keys, and a
  delivery mechanism (e.g. a Supabase Edge Function calling the Web Push
  API). See the stub comment in `src/main.tsx`.
- The Games module beyond its route/folder scaffold
- A public signup flow — this is a fixed two-account app

## PWA icons

`public/pwa-192x192.png` and `public/pwa-512x512.png` are programmatically
generated placeholders (a simple ring monogram in the brand colors), not
final artwork. Generate real icons before a production deploy.

## Path aliases

`@/*` maps to `src/*` (configured in `tsconfig.app.json`, `tsconfig.node.json`,
and `vite.config.ts`).

## Linting & formatting

```bash
npm run lint     # eslint
npm run format   # prettier --write
```
