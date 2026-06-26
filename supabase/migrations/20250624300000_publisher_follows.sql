-- Publisher page follows (ALPHA publisher discovery v1)

create table if not exists public.publisher_page_follows (
  publisher_id uuid not null references public.publishers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (publisher_id, user_id)
);

create index if not exists publisher_page_follows_user_idx on public.publisher_page_follows (user_id);

alter table public.publisher_page_follows enable row level security;

drop policy if exists publisher_page_follows_own on public.publisher_page_follows;
create policy publisher_page_follows_own on public.publisher_page_follows
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, delete on public.publisher_page_follows to authenticated;

create or replace function public.toggle_publisher_page_follow(p_publisher_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_following boolean;
  v_count int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if not exists (
    select 1 from public.publishers
    where id = p_publisher_id and status = 'published' and is_public = true
  ) then
    raise exception 'not_found';
  end if;

  if exists (
    select 1 from public.publisher_page_follows
    where publisher_id = p_publisher_id and user_id = v_user
  ) then
    delete from public.publisher_page_follows
    where publisher_id = p_publisher_id and user_id = v_user;
    v_following := false;
  else
    insert into public.publisher_page_follows (publisher_id, user_id)
    values (p_publisher_id, v_user);
    v_following := true;
  end if;

  update public.publishers
  set follower_count = (
    select count(*)::int from public.publisher_page_follows where publisher_id = p_publisher_id
  ),
  updated_at = now()
  where id = p_publisher_id
  returning follower_count into v_count;

  return json_build_object('following', v_following, 'followerCount', v_count);
end;
$$;

grant execute on function public.toggle_publisher_page_follow(uuid) to authenticated;
