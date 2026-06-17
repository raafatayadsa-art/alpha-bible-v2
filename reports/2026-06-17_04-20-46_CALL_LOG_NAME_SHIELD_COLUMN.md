# Alpha Connect — Call Log Name + Shield Column Alignment

**Date:** 2026-06-17  
**Scope:** Call log rows only

---

## Executive Summary

Call log rows now use a fixed grid: **name right-aligned**, **shield in a dedicated column** aligned vertically across all rows, **action buttons unchanged** on the right.

---

## Layout

`[Avatar 2.5rem] | [Name + time — RTL right] | [Shield 1.75rem] | [Call · Message]`

Same column logic as participants drawer shields.

---

## Changes

| File | Change |
|------|--------|
| `AlphaIdentityRow.tsx` | New `variant="call-log"` — name-only cell + separate shield cell |
| `alpha-identity-layout.css` | Grid columns for `.connect-call-log-row` |
| `alpha-connect.tsx` | `RecentCallerRow` uses `variant="call-log"` |

---

## Overall Status

**PASS**
