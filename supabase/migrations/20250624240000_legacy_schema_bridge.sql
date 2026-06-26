-- Bridge legacy Supabase schema before ALPHA-107 / ALPHA-110
-- Safe on fresh DBs (no-op) and on legacy publishers + monasteries seed.

-- ---------------------------------------------------------------------------
-- Legacy publishers (empty, wrong columns) blocks CREATE TABLE IF NOT EXISTS
-- ---------------------------------------------------------------------------
drop policy if exists create_publisher on public.publishers;
drop policy if exists owner_view_own_publisher on public.publishers;
drop policy if exists platform_owners_manage_publishers on public.publishers;
drop policy if exists update_own_publisher on public.publishers;
drop policy if exists view_verified_publishers on public.publishers;

drop table if exists public.publishers cascade;

-- ---------------------------------------------------------------------------
-- Monasteries seed (69 rows) — align column names with ALPHA-107
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'monasteries' and column_name = 'name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'monasteries' and column_name = 'monastery_name'
  ) then
    alter table public.monasteries rename column name to monastery_name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'monasteries' and column_name = 'address'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'monasteries' and column_name = 'formatted_address'
  ) then
    alter table public.monasteries rename column address to formatted_address;
  end if;
end $$;

alter table public.monasteries
  add column if not exists hero_image text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website_url text,
  add column if not exists members_count int not null default 0,
  add column if not exists updated_at timestamptz default now();

update public.monasteries
set updated_at = coalesce(created_at, now())
where updated_at is null;

alter table public.monasteries
  alter column updated_at set default now();
