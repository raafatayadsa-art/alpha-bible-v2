# Platform Module Full Hide + Alpha Connect Rename

**Date:** 2026-06-26  
**Scope:** Complete UI removal when module locked; rename `messaging` → **الفا كونكت**

---

## Executive Summary

When any module is disabled from Platform Control, related **cards, shortcuts, dock items, search scopes, and routes** are now hidden app-wide. The `messaging` module displays as **الفا كونكت · Alpha Connect** in Module Control.

**Build:** PASS

---

## Findings

### Full hide (expanded)
| Surface | Gating |
|---------|--------|
| Home journey + daily cards | `HOME_CARD_MODULE` (existing) |
| Kholagy home card | `kholagy` |
| Alpha Connect home card | `messaging` |
| Church news / directory | `community` |
| Bottom dock | `agpeya`, `community` (dynamic grid) |
| Nav hub | `NAV_ITEM_MODULE_KEY` |
| Search scopes + results | `SEARCH_SCOPE_MODULE` + category map |
| Library audio link | `audio` |
| Church hero «الفا كونكت» float | `messaging` |
| Smart context trip channel btn | `messaging` |
| Routes | Expanded prefixes: `/publisher`, `/profile/messages`, `/call` |

### New helper
- `ModuleGate` — conditional render wrapper
- `mergeOwnerModuleStates` / `mergePlatformModulesWithDefaults` — always use app labels (rename survives DB)

### Rename messaging
- `owner-module-defaults.ts`: **الفا كونكت · Alpha Connect**
- DB migration: `20250626130000_platform_module_messaging_rename.sql` (applied)

---

## Warnings

- Deep links inside large screens (e.g. church feed widgets) may still reference disabled modules until individually gated.
- `feasts` search scope has no module key (always visible).

---

## Errors

None.

---

## Recommendations

1. Hard refresh after toggling modules.
2. Audit remaining `to="/alpha-connect"` in church feed widgets if needed.

---

## Overall Status

**PASS**
