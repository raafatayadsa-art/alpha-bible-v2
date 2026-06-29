-- Community Phase 3: auto-activity source + friend feed index

alter table public.community_moments
  add column if not exists source text not null default 'manual'
  check (source in ('manual', 'auto_chapter', 'auto_book', 'auto_agpeya'));

create index if not exists community_moments_user_id_idx
  on public.community_moments (user_id, created_at desc);

comment on column public.community_moments.source is
  'manual = user shared; auto_* = generated from app activity (reading/agpeya)';
