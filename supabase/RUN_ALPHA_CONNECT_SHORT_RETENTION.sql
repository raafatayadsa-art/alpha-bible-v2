/*
  Short retention timers for Alpha Connect chat (5s … 1d)
  Run in Supabase SQL Editor — same as migration 20250617220000_alpha_connect_short_retention.sql
*/

create or replace function public.alpha_connect_retention_interval(p_policy text)
returns interval
language sql
immutable
as $$
  select case p_policy
    when 'on_read' then null
    when '5s' then interval '5 seconds'
    when '10s' then interval '10 seconds'
    when '30s' then interval '30 seconds'
    when '1m' then interval '1 minute'
    when '5m' then interval '5 minutes'
    when '30m' then interval '30 minutes'
    when '1d' then interval '1 day'
    when '1h' then interval '1 hour'
    when '6h' then interval '6 hours'
    when '12h' then interval '12 hours'
    when '24h' then interval '24 hours'
    when '3d' then interval '3 days'
    when '7d' then interval '7 days'
    when 'hour' then interval '1 hour'
    when 'day' then interval '1 day'
    when 'week' then interval '7 days'
    else null
  end;
$$;

do $$
declare
  con record;
begin
  for con in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'alpha_connect_messages'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%retention_policy%'
  loop
    execute format('alter table public.alpha_connect_messages drop constraint if exists %I', con.conname);
  end loop;
end $$;

alter table public.alpha_connect_messages
  alter column retention_policy set default '1m';

alter table public.alpha_connect_messages
  add constraint alpha_connect_messages_retention_policy_check
  check (retention_policy in (
    'on_read',
    '5s', '10s', '30s', '1m', '5m', '30m', '1d',
    '1h', '6h', '12h', '24h', '3d', '7d'
  ));

create or replace function public.alpha_connect_set_message_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.retention_policy in ('on_read', 'read') then
    new.expires_at := null;
  else
    new.expires_at := now() + public.alpha_connect_retention_interval(new.retention_policy);
    if new.expires_at is null then
      raise exception 'invalid retention_policy: % (ALPHA-DATA-POLICY-002)', new.retention_policy;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_set_expiry on public.alpha_connect_messages;
create trigger alpha_connect_messages_set_expiry
  before insert on public.alpha_connect_messages
  for each row execute function public.alpha_connect_set_message_expiry();

update public.alpha_connect_messages m
set expires_at = m.created_at + public.alpha_connect_retention_interval(m.retention_policy)
where m.retention_policy not in ('on_read', 'read')
  and public.alpha_connect_retention_interval(m.retention_policy) is not null
  and (m.expires_at is null or m.expires_at > now() + interval '8 days');
