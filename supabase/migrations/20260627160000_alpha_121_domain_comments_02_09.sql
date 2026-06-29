-- ALPHA-121: Permission domain metadata on public tables/views (Domains 02–09)
-- Skips relations missing in the current environment (safe for partial DBs)

create or replace function pg_temp.alpha_121_apply_domain_comment(p_fqname text, p_comment text)
returns void
language plpgsql
as $$
declare
  v_oid oid;
  v_kind "char";
  v_sql text;
begin
  v_oid := to_regclass(p_fqname);
  if v_oid is null then
    return;
  end if;

  select c.relkind
  into v_kind
  from pg_class c
  where c.oid = v_oid;

  v_sql := format(
    'comment on %s %s is %L',
    case v_kind when 'v' then 'view' else 'table' end,
    p_fqname,
    p_comment
  );
  execute v_sql;
end;
$$;

do $alpha_121$
declare
  r record;
begin
  for r in
    select *
    from (
      values
        -- DOMAIN 02 — Church System
        ('public.churches', 'DOMAIN-02 Church System: church master records'),
        ('public.church_profiles', 'DOMAIN-02 Church System: extended church profile data'),
        ('public.church_memberships', 'DOMAIN-02 Church System: user ↔ church membership'),
        ('public.church_roles', 'DOMAIN-02 Church System: role definitions'),
        ('public.church_permissions', 'DOMAIN-02 Church System: permission grants'),
        ('public.join_requests', 'DOMAIN-02 Church System: membership join requests'),
        ('public.church_claim_requests', 'DOMAIN-02 Church System: church page ownership claims'),
        ('public.monastery_claim_requests', 'DOMAIN-02 Church System: monastery page ownership claims'),
        ('public.church_setup_requests', 'DOMAIN-02 Church System: new church setup workflow'),
        ('public.church_transfer_requests', 'DOMAIN-02 Church System: bulk membership transfers'),
        ('public.church_transfer_members', 'DOMAIN-02 Church System: transfer member rows'),
        ('public.user_church_history', 'DOMAIN-02 Church System: historical church membership'),
        ('public.church_links_import', 'DOMAIN-02 Church System: directory import staging'),
        ('public.church_directory', 'DOMAIN-02 Church System: read model — church directory view'),
        -- DOMAIN 03 — Church Community
        ('public.church_posts', 'DOMAIN-03 Church Community: church feed posts'),
        ('public.church_post_comments', 'DOMAIN-03 Church Community: post comments'),
        ('public.church_post_reactions', 'DOMAIN-03 Church Community: post reactions'),
        ('public.church_messages', 'DOMAIN-03 Church Community: church messaging'),
        ('public.priest_messages', 'DOMAIN-03 Church Community: priest ↔ member messages'),
        ('public.church_notifications', 'DOMAIN-03 Church Community: church-scoped notifications'),
        ('public.prayer_requests', 'DOMAIN-03 Church Community: prayer request board'),
        ('public.blocked_users', 'DOMAIN-03 Church Community: user blocks'),
        ('public.family_groups', 'DOMAIN-03 Church Community: family groups'),
        ('public.notifications', 'DOMAIN-03 Church Community: platform in-app notifications'),
        -- DOMAIN 04 — Alpha Connect
        ('public.alpha_connect_conversations', 'DOMAIN-04 Alpha Connect: conversation threads'),
        ('public.alpha_connect_conversation_members', 'DOMAIN-04 Alpha Connect: conversation membership'),
        ('public.alpha_connect_messages', 'DOMAIN-04 Alpha Connect: messages'),
        ('public.alpha_user_presence', 'DOMAIN-04 Alpha Connect: user presence status'),
        -- DOMAIN 05 — Spiritual Content
        ('public.bible_verses', 'DOMAIN-05 Spiritual Content: bible text'),
        ('public.daily_verses', 'DOMAIN-05 Spiritual Content: daily verse pool (home hero)'),
        ('public.daily_verse_assignments', 'DOMAIN-05 Spiritual Content: daily verse scheduling'),
        ('public.daily_content', 'DOMAIN-05 Spiritual Content: daily content bundle'),
        ('public.agpeya_prayers', 'DOMAIN-05 Spiritual Content: agpeya prayers'),
        ('public.agpeya_sections', 'DOMAIN-05 Spiritual Content: agpeya sections'),
        ('public.katamaros_days', 'DOMAIN-05 Spiritual Content: katameros calendar days'),
        ('public.katamaros_readings', 'DOMAIN-05 Spiritual Content: katameros readings (legacy name)'),
        ('public.katameros_readings', 'DOMAIN-05 Spiritual Content: katameros readings'),
        ('public.synaxarium_days', 'DOMAIN-05 Spiritual Content: synaxarium calendar days'),
        ('public.synaxarium_entries', 'DOMAIN-05 Spiritual Content: synaxarium entries'),
        ('public.synaxarium_events', 'DOMAIN-05 Spiritual Content: synaxarium events'),
        ('public.synaxarium_saints', 'DOMAIN-05 Spiritual Content: premium saint gallery links'),
        ('public.kholagy', 'DOMAIN-05 Spiritual Content: hymn / tasbeha lyrics'),
        ('public.kholagy_liturgies', 'DOMAIN-05 Spiritual Content: kholagy liturgy structure'),
        ('public.saints', 'DOMAIN-05 Spiritual Content: saints master'),
        ('public.monasteries', 'DOMAIN-05 Spiritual Content: monasteries directory'),
        ('public.liturgical_occasions', 'DOMAIN-05 Spiritual Content: liturgical occasions'),
        ('public.coptic_months', 'DOMAIN-05 Spiritual Content: coptic month metadata'),
        ('public.coptic_month_slug_aliases', 'DOMAIN-05 Spiritual Content: coptic month slug aliases'),
        ('public.saint_gallery_images', 'DOMAIN-05 Spiritual Content: saint community gallery images'),
        ('public.saint_gallery_likes', 'DOMAIN-05 Spiritual Content: saint gallery likes'),
        ('public.synaxarium_catalog_v', 'DOMAIN-05 Spiritual Content: read model — synaxarium catalog (shared D06)'),
        -- DOMAIN 06 — Library & Dictionary
        ('public.dictionary_entries', 'DOMAIN-06 Library & Dictionary: dictionary entries'),
        ('public.dictionary_index', 'DOMAIN-06 Library & Dictionary: read model — search index view'),
        ('public.dictionary_stopwords', 'DOMAIN-06 Library & Dictionary: stopwords'),
        ('public.alpha_dictionary', 'DOMAIN-06 Library & Dictionary: alpha dictionary'),
        ('public.alpha_dictionary_deep', 'DOMAIN-06 Library & Dictionary: deep dictionary'),
        ('public.bible_encyclopedia', 'DOMAIN-06 Library & Dictionary: bible encyclopedia'),
        ('public.bible_names_dictionary', 'DOMAIN-06 Library & Dictionary: bible names'),
        ('public.bible_book_abbreviations', 'DOMAIN-06 Library & Dictionary: book abbreviations'),
        ('public.saints_index', 'DOMAIN-06 Library & Dictionary: saints search index'),
        ('public.pope_shenouda_audio_sermons', 'DOMAIN-06 Library & Dictionary: pope shenouda audio sermons'),
        -- DOMAIN 07 — Publisher Platform
        ('public.publishers', 'DOMAIN-07 Publisher Platform: publisher accounts'),
        ('public.publisher_content_items', 'DOMAIN-07 Publisher Platform: content items'),
        ('public.publisher_team_members', 'DOMAIN-07 Publisher Platform: team membership'),
        ('public.publisher_page_follows', 'DOMAIN-07 Publisher Platform: page follows'),
        ('public.publisher_page_likes', 'DOMAIN-07 Publisher Platform: page likes'),
        ('public.publisher_policy_actions', 'DOMAIN-07 Publisher Platform: policy enforcement'),
        ('public.publisher_terms_acceptance', 'DOMAIN-07 Publisher Platform: terms acceptance'),
        ('public.publisher_copyright_reports', 'DOMAIN-07 Publisher Platform: copyright reports'),
        ('public.publisher_legal_consents', 'DOMAIN-07 Publisher Platform: legal consents'),
        -- DOMAIN 08 — Platform Management
        ('public.platform_modules', 'DOMAIN-08 Platform Management: feature module toggles'),
        ('public.platform_settings', 'DOMAIN-08 Platform Management: global settings'),
        ('public.platform_dashboard_stats', 'DOMAIN-08 Platform Management: dashboard stats'),
        ('public.platform_reports', 'DOMAIN-08 Platform Management: user reports'),
        ('public.platform_audit_log', 'DOMAIN-08 Platform Management: audit log'),
        ('public.platform_scan_history', 'DOMAIN-08 Platform Management: QR scan history'),
        ('public.platform_library_docs', 'DOMAIN-08 Platform Management: internal docs'),
        ('public.platform_privacy_metrics', 'DOMAIN-08 Platform Management: privacy metrics'),
        ('public.platform_emergency', 'DOMAIN-08 Platform Management: emergency mode'),
        ('public.platform_owners', 'DOMAIN-08 Platform Management: platform owners'),
        ('public.platform_approvals', 'DOMAIN-08 Platform Management: approval workflow'),
        ('public.platform_approval_notifications', 'DOMAIN-08 Platform Management: approval notifications'),
        ('public.platform_ai_rules', 'DOMAIN-08 Platform Management: AI rules'),
        ('public.platform_trust_profiles', 'DOMAIN-08 Platform Management: trust center profiles'),
        ('public.support_tickets', 'DOMAIN-08 Platform Management: support tickets'),
        ('public.app_reviews', 'DOMAIN-08 Platform Management: app store reviews'),
        ('public.feature_requests', 'DOMAIN-08 Platform Management: feature requests'),
        ('public.approvals', 'DOMAIN-08 Platform Management: read model — approval workflow view'),
        -- DOMAIN 09 — User Progress
        ('public.users_progress', 'DOMAIN-09 User Progress: reading / journey progress'),
        ('public.saved_verses', 'DOMAIN-09 User Progress: saved verses'),
        ('public.post_registrations', 'DOMAIN-09 User Progress: event / post registrations')
    ) as t(fqname, domain_comment)
  loop
    perform pg_temp.alpha_121_apply_domain_comment(r.fqname, r.domain_comment);
  end loop;
end;
$alpha_121$;
