/*
  Alpha Connect voice messaging (future backend - not wired in app yet)
  Retention: expires_at enforces ephemeral policies (e.g. 7 days)
*/

create table if not exists public.alpha_connect_conversations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches (id) on delete cascade,
  kind text not null check (kind in ('direct', 'group')),
  title text,
  group_code text,
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
  retention_policy text not null default 'week'
    check (retention_policy in ('read', 'hour', 'day', 'week', 'never')),
  expires_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alpha_connect_messages_conversation_idx
  on public.alpha_connect_messages (conversation_id, created_at desc);

create index if not exists alpha_connect_messages_expires_idx
  on public.alpha_connect_messages (expires_at)
  where expires_at is not null;

alter table public.alpha_connect_conversations enable row level security;
alter table public.alpha_connect_conversation_members enable row level security;
alter table public.alpha_connect_messages enable row level security;

drop policy if exists "alpha_connect_conversations_member_read" on public.alpha_connect_conversations;
create policy "alpha_connect_conversations_member_read"
  on public.alpha_connect_conversations for select
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "alpha_connect_members_self_read" on public.alpha_connect_conversation_members;
create policy "alpha_connect_members_self_read"
  on public.alpha_connect_conversation_members for select
  using (user_id = auth.uid());

drop policy if exists "alpha_connect_messages_member_read" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_read"
  on public.alpha_connect_messages for select
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "alpha_connect_messages_member_insert" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_insert"
  on public.alpha_connect_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

/*
  Storage bucket (create in Supabase dashboard or storage API):
  alpha-connect-audio (private, RLS: auth.uid() folder prefix)
*/
