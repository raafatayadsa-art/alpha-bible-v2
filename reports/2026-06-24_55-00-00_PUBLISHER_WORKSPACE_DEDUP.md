# Publisher Workspace — Duplicate UX Cleanup

**Date:** 2026-06-24  
**Scope:** مساحة الناشر — إزالة التكرار + معاينة ثابتة

---

## Executive Summary

Cleaned up publisher workspace UX: removed auto-opening edit sheets on sub-tab click, eliminated duplicate full-width edit buttons, and moved preview/QR/published links to a persistent quick-actions bar visible on all main tabs.

---

## Findings

1. **Duplicate edit flow:** Selecting «بيانات الصفحة» or «كروت الهيرو» immediately opened the edit sheet *and* showed a summary panel with another edit button — same action twice.
2. **Preview hidden:** «معاينة الصفحة» lived only under «نظرة عامة» → «إجراءات سريعة», invisible on «الصفحة» / «المحتوى» tabs.
3. **Redundant labels:** Tab «بيانات الصفحة» + button «تعديل بيانات الصفحة» + sheet title «بيانات الصفحة».

---

## Changes

| Area | Change |
|------|--------|
| `selectPageSubTab` | Sets tab only — no auto `setProfileOpen` / `setHeroOpen` / `setTeamOpen` |
| `WorkspaceQuickActions` | New bar under hero stats: معاينة · باركود · (منشورة) عرض الصفحة |
| `OverviewPanel` | Removed duplicate quick-actions panel; keeps readiness + publish CTA |
| Page sub-panels | Single `PanelEditButton` in card header («تعديل» / «ترتيب») |
| `ProfileSummaryPanel` | Summary only — no bottom edit button |
| `HeroSummaryPanel` | List only — no bottom edit button |

---

## Warnings

- Team sub-tab no longer auto-opens add-assistant sheet; use «إضافة مساعد» inside team panel.
- Hero stack visual (cards behind each other on public page) remains a separate follow-up.

---

## Errors

None.

---

## Recommendations

1. Verify workspace on `/publisher/workspace/$id` — all three tabs show preview bar.
2. «الصفحة» → «بيانات الصفحة» shows summary; tap «تعديل» once to open sheet.
3. Optional next: `PublisherHeroStack` on public page for stacked carousel DNA.

---

## Overall Status

**PASS**
