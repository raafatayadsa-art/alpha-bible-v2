# Module Toggle + Control Cards Fix

**Date:** 2026-06-22  
**Scope:** RPC deploy · module hide · card nav · typography

---

## Executive Summary

Applied `platform_toggle_module` RPC to remote Supabase (root cause of save failure). Fixed module visibility logic (fail-closed until DB load, strict `enabled === true`). Replaced card `button+navigate` with `Link` for reliable routing. Unified control card layout with emergency card and enlarged dashboard/card numbers.

---

## Findings

| Issue | Root cause | Fix |
|-------|------------|-----|
| «تعذّر حفظ…» | RPC missing on remote | Migration applied via Supabase |
| Cards still on home | `isModuleEnabled` defaulted to `true` + stale cache | Fail-closed while loading; `enabled === true` only |
| Settings / cards not opening | Unreliable programmatic navigate | `Link to={to as never}` on all control cards |
| Text layout | Inconsistent titleEn lines | Shared `PlatformCardRow` — icon left, text right |
| Small numbers | 16px dashboard / 13px footer | 22px dashboard / 18px footer metrics |

**Remote DB snapshot:** `agpeya` disabled via RPC test; bible/community also disabled in seed state.

---

## Warnings

- First home load may briefly hide module cards until fetch completes (intentional fail-closed).
- Re-enable modules from `/platform/modules` after testing.

---

## Errors

None. **Build PASS.**

---

## Recommendations

Hard-refresh browser or clear `ab:platform-modules-public` localStorage if stale cards persist once.

---

## Overall Status

**PASS**
