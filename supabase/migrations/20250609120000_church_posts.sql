-- Church posts — member-facing feed (separate from existing tables; no RLS changes elsewhere)

create table if not exists public.church_posts (
  id uuid primary key default gen_random_uuid(),
  church_id bigint not null references public.churches (id) on delete cascade,
  type text not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  image_url text,
  author text not null default '',
  created_by text,
  pinned_until timestamptz,
  expires_at timestamptz,
  archived boolean not null default false,
  closed boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists church_posts_church_idx on public.church_posts (church_id);
create index if not exists church_posts_church_archived_idx on public.church_posts (church_id, archived);
create index if not exists church_posts_created_idx on public.church_posts (church_id, created_at desc);

alter table public.church_posts enable row level security;

drop policy if exists church_posts_public_read on public.church_posts;
create policy church_posts_public_read
  on public.church_posts for select to anon, authenticated
  using (archived = false or true);

drop policy if exists church_posts_public_write on public.church_posts;
create policy church_posts_public_write
  on public.church_posts for all to anon, authenticated
  using (true) with check (true);
