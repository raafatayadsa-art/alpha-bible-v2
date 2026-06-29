-- Community Phase 9: enable Realtime for community feed + connection requests

alter table public.community_moments replica identity full;
alter table public.alpha_connect_connection_requests replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.community_moments;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.alpha_connect_connection_requests;
exception
  when duplicate_object then null;
end $$;
