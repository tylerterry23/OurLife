-- Been & Going (places) and Ratings were the same module in two skins:
-- both tracked a visited/planned (rated/want) axis over things done
-- together, and "city" was already a ratings category. Merging: places
-- becomes the 'place' rating category, gaining scoring/agreement for
-- free. The places table had zero live rows, so this is a clean cut,
-- no data migration needed.

alter table ratings add column location text;

drop table places;
