# Kholagy Coptic Text Encoding Analysis

**Date:** 2026-06-24  
**Scope:** Why Coptic column shows strange symbols + implementation plan for real Unicode Coptic

---

## Executive Summary

The Khoulagy Coptic column does **not** contain Unicode Coptic (ⲁⲃⲅ…). It stores **legacy ASCII keyboard encoding** from the CS / CopticChurch.net ecosystem (e.g. `Pi`precbuteroc@`). Displaying that string with a normal or monospace Latin font produces “random symbols”. The fix is **transcoding to Unicode Coptic** + a **Unicode Coptic webfont** — not merely swapping fonts on the raw text.

---

## Findings

### Current state in Alpha Bible

| Layer | What happens |
|-------|----------------|
| DB `kholagy.coptic_text` / liturgy `content` | Legacy ASCII / CS keyboard text |
| Parser (`kholagy-liturgy-parser.ts`) | Detects lines with `` ` `` and `@` as “Coptic” |
| UI (`KholagyVerseRow`) | Renders raw string with `font-mono` |
| `.font-coptic` in `styles.css` | Uses same `--font-alpha` as Arabic — **no Coptic font** |

Example markers already in code: `Pi`precbuteroc@`, `Pidiakwn@`, `Pilaoc@` — these are **transliteration keys**, not Unicode.

### What CopticChurch.net recommends

- Store and display **Unicode Coptic** (U+2C80–U+2CFF)
- Use fonts like **Noto Sans Coptic** or **Antinoou**
- Convert legacy CS-font text via their [Convert Text to Coptic Unicode](https://www.copticchurch.net/coptic_fonts/) tool

### Available tooling (no ML needed)

This is **deterministic mapping**, not an AI model:

1. **`@stmarkus/coptic-font-unicode-converter`** (npm) — supports `CS`, `NEW_ATHANASIUS`, `KYRILLOS`, etc.; handles jimkin combining rules
2. **Custom mapper** (regex + tables) — like [Coptic-ASCII-UNICODE-Translator](https://github.com/SuperHeavyBallet/Coptic-ASCII-UNICODE-Translator) for backtick/`@` segments

---

## Recommended implementation plan (Alpha Bible)

### Phase 1 — Display pipeline (1–2 days)

1. Add `src/lib/coptic-text/format-coptic-display.ts`:
   - If string already contains Unicode Coptic → return as-is
   - Else run `convertCopticText("CS", raw, "COMBINE_WITH_CHAR_AFTER")` (tune font + jimkin after samples)
2. Add **Noto Sans Coptic** `@font-face` + class `.font-coptic-text`
3. Apply in `kholagy-api.ts` + liturgy parser output + `KholagyVerseRow` / `KholagyLiturgyBlockRow`
4. Unit tests with 5–10 known phrases (Amen, Trisagion, Priest/Deacon labels)

### Phase 2 — DB normalization (optional, best long-term)

1. Script: fetch all rows → convert → write `coptic_text_unicode` column
2. Migration + backfill; reader reads Unicode column first
3. Enables search, copy/paste, consistent rendering on all devices

### Phase 3 — Import pipeline

1. On scrape/import from CopticChurch.net sources, convert **before** insert
2. Never store legacy ASCII in new rows

### Validation

- Compare converter output with [copticchurch.net converter](https://www.copticchurch.net/coptic_fonts/) for sample verses
- If `CS` font key fails, try `NEW_ATHANASIUS` or `COPTIC` via `fontSupported()`

---

## Warnings

- Wrong jimkin mode → incorrect dots above letters (ⲁ̅ vs ⲁ)
- Mixed Unicode + legacy in same line needs passthrough logic
- Converting 142 liturgy sections + 127 hymns at runtime on every load is slow — prefer cached/DB Unicode

---

## Errors

None (analysis only).

---

## Overall Status

**PARTIAL** — root cause identified; conversion not yet implemented.

---

## COPYABLE REPORT

```
COPTIC ENCODING ANALYSIS — 2026-06-24 | PARTIAL
Problem: DB stores CS ASCII (Pi`precbuteroc@), not Unicode ⲡⲓ…
Fix: convert to Unicode + Noto Sans Coptic font
Tool: @stmarkus/coptic-font-unicode-converter (CS font)
Plan: format-coptic-display.ts → API → UI → optional DB migration
```
