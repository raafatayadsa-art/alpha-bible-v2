# Kholagy Dark Scroll Rail Contrast Fix

**Date:** 2026-06-24

---

## Executive Summary

Improved visibility of the Khoulagy scroll rail and auto-scroll control bar in **dark mode** — track, thumb, and bar shell now contrast clearly against `#0c1024` background. Light mode unchanged.

---

## Findings

- Dark kholagy track used `bg-[#8a6ec1]/18` — nearly invisible on navy background.
- Auto-scroll bar shell `#121836` blended into screen background.

---

## Changes

| Element | Dark kholagy fix |
|---------|------------------|
| Scroll track | `#c4b0e8/26` + ring + purple outer glow |
| Scroll thumb | Brighter gold gradient + stronger glow + ring |
| Rail width | 6px (was 5px) in dark kholagy |
| Control bar | `#1a2248` shell, `#c4b0e8` borders, brighter buttons |

---

## Warnings

None.

---

## Errors

None — build verified.

---

## Recommendations

None.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY DARK SCROLL CONTRAST — 2026-06-24 | PASS
- Brighter purple track + gold thumb glow in dark mode
- Wider rail (6px) for kholagy dark
- Control bar shell lifted for visibility on #0c1024
```
