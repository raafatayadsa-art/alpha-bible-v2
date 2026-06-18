-- Alpha Connect direct messaging RPC (run in Supabase SQL editor if send/open fails)
-- Mirrors: supabase/migrations/20250617180000_alpha_connect_direct_messaging.sql

create or replace function public.alpha_connect_open_direct(p_peer_key text, p_title text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_key text;
  v_conv uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_key := trim(p_peer_key);
  if v_key is null or length(v_key) = 0 then
    raise exception 'peer_key required';
  end if;

  v_key := 'direct:' || v_uid::text || ':' || v_key;

  select id into v_conv
  from public.alpha_connect_conversations
  where group_code = v_key;

  if v_conv is null then
    insert into public.alpha_connect_conversations (kind, title, group_code)
    values ('direct', coalesce(nullif(trim(p_title), ''), p_peer_key), v_key)
    returning id into v_conv;
  end if;

  insert into public.alpha_connect_conversation_members (conversation_id, user_id)
  values (v_conv, v_uid)
  on conflict do nothing;

  return v_conv;
end;
$$;

grant execute on function public.alpha_connect_open_direct(text, text) to authenticated;

create or replace function public.alpha_connect_touch_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.alpha_connect_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists alpha_connect_messages_touch_conversation on public.alpha_connect_messages;
create trigger alpha_connect_messages_touch_conversation
  after insert on public.alpha_connect_messages
  for each row execute function public.alpha_connect_touch_conversation_updated_at();

notify pgrst, 'reload schema';
