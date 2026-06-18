/*
  RUN IN SUPABASE SQL EDITOR — clear conversation messages (optional both-party mirror).
*/

create or replace function public.alpha_connect_clear_conversation(
  p_conversation_id uuid,
  p_for_both boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_group_code text;
  v_owner text;
  v_peer text;
  v_reciprocal_code text;
  v_other_conv uuid;
  v_sender uuid;
  v_other_senders uuid[];
  v_uuid_regex constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.alpha_connect_conversation_members m
    where m.conversation_id = p_conversation_id
      and m.user_id = v_uid
  ) then
    raise exception 'not a conversation member';
  end if;

  select coalesce(array_agg(distinct sender_id), '{}')
  into v_other_senders
  from public.alpha_connect_messages
  where conversation_id = p_conversation_id
    and sender_id <> v_uid;

  select group_code
  into v_group_code
  from public.alpha_connect_conversations
  where id = p_conversation_id;

  delete from public.alpha_connect_messages
  where conversation_id = p_conversation_id;

  if not coalesce(p_for_both, false) then
    return;
  end if;

  if v_group_code is null or not v_group_code like 'direct:%' then
    return;
  end if;

  v_owner := split_part(substring(v_group_code from 8), ':', 1);
  v_peer := substring(v_group_code from length('direct:') + length(v_owner) + 2);

  if v_peer ~* v_uuid_regex then
    v_reciprocal_code := 'direct:' || v_peer || ':' || v_owner;
    select id
    into v_other_conv
    from public.alpha_connect_conversations
    where group_code = v_reciprocal_code;

    if v_other_conv is not null then
      delete from public.alpha_connect_messages
      where conversation_id = v_other_conv;
    end if;
  end if;

  foreach v_sender in array v_other_senders loop
    v_reciprocal_code := 'direct:' || v_sender::text || ':' || v_uid::text;
    select id
    into v_other_conv
    from public.alpha_connect_conversations
    where group_code = v_reciprocal_code;

    if v_other_conv is not null then
      delete from public.alpha_connect_messages
      where conversation_id = v_other_conv;
    end if;
  end loop;
end;
$$;

grant execute on function public.alpha_connect_clear_conversation(uuid, boolean) to authenticated;
