-- ALPHA-110: Publisher verification & content moderation foundation

do $$
begin
  if not exists (select 1 from pg_type where typname = 'publisher_type') then
    create type public.publisher_type as enum (
      'church',
      'monastery',
      'hymn_team',
      'choir',
      'priest',
      'bishop',
      'church_service',
      'publishing_house',
      'institution'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'publisher_status') then
    create type public.publisher_status as enum (
      'under_review',
      'draft',
      'pending_publication',
      'published',
      'suspended'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'publisher_content_kind') then
    create type public.publisher_content_kind as enum (
      'album',
      'hymn',
      'book',
      'lecture',
      'video',
      'cover',
      'logo',
      'playlist',
      'article'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'publisher_content_status') then
    create type public.publisher_content_status as enum (
      'draft',
      'pending_review',
      'approved',
      'rejected',
      'needs_changes'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Publishers (unified entity for churches, monasteries, choirs, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.publishers (
  id uuid primary key default gen_random_uuid(),
  publisher_type public.publisher_type not null,
  name text not null,
  english_name text,
  bio text,
  logo_url text,
  cover_url text,
  phone text,
  email text,
  website_url text,
  facebook_url text,
  youtube_url text,
  status public.publisher_status not null default 'under_review',
  is_trusted boolean not null default false,
  is_public boolean not null default false,
  owner_user_id uuid references auth.users (id) on delete set null,
  church_id bigint references public.churches (id) on delete set null,
  monastery_id bigint references public.monasteries (id) on delete set null,
  follower_count int not null default 0,
  content_count int not null default 0,
  readiness_score int not null default 0 check (readiness_score >= 0 and readiness_score <= 100),
  identity_approval_id uuid references public.platform_approvals (id) on delete set null,
  submitted_for_review_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists publishers_status_idx on public.publishers (status);
create index if not exists publishers_type_idx on public.publishers (publisher_type);
create index if not exists publishers_owner_idx on public.publishers (owner_user_id);
create unique index if not exists publishers_church_unique
  on public.publishers (church_id) where church_id is not null;
create unique index if not exists publishers_monastery_unique
  on public.publishers (monastery_id) where monastery_id is not null;

-- ---------------------------------------------------------------------------
-- Publisher content (moderated — never public until approved)
-- ---------------------------------------------------------------------------
create table if not exists public.publisher_content_items (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers (id) on delete cascade,
  content_kind public.publisher_content_kind not null,
  title text not null,
  description text,
  cover_url text,
  payload jsonb not null default '{}'::jsonb,
  status public.publisher_content_status not null default 'pending_review',
  sort_order int not null default 0,
  approval_id uuid references public.platform_approvals (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists publisher_content_publisher_idx on public.publisher_content_items (publisher_id);
create index if not exists publisher_content_status_idx on public.publisher_content_items (status);
create index if not exists publisher_content_pending_idx
  on public.publisher_content_items (status, created_at desc)
  where status = 'pending_review';

-- ---------------------------------------------------------------------------
-- Readiness helper
-- ---------------------------------------------------------------------------
create or replace function public.compute_publisher_readiness(p_id uuid)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v record;
  v_score int := 0;
  v_has_content boolean;
begin
  select * into v from public.publishers where id = p_id;
  if not found then return 0; end if;

  if coalesce(length(trim(v.cover_url)), 0) > 0 then v_score := v_score + 20; end if;
  if coalesce(length(trim(v.logo_url)), 0) > 0 then v_score := v_score + 20; end if;
  if coalesce(length(trim(v.bio)), 0) >= 40 then v_score := v_score + 20; end if;
  if coalesce(length(trim(v.phone)), 0) > 0 or coalesce(length(trim(v.email)), 0) > 0 then
    v_score := v_score + 20;
  end if;

  select exists (
    select 1 from public.publisher_content_items c
    where c.publisher_id = p_id
      and c.content_kind in ('album', 'book', 'hymn', 'lecture', 'playlist')
  ) into v_has_content;

  if v_has_content then v_score := v_score + 20; end if;

  return least(v_score, 100);
end;
$$;

create or replace function public.refresh_publisher_readiness(p_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_score int;
begin
  v_score := public.compute_publisher_readiness(p_id);
  update public.publishers
  set readiness_score = v_score, updated_at = now()
  where id = p_id;
  return v_score;
end;
$$;

-- ---------------------------------------------------------------------------
-- Submit new publisher application (NOT for church/monastery — use ALPHA-107 claim)
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

  return json_build_object('ok', true, 'publisherId', v_id, 'approvalId', v_approval_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Update publisher workspace (owner only, private states)
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

  select * into v_pub from public.publishers where id = p_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.owner_user_id is distinct from v_user then raise exception 'forbidden'; end if;
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

-- ---------------------------------------------------------------------------
-- Submit content item (always pending_review unless trusted fast-track later)
-- ---------------------------------------------------------------------------
create or replace function public.submit_publisher_content(
  p_publisher_id uuid,
  p_kind public.publisher_content_kind,
  p_title text,
  p_description text default null,
  p_cover_url text default null,
  p_payload jsonb default '{}'::jsonb
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

  select * into v_pub from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.owner_user_id is distinct from v_user then raise exception 'forbidden'; end if;
  if v_pub.status not in ('under_review', 'draft', 'pending_publication') then
    raise exception 'invalid_publisher_state';
  end if;

  if coalesce(length(trim(p_title)), 0) < 2 then raise exception 'invalid_title'; end if;

  insert into public.publisher_content_items (
    publisher_id, content_kind, title, description, cover_url, payload, status, created_by
  )
  values (
    p_publisher_id,
    p_kind,
    trim(p_title),
    nullif(trim(p_description), ''),
    nullif(trim(p_cover_url), ''),
    coalesce(p_payload, '{}'::jsonb),
    v_status,
    v_user
  )
  returning id into v_id;

  v_request_no := 'CR-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no,
    'content_review',
    'مراجعة محتوى — ' || trim(p_title),
    'محتوى ناشر',
    'pending',
    'normal',
    jsonb_build_object(
      'contentId', v_id::text,
      'publisherId', p_publisher_id::text,
      'publisherName', v_pub.name,
      'contentKind', p_kind::text,
      'title', trim(p_title)
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

-- ---------------------------------------------------------------------------
-- Submit publisher page for final publication review
-- ---------------------------------------------------------------------------
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

  select * into v_pub from public.publishers where id = p_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.owner_user_id is distinct from v_user then raise exception 'forbidden'; end if;
  if v_pub.status not in ('draft', 'under_review') then raise exception 'invalid_state'; end if;

  v_score := public.refresh_publisher_readiness(p_id);
  if v_score < 100 then raise exception 'readiness_incomplete'; end if;

  update public.publishers
  set status = 'pending_publication', submitted_for_review_at = now(), updated_at = now()
  where id = p_id;

  v_request_no := 'PP-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no,
    'publisher_publication',
    'نشر صفحة — ' || v_pub.name,
    'نشر صفحة ناشر',
    'pending',
    'normal',
    jsonb_build_object(
      'publisherId', p_id::text,
      'publisherType', v_pub.publisher_type::text,
      'submittedBy', v_user::text,
      'readinessScore', v_score
    )
  )
  returning id into v_approval_id;

  return json_build_object('ok', true, 'approvalId', v_approval_id, 'readinessScore', v_score);
end;
$$;

-- ---------------------------------------------------------------------------
-- Link church to publisher when claim verified (ALPHA-107 bridge)
-- ---------------------------------------------------------------------------
create or replace function public.ensure_church_publisher(p_church_id bigint, p_owner_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_church record;
  v_id uuid;
begin
  select id into v_id from public.publishers where church_id = p_church_id limit 1;
  if v_id is not null then return v_id; end if;

  select church_name, hero_image, cover_image_url, phone, email, website_url
  into v_church
  from public.churches where id = p_church_id;

  if not found then return null; end if;

  insert into public.publishers (
    publisher_type, name, cover_url, logo_url, phone, email, website_url,
    church_id, owner_user_id, status, is_public, is_trusted
  )
  values (
    'church',
    v_church.church_name,
    v_church.cover_image_url,
    v_church.hero_image,
    v_church.phone,
    v_church.email,
    v_church.website_url,
    p_church_id,
    p_owner_id,
    'draft',
    false,
    false
  )
  returning id into v_id;

  perform public.refresh_publisher_readiness(v_id);
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.publishers enable row level security;
alter table public.publisher_content_items enable row level security;

drop policy if exists publishers_public_read on public.publishers;
create policy publishers_public_read on public.publishers
  for select to anon, authenticated
  using (status = 'published' and is_public = true);

drop policy if exists publishers_owner_read on public.publishers;
create policy publishers_owner_read on public.publishers
  for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists publisher_content_owner_read on public.publisher_content_items;
create policy publisher_content_owner_read on public.publisher_content_items
  for select to authenticated
  using (
    exists (
      select 1 from public.publishers p
      where p.id = publisher_id and p.owner_user_id = auth.uid()
    )
  );

drop policy if exists publisher_content_public_read on public.publisher_content_items;
create policy publisher_content_public_read on public.publisher_content_items
  for select to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1 from public.publishers p
      where p.id = publisher_id and p.status = 'published' and p.is_public = true
    )
  );

grant select on public.publishers to anon, authenticated;
grant select on public.publisher_content_items to anon, authenticated;
grant execute on function public.submit_publisher_application to authenticated;
grant execute on function public.update_publisher_workspace to authenticated;
grant execute on function public.submit_publisher_content to authenticated;
grant execute on function public.submit_publisher_for_publication to authenticated;
grant execute on function public.compute_publisher_readiness to authenticated;
grant execute on function public.refresh_publisher_readiness to authenticated;

-- Platform / admin review reads (dev parity with platform_approvals open RLS)
drop policy if exists publisher_content_admin_read on public.publisher_content_items;
create policy publisher_content_admin_read on public.publisher_content_items
  for select to authenticated using (true);

drop policy if exists publishers_admin_read on public.publishers;
create policy publishers_admin_read on public.publishers
  for select to authenticated using (true);

drop policy if exists publishers_admin_update on public.publishers;
create policy publishers_admin_update on public.publishers
  for update to authenticated using (true) with check (true);

drop policy if exists publisher_content_admin_update on public.publisher_content_items;
create policy publisher_content_admin_update on public.publisher_content_items
  for update to authenticated using (true) with check (true);
