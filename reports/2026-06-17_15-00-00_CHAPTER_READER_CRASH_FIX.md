# Chapter Reader Crash Fix

**Date:** 2026-06-17

---

## Executive Summary

The Bible chapter reader screen was crashing on load due to a JavaScript temporal dead zone error: `bookName` was referenced in hooks before its `const` declaration.

---

## Findings

- `handleShareChapter` and `handleToggleChapterSave` (lines ~456–481) used `bookName` in dependency arrays and bodies.
- `const bookName = displayName(book)` was declared later (~line 493).
- Runtime error: `ReferenceError: Cannot access 'bookName' before initialization` — blank/crashed chapter screen.

---

## Fix

Moved `bookName`, `list`, `prev`, and `next` immediately after route params and queries (top of `ScriptureReader`).

---

## Warnings

None.

---

## Errors

Resolved — was a single ordering bug, not a routing or data issue.

---

## Recommendations

Avoid declaring values used in early hooks below those hooks in large components.

---

## Overall Status

**PASS**
