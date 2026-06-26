# ALPHA LEGAL PUBLISHING TERMS — Version 1.0 Integration

**Date:** 2026-06-24  
**Scope:** Publisher legal terms UI + policy version alignment  
**Overall Status:** PASS

---

## Executive Summary

Integrated the full **ALPHA LEGAL PUBLISHING TERMS (Version 1.0)** Arabic text into the publisher consent flow. Publishers must now acknowledge three explicit checkboxes (إقرار الناشر) on both application and content upload. A scrollable terms sheet exposes all 11 policy sections. Policy version unified to `1.0` in client and database RPCs.

---

## Findings

### New / updated files

| File | Purpose |
|------|---------|
| `src/features/publisher/publisher-legal-terms.ts` | Structured sections + 3 acknowledgement items |
| `src/features/publisher/components/PublisherLegalTermsSheet.tsx` | Full terms bottom sheet |
| `src/features/publisher/components/PublisherCopyrightConsent.tsx` | Triple-checkbox consent + "الشروط كاملة" link |
| `src/features/publisher/publisher-legal.ts` | `PUBLISHER_LEGAL_POLICY_VERSION = "1.0"` |
| `supabase/migrations/20250624290000_publisher_legal_policy_v1.sql` | DB default + RPC policy_version `1.0` |

### Terms coverage (11 sections)

1. المسؤولية عن المحتوى  
2. الإقرار بالملكية أو الإذن  
3. المحتوى الممنوع  
4. مراجعة المحتوى  
5. بلاغات حقوق الملكية  
6. إزالة المحتوى  
7. مسؤولية Alpha  
8. منح الترخيص للعرض  
9. التوثيق والتحقق  
10. الناشر الموثق  
11. قبول الشروط  

### إقرار الناشر (required checkboxes)

- أؤكد أنني أملك المحتوى أو أمتلك الإذن القانوني اللازم لنشره  
- أتحمل المسؤولية الكاملة عن جميع المواد التي أقوم برفعها  
- أوافق على شروط النشر وحقوق الملكية الخاصة بمنصة Alpha  

### Integration points

- **طلب ناشر** (`PublisherApplyForm`) — consent required before submit  
- **رفع محتوى** (`PublisherWorkspaceScreen`) — consent required before upload  
- **زر «الشروط كاملة»** — opens `PublisherLegalTermsSheet`  

### Database

- Migration `publisher_legal_policy_v1` applied to project `usflbjlyadihyitnvzya`
- `publisher_legal_consents.policy_version` default → `1.0`
- `submit_publisher_application`, `submit_publisher_content`, `record_publisher_legal_consent` record `1.0`

---

## Warnings

- Pre-existing repo-wide `tsc` errors unrelated to this change (alpha-connect, bible routes, etc.)
- No dedicated `/publisher/legal` route yet — terms accessible via sheet from consent UI
- Older consent rows may still show `legal-001` in DB (historical records unchanged)

---

## Errors

None in publisher legal integration. Linter clean on touched publisher files.

---

## Recommendations

1. Add optional standalone route `/publisher/legal` for deep-linking terms from help/settings
2. Consider tracking `terms_sheet_viewed_at` for audit trail
3. Add English i18n mirror in `legal.json` if bilingual legal pages are required
4. Re-consent flow when policy bumps beyond `1.0`

---

## Overall Status

**PASS** — Full Version 1.0 terms integrated; triple acknowledgement enforced; DB aligned to `1.0`.
