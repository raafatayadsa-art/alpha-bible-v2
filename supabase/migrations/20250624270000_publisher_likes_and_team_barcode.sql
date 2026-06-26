-- Publisher page likes + add team member by Alpha ID barcode

alter table public.publishers
  add column if not exists likes_count int not null default 0 check (likes_count >= 0);

create table if not exists public.publisher_page_likes (
  publisher_id uuid not null references public.publishers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (publisher_id, user_id)
);

create index if not exists publisher_page_likes_user_idx
  on public.publisher_page_likes (user_id);

alter table public.publisher_page_likes enable row level security;

drop policy if exists publisher_page_likes_owner_read on public.publisher_page_likes;
create policy publisher_page_likes_owner_read on public.publisher_page_likes
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists publisher_page_likes_self_write on public.publisher_page_likes;
create policy publisher_page_likes_self_write on public.publisher_page_likes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, delete on public.publisher_page_likes to authenticated;

create or replace function public.toggle_publisher_page_like(p_publisher_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_liked boolean;
  v_count int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if exists (
    select 1 from public.publisher_page_likes
    where publisher_id = p_publisher_id and user_id = v_user
  ) then
    delete from public.publisher_page_likes
    where publisher_id = p_publisher_id and user_id = v_user;
    v_liked := false;
  else
    insert into public.publisher_page_likes (publisher_id, user_id)
    values (p_publisher_id, v_user)
    on conflict do nothing;
    v_liked := true;
  end if;

  select count(*)::int into v_count
  from public.publisher_page_likes
  where publisher_id = p_publisher_id;

  update public.publishers
  set likes_count = v_count, updated_at = now()
  where id = p_publisher_id;

  return json_build_object('liked', v_liked, 'likesCount', v_count);
end;
$$;

create or replace function public.add_publisher_team_member_by_alpha_id(
  p_publisher_id uuid,
  p_alpha_id text,
  p_can_edit_profile boolean default false,
  p_can_manage_content boolean default true,
  p_can_submit_publication boolean default false,
  p_can_manage_team boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_target uuid;
  v_id uuid;
  v_owner uuid;
  v_code text := upper(trim(p_alpha_id));
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  select owner_user_id into v_owner from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;

  select ai.user_id into v_target
  from public.alpha_identities ai
  where ai.alpha_id = v_code or ai.alpha_id_short = v_code
  limit 1;

  if v_target is null then raise exception 'user_not_found'; end if;
  if v_target = v_owner then raise exception 'cannot_add_owner'; end if;

  insert into public.publisher_team_members (
    publisher_id, user_id, invited_by,
    can_edit_profile, can_manage_content, can_submit_publication, can_manage_team
  )
  values (
    p_publisher_id, v_target, v_user,
    coalesce(p_can_edit_profile, false),
    coalesce(p_can_manage_content, true),
    coalesce(p_can_submit_publication, false),
    coalesce(p_can_manage_team, false)
  )
  on conflict (publisher_id, user_id) do update set
    can_edit_profile = excluded.can_edit_profile,
    can_manage_content = excluded.can_manage_content,
    can_submit_publication = excluded.can_submit_publication,
    can_manage_team = excluded.can_manage_team,
    updated_at = now()
  returning id into v_id;

  return json_build_object('ok', true, 'memberId', v_id, 'userId', v_target);
end;
$$;

grant execute on function public.toggle_publisher_page_like(uuid) to authenticated;
grant execute on function public.add_publisher_team_member_by_alpha_id(uuid, text, boolean, boolean, boolean, boolean) to authenticated;
