-- Fix st-takla URL month slug variants + improve saint_index linking.

create table if not exists public.coptic_month_slug_aliases (
  slug text primary key,
  month_num smallint not null references public.coptic_months (month_num)
);

insert into public.coptic_month_slug_aliases (slug, month_num) values
  ('01-Toot', 1),
  ('02-Babah', 2),
  ('02-Baba', 2),
  ('03-Hatoor', 3),
  ('03-Hator', 3),
  ('04-Keyahk', 4),
  ('04-Kiahk', 4),
  ('05-Topah', 5),
  ('05-Toba', 5),
  ('06-Amsheer', 6),
  ('06-Amshir', 6),
  ('07-Baramhat', 7),
  ('08-Bermodah', 8),
  ('08-Baramouda', 8),
  ('09-Bashans', 9),
  ('10-Bawoonah', 10),
  ('10-Paoni', 10),
  ('11-Abeeb', 11),
  ('11-Epep', 11),
  ('12-Mesraa', 12),
  ('12-Mesra', 12),
  ('13-Nasea', 13),
  ('13-Nesi', 13)
on conflict (slug) do nothing;

create or replace function public.resolve_coptic_month_num(p_slug text)
returns smallint
language sql
stable
as $$
  select coalesce(
    (select month_num from public.coptic_month_slug_aliases where slug = p_slug),
    (select month_num from public.coptic_months where slug_en = p_slug)
  );
$$;

create or replace function public.core_saint_name(p_name text)
returns text
language sql
immutable
as $$
  select trim(both ' ' from regexp_replace(
    regexp_replace(
      regexp_replace(coalesce(p_name, ''), '^(القديس|القديسة|الأنبا|أنبا|البابا|بابا|الشهيد|الشهيدة)\s+', '', 'gi'),
      '\s+(القديس|القديسة|الشهيد|الشهيدة)\s*$', '', 'gi'
    ),
    '\s+', ' ', 'g'
  ));
$$;

-- Rebuild synaxarium_days using alias resolver
insert into public.synaxarium_days (id, coptic_month, coptic_day, heading_ar, source_url)
select distinct on (month_num, day_num)
  month_num || '-' || day_num,
  month_num,
  day_num,
  coalesce(e.day_title, ''),
  coalesce(e.source_url, '')
from public.synaxarium_entries e
cross join lateral (
  select
    (regexp_match(e.source_url, '/Synaxarium-or-Synaxarion/([^/]+)/'))[1] as month_slug,
    (regexp_match(e.source_url, '/Synaxarium-or-Synaxarion/[^/]+/([^/.]+)'))[1] as day_slug
) parts
cross join lateral (
  select
    public.resolve_coptic_month_num(parts.month_slug) as month_num,
    least(
      30,
      greatest(1, nullif(regexp_replace(coalesce(parts.day_slug, ''), '\D', '', 'g'), '')::smallint)
    ) as day_num
) parsed
where parsed.month_num is not null
  and parsed.day_num is not null
order by month_num, day_num, e.created_at nulls last
on conflict (id) do update set
  heading_ar = excluded.heading_ar,
  source_url = coalesce(nullif(excluded.source_url, ''), synaxarium_days.source_url);

-- Re-link all entries to days
update public.synaxarium_entries e
set day_id = matched.day_id
from (
  select
    e2.id as entry_id,
    d.id as day_id
  from public.synaxarium_entries e2
  cross join lateral (
    select
      (regexp_match(e2.source_url, '/Synaxarium-or-Synaxarion/([^/]+)/'))[1] as month_slug,
      (regexp_match(e2.source_url, '/Synaxarium-or-Synaxarion/[^/]+/([^/.]+)'))[1] as day_slug
  ) parts
  cross join lateral (
    select
      public.resolve_coptic_month_num(parts.month_slug) as month_num,
      least(
        30,
        greatest(1, nullif(regexp_replace(coalesce(parts.day_slug, ''), '\D', '', 'g'), '')::smallint)
      ) as day_num
  ) parsed
  join public.synaxarium_days d
    on d.coptic_month = parsed.month_num
   and d.coptic_day = parsed.day_num
  where parsed.month_num is not null
    and parsed.day_num is not null
) matched
where e.id = matched.entry_id;

update public.synaxarium_days sd
set katamaros_day_id = kd.id
from public.katamaros_days kd
join public.coptic_months cm on cm.name_en = kd.coptic_month
where sd.coptic_month = cm.month_num
  and sd.coptic_day = kd.coptic_day
  and (sd.katamaros_day_id is distinct from kd.id);

-- Improved saint_index matching
update public.synaxarium_entries e
set saint_index_id = si.id
from public.saints_index si
where e.saint_index_id is null
  and e.entity_type in ('saint', 'monk', 'patriarch')
  and public.core_saint_name(si.name) = public.core_saint_name(public.extract_synaxarium_subject(e.commemoration_title));

update public.synaxarium_entries e
set saint_index_id = si.id
from public.saints_index si
where e.saint_index_id is null
  and e.entity_type in ('saint', 'monk', 'patriarch')
  and si.name ilike '%' || public.core_saint_name(public.extract_synaxarium_subject(e.commemoration_title)) || '%'
  and length(public.core_saint_name(public.extract_synaxarium_subject(e.commemoration_title))) >= 4;

update public.synaxarium_entries e
set saint_index_id = si.id
from public.saints_index si
where e.saint_index_id is null
  and e.entity_type in ('saint', 'monk', 'patriarch')
  and public.core_saint_name(si.name) ilike '%' || public.core_saint_name(public.extract_synaxarium_subject(e.commemoration_title)) || '%'
  and length(public.core_saint_name(public.extract_synaxarium_subject(e.commemoration_title))) >= 6;

alter table public.coptic_month_slug_aliases enable row level security;
drop policy if exists coptic_month_slug_aliases_public_read on public.coptic_month_slug_aliases;
create policy coptic_month_slug_aliases_public_read on public.coptic_month_slug_aliases
  for select to anon, authenticated using (true);

grant select on public.coptic_month_slug_aliases to anon, authenticated;
