# Publisher Workspace — Album, Hero, Dates, Re-Review, Direct Publish

**Date:** 2026-06-24

---

## Executive Summary

Five publisher workspace / admin improvements: multi-hymn album picker, hero cards button outside page tab, content timestamps, edit → pending review, Alpha Control direct-publish entry.

---

## Findings

| Request | Fix |
|---------|-----|
| Album: no multi-hymn selection | Picker now includes all non-rejected hymns (not only `approved`); checkboxes + select all |
| Hero button inside page tab | Moved to `WorkspaceQuickActions` (gold button, always visible) |
| Content publish/edit dates | `publisherContentDateLabel()` on each content row |
| Edit should re-enter review | Migration `20250625120000` — all edits → `pending_review` + approval row |
| Alpha Control direct publish | Button in Alpha Control → PIN → Publisher Center; toggle labeled «نشر مباشر بدون تحقق» (`is_trusted`) |

---

## Warnings

- Apply migration on Supabase for edit re-review RPC.
- Trusted publishers: **new** content still auto-approved; **edits** always re-reviewed.
- Album tracks can include hymns still pending Alpha approval.

---

## Errors

None (build PASS).

---

## Overall Status

**PASS** (pending DB migration apply)
