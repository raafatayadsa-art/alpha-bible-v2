-- Approvals DB workflow — documents column, admin_notes, needs_info status

alter table public.platform_approvals
  add column if not exists documents jsonb not null default '[]'::jsonb,
  add column if not exists admin_notes text;

-- Backfill documents from payload when empty
update public.platform_approvals
set documents = coalesce(
  nullif(payload->'documentFiles', 'null'::jsonb),
  (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', 'doc-' || ordinality,
      'label', elem,
      'url', coalesce(payload->>'idImageUrl', payload->>'thumbnailUrl', '/placeholder.svg'),
      'verified', true
    )), '[]'::jsonb)
    from jsonb_array_elements_text(coalesce(payload->'documents', '[]'::jsonb)) with ordinality as t(elem, ordinality)
  ),
  '[]'::jsonb
)
where documents = '[]'::jsonb
  and (
    payload ? 'documentFiles'
    or payload ? 'documents'
    or payload ? 'photos'
  );

update public.platform_approvals
set documents = (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', 'photo-' || ordinality,
    'label', 'صورة الكنيسة',
    'url', elem,
    'verified', true
  )), '[]'::jsonb)
  from jsonb_array_elements_text(coalesce(payload->'photos', '[]'::jsonb)) with ordinality as t(elem, ordinality)
)
where documents = '[]'::jsonb
  and payload ? 'photos';

-- Normalize legacy statuses
update public.platform_approvals set status = 'under_review' where status = 'reviewed';
update public.platform_approvals set status = 'needs_info' where status = 'needs_changes';
update public.platform_approvals set admin_notes = review_notes where admin_notes is null and review_notes is not null;

-- Owner-facing view (matches spec)
drop view if exists public.approvals cascade;

create or replace view public.approvals as
select
  id,
  kind as type,
  status,
  priority,
  submitted_by,
  church_id,
  payload,
  documents,
  admin_notes,
  rejection_reason,
  reviewed_by,
  reviewed_at,
  submitted_at as created_at,
  updated_at
from public.platform_approvals;

-- Enrich seed documents column from payload
update public.platform_approvals
set documents = coalesce(payload->'documentFiles', documents)
where jsonb_array_length(documents) = 0;

update public.platform_approvals
set
  submitted_by = coalesce(submitted_by, payload->>'submittedBy', payload->>'priestName', 'مقدم الطلب'),
  church_id = coalesce(church_id, payload->>'churchId', 'CH-00356'),
  documents = case kind
    when 'priest_verification' then '[
      {"id":"id","label":"صورة الهوية","url":"/placeholder.svg","verified":true},
      {"id":"church-id","label":"الكارنيه الكنسي","url":"/placeholder.svg","verified":true},
      {"id":"ref","label":"خطاب التوصية","url":"/placeholder.svg","verified":true}
    ]'::jsonb
    when 'church_setup' then '[
      {"id":"b1","label":"سجل إيبارشي","url":"/placeholder.svg","verified":true},
      {"id":"b2","label":"صور المبنى","url":"/placeholder.svg","verified":true}
    ]'::jsonb
    when 'saint_image' then '[
      {"id":"st1","label":"صورة القديس","url":"/placeholder.svg","verified":true}
    ]'::jsonb
    else documents
  end,
  payload = payload || jsonb_build_object(
    'phone', coalesce(payload->>'phone', '+20 100 123 4567'),
    'email', coalesce(payload->>'email', 'applicant@alpha.app'),
    'submitterAvatarUrl', coalesce(payload->>'submitterAvatarUrl', payload->>'idImageUrl', payload->>'thumbnailUrl', '/placeholder.svg'),
    'idImageUrl', coalesce(payload->>'idImageUrl', '/placeholder.svg'),
    'photos', coalesce(payload->'photos', '["/placeholder.svg"]'::jsonb)
  )
where kind in ('priest_verification', 'servant_verification', 'church_setup', 'saint_image', 'church_verification');

alter table public.platform_approval_notifications drop constraint if exists platform_approval_notifications_kind_check;
alter table public.platform_approval_notifications
  add constraint platform_approval_notifications_kind_check
  check (kind in ('approved', 'rejected', 'needs_changes', 'needs_info', 'under_review'));
