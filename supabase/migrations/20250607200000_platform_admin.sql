-- Alpha Control Center — platform admin tables (owner console data layer)
-- RLS: anon read/write for dev owner console; tighten with owner JWT before production.

-- ---------------------------------------------------------------------------
-- Modules
-- ---------------------------------------------------------------------------
create table if not exists public.platform_modules (
  key text primary key,
  label text not null,
  label_ar text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Emergency flags (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_emergency (
  id int primary key default 1 check (id = 1),
  maintenance boolean not null default false,
  disable_registration boolean not null default false,
  disable_messaging boolean not null default false,
  disable_community boolean not null default false,
  lockdown boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Platform settings (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  registration_enabled boolean not null default true,
  verification_required boolean not null default true,
  maintenance_message text not null default '',
  allow_new_churches boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Dashboard aggregate stats (singleton — no PII)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_dashboard_stats (
  id int primary key default 1 check (id = 1),
  user_count int not null default 0,
  church_count int not null default 0,
  priest_count int not null default 0,
  servant_count int not null default 0,
  message_count int not null default 0,
  request_count int not null default 0,
  report_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Privacy metrics (singleton aggregates only)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_privacy_metrics (
  id int primary key default 1 check (id = 1),
  blocked_words_count int not null default 0,
  security_reports_count int not null default 0,
  restricted_users_count int not null default 0,
  blocked_accounts_count int not null default 0,
  violations_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Approvals queue
-- ---------------------------------------------------------------------------
create table if not exists public.platform_approvals (
  id uuid primary key default gen_random_uuid(),
  request_no text not null unique,
  kind text not null,
  title text not null,
  kind_label text not null,
  submitted_at timestamptz not null default now(),
  status text not null default 'pending',
  priority text not null default 'normal',
  payload jsonb not null default '{}'::jsonb
);

create index if not exists platform_approvals_status_idx on public.platform_approvals (status);
create index if not exists platform_approvals_kind_idx on public.platform_approvals (kind);

-- ---------------------------------------------------------------------------
-- Reported content (metadata only — no private content)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post', 'image', 'comment')),
  status text not null default 'open' check (status in ('open', 'reviewing', 'closed', 'dismissed')),
  summary text not null,
  severity text not null default 'normal',
  created_at timestamptz not null default now(),
  closed_at timestamptz null
);

-- ---------------------------------------------------------------------------
-- AI moderation config (queues as counts only)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_ai_rules (
  key text primary key,
  label text not null,
  label_ar text not null,
  enabled boolean not null default true,
  queue_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table if not exists public.platform_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  admin text not null default 'Owner',
  reason text not null default '',
  scan_meta jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists platform_audit_log_created_idx on public.platform_audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Alpha library docs
-- ---------------------------------------------------------------------------
create table if not exists public.platform_library_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('policy', 'guide', 'document', 'admin')),
  description text not null default '',
  url text null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trust profiles (Scan Center — admin metadata only)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_trust_profiles (
  trust_id text primary key,
  qr_code text not null unique,
  kind text not null check (kind in ('person', 'church')),
  qr_type text not null,
  profile jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Scan history
-- ---------------------------------------------------------------------------
create table if not exists public.platform_scan_history (
  id uuid primary key default gen_random_uuid(),
  trust_id text not null references public.platform_trust_profiles (trust_id) on delete cascade,
  qr_type text not null,
  label text not null,
  access_reason text null,
  scanned_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS (dev owner console — same pattern as post_registrations)
-- ---------------------------------------------------------------------------
alter table public.platform_modules enable row level security;
alter table public.platform_emergency enable row level security;
alter table public.platform_settings enable row level security;
alter table public.platform_dashboard_stats enable row level security;
alter table public.platform_privacy_metrics enable row level security;
alter table public.platform_approvals enable row level security;
alter table public.platform_reports enable row level security;
alter table public.platform_ai_rules enable row level security;
alter table public.platform_audit_log enable row level security;
alter table public.platform_library_docs enable row level security;
alter table public.platform_trust_profiles enable row level security;
alter table public.platform_scan_history enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'platform_modules','platform_emergency','platform_settings','platform_dashboard_stats',
    'platform_privacy_metrics','platform_approvals','platform_reports','platform_ai_rules',
    'platform_audit_log','platform_library_docs','platform_trust_profiles','platform_scan_history'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_anon_all', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using (true) with check (true)',
      t || '_anon_all', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.platform_modules (key, label, label_ar, enabled) values
  ('bible', 'Bible', 'الكتاب المقدس', true),
  ('agpeya', 'Agpeya', 'الأجبية', true),
  ('synaxarium', 'Synaxarium', 'السنكسار', true),
  ('katameros', 'Katameros', 'القطمارس', true),
  ('community', 'Community', 'المجتمع', true),
  ('messaging', 'Messaging', 'الرسائل', true),
  ('trips', 'Trips', 'الرحلات', true),
  ('reservations', 'Reservations', 'الحجوزات', false),
  ('donations', 'Donations', 'التبرعات', true)
on conflict (key) do nothing;

insert into public.platform_emergency (id) values (1) on conflict (id) do nothing;
insert into public.platform_settings (id) values (1) on conflict (id) do nothing;

insert into public.platform_dashboard_stats (id, user_count, church_count, priest_count, servant_count, message_count, request_count, report_count)
values (1, 12458, 356, 125, 1256, 84200, 23, 8)
on conflict (id) do nothing;

insert into public.platform_privacy_metrics (id, blocked_words_count, security_reports_count, restricted_users_count, blocked_accounts_count, violations_count)
values (1, 142, 8, 12, 3, 47)
on conflict (id) do nothing;

insert into public.platform_ai_rules (key, label, label_ar, enabled, queue_count) values
  ('auto_moderation', 'Auto Moderation', 'الإشراف التلقائي', true, 0),
  ('image_review', 'Image Review Queue', 'مراجعة الصور', true, 4),
  ('content_review', 'Content Review Queue', 'مراجعة المحتوى', true, 6),
  ('ai_rules', 'AI Rules Engine', 'قواعد الذكاء الاصطناعي', true, 5)
on conflict (key) do nothing;

insert into public.platform_library_docs (title, category, description) values
  ('سياسة الخصوصية', 'policy', 'سياسة خصوصية المنصة'),
  ('دليل إدارة الكنائس', 'guide', 'إرشادات اعتماد الكنائس'),
  ('سياسة المحتوى', 'policy', 'قواعد المحتوى المسموح'),
  ('دليل Owner Console', 'admin', 'دليل مالك المنصة')
on conflict do nothing;

insert into public.platform_audit_log (action, admin, reason, created_at) values
  ('اعتماد كنيسة', 'Owner', 'مستندات مكتملة', now() - interval '1 day'),
  ('تعليق موديول', 'Owner', 'صيانة', now() - interval '2 days')
on conflict do nothing;

insert into public.platform_reports (kind, status, summary, severity) values
  ('post', 'open', 'بلاغ — محتوى مخالف (ملخص فقط)', 'high'),
  ('image', 'open', 'بلاغ — صورة غير مناسبة', 'normal'),
  ('comment', 'open', 'بلاغ — تعليق مسيء', 'normal'),
  ('post', 'open', 'بلاغ — spam', 'low'),
  ('post', 'closed', 'بلاغ — تمت المعالجة', 'normal'),
  ('image', 'open', 'بلاغ — محتوى مضلل', 'high'),
  ('comment', 'open', 'بلاغ — تحرش', 'critical'),
  ('post', 'open', 'بلاغ — انتحال شخصية', 'high')
on conflict do nothing;

-- Approvals seed (matches in-app mock)
insert into public.platform_approvals (request_no, kind, title, kind_label, submitted_at, status, priority, payload) values
  ('RPT-2026-0041', 'critical_report', 'بلاغ حرج — محتوى مبلغ عنه', 'بلاغ حرج', now() - interval '1 hour', 'pending', 'critical',
    '{"reportType":"محتوى مخالف","severity":"حرج"}'::jsonb),
  ('CH-2026-0188', 'church_setup', 'طلب تأسيس — كنيسة العذراء مريم', 'تأسيس كنيسة', now() - interval '2 hours', 'pending', 'high',
    '{"churchName":"كنيسة العذراء مريم — الزقازيق","diocese":"الشرقية","priestName":"أبونا مينا عاطف","verificationStatus":"قيد التحقق"}'::jsonb),
  ('PR-2026-0092', 'priest_verification', 'اعتماد كاهن — أبونا بولس', 'اعتماد كاهن', now() - interval '1 day', 'pending', 'normal',
    '{"priestName":"أبونا بولس إبراهيم","churchLabel":"كنيسة الشهيد مار جرجس","documentsStatus":"مكتملة"}'::jsonb),
  ('SV-2026-0044', 'servant_verification', 'اعتماد خادم — جورج إميل', 'اعتماد خادم', now() - interval '18 hours', 'pending', 'normal',
    '{"priestName":"جورج إميل فتحي","churchLabel":"كنيسة مارمرقس — الزقازيق","documentsStatus":"قيد المراجعة"}'::jsonb),
  ('ST-2026-0033', 'saint_image', 'صورة القديس مقار الكبير', 'صورة قديس', now() - interval '2 days', 'pending', 'normal',
    '{"saintName":"القديس مقار الكبير","contributorName":"Alpha Library","thumbnailUrl":"/placeholder.svg"}'::jsonb),
  ('VF-2026-0011', 'church_verification', 'توثيق كنيسة — مارمرقس', 'توثيق كنيسة', now() - interval '3 days', 'pending', 'high',
    '{"verificationTarget":"كنيسة مارمرقس — الإسكندرية"}'::jsonb),
  ('VF-2026-0012', 'priest_account_verification', 'توثيق كاهن — القمص داود', 'توثيق كاهن', now() - interval '4 days', 'pending', 'normal',
    '{"verificationTarget":"القمص داود عبد الملاك"}'::jsonb),
  ('VF-2026-0013', 'official_account_verification', 'توثيق حساب رسمي — إيبارشية', 'حساب رسمي', now() - interval '5 days', 'reviewed', 'normal',
    '{"verificationTarget":"الإيبارشية البحرية"}'::jsonb)
on conflict (request_no) do nothing;

-- Trust profiles for Scan Center
insert into public.platform_trust_profiles (trust_id, qr_code, kind, qr_type, profile) values
  ('user-a128', 'USER-A128', 'person', 'user', '{"kind":"person","id":"user-a128","qrType":"user","displayName":"مينا عادل سامي","membershipId":"MBR-12847","accountType":"member","accountStatus":"active","currentChurch":"كنيسة القديس مارمرقس — الزقازيق","appJoinDate":"2023-04-12","churchJoinDate":"2024-01-08","banCount":0,"restrictionCount":1,"confirmedReports":0,"rejectedReports":2,"adminActions":[{"id":"a1","action":"تقييد مؤقت","date":"2025-11-03","by":"Moderation"}],"churchTransfers":[{"from":"كنيسة العذراء — مدينة نصر","to":"كنيسة القديس مارمرقس — الزقازيق","date":"2024-01-08"}],"platformPermissions":["قراءة الكتاب","المجتمع"],"lastPublicActivity":"2026-06-05","trustStatus":"good"}'::jsonb),
  ('priest-p125', 'PRIEST-P125', 'person', 'priest', '{"kind":"person","id":"priest-p125","qrType":"priest","displayName":"أبونا بولس ميخائيل","membershipId":"MBR-00125","accountType":"priest","accountStatus":"active","currentChurch":"كنيسة القديس أنبا أنطony — شبرا","appJoinDate":"2022-01-15","churchJoinDate":"2022-01-15","banCount":0,"restrictionCount":0,"confirmedReports":0,"rejectedReports":0,"adminActions":[],"churchTransfers":[],"platformPermissions":["إدارة الكنيسة"],"lastPublicActivity":"2026-06-06","trustStatus":"good"}'::jsonb),
  ('servant-s042', 'SERVANT-S042', 'person', 'servant', '{"kind":"person","id":"servant-s042","qrType":"servant","displayName":"جورج إميل فتحي","membershipId":"MBR-09042","accountType":"servant","accountStatus":"review","currentChurch":"كنيسة القديس مارمرقس — الزقازيق","appJoinDate":"2024-08-20","churchJoinDate":"2024-09-01","banCount":0,"restrictionCount":2,"confirmedReports":1,"rejectedReports":1,"adminActions":[],"churchTransfers":[],"platformPermissions":["خدمات الكنيسة"],"lastPublicActivity":"2026-06-01","trustStatus":"watch"}'::jsonb),
  ('church-c356', 'CHURCH-C356', 'church', 'church', '{"kind":"church","id":"church-c356","qrType":"church","churchName":"كنيسة القديس مارمرقس — الزقازيق","churchId":"CH-00356","verificationStatus":"verified","churchStatus":"active","responsiblePriest":"أبونا يوسف نبيل","memberCount":842,"servantCount":24,"storageUsed":"1.8 GB","openReports":2,"closedReports":14,"lastPublicActivity":"2026-06-06","trustStatus":"good","platformActions":[]}'::jsonb)
on conflict (trust_id) do nothing;
