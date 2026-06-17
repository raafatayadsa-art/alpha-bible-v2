/*
  ALPHA-076 Alpha Digital Identity - persistent ID independent of phone/email
*/

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
