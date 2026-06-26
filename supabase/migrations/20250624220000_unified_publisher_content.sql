-- Unified publisher content fields (visibility, download policy, engagement, media)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'publisher_content_visibility') then
    create type public.publisher_content_visibility as enum (
      'public',
      'verified_users',
      'church_members',
      'followers',
      'private'
    );
  end if;
end $$;

alter table public.publisher_content_items
  add column if not exists visibility public.publisher_content_visibility not null default 'private',
  add column if not exists allow_download boolean not null default false,
  add column if not exists likes_count int not null default 0 check (likes_count >= 0),
  add column if not exists duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists media_url text;

-- PDF as first-class content kind (alongside book)
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'publisher_content_kind' and e.enumlabel = 'pdf'
  ) then
    alter type public.publisher_content_kind add value 'pdf';
  end if;
exception
  when duplicate_object then null;
end $$;

create index if not exists publisher_content_public_feed_idx
  on public.publisher_content_items (created_at desc)
  where status = 'approved' and visibility = 'public';

create index if not exists publisher_content_audio_feed_idx
  on public.publisher_content_items (publisher_id, created_at desc)
  where status = 'approved'
    and visibility = 'public'
    and content_kind in ('hymn', 'album', 'lecture', 'playlist');

-- ---------------------------------------------------------------------------
-- Submit content — extended unified fields
-- ---------------------------------------------------------------------------
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

  select * into v_pub from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.owner_user_id is distinct from v_user then raise exception 'forbidden'; end if;
  if v_pub.status not in ('under_review', 'draft', 'pending_publication') then
    raise exception 'invalid_publisher_state';
  end if;

  if coalesce(length(trim(p_title)), 0) < 2 then raise exception 'invalid_title'; end if;

  insert into public.publisher_content_items (
    publisher_id,
    content_kind,
    title,
    description,
    cover_url,
    payload,
    status,
    created_by,
    visibility,
    allow_download,
    duration_seconds,
    media_url
  )
  values (
    p_publisher_id,
    p_kind,
    trim(p_title),
    nullif(trim(p_description), ''),
    nullif(trim(p_cover_url), ''),
    coalesce(p_payload, '{}'::jsonb),
    v_status,
    v_user,
    coalesce(p_visibility, 'private'::public.publisher_content_visibility),
    coalesce(p_allow_download, false),
    p_duration_seconds,
    nullif(trim(p_media_url), '')
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
      'title', trim(p_title),
      'visibility', p_visibility::text,
      'allowDownload', coalesce(p_allow_download, false)
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

grant execute on function public.submit_publisher_content(
  uuid,
  public.publisher_content_kind,
  text,
  text,
  text,
  jsonb,
  public.publisher_content_visibility,
  boolean,
  int,
  text
) to authenticated;
