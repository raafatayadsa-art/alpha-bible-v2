-- Publisher team assistants + one self-service page per owner

-- ---------------------------------------------------------------------------
-- Team members
-- ---------------------------------------------------------------------------
create table if not exists public.publisher_team_members (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  invited_by uuid references auth.users (id) on delete set null,
  can_edit_profile boolean not null default false,
  can_manage_content boolean not null default true,
  can_submit_publication boolean not null default false,
  can_manage_team boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publisher_id, user_id)
);

create index if not exists publisher_team_members_publisher_idx
  on public.publisher_team_members (publisher_id);
create index if not exists publisher_team_members_user_idx
  on public.publisher_team_members (user_id);

alter table public.publisher_team_members enable row level security;

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function public.publisher_is_owner(p_publisher_id uuid, p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.publishers p
    where p.id = p_publisher_id and p.owner_user_id = p_user
  );
$$;

create or replace function public.publisher_team_has_perm(
  p_publisher_id uuid,
  p_perm text,
  p_user uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user is null then return false; end if;
  if public.publisher_is_owner(p_publisher_id, p_user) then return true; end if;

  return exists (
    select 1 from public.publisher_team_members m
    where m.publisher_id = p_publisher_id
      and m.user_id = p_user
      and case p_perm
        when 'edit_profile' then m.can_edit_profile
        when 'manage_content' then m.can_manage_content
        when 'submit_publication' then m.can_submit_publication
        when 'manage_team' then m.can_manage_team
        else false
      end
  );
end;
$$;

create or replace function public.user_owns_self_service_publisher(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.publishers p
    where p.owner_user_id = p_user
      and p.publisher_type not in ('church', 'monastery')
  );
$$;

-- ---------------------------------------------------------------------------
-- One self-service publisher per user
-- ---------------------------------------------------------------------------
create or replace function public.submit_publisher_application(
  p_type public.publisher_type,
  p_name text,
  p_bio text default null,
  p_logo_url text default null,
  p_cover_url text default null,
  p_phone text default null,
  p_email text default null,
  p_website_url text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_approval_id uuid;
  v_request_no text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if p_type in ('church', 'monastery', 'priest', 'bishop') then
    raise exception 'use_claim_flow';
  end if;

  if public.user_owns_self_service_publisher(v_user) then
    raise exception 'already_has_publisher';
  end if;

  if coalesce(length(trim(p_name)), 0) < 2 then
    raise exception 'invalid_name';
  end if;

  insert into public.publishers (
    publisher_type, name, bio, logo_url, cover_url,
    phone, email, website_url, owner_user_id, status, is_public
  )
  values (
    p_type,
    trim(p_name),
    nullif(trim(p_bio), ''),
    nullif(trim(p_logo_url), ''),
    nullif(trim(p_cover_url), ''),
    nullif(trim(p_phone), ''),
    nullif(trim(p_email), ''),
    nullif(trim(p_website_url), ''),
    v_user,
    'under_review',
    false
  )
  returning id into v_id;

  v_request_no := 'PB-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no,
    'publisher_setup',
    'طلب ناشر — ' || trim(p_name),
    'صفحة ناشر',
    'pending',
    'normal',
    jsonb_build_object(
      'publisherId', v_id::text,
      'publisherType', p_type::text,
      'submittedBy', v_user::text,
      'name', trim(p_name)
    )
  )
  returning id into v_approval_id;

  update public.publishers
  set identity_approval_id = v_approval_id, updated_at = now()
  where id = v_id;

  perform public.refresh_publisher_readiness(v_id);

  return json_build_object('ok', true, 'publisherId', v_id::text, 'approvalId', v_approval_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Permission-gated workspace RPCs
-- ---------------------------------------------------------------------------
create or replace function public.update_publisher_workspace(
  p_id uuid,
  p_name text default null,
  p_bio text default null,
  p_logo_url text default null,
  p_cover_url text default null,
  p_phone text default null,
  p_email text default null,
  p_website_url text default null,
  p_facebook_url text default null,
  p_youtube_url text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pub record;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_id, 'edit_profile', v_user) then
    raise exception 'forbidden';
  end if;

  select * into v_pub from public.publishers where id = p_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.status = 'suspended' then raise exception 'suspended'; end if;

  update public.publishers
  set
    name = coalesce(nullif(trim(p_name), ''), name),
    bio = case when p_bio is not null then nullif(trim(p_bio), '') else bio end,
    logo_url = case when p_logo_url is not null then nullif(trim(p_logo_url), '') else logo_url end,
    cover_url = case when p_cover_url is not null then nullif(trim(p_cover_url), '') else cover_url end,
    phone = case when p_phone is not null then nullif(trim(p_phone), '') else phone end,
    email = case when p_email is not null then nullif(trim(p_email), '') else email end,
    website_url = case when p_website_url is not null then nullif(trim(p_website_url), '') else website_url end,
    facebook_url = case when p_facebook_url is not null then nullif(trim(p_facebook_url), '') else facebook_url end,
    youtube_url = case when p_youtube_url is not null then nullif(trim(p_youtube_url), '') else youtube_url end,
    updated_at = now()
  where id = p_id;

  perform public.refresh_publisher_readiness(p_id);

  return json_build_object('ok', true, 'readinessScore', public.compute_publisher_readiness(p_id));
end;
$$;

-- Patch submit_publisher_content (extended signature from unified migration)
create or replace function public.submit_publisher_content(
  p_publisher_id uuid,
  p_kind public.publisher_content_kind,
  p_title text,
  p_description text default null,
  p_cover_url text default null,
  p_payload jsonb default '{}'::jsonb,
  p_visibility public.publisher_content_visibility default 'private',
  p_allow_download boolean default false,
  p_duration_seconds int default null,
  p_media_url text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pub record;
  v_id uuid;
  v_approval_id uuid;
  v_request_no text;
  v_status public.publisher_content_status := 'pending_review';
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_publisher_id, 'manage_content', v_user) then
    raise exception 'forbidden';
  end if;

  select * into v_pub from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.status not in ('under_review', 'draft', 'pending_publication') then
    raise exception 'invalid_publisher_state';
  end if;

  if coalesce(length(trim(p_title)), 0) < 2 then raise exception 'invalid_title'; end if;

  insert into public.publisher_content_items (
    publisher_id, content_kind, title, description, cover_url, payload, status, created_by,
    visibility, allow_download, duration_seconds, media_url
  )
  values (
    p_publisher_id, p_kind, trim(p_title), nullif(trim(p_description), ''),
    nullif(trim(p_cover_url), ''), coalesce(p_payload, '{}'::jsonb), v_status, v_user,
    coalesce(p_visibility, 'private'::public.publisher_content_visibility),
    coalesce(p_allow_download, false), p_duration_seconds, nullif(trim(p_media_url), '')
  )
  returning id into v_id;

  v_request_no := 'CR-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no, 'content_review', 'مراجعة محتوى — ' || trim(p_title), 'محتوى ناشر', 'pending', 'normal',
    jsonb_build_object(
      'contentId', v_id::text, 'publisherId', p_publisher_id::text,
      'publisherName', v_pub.name, 'contentKind', p_kind::text, 'title', trim(p_title),
      'visibility', p_visibility::text, 'allowDownload', coalesce(p_allow_download, false)
    )
  )
  returning id into v_approval_id;

  update public.publisher_content_items
  set approval_id = v_approval_id, updated_at = now()
  where id = v_id;

  perform public.refresh_publisher_readiness(p_publisher_id);

  return json_build_object('ok', true, 'contentId', v_id, 'approvalId', v_approval_id);
end;
$$;

create or replace function public.submit_publisher_for_publication(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pub record;
  v_score int;
  v_approval_id uuid;
  v_request_no text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_id, 'submit_publication', v_user) then
    raise exception 'forbidden';
  end if;

  select * into v_pub from public.publishers where id = p_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.status not in ('draft', 'under_review') then raise exception 'invalid_state'; end if;

  v_score := public.refresh_publisher_readiness(p_id);
  if v_score < 100 then raise exception 'readiness_incomplete'; end if;

  update public.publishers
  set status = 'pending_publication', submitted_for_review_at = now(), updated_at = now()
  where id = p_id;

  v_request_no := 'PP-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no, 'publisher_publication', 'نشر صفحة — ' || v_pub.name, 'نشر صفحة ناشر', 'pending', 'normal',
    jsonb_build_object(
      'publisherId', p_id::text, 'publisherType', v_pub.publisher_type::text,
      'submittedBy', v_user::text, 'readinessScore', v_score
    )
  )
  returning id into v_approval_id;

  return json_build_object('ok', true, 'approvalId', v_approval_id, 'readinessScore', v_score);
