# St-Takla Selectors Discovery Report

**Scope:** Discovery only — no scrape, no UI/routes/Supabase changes, no sample data.  
**Date:** 2026-06-11  
**Method:** Live HTTP fetch via WebFetch (markdown extraction). Raw HTML download from local shell failed (TLS exit 35).

---

## Executive summary

St-Takla exposes **full Arabic katamaros text** on a Joomla route distinct from the compact summary page. Synaxarium full bios live on static HTML under `Full-Free-Coptic-Books/Synaxarium-or-Synaxarion/`. The katamaros page embeds a **short synaxarium** block; the static pages are the **authoritative long-form** source for `synaxarium_saints.bio_ar`.

Recommended scrape order later:

1. Resolve calendar URL params (`sm`, `iyear`, `imonth`, `iday`) per Coptic day.
2. Parse katamaros sections → `katamaros_readings` with detailed `reading_type`.
3. Parse embedded synaxarium → `synaxarium_days` + stub saints.
4. Enrich saints from static synaxarium HTML (Arabic only in phase 1).

---

## Katamaros sources

### A. Full readings (PRIMARY for scrape)

| Field | Value |
|-------|--------|
| URL pattern | `https://st-takla.org/zJ/index.php/en-readings-katamaros?c=&dbl=ar&iday={d}&imonth={m}&iyear={Y}&sm={M}-{D}&view=reading-arabic` |
| Language | Arabic (`dbl=ar`, `view=reading-arabic`) |
| Content | Full verse tables, liturgical headings, synaxarium embed |

**Verified samples**

| Purpose | URL params | Page title (Arabic) |
|---------|------------|---------------------|
| Ordinary day | `iyear=2026`, today | `قراءات الجمعة, 12 يونية 2026 --- 5 بؤونة 1742` |
| Pentecost week | `sm=5-5`, `imonth=5`, `iday=5`, `iyear=1742` | `قراءات الثلاثاء من الأسبوع السادس من الخماسين المقدسة` |
| Great Lent D1 | `iyear=2026`, `imonth=2`, `iday=16`, `sm=2-16` | `قراءات الصوم الكبير` (16 Feb 2026 = 9 أمشير 1742) |
| Feast | `sm=3-1`, `imonth=3`, `iday=1` | `قراءات عيد مجيء المسيح إلى أرض مصر` |

**URL param notes (open risk)**

- Header date can remain “today” while body reflects `sm` + calendar params — trust **body title**, not header alone.
- `sm={M}-{D}` correlates with target day but exact mapping needs a **366-day resolver** (iterate `sm` + validate coptic date in page title, or follow prev/next links).
- `iyear`: use **Gregorian year** (e.g. `2026`) for correct liturgical season in tested Lent URL.

### B. Compact summary (SECONDARY — references only)

| Field | Value |
|-------|--------|
| URL | `https://st-takla.org/zJ/index.php/component/katamaros/` |
| Content | Section refs without full verse text |
| Use | Quick audit / reference cross-check only |

### C. Legacy static Lent HTML (REFERENCE)

| Field | Value |
|-------|--------|
| Path | `/Full-Free-Coptic-Books/Katamars/Katamaros-El-Soum-El-Kebir/Katamares-Holy-Lent_Week-{W}-Day-{D}.html` |
| Notes | Site warns of errors vs daily Joomla katamaros; Van Dyck translation in static copy |

---

## Section discovery → `reading_type`

| Arabic heading | English equivalent | `reading_type` | Present when |
|----------------|-------------------|----------------|--------------|
| (OT blocks before psalm) | Prophecy | `prophecy` | Great Lent; multiple per day |
| العشية + مزمور العشية | Vespers psalm | `vespers_psalm` | Most non-Lent days |
| إنجيل العشية | Vespers gospel | `vespers_gospel` | Most non-Lent days |
| باكر + مزمور باكر | Matins psalm | `matins_psalm` | Always (2nd باكر block in Lent) |
| إنجيل باكر | Matins gospel | `matins_gospel` | Always |
| البولس | Pauline | `pauline` | Liturgy |
| الكاثوليكون | Catholic | `catholic` | Liturgy |
| الإبركسيس | Praxis | `praxis` | Liturgy |
| السنكسار | Synaxarium | `synaxarium` | Usually; order varies |
| مزمور القداس | Liturgy psalm | `liturgy_psalm` | Usually |
| إنجيل القداس | Liturgy gospel | `liturgy_gospel` | Usually |

### Seasonal layout differences

