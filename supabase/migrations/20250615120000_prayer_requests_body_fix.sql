-- Ensure prayer_requests.body exists (some environments created the table without it)

alter table public.prayer_requests add column if not exists body text;
alter table public.prayer_requests add column if not exists request text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'prayer_requests' and column_name = 'request'
  ) then
    execute $sql$
      update public.prayer_requests
      set body = coalesce(nullif(trim(body), ''), request)
      where body is null or trim(body) = ''
    $sql$;
  end if;
exception when others then
  null;
end $$;
