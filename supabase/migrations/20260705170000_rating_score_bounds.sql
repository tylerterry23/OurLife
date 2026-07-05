-- The UI only ever sends 0-10 (step 0.1), but nothing stopped a bad client
-- or direct API call from writing out-of-range scores. Enforce it in the DB.
alter table rating_scores
  add constraint rating_scores_score_range
  check (score is null or (score >= 0 and score <= 10));
