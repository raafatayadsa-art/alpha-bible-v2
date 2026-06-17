/*
  ALPHA-PRESENCE-STATUS-002
  Allowed values: available | busy | hidden
  Default: available
*/

create table if not exists public.alpha_user_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'available'
    check (status in ('available', 'busy', 'hidden')),
  updated_at timestamptz not null default now()
);

create index if not exists alpha_user_presence_status_idx
  on public.alpha_user_presence (status);

alter table public.alpha_user_presence enable row level security;

drop policy if exists alpha_user_presence_select on public.alpha_user_presence;
create policy alpha_user_presence_select
  on public.alpha_user_presence
  for select
  to authenticated
  using (true);

drop policy if exists alpha_user_presence_upsert_self on public.alpha_user_presence;
create policy alpha_user_presence_upsert_self
  on public.alpha_user_presence
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.alpha_user_presence;
exception
  when duplicate_object then null;
end $$;