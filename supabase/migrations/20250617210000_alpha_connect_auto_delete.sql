/*
  Alpha Connect — enable automatic message deletion (server-side)
  - Timed: expires_at + purge RPC + pg_cron every 15 min
  - On read: consume trigger (requires 20250617200000 retention fix)
*/

create or replace function public.alpha_connect_retention_interval(p_policy text)
returns interval
language sql
immutable
as $$
  select case p_policy
    when 'on_read' then null
    when '1h' then interval '1 hour'
    when '6h' then interval '6 hours'
    when '12h' then interval '12 hours'
    when '24h' then interval '24 hours'
    when '3d' then interval '3 days'
    when '7d' then interval '7 days'
    when 'hour' then interval '1 hour'
    when 'day' then interval '24 hours'
    when 'week' then interval '7 days'
    else null
  end;
$$;

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

create or replace function public.alpha_connect_on_message_consumed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.retention_policy in ('on_read', 'read')
     and new.read_at is not null
     and old.read_at is null then
    perform public.alpha_connect_delete_storage_object(new.audio_path);
    delete from public.alpha_connect_messages where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_consume_on_read on public.alpha_connect_messages;
create trigger alpha_connect_messages_consume_on_read
  after update of read_at on public.alpha_connect_messages
  for each row execute function public.alpha_connect_on_message_consumed();

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

update public.alpha_connect_messages m
set expires_at = m.created_at + public.alpha_connect_retention_interval(m.retention_policy)
where m.retention_policy not in ('on_read', 'read')
  and m.expires_at is null
  and public.alpha_connect_retention_interval(m.retention_policy) is not null;

notify pgrst, 'reload schema';
