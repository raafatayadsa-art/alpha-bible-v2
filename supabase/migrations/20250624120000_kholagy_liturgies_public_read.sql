-- Allow anonymous read of liturgy sections (same as kholagy hymns table).
drop policy if exists "Authenticated users can read liturgies" on public.kholagy_liturgies;

create policy "public read kholagy_liturgies"
  on public.kholagy_liturgies
  for select
  to anon, authenticated
  using (true);
