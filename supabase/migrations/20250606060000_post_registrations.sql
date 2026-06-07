-- Church post registrations (attendance, trips, events) — QR-ready schema.

create table if not exists public.post_registrations (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id text not null,
  user_name text not null,
  church_name text not null default 'كنيسة الشهيد مار جرجس',
  kind text not null check (kind in ('attendance', 'trip', 'event', 'reservation')),
  seats integer not null default 1 check (seats > 0),
  status text not null default 'registered'
    check (status in ('registered', 'confirmed', 'cancelled')),
  qr_token text null,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_registrations_post_id_idx
  on public.post_registrations (post_id);

create index if not exists post_registrations_user_post_idx
  on public.post_registrations (post_id, user_id, kind);

create unique index if not exists post_registrations_active_unique
  on public.post_registrations (post_id, user_id, kind)
  where status <> 'cancelled';

alter table public.post_registrations enable row level security;

drop policy if exists "post_registrations_public_read" on public.post_registrations;
create policy "post_registrations_public_read"
  on public.post_registrations
  for select
  to anon, authenticated
  using (true);

drop policy if exists "post_registrations_public_insert" on public.post_registrations;
create policy "post_registrations_public_insert"
  on public.post_registrations
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "post_registrations_public_update" on public.post_registrations;
create policy "post_registrations_public_update"
  on public.post_registrations
  for update
  to anon, authenticated
  using (true)
  with check (true);
