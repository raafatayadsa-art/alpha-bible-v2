# Module Control — Save Button & UI Polish

## Executive Summary

Redesigned **إدارة الموديولات** (`/platform/modules`): staged edits with an explicit **حفظ التغييرات** button, professional module cards with larger Arabic typography, and clearer scope labels. Disabled modules propagate via existing `PlatformModuleGate` + `isModuleEnabled`; trip smart-context cards now respect the `trips` module.

## Findings

- Toggles saved immediately on each flip — risky for batch owner edits.
- UI used small `CyberToggle` rows (12px) without module scope explanation.
- Trip cards in Smart Context only checked `community`, not `trips`.

## Changes

| Area | Detail |
|------|--------|
| `module-control-screen.tsx` | **New** — draft state, dirty flag, sticky save bar, discard |
| `platform-store.ts` | `saveModules()` batch persist to Supabase |
| `platform-api.ts` | `saveModulesDb()` |
| `module-control-meta.ts` | Icons, accents, Arabic scope per module |
| `mission-control-ui.tsx` | `ModuleControlRow` — 17px titles, status chips |
| `SmartContextCard.tsx` | Trip kinds gated by `trips` module |

## Warnings

- `trips` module has no dedicated route prefix yet (trip posts live under `/church`); UI cards hide via Smart Context; full church trip post filtering is a follow-up.
- Save applies all changed modules sequentially to DB.

## Errors

None — build PASS (~72s).

## Overall Status

**PASS**
