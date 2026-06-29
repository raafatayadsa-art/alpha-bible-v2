-- Community Phase 8: connection request cancel RLS + contacts delete for unfriend

drop policy if exists alpha_connect_connection_requests_update_sender
  on public.alpha_connect_connection_requests;

create policy alpha_connect_connection_requests_update_sender
  on public.alpha_connect_connection_requests
  for update
  to authenticated
  using (auth.uid() = from_user_id and status = 'pending')
  with check (auth.uid() = from_user_id and status in ('pending', 'cancelled'));

drop policy if exists alpha_connect_contacts_delete_self
  on public.alpha_connect_contacts;

create policy alpha_connect_contacts_delete_self
  on public.alpha_connect_contacts
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy alpha_connect_connection_requests_update_sender
  on public.alpha_connect_connection_requests is
  'Sender may cancel a pending connection request';
