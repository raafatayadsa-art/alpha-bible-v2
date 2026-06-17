-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Fixes: "تعذّر حفظ طلب الصلاة" error
-- ============================================================

-- Add missing columns
alter table public.prayer_requests add column if not exists body         text         not null default '';
alter table public.prayer_requests add column if not exists request      text;
alter table public.prayer_requests add column if not exists user_name    text         not null default '';
alter table public.prayer_requests add column if not exists category     text         not null default 'طلبة';
alter table public.prayer_requests add column if not exists status       text         not null default 'active';
alter table public.prayer_requests add column if not exists anonymous    boolean      not null default false;
alter table public.prayer_requests add column if not exists visibility   text         not null default 'community';
alter table public.prayer_requests add column if not exists prayer_count int          not null default 0;

-- Ensure write policy exists
drop policy if exists prayer_requests_public_write on public.prayer_requests;
create policy prayer_requests_public_write
  on public.prayer_requests for all to anon, authenticated
  using (true) with check (true);

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- ============================================================
-- Done. Try submitting a prayer request again.
-- ============================================================
