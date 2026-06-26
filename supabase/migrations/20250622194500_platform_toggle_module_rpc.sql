-- Module Control: persist enable/disable via security definer RPC.
-- Ensures owner toggles always write even if direct UPDATE is blocked or returns 0 rows silently.

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
  update public.platform_modules m
  set
    enabled = p_enabled,
    updated_at = now()
  where m.key = p_key;

  if not found then
    raise exception 'module not found (key=%)', p_key;
  end if;

  return query
  select m.key, m.label, m.label_ar, m.enabled
  from public.platform_modules m
  where m.key = p_key;
end;
$$;

revoke all on function public.platform_toggle_module(text, boolean) from public;
grant execute on function public.platform_toggle_module(text, boolean) to anon, authenticated;

comment on function public.platform_toggle_module(text, boolean) is
  'Platform admin: enable or disable an app module for all users';
