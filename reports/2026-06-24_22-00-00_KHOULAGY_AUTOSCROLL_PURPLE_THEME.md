# Kholagy Auto-Scroll Bar Purple Theme

**Date:** 2026-06-24

---

## Executive Summary

Matched the Khoulagy reader auto-scroll control bar and side scroll rail to the screen’s purple palette (`#f6f0ff` light / `#121836` dark). Bible and Agpeya readers keep the default green bar.

---

## Findings

- `AutoScrollControls` reused the Bible green control bar DNA on Khoulagy purple screens — visually mismatched.
- Khoulagy uses `bg-[#f6f0ff]` (light) and `bg-[#0c1024]` / `#121836` header (dark).

---

## Changes

| File | Change |
|------|--------|
| `AlphaControlBar.tsx` | `AlphaControlTone` + `kholagy` purple tokens; purple play button |
| `AlphaReadingControlBar.tsx` | Optional `tone` prop |
| `AutoScrollControls.tsx` | Optional `tone` prop |
| `ChapterReadingScrollRail.tsx` | Optional `tone="kholagy"` track colors |
| `kholagy.$groupId.tsx` | `tone="kholagy"` on both controls |
| `kholagy.liturgy_.$liturgyKey.$sectionId.tsx` | Same |

---

## Warnings

None.

---

## Errors

None — build verified.

---

## Recommendations

None required.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY SCROLL BAR THEME — 2026-06-24 | PASS
- tone="kholagy" purple bar on Khoulagy readers only
- Light: #f6f0ff shell, purple borders/buttons
- Dark: #121836 shell, #8a6ec1 accents, gold thumb on rail
- Bible/Agpeya unchanged (default green)
```
