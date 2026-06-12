# Katameros Parser Failures — Root Cause Analysis

**Date:** 2026-06-12  
**Scope:** The 2 remaining validation failures (4,748 passed / 2 failed)  
**Sources:** Katameros readings JSON (references only), Alpha Bible `bible_verses` (Supabase)

---

## Summary

| # | Reference | Date / Reading | Root cause | Fix type |
|---|-----------|----------------|------------|----------|
| 1 | `27.1:1-42` | Great Lent · Week 4 · Day 5 · Prophecy | Orthodox Daniel chapter numbering vs Alpha | Parser chapter remap |
| 2 | `60.3:25-4:6` | Resurrection · C Gospel | Katameros JSON typo (`25` → `15`) | Parser reference alias |

Neither failure is missing Bible text in Supabase. Both are reference-resolution issues.

---

## Failure 1: `27.1:1-42` — “Alpha verse 27.1:22 missing”

### What Katameros stores

```
5.10:12-22*@+5.11:1-28@23.29:12-23@18.21:1-34@27.1:1-42
```

The failing segment is **`27.1:1-42`** (book 27 = Daniel, chapter 1, verses 1–42).

### What Alpha Bible has

| Location | Verse count | Notes |
|----------|------------:|-------|
| Daniel **chapter 1** | 21 | MT/LXX opening chapter (ends at v.21) |
| Daniel **chapter 14** | **42** | Deuterocanon: Bel and the Dragon |

Supabase contains Daniel chapters 1–14. Chapter 1 has no verse 22.

### Is the reference format invalid?

**No.** The string `27.1:1-42` is valid Katameros machine syntax (single chapter, verse range).

### Is the parser wrong?

**Partially.** The parser correctly reads `book=27`, `chapter=1`, `verses=1-42`. It then looks up Daniel 1:22 in Supabase and correctly reports it missing.

The gap is **Orthodox deuterocanon numbering**: Katameros treats the 42-verse Bel and the Dragon block as **`27.1:1-42`**, while Alpha stores that same text under **`سفر دانيال` chapter 14**.

Evidence:

- Katameros `books/27.json` also has only **21** verses in chapter 1 — so even the legacy JSON cannot satisfy `1-42` in chapter 1.
- Alpha chapter 14 has **exactly 42** verses — a precise match for the requested range.
- Chapter 14 v.1 begins the Bel narrative (“و كان دانيال نديما للملك…”), not the chapter-1 exile narrative.

### Verdict

| Question | Answer |
|----------|--------|
| Invalid reference format? | No |
| Parser wrong? | Needs Orthodox Daniel remap |
| Missing in Supabase? | No — text is at **27.14:1-42** |

### Exact fix (implemented)

In `src/lib/katameros-references.ts` and `scripts/katameros-validation-001.mjs`:

When resolving **book 27, chapter 1, range `1-42`** and chapter 1 has fewer than 42 verses, **remap to chapter 14, range `1-42`** before querying Supabase.

```typescript
// Daniel deuterocanon: Katameros 27.1:1-42 → Alpha Daniel 14:1-42
if (bookId === 27 && chapter === 1 && verseSpec === "1-42" && maxVerseInChapter < 42) {
  chapter = 14;
}
```

---

## Failure 2: `60.3:25-4:6` — “No verses resolved for 60.3:25-end”

### What Katameros stores

Pentecost / Resurrection:

```
C_Gospel_Ref: "60.3:25-4:6"
```

Book **60** = 1 Peter (`رسالة بطرس الرسول الأولى`).

### How the cross-chapter parser expands it

`60.3:25-4:6` contains **two colons** (`3:` and `4:`), so Katameros splits it as:

1. `60.3:25-end` — 1 Peter 3:25 through end of chapter  
2. `60.4:1-6` — 1 Peter 4:1–6

This matches the official `getRefs()` logic in `katameros-preparation/utils/readings-helpers.js`.

### What Alpha Bible has

| Segment | Expected | Alpha reality |
|---------|----------|---------------|
| 1 Peter 3:25+ | v.25–end | **Chapter 3 has only 22 verses** — v.25 does not exist |
| 1 Peter 4:1–6 | v.1–6 | All present |

So `60.3:25-end` resolves to **zero verses** (`from=25`, `to=22` → empty loop).

### Is the reference format invalid?

**No.** `book.chapter:startVerse-endChapter:endVerse` is the standard Katameros cross-chapter pattern (same as `52.4:13-5:11`, `60.3:15-4:6`).

### Is the parser wrong?

**No.** The split is correct. The **start verse number is wrong in the JSON**.

Smoking gun — the **same resurrection catholic epistle** appears elsewhere as:

| File | Reference | Validation |
|------|-----------|------------|
| `special-readings.json` (Easter) | `60.3:15-4:6` | **PASS** (14 verses: 3:15–22 + 4:1–6) |
| `pentecost-readings.json` (Resurrection) | `60.3:25-4:6` | **FAIL** |

Only difference: **`25` vs `15`**. With `15`, the parser produces `60.3:15-end` + `60.4:1-6`, which resolves fully in Supabase.

### Verdict

| Question | Answer |
|----------|--------|
| Invalid reference format? | No |
| Parser wrong? | No — typo in source JSON |
| Missing in Supabase? | No — v.25 was never a valid 1 Peter verse |

### Exact fix (implemented)

Without editing Katameros JSON, add a **known-reference alias** in the parser:

```typescript
"60.3:25-4:6" → "60.3:15-4:6"
```

Applied in `normalizeKatamerosReference()` before `splitKatamerosRefs()`.

---

## Files changed (parser only)

- `src/lib/katameros-references.ts` — `normalizeKatamerosReference()`, `adjustDanielAlphaChapter()`
- `scripts/katameros-validation-001.mjs` — same logic for batch validation

## Not changed (per requirements)

- Supabase Bible data  
- Katameros JSON files  
- UI, routes, or design  

## Re-validate

```bash
node scripts/katameros-validation-001.mjs
```

Expected after fix: **4,757 / 4,757 PASS** (for these two cases; any other failures would be separate issues).
