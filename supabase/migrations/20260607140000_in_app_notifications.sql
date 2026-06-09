-- In-app notifications (Alpha notifications sheet)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  church_id uuid references public.churches (id) on delete cascade,
  title text not null,
  body text,
  type text not null,
  scope text not null,
  target_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notifications_scope_check'
  ) then
    alter table public.notifications
      add constraint notifications_scope_check
      check (scope in ('spiritual', 'church', 'community', 'system'));
  end if;
exception when others then
  null;
end $$;

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_church_idx on public.notifications (church_id);
create index if not exists notifications_scope_idx on public.notifications (scope);
create index if not exists notifications_created_idx on public.notifications (created_at desc);
create index if not exists notifications_unread_idx on public.notifications (is_read) where is_read = false;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_authenticated on public.notifications;
create policy notifications_select_authenticated
  on public.notifications for select to authenticated
  using (
    user_id = auth.uid()
    or scope in ('spiritual', 'system')
    or (
      church_id is not null
      and church_id in (
        select church_id from public.church_memberships
        where user_id = auth.uid()::text and status = 'active'
      )
    )
  );

drop policy if exists notifications_select_anon on public.notifications;
create policy notifications_select_anon
  on public.notifications for select to anon
  using (scope in ('spiritual', 'system'));

drop policy if exists notifications_update_authenticated on public.notifications;
create policy notifications_update_authenticated
  on public.notifications for update to authenticated
  using (
    user_id = auth.uid()
    or scope in ('spiritual', 'system')
    or (
      church_id is not null
      and church_id in (
        select church_id from public.church_memberships
        where user_id = auth.uid()::text and status = 'active'
      )
    )
  )
  with check (true);

drop policy if exists notifications_service_write on public.notifications;
create policy notifications_service_write
  on public.notifications for insert to anon, authenticated
  with check (true);
