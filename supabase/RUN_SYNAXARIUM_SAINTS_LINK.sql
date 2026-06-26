-- Run in Supabase SQL Editor after migrations if applying manually.
-- See migrations:
--   20250622220000_synaxarium_saints_linking.sql
--   20250622223000_synaxarium_slug_aliases_and_saint_match.sql

select
  (select count(*) from synaxarium_days) as synaxarium_days,
  (select count(*) from synaxarium_entries where day_id is not null) as entries_with_day,
  (select count(*) from synaxarium_entries where saint_index_id is not null) as entries_with_saint,
  (select count(*) from saints) as saints_from_index,
  (select count(*) from liturgical_occasions) as liturgical_occasions,
  (select count(*) from synaxarium_catalog_v) as catalog_rows;

select entity_type, count(*) from synaxarium_entries group by entity_type order by count(*) desc;
