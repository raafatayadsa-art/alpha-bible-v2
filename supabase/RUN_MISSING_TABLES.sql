/*
  RUN IN SUPABASE SQL EDITOR (copy entire file, then Run)
  Phase 1 Alpha Connect MVP + ALPHA-076 Identity (idempotent)

  Prefer: node scripts/apply-missing-tables.mjs (with SUPABASE_DB_PASSWORD)
  Or paste: supabase/RUN_ALPHA_CONNECT_MVP.sql then alpha_identities section below.
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Alpha Connect MVP — see supabase/RUN_ALPHA_CONNECT_MVP.sql (full file)
--    Run that file first, OR use scripts/apply-missing-tables.mjs
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ALPHA-076 Digital Identity
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.alpha_identities (
  user_id uuid primary key references auth.users (id) on delete cascade,
  alpha_id text not null unique,
  alpha_id_short text not null unique,
  phone_hidden boolean not null default true,
  qr_version int not null default 1,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alpha_identities_alpha_id_idx on public.alpha_identities (alpha_id);
create index if not exists alpha_identities_alpha_id_short_idx on public.alpha_identities (alpha_id_short);

alter table public.alpha_identities enable row level security;

drop policy if exists "alpha_identities_owner_read" on public.alpha_identities;
create policy "alpha_identities_owner_read"
  on public.alpha_identities for select
  using (auth.uid() = user_id);

drop policy if exists "alpha_identities_owner_insert" on public.alpha_identities;
create policy "alpha_identities_owner_insert"
  on public.alpha_identities for insert
  with check (auth.uid() = user_id);

drop policy if exists "alpha_identities_owner_update" on public.alpha_identities;
create policy "alpha_identities_owner_update"
  on public.alpha_identities for update
  using (auth.uid() = user_id);

drop policy if exists "alpha_identities_lookup_by_id" on public.alpha_identities;
create policy "alpha_identities_lookup_by_id"
  on public.alpha_identities for select
  to authenticated
  using (true);

comment on table public.alpha_identities is 'ALPHA-076 permanent Alpha ID per user - not tied to phone number';

grant select, insert, update on public.alpha_identities to authenticated;

alter table public.prayer_requests add column if not exists body text;
alter table public.prayer_requests add column if not exists request text;

notify pgrst, 'reload schema';

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'alpha_connect_conversations',
    'alpha_connect_conversation_members',
    'alpha_connect_messages',
    'alpha_identities'
  )
order by tablename;
