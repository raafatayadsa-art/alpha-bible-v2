-- Publisher listen/play counter for audio discovery cards

alter table public.publishers
  add column if not exists listen_count int not null default 0 check (listen_count >= 0);

create or replace function public.increment_publisher_listen(p_publisher_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not exists (
    select 1 from public.publishers
    where id = p_publisher_id and status = 'published' and is_public = true
  ) then
    raise exception 'not_found';
  end if;

  update public.publishers
  set listen_count = listen_count + 1, updated_at = now()
  where id = p_publisher_id
  returning listen_count into v_count;

  return json_build_object('ok', true, 'listenCount', v_count);
end;
$$;

grant execute on function public.increment_publisher_listen(uuid) to anon, authenticated;
