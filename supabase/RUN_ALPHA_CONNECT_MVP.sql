/*
  Phase 1 — Alpha Connect MVP
  ALPHA-DATA-POLICY-002: ephemeral retention via retention_policy + expires_at + purge
  church_id uses bigint to match legacy public.churches.id
*/

/* ── Tables ─────────────────────────────────────────────────────────────── */

create table if not exists public.alpha_connect_conversations (
  id uuid primary key default gen_random_uuid(),
  church_id bigint references public.churches (id) on delete set null,
  kind text not null check (kind in ('direct', 'group')),
  title text,
  group_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alpha_connect_conversation_members (
  conversation_id uuid not null references public.alpha_connect_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.alpha_connect_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.alpha_connect_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'voice' check (kind in ('voice', 'text', 'ptt')),
  body text,
  audio_path text,
  duration_ms int,
  retention_policy text not null default '24h'
    check (retention_policy in ('on_read', '1h', '6h', '12h', '24h', '3d', '7d')),
  expires_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alpha_connect_messages_conversation_idx
  on public.alpha_connect_messages (conversation_id, created_at desc);

create index if not exists alpha_connect_messages_expires_idx
  on public.alpha_connect_messages (expires_at)
  where expires_at is not null;

create index if not exists alpha_connect_conversations_group_code_idx
  on public.alpha_connect_conversations (group_code)
  where group_code is not null;

/* ── Retention (ALPHA-DATA-POLICY-002) ──────────────────────────────────── */

create or replace function public.alpha_connect_retention_interval(p_policy text)
returns interval
language sql
immutable
as $$
  select case p_policy
    when '1h' then interval '1 hour'
    when '6h' then interval '6 hours'
    when '12h' then interval '12 hours'
    when '24h' then interval '24 hours'
    when '3d' then interval '3 days'
    when '7d' then interval '7 days'
    else null
  end;
$$;

create or replace function public.alpha_connect_set_message_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.retention_policy = 'on_read' then
    new.expires_at := null;
  else
    new.expires_at := now() + public.alpha_connect_retention_interval(new.retention_policy);
    if new.expires_at is null then
      raise exception 'invalid retention_policy: % (ALPHA-DATA-POLICY-002)', new.retention_policy;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_set_expiry on public.alpha_connect_messages;
create trigger alpha_connect_messages_set_expiry
  before insert on public.alpha_connect_messages
  for each row execute function public.alpha_connect_set_message_expiry();

create or replace function public.alpha_connect_delete_storage_object(p_path text)
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  if p_path is null or length(trim(p_path)) = 0 then
    return;
  end if;
  delete from storage.objects
  where bucket_id = 'alpha-connect-audio'
    and name = p_path;
end;
$$;

create or replace function public.alpha_connect_on_message_consumed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.retention_policy = 'on_read'
     and new.read_at is not null
     and old.read_at is null then
    perform public.alpha_connect_delete_storage_object(new.audio_path);
    delete from public.alpha_connect_messages where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_consume_on_read on public.alpha_connect_messages;
create trigger alpha_connect_messages_consume_on_read
  after update of read_at on public.alpha_connect_messages
  for each row execute function public.alpha_connect_on_message_consumed();

create or replace function public.alpha_connect_purge_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  n integer := 0;
begin
  for rec in
    select id, audio_path
    from public.alpha_connect_messages
    where expires_at is not null and expires_at <= now()
    order by expires_at
    for update skip locked
  loop
    perform public.alpha_connect_delete_storage_object(rec.audio_path);
    delete from public.alpha_connect_messages where id = rec.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

grant execute on function public.alpha_connect_purge_expired_messages() to authenticated;

/* ── Server-side purge schedule (pg_cron) ───────────────────────────────── */

create extension if not exists pg_cron with schema extensions;

do $$
begin
  perform cron.unschedule('alpha-connect-purge-expired');
exception
  when others then null;
end $$;

select cron.schedule(
  'alpha-connect-purge-expired',
  '*/15 * * * *',
  $$select public.alpha_connect_purge_expired_messages()$$
);

/* ── Conversation bootstrap RPCs ──────────────────────────────────────────── */

create or replace function public.alpha_connect_open_group(p_group_code text, p_title text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_conv uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select id into v_conv
  from public.alpha_connect_conversations
  where group_code = p_group_code;

  if v_conv is null then
    insert into public.alpha_connect_conversations (kind, title, group_code)
    values ('group', coalesce(nullif(trim(p_title), ''), p_group_code), p_group_code)
    returning id into v_conv;
  end if;

  insert into public.alpha_connect_conversation_members (conversation_id, user_id)
  values (v_conv, v_uid)
  on conflict do nothing;

  return v_conv;
end;
$$;

create or replace function public.alpha_connect_open_personal()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_conv uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_code := 'personal:' || v_uid::text;

  select id into v_conv
  from public.alpha_connect_conversations
  where group_code = v_code;

  if v_conv is null then
    insert into public.alpha_connect_conversations (kind, title, group_code)
    values ('direct', 'رسائلي', v_code)
    returning id into v_conv;
  end if;

  insert into public.alpha_connect_conversation_members (conversation_id, user_id)
  values (v_conv, v_uid)
  on conflict do nothing;

  return v_conv;
end;
$$;

grant execute on function public.alpha_connect_open_group(text, text) to authenticated;
grant execute on function public.alpha_connect_open_personal() to authenticated;

/* ── RLS ────────────────────────────────────────────────────────────────── */

alter table public.alpha_connect_conversations enable row level security;
alter table public.alpha_connect_conversation_members enable row level security;
alter table public.alpha_connect_messages enable row level security;

drop policy if exists "alpha_connect_conversations_member_read" on public.alpha_connect_conversations;
create policy "alpha_connect_conversations_member_read"
  on public.alpha_connect_conversations for select to authenticated
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "alpha_connect_members_self_read" on public.alpha_connect_conversation_members;
create policy "alpha_connect_members_self_read"
  on public.alpha_connect_conversation_members for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "alpha_connect_messages_member_read" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_read"
  on public.alpha_connect_messages for select to authenticated
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "alpha_connect_messages_member_insert" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_insert"
  on public.alpha_connect_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "alpha_connect_messages_member_update" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_update"
  on public.alpha_connect_messages for update to authenticated
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

grant select on public.alpha_connect_conversations to authenticated;
grant select on public.alpha_connect_conversation_members to authenticated;
grant select, insert, update on public.alpha_connect_messages to authenticated;

/* ── Storage bucket: alpha-connect-audio ────────────────────────────────── */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'alpha-connect-audio',
  'alpha-connect-audio',
  false,
  10485760,
  array['audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/mpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "alpha_connect_audio_upload" on storage.objects;
create policy "alpha_connect_audio_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'alpha-connect-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "alpha_connect_audio_read" on storage.objects;
create policy "alpha_connect_audio_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'alpha-connect-audio'
    and exists (
      select 1
      from public.alpha_connect_conversation_members m
      where m.user_id = auth.uid()
        and m.conversation_id::text = (storage.foldername(name))[2]
    )
  );

drop policy if exists "alpha_connect_audio_delete" on storage.objects;
create policy "alpha_connect_audio_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'alpha-connect-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

/* ── Realtime ───────────────────────────────────────────────────────────── */

do $$
begin
  alter publication supabase_realtime add table public.alpha_connect_messages;
exception
  when duplicate_object then null;
  when others then null;
end $$;

notify pgrst, 'reload schema';
