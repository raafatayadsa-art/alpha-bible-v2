-- Church post comments & reactions (likes) — feed engagement

create table if not exists public.church_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.church_posts (id) on delete cascade,
  user_id text not null,
  user_name text not null,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists church_post_comments_post_idx
  on public.church_post_comments (post_id, created_at desc);

create table if not exists public.church_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.church_posts (id) on delete cascade,
  user_id text not null,
  kind text not null default 'love' check (kind in ('love', 'amen', 'pray')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);

create index if not exists church_post_reactions_post_idx
  on public.church_post_reactions (post_id, kind);

alter table public.church_post_comments enable row level security;
alter table public.church_post_reactions enable row level security;

drop policy if exists church_post_comments_public_read on public.church_post_comments;
create policy church_post_comments_public_read
  on public.church_post_comments for select to anon, authenticated
  using (true);

drop policy if exists church_post_comments_public_write on public.church_post_comments;
create policy church_post_comments_public_write
  on public.church_post_comments for all to anon, authenticated
  using (true) with check (true);

drop policy if exists church_post_reactions_public_read on public.church_post_reactions;
create policy church_post_reactions_public_read
  on public.church_post_reactions for select to anon, authenticated
  using (true);

drop policy if exists church_post_reactions_public_write on public.church_post_reactions;
create policy church_post_reactions_public_write
  on public.church_post_reactions for all to anon, authenticated
  using (true) with check (true);
