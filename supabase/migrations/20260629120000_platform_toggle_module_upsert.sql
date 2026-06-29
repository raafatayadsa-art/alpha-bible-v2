-- Module Control: upsert missing keys so new modules persist even if seed migration not applied yet.

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

revoke all on function public.platform_toggle_module(text, boolean) from public;
grant execute on function public.platform_toggle_module(text, boolean) to anon, authenticated;

comment on function public.platform_toggle_module(text, boolean) is
  'Platform admin: enable or disable an app module for all users (upsert-safe)';