| Season | Notable |
|--------|---------|
| **Ordinary** | Vespers → Matins → Liturgy → **Synaxarium → Liturgy psalm/gospel** |
| **Pentecost** | Liturgy psalm/gospel **before** synaxarium; note `لا يُقرأ في الكنيسة خلال هذه الفترة` |
| **Great Lent** | **No vespers** on day-1 sample; **prophecy block(s)** under first `باكر`; synaxarium before liturgy psalm/gospel |

### Prophecy detection rule

When first `باكر` section contains OT book lines (`خروج`, `اشعياء`, `(من سفر…`) **without** `مزمور باكر` / `إنجيل باكر`, classify verses as `prophecy` with `reading_key` `prophecy_1`, `prophecy_2`, …

---

## Synaxarium sources

### A. Static Arabic (PRIMARY for bios)

```
https://st-takla.org/Full-Free-Coptic-Books/Synaxarium-or-Synaxarion/{folder}/{dayFile}.html
```

Example: `10-Bawoonah/05-Bawoonah.html` → 5 Baouna.

Structure:

- `h1` — day header (`5 شهر بؤونه`)
- `h2` — saint entry (`نياحة…`, `استشهاد…`, `تذكار…`)
- Body paragraphs + optional images
- Closing: `صلاته تكون معنا`

### B. Static English (future i18n)

```
https://st-takla.org/books/en/church/synaxarium/{month-slug}/{day-slug}.html
```

Example: `10-bawoonah/05-paona.html` — often **summary list only**, not full bios.

### C. Joomla calendar (INDEX)

```
https://st-takla.org/zJ/index.php/ar-synaxarium?dbl=ar&imonth={n}&rdr={month}.php&view=days_of_month
```

`imonth` uses **site index 1–13** (e.g. `9` → Baouna). Use for link discovery, not primary text.

### D. Embedded in katamaros (SYNC source)

Same saint headings as static, shorter text — use for **day linkage** and dedupe keys.

**Deprecated / 404:** old paths like `/books/ar/church/synaxarium/index.html`, `/books/en/church/synaxarium/02-Pashons/16.html`.

---

## Selector strategy (pre-HTML pass)

Because raw HTML was not saved locally, selectors are **heading-driven** until HTML inspection in scrape phase:

```
1. Locate main content container (Joomla article / component body).
2. Split on horizontal rules or ↑ أعلى الصفحة ↑ markers.
3. For each block:
   - first strong heading text → section map → reading_type
   - subheading (مزمور العشية, إنجيل العشية, …) → refine type
4. Verse tables: rows with | verse_num | text |
5. Reference line: regex (book) (chapter) : (verses)
6. Synaxarium h2/h3 → saint records
```

**Post-scrape validation:** compare reference strings against compact `component/katamaros/` page.

---

## Coptic month folder map (Arabic static synaxarium)

| Month # | Arabic | Folder slug (observed) |
|--------:|--------|-------------------------|
| 1 | توت | `01-Tout` (pattern) |
| 2 | بابه | `02-Baba` |
| 3 | هاتور | `03-Hator` |
| … | … | … |
| 10 | بؤونة | `10-Bawoonah` |
| 11 | أبيب | `11-Abib` |
| 12 | مسرى | `12-Mesra` |
| 13 | نسئ | `13-Nesi` |

Confirm remaining folder names in scrape phase by crawling parent directory or sitemap.

---

## Occasion type taxonomy (synaxarium_saints.occasion_type)

| Arabic prefix | `occasion_type` |
|---------------|-----------------|
| نياحة | `departure` |
| استشهاد | `martyrdom` |
| تذكار | `commemoration` |
| تكريس | `consecration` |
| (other) | `other` → extend registry if discovery finds new prefixes |

---

## Risks & next steps

| Risk | Mitigation |
|------|------------|
| `sm` param ambiguity | Build resolver from page title coptic date; fallback prev/next crawl |
| Duplicate `باكر` in Lent | Use content heuristic (OT refs vs psalm intro) |
| EN synaxarium thin | Schema supports `*_en`; scrape AR first |
| HTML selectors unknown | Save 3–5 sample HTML files locally before parser implementation |
| TLS from dev machine | Run fetch in CI or use WebFetch-equivalent with HTML retained |

---

## Artifacts in this folder

| File | Purpose |
|------|---------|
| `reading-types.json` | Canonical + discovered types |
| `json-structure-proposal.json` | Target JSON shape |
| `sql-schema-proposal.sql` | Bilingual DB proposal |
| `source-mapping.md` | URL ↔ field mapping |
| `discovery-report.md` | This file |
