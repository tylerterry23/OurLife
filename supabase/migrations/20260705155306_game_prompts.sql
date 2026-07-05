-- Games: a spin-the-wheel do-or-drink game. The built-in prompt library
-- ships in the frontend (no DB needed for it), but couples can add their
-- own custom prompts to mix into the pool — this table holds only those.

create table game_prompts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  category text not null check (category in ('light', 'daring', 'trivia', 'spicy')),
  text text not null,
  created_at timestamptz not null default now()
);

create index game_prompts_couple_id_idx on game_prompts(couple_id);

alter table game_prompts enable row level security;
grant all on game_prompts to anon, authenticated;

create policy "couple members full access" on game_prompts
  for all
  using (couple_id = get_my_couple_id())
  with check (couple_id = get_my_couple_id());
