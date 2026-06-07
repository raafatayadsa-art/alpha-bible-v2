-- Allow the app (anon + authenticated) to read Agpeya catalog and sections.
-- Required for the reader to load content via the publishable/anon key.

alter table public.agpeya_prayers enable row level security;
alter table public.agpeya_sections enable row level security;

drop policy if exists "agpeya_prayers_public_read" on public.agpeya_prayers;
create policy "agpeya_prayers_public_read"
  on public.agpeya_prayers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "agpeya_sections_public_read" on public.agpeya_sections;
create policy "agpeya_sections_public_read"
  on public.agpeya_sections
  for select
  to anon, authenticated
  using (true);
