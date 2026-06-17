/*
  ALPHA-DATA-POLICY-002 — Immediate After Read/Listen
  - Add on_read policy: delete row + storage immediately when read_at is set
  - Allowed: on_read, 1h, 6h, 12h, 24h, 3d, 7d
  - Removes never / unlimited retention paths
*/

update public.alpha_connect_messages
set retention_policy = case retention_policy
  when 'read' then 'on_read'
  when 'never' then 'on_read'
  else retention_policy
end
where retention_policy in ('read', 'never');

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
  add constraint alpha_connect_messages_retention_policy_check
  check (retention_policy in ('on_read', '1h', '6h', '12h', '24h', '3d', '7d'));

create or replace function public.alpha_connect_set_message_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.retention_policy = 'on_read' then
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
  if new.retention_policy = 'on_read'
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

update public.alpha_connect_messages
set expires_at = null
where retention_policy = 'on_read';

notify pgrst, 'reload schema';
