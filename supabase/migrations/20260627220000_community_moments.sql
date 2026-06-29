-- Community hub: structured spiritual shares (no free-form posts)
-- Domain: church community spiritual moments

create table if not exists public.community_moments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reading', 'prayer', 'agpeya')),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  user_avatar_url text,
  church_id bigint references public.churches (id) on delete set null,
  church_name text,
  payload jsonb not null,
  church_post_id text,
  created_at timestamptz not null default now()
);

create index if not exists community_moments_created_at_idx
  on public.community_moments (created_at desc);

create index if not exists community_moments_church_id_idx
  on public.community_moments (church_id);

create table if not exists public.community_moment_reactions (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.community_moments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('amen', 'prayed_for')),
  created_at timestamptz not null default now(),
  unique (moment_id, user_id, kind)
);

create table if not exists public.community_moment_comments (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.community_moments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists community_moment_comments_moment_id_idx
  on public.community_moment_comments (moment_id, created_at);

alter table public.community_moments enable row level security;
alter table public.community_moment_reactions enable row level security;
alter table public.community_moment_comments enable row level security;

drop policy if exists "community_moments_select_authenticated" on public.community_moments;
create policy "community_moments_select_authenticated"
  on public.community_moments for select
  to authenticated
  using (true);

drop policy if exists "community_moments_insert_own" on public.community_moments;
create policy "community_moments_insert_own"
  on public.community_moments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "community_moment_reactions_select" on public.community_moment_reactions;
create policy "community_moment_reactions_select"
  on public.community_moment_reactions for select
  to authenticated
  using (true);

drop policy if exists "community_moment_reactions_insert_own" on public.community_moment_reactions;
create policy "community_moment_reactions_insert_own"
  on public.community_moment_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "community_moment_reactions_delete_own" on public.community_moment_reactions;
create policy "community_moment_reactions_delete_own"
  on public.community_moment_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "community_moment_comments_select" on public.community_moment_comments;
drop policy if exists "community_moments_comments_select" on public.community_moment_comments;
create policy "community_moment_comments_select"
  on public.community_moment_comments for select
  to authenticated
  using (true);

drop policy if exists "community_moment_comments_insert_own" on public.community_moment_comments;
create policy "community_moment_comments_insert_own"
  on public.community_moment_comments for insert
  to authenticated
  with check (auth.uid() = user_id);
