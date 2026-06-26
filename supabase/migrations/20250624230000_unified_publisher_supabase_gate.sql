-- Supabase gate fixes — grants + public read visibility filter
-- Apply AFTER: 20250624200000, 20250624210000, 20250624220000

grant execute on function public.ensure_church_publisher(bigint, uuid) to authenticated;

-- Public feed must respect visibility (unified content schema)
drop policy if exists publisher_content_public_read on public.publisher_content_items;
create policy publisher_content_public_read on public.publisher_content_items
  for select to anon, authenticated
  using (
    status = 'approved'
    and visibility = 'public'
    and exists (
      select 1 from public.publishers p
      where p.id = publisher_id
        and p.status = 'published'
        and p.is_public = true
    )
  );

-- Published publishers visible to everyone
drop policy if exists publishers_public_read on public.publishers;
create policy publishers_public_read on public.publishers
  for select to anon, authenticated
  using (status = 'published' and is_public = true);
