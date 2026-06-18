/*
  RUN IN SUPABASE SQL EDITOR — enable delete for both chat parties
  Same as migration 20250617230000_alpha_connect_message_delete.sql
*/

drop policy if exists "alpha_connect_messages_member_delete" on public.alpha_connect_messages;
create policy "alpha_connect_messages_member_delete"
  on public.alpha_connect_messages for delete to authenticated
  using (
    exists (
      select 1 from public.alpha_connect_conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

grant delete on public.alpha_connect_messages to authenticated;
