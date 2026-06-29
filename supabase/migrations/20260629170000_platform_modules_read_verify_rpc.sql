-- Read/verify platform_modules via security definer (bypasses RLS for owner console).

create or replace function public.platform_fetch_modules()
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
  return query
  select m.key, m.label, m.label_ar, m.enabled
  from public.platform_modules m
  order by m.key;
end;
$$;

create or replace function public.platform_verify_modules(p_keys text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_keys is null or array_length(p_keys, 1) is null then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object('key', m.key, 'enabled', m.enabled) order by m.key)
      from public.platform_modules m
      where m.key = any(p_keys)
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.platform_fetch_modules() from public;
grant execute on function public.platform_fetch_modules() to anon, authenticated;

revoke all on function public.platform_verify_modules(text[]) from public;
grant execute on function public.platform_verify_modules(text[]) to anon, authenticated;

-- Ensure SELECT is allowed (idempotent)
drop policy if exists platform_modules_anon_all on public.platform_modules;
create policy platform_modules_anon_all
  on public.platform_modules
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on public.platform_modules to anon, authenticated;

notify pgrst, 'reload schema';
