-- Ratings become a planning tool, not just a log: an item can start life as
-- something the couple *wants* to watch/try/visit (no scores yet) and later
-- graduate to *rated*. Existing rows default to 'rated' so nothing changes
-- for them.

alter table ratings
  add column status text not null default 'rated'
  check (status in ('want', 'rated'));

create index ratings_couple_status_idx on ratings (couple_id, status);
