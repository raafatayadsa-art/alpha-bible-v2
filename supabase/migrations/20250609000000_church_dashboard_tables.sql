-- Church Dashboard — core tables (minimum viable)
-- Safe for existing `churches` table on remote (additive columns + new tables)

-- ---------------------------------------------------------------------------
-- Churches — extend legacy table or create fresh
-- ---------------------------------------------------------------------------
create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.churches add column if not exists setup_request_id uuid references public.church_setup_requests (id) on delete set null;
alter table public.churches add column if not exists diocese text;
alter table public.churches add column if not exists governorate text;
alter table public.churches add column if not exists city text;
alter table public.churches add column if not exists address text;
alter table public.churches add column if not exists location_lat numeric;
alter table public.churches add column if not exists location_lng numeric;
alter table public.churches add column if not exists phone text;
alter table public.churches add column if not exists whatsapp text;
alter table public.churches add column if not exists cover_image_url text;
alter table public.churches add column if not exists status text not null default 'pending';
alter table public.churches add column if not exists member_count int not null default 0;
alter table public.churches add column if not exists servant_count int not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'churches_status_check'
  ) then
    alter table public.churches
      add constraint churches_status_check
      check (status in ('pending', 'approved', 'suspended'));
  end if;
exception when others then
  null;
end $$;

create unique index if not exists churches_setup_request_id_idx
  on public.churches (setup_request_id)
  where setup_request_id is not null;

create index if not exists churches_status_idx on public.churches (status);

-- ---------------------------------------------------------------------------
-- Memberships
-- ---------------------------------------------------------------------------
create table if not exists public.church_memberships (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  user_id text not null,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, user_id)
);

alter table public.church_memberships add column if not exists role_label text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'church_memberships_status_check'
  ) then
    alter table public.church_memberships
      add constraint church_memberships_status_check
      check (status in ('pending', 'active', 'left'));
  end if;
exception when others then
  null;
end $$;

create index if not exists church_memberships_user_idx on public.church_memberships (user_id);
create index if not exists church_memberships_church_idx on public.church_memberships (church_id);

-- ---------------------------------------------------------------------------
-- Roles / contacts (priest, servant, admin)
-- ---------------------------------------------------------------------------
create table if not exists public.church_roles (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  role_type text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.church_roles add column if not exists user_id text;
alter table public.church_roles add column if not exists title text not null default '';
alter table public.church_roles add column if not exists phone text not null default '';
alter table public.church_roles add column if not exists whatsapp text not null default '';
alter table public.church_roles add column if not exists initials text not null default '✚';
alter table public.church_roles add column if not exists messaging_allowed boolean not null default false;
alter table public.church_roles add column if not exists is_primary_priest boolean not null default false;
alter table public.church_roles add column if not exists visible_to_members boolean not null default true;
alter table public.church_roles add column if not exists sort_order int not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'church_roles_role_type_check'
  ) then
    alter table public.church_roles
      add constraint church_roles_role_type_check
      check (role_type in ('priest', 'servant', 'admin'));
  end if;
exception when others then
  null;
end $$;

create index if not exists church_roles_church_idx on public.church_roles (church_id);
create index if not exists church_roles_church_visible_idx
  on public.church_roles (church_id, visible_to_members);

-- ---------------------------------------------------------------------------
-- Church notifications (member-facing)
-- ---------------------------------------------------------------------------
create table if not exists public.church_notifications (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.church_notifications add column if not exists user_id text;
alter table public.church_notifications add column if not exists body text not null default '';
alter table public.church_notifications add column if not exists kind text not null default 'general';
alter table public.church_notifications add column if not exists read boolean not null default false;

create index if not exists church_notifications_church_idx on public.church_notifications (church_id);
create index if not exists church_notifications_user_idx on public.church_notifications (user_id);

-- ---------------------------------------------------------------------------
-- Prayer requests
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches (id) on delete cascade,
  user_id text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prayer_requests add column if not exists church_id bigint references public.churches (id) on delete cascade;
alter table public.prayer_requests add column if not exists user_name text not null default '';
alter table public.prayer_requests add column if not exists category text not null default 'طلبة';
alter table public.prayer_requests add column if not exists status text not null default 'active';
alter table public.prayer_requests add column if not exists anonymous boolean not null default false;
alter table public.prayer_requests add column if not exists visibility text not null default 'community';
alter table public.prayer_requests add column if not exists prayer_count int not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_status_check'
  ) then
    alter table public.prayer_requests
      add constraint prayer_requests_status_check
      check (status in ('active', 'urgent', 'answered'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_visibility_check'
  ) then
    alter table public.prayer_requests
      add constraint prayer_requests_visibility_check
      check (visibility in ('community', 'private', 'leaders_only'));
  end if;
exception when others then
  null;
end $$;

create index if not exists prayer_requests_church_idx on public.prayer_requests (church_id);
create index if not exists prayer_requests_visibility_idx
  on public.prayer_requests (church_id, visibility);

-- ---------------------------------------------------------------------------
-- RLS — dev-friendly (tighten with auth.uid() before production)
-- ---------------------------------------------------------------------------
alter table public.churches enable row level security;
alter table public.church_memberships enable row level security;
alter table public.church_roles enable row level security;
alter table public.church_notifications enable row level security;
alter table public.prayer_requests enable row level security;

drop policy if exists churches_public_read on public.churches;
create policy churches_public_read
  on public.churches for select to anon, authenticated
  using (status = 'approved');

drop policy if exists churches_service_write on public.churches;
create policy churches_service_write
  on public.churches for all to anon, authenticated
  using (true) with check (true);

drop policy if exists church_memberships_public_all on public.church_memberships;
create policy church_memberships_public_all
  on public.church_memberships for all to anon, authenticated
  using (true) with check (true);

drop policy if exists church_roles_public_read on public.church_roles;
create policy church_roles_public_read
  on public.church_roles for select to anon, authenticated
  using (visible_to_members = true);

drop policy if exists church_roles_public_write on public.church_roles;
create policy church_roles_public_write
  on public.church_roles for all to anon, authenticated
  using (true) with check (true);

drop policy if exists church_notifications_public_all on public.church_notifications;
create policy church_notifications_public_all
  on public.church_notifications for all to anon, authenticated
  using (true) with check (true);

drop policy if exists prayer_requests_public_read on public.prayer_requests;
create policy prayer_requests_public_read
  on public.prayer_requests for select to anon, authenticated
  using (visibility = 'community');

drop policy if exists prayer_requests_public_write on public.prayer_requests;
create policy prayer_requests_public_write
  on public.prayer_requests for all to anon, authenticated
  using (true) with check (true);
