# Alpha Connect — Notifications Sheet Size Fix

**Date:** 2026-06-17  
**Scope:** Reduce notifications panel from full-bleed 100dvh to phone-frame inset card

---

## Executive Summary

Notifications panel no longer fills the entire viewport edge-to-edge. It is now a centered card matching Connect frame width (`max-w-[430px]`) with ~12px vertical inset, rounded corners, and shadow — same visual language as other Connect sheets.

**Overall Status:** PASS

---

## Findings

| Before | After |
|--------|-------|
| `h-[100dvh]` full screen | `h-[min(calc(100dvh-24px),760px)]` |
| `max-w-[440px]` flush top | `max-w-[430px]` centered with `px-3` + safe-area padding |
| Square edges | `rounded-3xl` + shadow |
| Header safe-area double padding | Outer wrapper handles safe-area; header `pt-3` |

Applies to both Connect and church notification surfaces.

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

Visual QA on small iPhone + tall Android: confirm sheet feels inset and scroll area still works.

---

## Overall Status

**PASS**
