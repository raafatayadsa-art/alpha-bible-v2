-- Auth roles foundation — platform owners + membership role hint

-- Platform Owner (links Supabase Auth user → Owner console access)
create table if not exists public.platform_owners (
  user_id uuid primary key,
  label text not null default 'Owner',
  created_at timestamptz not null default now()
);

create index if not exists platform_owners_user_idx on public.platform_owners (user_id);

-- Optional church-level role on membership (derived from church_roles when absent)
alter table public.church_memberships add column if not exists platform_role text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'church_memberships_platform_role_check'
  ) then
    alter table public.church_memberships
      add constraint church_memberships_platform_role_check
      check (platform_role is null or platform_role in ('priest', 'servant', 'member'));
  end if;
exception when others then
  null;
end $$;

-- RLS — dev: authenticated users can read own owner row; writes open for bootstrap
alter table public.platform_owners enable row level security;

drop policy if exists platform_owners_read_self on public.platform_owners;
create policy platform_owners_read_self
  on public.platform_owners for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists platform_owners_dev_all on public.platform_owners;
create policy platform_owners_dev_all
  on public.platform_owners for all to anon, authenticated
  using (true) with check (true);
