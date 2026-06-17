# Alpha Connect Call Tab — Profile & Call Log UI Fix

**Date:** 2026-06-17  
**Scope:** Profile card sizing + call log list restore (Image 1 / Image 2).

---

## Executive Summary

Profile identity card now matches **ConnectChannelHeader** typography and avatar scale. Call log list is always visible in a **glass-strong** card (Image 2), with name/time grouped in the identity block on the right and action buttons on the left.

---

## Changes

### IndividualProfileCard
- Avatar: `lg` → `sm` (aligned with channel icon scale)
- Name: `17px` → `15px font-bold` (same as channel name)
- Meta: `10px` presence + status lines inside identity block
- Removed floating `subtitle` between identity and QR
- Card: `rounded-2xl px-3 py-2.5` (channel card DNA)

### CallLogCard
- Removed collapsible `ConnectHistoryPanel` wrapper on Call tab
- `glass-strong rounded-3xl p-4` container with rows + عرض المزيد
- Removed duplicate inner title

### RecentCallerRow
- Time/duration/call icon → `meta` inside identity block (under name, right)
- Phone + message buttons only in `trailing` (left)
- Shield role from conversation data

---

## Overall Status

**PASS**
