# Module Save Persistence & Alpha Control UI Upgrade

**Date:** 2026-06-29  
**Scope:** Module save after refresh, Alpha Control UI consistency, Founder quick tools

---

## Executive Summary

Fixed module save not persisting after page refresh by adding upsert-safe DB writes, post-save verification, and unified cache sync. Upgraded Alpha Control sub-screens to match the Module Control card design. Enhanced the founder quick-tools strip with prominent Modules and Media cards, dirty-state save button styling, and a clearer discard control.

---

## Findings

1. **Save reverted on refresh** — Owner UI wrote to local cache but DB rows for newer module keys (e.g. `kholagy`, `audio`, `kids`) could be missing; `platform_toggle_module` RPC raised "module not found" and updates returned 0 rows silently.
2. **No post-save verification** — `saveModules` trusted client draft without re-reading DB.
3. **Split caches** — `ab:mc-modules` (owner) and `ab:platform-modules-public-v6` (app) could diverge after batch save.
4. **Quick tools** — Modules and Media were small / buried; names and metrics hard to read.
5. **Alpha Control screens** — Mixed `CyberToggle` / `CyberPanel` styles vs. new Module Control cards.

---

## Warnings

- **Migration required on Supabase:** Apply `supabase/migrations/20260629120000_platform_toggle_module_upsert.sql` so the RPC upserts missing keys server-side. Client-side upsert fallback works without migration but RPC path is preferred.
- If save still fails, the UI now shows an error instead of a false success flash.

---

## Errors

- None during local `npm run build` (PASS).

---

## Recommendations

1. Run `supabase db push` or apply the new migration on the linked project.
2. After deploy, toggle a module → Save → hard refresh → confirm state persists.
3. Consider adding draft+save pattern to Emergency/Settings screens later (currently instant toggle).

---

## Changes Made

| Area | Change |
|------|--------|
| `platform-api.ts` | Upsert fallback in `toggleModuleDb`; improved RPC row parsing |
| `platform-store.ts` | Verify DB after save; `replacePlatformModulesCache` sync |
| `platform-modules-client.ts` | `replacePlatformModulesCache()` helper |
| Migration | `platform_toggle_module` upsert-safe |
| `module-control-screen.tsx` | Gold pulsing save when dirty; labeled discard button |
| `mission-control-ui.tsx` | `CyberBtn` save highlight; `ModuleControlRow` metric mode |
| `mission-screens.tsx` | Privacy, AI, Settings, Emergency, Analytics, Library use ModuleControlRow |
| `FounderQuickTools.tsx` | Featured Modules + Media cards at top; larger grid tools |
| `FounderMissionControlHome.tsx` | Pass module counts to quick tools |

---

## Overall Status

**PASS**
