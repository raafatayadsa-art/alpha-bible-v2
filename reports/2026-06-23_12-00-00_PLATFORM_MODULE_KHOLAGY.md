# Platform Module — Khoulagy Lock/Unlock

**Date:** 2026-06-23  
**Scope:** Independent `kholagy` platform module for Alpha Control Module Control

---

## Executive Summary

Added **الخولاجي المقدس** as a standalone platform module (`kholagy`) with the same lock/unlock pattern as Bible, Agpeya, Synaxarium, etc. When disabled in `/platform/modules`, routes under `/kholagy` redirect home and home/nav cards hide.

**Overall Status: PARTIAL** — app code complete; run SQL on Supabase to register the DB row.

---

## Findings

### Code changes

| File | Change |
|------|--------|
| `src/lib/platform-modules/types.ts` | `kholagy` in `PlatformModuleKey` |
| `src/lib/platform-modules/module-route-map.ts` | Routes `/kholagy` gated by `kholagy` |
| `src/features/platform-admin/platform-store.ts` | Default module list + toggle type |
| `src/routes/home.tsx` | Cards `kholagy` / `hymn` → module `kholagy` |
| `supabase/migrations/20250623210000_platform_module_kholagy.sql` | Seed row |

### Module Control UI

`/platform/modules` (`ModuleControlScreen`) already maps **all** rows from `platform_modules` — no new card needed. After DB insert, **الخولاجي المقدس · Khoulagy** appears with CyberToggle.

### Pattern for future screens

1. Add key to `PlatformModuleKey` + `PLATFORM_MODULE_KEYS`
2. Add route prefix in `MODULE_ROUTE_PREFIXES`
3. Map home/nav keys in `NAV_ITEM_MODULE_KEY` / `HOME_CARD_MODULE`
4. Insert row in `platform_modules`
5. `PlatformModuleGate` handles route blocking automatically

---

## Warnings

- Remote Supabase migration requires manual run: `supabase/RUN_PLATFORM_MODULE_KHOLAGY.sql`
- Stale localStorage `ab:mc-modules` may omit `kholagy` until owner console syncs from DB

---

## Errors

Auto MCP migration blocked (approval required). Apply SQL manually if not yet run.

---

## Recommendations

1. Run `RUN_PLATFORM_MODULE_KHOLAGY.sql` on production
2. Open `/platform/modules` and verify toggle for الخولاجي

---

## Overall Status

**PARTIAL** (code PASS, DB seed pending manual apply)

---

## COPYABLE REPORT

```
PLATFORM MODULE KHOLAGY — 2026-06-23 | PARTIAL
Key: kholagy | label: الخولاجي المقدس
Toggle: /platform/modules (CyberToggle)
Gate: /kholagy routes + home cards
Run: supabase/RUN_PLATFORM_MODULE_KHOLAGY.sql
Build: PASS
```
