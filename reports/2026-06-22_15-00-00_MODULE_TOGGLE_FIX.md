# Module Toggle Fix + Alpha Nav Button

**Date:** 2026-06-22  
**Scope:** Bottom nav Alpha button · Module lock persistence · App-wide hide

---

## Executive Summary

Fixed module toggles not hiding sections (cache overwritten by stale DB refetch) and improved DB save via RPC + row verification. Simplified Alpha bottom-nav button to match peer styling (removed «رجوع» label and gold box).

---

## Findings

### Alpha button
- Removed «رجوع» subtitle and gold elevated chip
- Same pattern as other nav items: icon + «Alpha» label, `MC.muted` color

### Module toggle root causes
1. **Event handler refetched DB immediately** after optimistic cache patch — stale `enabled=true` restored, sections stayed visible
2. **Direct UPDATE** returned success without verifying row (`toggleModuleDb` only checked `!error`)

### Fixes applied
| Fix | Detail |
|-----|--------|
| Cache sync | `ab:platform-modules` now syncs from local cache, not full DB refetch |
| Optimistic | Toggle patches public cache first → app hides section instantly |
| DB verify | `toggleModuleDb` uses RPC `platform_toggle_module` + `.select()` fallback |
| Revert | Failed save rolls back cache + UI |

### Migration (apply on Supabase)
- `supabase/migrations/20250622194500_platform_toggle_module_rpc.sql`
- Run: `supabase/RUN_PLATFORM_TOGGLE_MODULE.sql`

---

## Warnings

- RPC migration **not auto-applied** to remote — run SQL in Supabase dashboard if toggles still revert after refresh

---

## Errors

None. **Build PASS.**

---

## Recommendations

Apply migration to production Supabase project `usflbjlyadihyitnvzya`.

---

## Overall Status

**PARTIAL** (code PASS · migration pending remote apply)