end;
$$;

-- ---------------------------------------------------------------------------
-- Team management RPCs
-- ---------------------------------------------------------------------------
create or replace function public.get_publisher_access(p_publisher_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_member record;
begin
  if v_user is null then return null; end if;

  if public.publisher_is_owner(p_publisher_id, v_user) then
    return json_build_object(
      'role', 'owner',
      'canEditProfile', true,
      'canManageContent', true,
      'canSubmitPublication', true,
      'canManageTeam', true
    );
  end if;

  select * into v_member
  from public.publisher_team_members m
  where m.publisher_id = p_publisher_id and m.user_id = v_user;

  if not found then return null; end if;

  return json_build_object(
    'role', 'assistant',
    'canEditProfile', v_member.can_edit_profile,
    'canManageContent', v_member.can_manage_content,
    'canSubmitPublication', v_member.can_submit_publication,
    'canManageTeam', v_member.can_manage_team
  );
end;
$$;

create or replace function public.list_publisher_team_members(p_publisher_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  return coalesce((
    select json_agg(row_to_json(t) order by t.created_at)
    from (
      select
        m.id,
        m.user_id as "userId",
        coalesce(p.display_name, 'عضو ألفا') as "displayName",
        m.can_edit_profile as "canEditProfile",
        m.can_manage_content as "canManageContent",
        m.can_submit_publication as "canSubmitPublication",
        m.can_manage_team as "canManageTeam",
        m.created_at as "createdAt"
      from public.publisher_team_members m
      left join public.profiles p on p.id = m.user_id
      where m.publisher_id = p_publisher_id
    ) t
  ), '[]'::json);
end;
$$;

create or replace function public.add_publisher_team_member(
  p_publisher_id uuid,
  p_email text,
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
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  select owner_user_id into v_owner from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;

  select u.id into v_target
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
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

create or replace function public.update_publisher_team_member(
  p_member_id uuid,
  p_can_edit_profile boolean,
  p_can_manage_content boolean,
  p_can_submit_publication boolean,
  p_can_manage_team boolean
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row record;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select m.*, p.owner_user_id
  into v_row
  from public.publisher_team_members m
  join public.publishers p on p.id = m.publisher_id
  where m.id = p_member_id;

  if not found then raise exception 'not_found'; end if;
  if not public.publisher_team_has_perm(v_row.publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  update public.publisher_team_members
  set
    can_edit_profile = coalesce(p_can_edit_profile, can_edit_profile),
    can_manage_content = coalesce(p_can_manage_content, can_manage_content),
    can_submit_publication = coalesce(p_can_submit_publication, can_submit_publication),
    can_manage_team = coalesce(p_can_manage_team, can_manage_team),
    updated_at = now()
  where id = p_member_id;

  return json_build_object('ok', true);
end;
$$;

create or replace function public.remove_publisher_team_member(p_member_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row record;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select m.publisher_id into v_row
  from public.publisher_team_members m
  where m.id = p_member_id;

  if not found then raise exception 'not_found'; end if;
  if not public.publisher_team_has_perm(v_row.publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  delete from public.publisher_team_members where id = p_member_id;
  return json_build_object('ok', true);
end;
$$;

create or replace function public.can_create_publisher_application()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.user_owns_self_service_publisher(auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- RLS — team read access
-- ---------------------------------------------------------------------------
drop policy if exists publishers_team_read on public.publishers;
create policy publishers_team_read on public.publishers
  for select to authenticated
  using (
    exists (
      select 1 from public.publisher_team_members m
      where m.publisher_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists publisher_content_team_read on public.publisher_content_items;
create policy publisher_content_team_read on public.publisher_content_items
  for select to authenticated
  using (
    exists (
      select 1 from public.publisher_team_members m
      where m.publisher_id = publisher_id and m.user_id = auth.uid()
    )
  );

drop policy if exists publisher_team_members_owner_read on public.publisher_team_members;
create policy publisher_team_members_owner_read on public.publisher_team_members
  for select to authenticated
  using (public.publisher_team_has_perm(publisher_id, 'manage_team', auth.uid()));

drop policy if exists publisher_team_members_self_read on public.publisher_team_members;
create policy publisher_team_members_self_read on public.publisher_team_members
  for select to authenticated
  using (user_id = auth.uid());

grant select on public.publisher_team_members to authenticated;
grant execute on function public.get_publisher_access(uuid) to authenticated;
grant execute on function public.list_publisher_team_members(uuid) to authenticated;
grant execute on function public.add_publisher_team_member(uuid, text, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.update_publisher_team_member(uuid, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.remove_publisher_team_member(uuid) to authenticated;
grant execute on function public.can_create_publisher_application() to authenticated;
grant execute on function public.user_owns_self_service_publisher(uuid) to authenticated;
