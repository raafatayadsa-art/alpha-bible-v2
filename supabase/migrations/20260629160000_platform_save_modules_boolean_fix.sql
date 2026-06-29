-- Fix false boolean parsing in platform_save_modules + reload PostgREST schema cache.

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

notify pgrst, 'reload schema';
