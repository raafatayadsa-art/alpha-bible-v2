-- Paste this entire file in Supabase Dashboard → SQL Editor → Run
-- Fixes: empty platform_modules table + module save failures

-- (same content as migration 20260629130000_platform_modules_seed_and_save.sql)

create or replace function public.platform_ensure_modules_seeded()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.platform_modules (key, label, label_ar, enabled) values
    ('bible', 'Bible', 'الكتاب المقدس', true),
    ('agpeya', 'Agpeya', 'الأجبية', true),
    ('kholagy', 'Khoulagy', 'الخولاجي المقدس', true),
    ('synaxarium', 'Synaxarium', 'السنكسار', true),
    ('katameros', 'Katameros', 'القطمارس', true),
    ('audio', 'Audio', 'الصوتيات', true),
    ('kids', 'Kids', 'الأطفال', true),
    ('meditations', 'Meditations', 'التأملات', true),
    ('community', 'Community', 'المجتمع', true),
    ('messaging', 'Alpha Connect', 'الفا كونكت', true),
    ('trips', 'Trips', 'الرحلات', true),
    ('reservations', 'Reservations', 'الحجوزات', false),
    ('donations', 'Donations', 'التبرعات', true)
  on conflict (key) do nothing;
end;
$$;

create or replace function public.platform_save_modules(p_updates jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  k text;
  en boolean;
  out_rows jsonb := '[]'::jsonb;
  row_enabled boolean;
begin
  perform public.platform_ensure_modules_seeded();

  if p_updates is null or jsonb_typeof(p_updates) <> 'array' then
    return '[]'::jsonb;
  end if;

  for item in select value from jsonb_array_elements(p_updates) as t(value)
  loop
    k := item->>'key';
    if k is null or length(trim(k)) = 0 then
      continue;
    end if;

    en := case
      when item ? 'enabled' and jsonb_typeof(item->'enabled') = 'boolean' then (item->'enabled')::boolean
      when item ? 'enabled' then lower(coalesce(item->>'enabled', '')) in ('true', 't', '1', 'yes')
      else true
    end;

    update public.platform_modules m
    set enabled = en, updated_at = now()
    where m.key = k;

    if not found then
      insert into public.platform_modules (key, label, label_ar, enabled, updated_at)
      values (k, k, k, en, now())
      on conflict (key) do update
      set enabled = excluded.enabled, updated_at = now();
    end if;

    select m.enabled into row_enabled
    from public.platform_modules m
    where m.key = k;

    out_rows := out_rows || jsonb_build_array(
      jsonb_build_object('key', k, 'enabled', coalesce(row_enabled, en))
    );
  end loop;

  return out_rows;
end;
$$;

create or replace function public.platform_toggle_module(
  p_key text,
  p_enabled boolean
)
returns table (
  key text,
  label text,
  label_ar text,
  enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.platform_ensure_modules_seeded();

  insert into public.platform_modules (key, label, label_ar, enabled, updated_at)
  values (p_key, p_key, p_key, p_enabled, now())
  on conflict (key) do update
  set
    enabled = excluded.enabled,
    updated_at = now();

  return query
  select m.key, m.label, m.label_ar, m.enabled
  from public.platform_modules m
  where m.key = p_key;
end;
$$;

revoke all on function public.platform_ensure_modules_seeded() from public;
grant execute on function public.platform_ensure_modules_seeded() to anon, authenticated;

revoke all on function public.platform_save_modules(jsonb) from public;
grant execute on function public.platform_save_modules(jsonb) to anon, authenticated;

revoke all on function public.platform_toggle_module(text, boolean) from public;
grant execute on function public.platform_toggle_module(text, boolean) to anon, authenticated;

grant select, insert, update on public.platform_modules to anon, authenticated;

select public.platform_ensure_modules_seeded();

select key, label_ar, enabled from public.platform_modules order by key;

notify pgrst, 'reload schema';
