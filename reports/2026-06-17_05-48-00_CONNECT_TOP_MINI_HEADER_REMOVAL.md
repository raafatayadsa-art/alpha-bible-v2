# Connect Top Mini Header Removal

**Date:** 2026-06-17  
**Scope:** Alpha Connect — top safe-area / header strip  
**Build:** PASS

---

## Executive Summary

Removed the extra thin header strip at the very top of Alpha Connect screens by consolidating safe-area padding into the main header row, deleting a non-functional back button, and removing the duplicate hero branding block from settings.

---

## Findings

1. **Double top inset** — Outer content wrapper had `pt-[safe-area]` while the header sat below it, leaving an empty band that read as a tiny header under the Dynamic Island.
2. **Placeholder back button** — A glass `ArrowLeft` button with no action rendered on every non-chat screen (and stacked with the groups participants button).
3. **Settings hero card** — `ConnectSettingsLivePanel` duplicated logo + “Alpha Connect” title directly under the settings header.
4. **Call routes** — `/call` and `/personal-call` used fixed `pt-14` instead of safe-area-aware header padding.

---

## Warnings

- Left column uses an invisible `h-11 w-11` spacer on individual/messages modes to keep the logo centered (layout balance only, no visible chrome).

---

## Errors

None.

---

## Changes Made

| File | Change |
|------|--------|
| `alpha-connect.tsx` | Safe area on `connect-header`; removed outer top padding; removed dummy back button |
| `AlphaConnectSettings.tsx` | Removed hero logo/title from live panel |
| `ConnectChannelSettings.tsx` | Safe area on header row only |
| `call.tsx` / `personal-call.tsx` | Replaced `pt-14` with header safe-area padding |

---

## Overall Status

**PASS**
