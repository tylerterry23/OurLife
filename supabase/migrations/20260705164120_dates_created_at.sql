-- Every other data table has created_at except this one — an oversight
-- from the original schema, not intentional. Needed now so Important
-- Dates can appear in the new cross-module Recent Activity feed sorted
-- by when things were added (not the event date itself). 0 live rows,
-- safe additive column.

alter table important_dates
  add column created_at timestamptz not null default now();
