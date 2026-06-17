/*
  ALPHA-DATA-POLICY-002 enforcement fix
  - Remove never, read, and legacy timed policies
  - Allowed: 1h, 6h, 12h, 24h, 3d, 7d (max 7 days)
  - Server-side scheduled purge via pg_cron
*/

/* ── Migrate legacy retention_policy values ─────────────────────────────── */

update public.alpha_connect_messages
set retention_policy = case retention_policy
  when 'hour' then '1h'
  when 'day' then '24h'
  when 'week' then '7d'
  when 'read' then '24h'
  when 'never' then '7d'
  else retention_policy
end
where retention_policy in ('read', 'hour', 'day', 'week', 'never');

/* ── Drop legacy CHECK constraint ───────────────────────────────────────── */

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'alpha_connect_messages'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%retention_policy%'
  loop
    execute format('alter table public.alpha_connect_messages drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.alpha_connect_messages
  alter column retention_policy set default '24h';

alter table public.alpha_connect_messages
  add constraint alpha_connect_messages_retention_policy_check
  check (retention_policy in ('1h', '6h', '12h', '24h', '3d', '7d'));

/* ── Retention interval (max 7 days) ────────────────────────────────────── */

create or replace function public.alpha_connect_retention_interval(p_policy text)
returns interval
language sql
immutable
as $$
  select case p_policy
    when '1h' then interval '1 hour'
    when '6h' then interval '6 hours'
    when '12h' then interval '12 hours'
    when '24h' then interval '24 hours'
    when '3d' then interval '3 days'
    when '7d' then interval '7 days'
    else null
  end;
$$;

create or replace function public.alpha_connect_set_message_expiry()
returns trigger
language plpgsql
as $$
begin
  new.expires_at := now() + public.alpha_connect_retention_interval(new.retention_policy);
  if new.expires_at is null then
    raise exception 'invalid retention_policy: % (ALPHA-DATA-POLICY-002)', new.retention_policy;
  end if;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_set_expiry on public.alpha_connect_messages;
create trigger alpha_connect_messages_set_expiry
  before insert on public.alpha_connect_messages
  for each row execute function public.alpha_connect_set_message_expiry();

/* Remove read-based expiry — all messages expire on timed policy only */
drop trigger if exists alpha_connect_messages_read_expiry on public.alpha_connect_messages;
drop function if exists public.alpha_connect_on_message_read();

/* Recalculate expires_at for existing rows under new policies */
update public.alpha_connect_messages m
set expires_at = m.created_at + public.alpha_connect_retention_interval(m.retention_policy)
where m.retention_policy in ('1h', '6h', '12h', '24h', '3d', '7d');

/* ── Purge RPC (row + storage object) ───────────────────────────────────── */

create or replace function public.alpha_connect_purge_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  n integer := 0;
begin
  for rec in
    select id, audio_path
    from public.alpha_connect_messages
    where expires_at is not null
      and expires_at <= now()
    order by expires_at
    for update skip locked
  loop
    perform public.alpha_connect_delete_storage_object(rec.audio_path);
    delete from public.alpha_connect_messages where id = rec.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

grant execute on function public.alpha_connect_purge_expired_messages() to authenticated;

/* ── Server-side schedule (pg_cron) ─────────────────────────────────────── */

create extension if not exists pg_cron with schema extensions;

do $$
begin
  perform cron.unschedule('alpha-connect-purge-expired');
exception
  when others then null;
end $$;

select cron.schedule(
  'alpha-connect-purge-expired',
  '*/15 * * * *',
  $$select public.alpha_connect_purge_expired_messages()$$
);

notify pgrst, 'reload schema';
