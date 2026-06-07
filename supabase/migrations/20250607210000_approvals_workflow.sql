-- Approvals workflow — extended schema + notifications queue
-- Maps to Owner Console "approvals" spec (platform_approvals is the canonical table).

alter table public.platform_approvals
  add column if not exists submitted_by text,
  add column if not exists church_id text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists review_notes text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists platform_approvals_reviewed_at_idx on public.platform_approvals (reviewed_at desc);

-- Owner-facing view alias
create or replace view public.approvals as
select
  id,
  kind as type,
  status,
  priority,
  submitted_by,
  church_id,
  reviewed_by,
  reviewed_at,
  rejection_reason,
  submitted_at as created_at,
  updated_at
from public.platform_approvals;

-- Notification queue for approval outcomes
create table if not exists public.platform_approval_notifications (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid references public.platform_approvals (id) on delete cascade,
  recipient_id text not null,
  title text not null,
  body text not null,
  kind text not null check (kind in ('approved', 'rejected', 'needs_changes', 'under_review')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists platform_approval_notifications_approval_idx
  on public.platform_approval_notifications (approval_id);

alter table public.platform_approval_notifications enable row level security;

drop policy if exists platform_approval_notifications_anon_all on public.platform_approval_notifications;
create policy platform_approval_notifications_anon_all
  on public.platform_approval_notifications for all to anon, authenticated
  using (true) with check (true);

-- Enrich seed payloads with review workflow fields
update public.platform_approvals set
  submitted_by = coalesce(submitted_by, 'مستخدم Alpha'),
  church_id = coalesce(church_id, 'CH-00356'),
  updated_at = now()
where submitted_by is null;

update public.platform_approvals set payload = payload || jsonb_build_object(
  'submittedBy', coalesce(payload->>'submittedBy', 'مستخدم Alpha'),
  'phone', coalesce(payload->>'phone', '+20 100 123 4567'),
  'address', coalesce(payload->>'address', 'شارع الجيش — الزقازيق'),
  'idImageUrl', coalesce(payload->>'idImageUrl', '/placeholder.svg'),
  'documents', coalesce(payload->'documents', '["بطاقة شخصية","شهادة ordination"]'::jsonb),
  'systemNotes', coalesce(payload->>'systemNotes', 'لا ملاحظات نظام'),
  'responsiblePriest', coalesce(payload->>'responsiblePriest', payload->>'priestName'),
  'photos', coalesce(payload->'photos', '["/placeholder.svg"]'::jsonb),
  'verificationData', coalesce(payload->>'verificationData', 'مستندات مرفوعة — قيد المراجعة'),
  'aiScanResults', coalesce(payload->>'aiScanResults', 'آمن — 98%'),
  'relatedReports', coalesce(payload->>'relatedReports', '0')
) where kind in ('church_setup', 'priest_verification', 'servant_verification', 'saint_image');

update public.platform_approvals set status = 'under_review' where status = 'reviewed';
