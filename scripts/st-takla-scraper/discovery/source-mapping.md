# St-Takla Source Mapping

Maps external fields → Alpha Bible discovery JSON / proposed SQL.  
**Scrape locale phase 1:** Arabic only (`*_ar` populated, `*_en` null).

---

## 1. Katamaros day metadata

| St-Takla source | Location on page | Target JSON | Target SQL |
|-----------------|------------------|-------------|------------|
| Liturgical title | Line after date picker, e.g. `قراءات الجمعة…` | `katamaros_day.liturgical_day_ar` | `katamaros_days.liturgical_day_ar` |
| Gregorian + Coptic date | Header table, e.g. `الجمعة, 12 يونية 2026 --- 5 بؤونة 1742` | `gregorian_date_label_ar`, `coptic_date_label_ar` | same |
| Parsed coptic parts | From date string | `coptic_month`, `coptic_day`, `coptic_year` | same |
| Season / feast name | Title when special, e.g. `قراءات الصوم الكبير` | `occasion_ar`, `season` | same |
| Canonical URL | Request URL | `source.url` | `katamaros_days.source_url` |
| Stable id | `{coptic_year}-{month:02d}-{day:02d}` | `id` | `katamaros_days.id` |

**Fetch URL template (primary)**

```
https://st-takla.org/zJ/index.php/en-readings-katamaros
  ?c=
  &dbl=ar
  &iday={gregorian_day}
  &imonth={gregorian_month}
  &iyear={gregorian_year}
  &sm={coptic_month}-{coptic_day}
  &view=reading-arabic
```

---

## 2. Katamaros readings

| Section heading (AR) | Sub-heading | `reading_type` | `reading_key` | SQL columns |
|------------------------|-------------|----------------|---------------|-------------|
| العشية | مزمور العشية | `vespers_psalm` | `vespers_psalm` | `title_ar`, `reference_ar`, `body_ar`, `source_ar='العشية'` |
| العشية | إنجيل العشية | `vespers_gospel` | `vespers_gospel` | same |
| باكر (OT only) | — | `prophecy` | `prophecy_{n}` | `reference_ar`, `body_ar`; `metadata.prophecy_index` |
| باكر | مزمور باكر | `matins_psalm` | `matins_psalm` | same |
| باكر | إنجيل باكر | `matins_gospel` | `matins_gospel` | same |
| قراءات القداس | البولس | `pauline` | `pauline` | `source_ar='قراءات القداس'` |
| قراءات القداس | الكاثوليكون | `catholic` | `catholic` | same |
| قراءات القداس | الإبركسيس | `praxis` | `praxis` | same |
| السنكسار | intro paragraph | `synaxarium` | `synaxarium_intro` | `body_ar` = intro only |
| (after synaxarium or before) | مزمور القداس | `liturgy_psalm` | `liturgy_psalm` | — |
| (after synaxarium or before) | إنجيل القداس | `liturgy_gospel` | `liturgy_gospel` | — |

**Reference line patterns**

| Pattern example | Parsed |
|-----------------|--------|
| `مزامير 32:11 ; 33:1 ; 32:6` | multi-segment psalm ref |
| `متى 25 : 14 - 23` | book, chapter, verse range |
| `فيلبي 3 : 20 - 4 : 9` | cross-chapter epistle |
| `خروج 2 : 23 - 3 : 5` | prophecy OT span |

**Verse body:** table rows `| n | text |` → concatenate into `body_ar`.

**Display order:** use `reading-types.json` → `section_order_variants` for season, else default 10-step spacing.

---

## 3. Synaxarium day

| St-Takla source | URL | Target |
|-----------------|-----|--------|
| Static Arabic day page | `/Full-Free-Coptic-Books/Synaxarium-or-Synaxarion/{MM-Month}/{DD-Month}.html` | `synaxarium_days` |
| Katamaros embed | `#السنكسار` section | `intro_ar`, `heading_ar`, saint list |
| English stub | `/books/en/church/synaxarium/{slug}/{day}.html` | `heading_en`, `intro_en` (future) |

| Page element | Field |
|--------------|-------|
| `h1` / day title | `heading_ar` |
| Opening doxology paragraph | `intro_ar` |
| `لا يُقرأ في الكنيسة…` (from katamaros) | `church_reading_suppressed=true`, `church_reading_note_ar` |
| `{coptic_month}-{coptic_day}` | `id` (year optional on day table) |

**Month folder ↔ coptic_month**

| coptic_month | Folder |
|-------------:|--------|
| 10 | `10-Bawoonah` |
| … | (see discovery-report.md) |

**Day file naming:** `{DD}-{MonthName}.html` e.g. `05-Bawoonah.html`.

---

## 4. Synaxarium saints

| St-Takla element | Target JSON / SQL |
|------------------|-------------------|
| `h2` full title | `title_ar` |
| Parsed name from title | `name_ar` |
| Prefix (نياحة / استشهاد / تذكار) | `occasion_type` |
| `( 5 بـؤونة)` suffix | `coptic_date_label_ar` |
| Paragraph(s) after heading | `bio_ar` (static page); `summary_ar` = first paragraph or katamaros short text |
| `صلاته تكون معنا` | `closing_ar` |
| Order on page | `display_order` |
| Generated slug from name | `slug` |
| `{day_id}-{order:02d}` | `id` |

**Dual-source merge rule**

1. Create saints from katamaros embed (guaranteed 366-day coverage).
2. Upsert `bio_ar` from static HTML when URL resolves.
3. Dedupe key: `(day_id, display_order)`; fallback fuzzy match on `title_ar`.

---

## 5. Cross-links

| From | To | Mechanism |
|------|-----|-----------|
| `katamaros_days` | `synaxarium_days` | same `id` = `{year}-{month}-{day}` |
| `katamaros_readings` (synaxarium) | `synaxarium_saints` | `metadata.saint_ids[]` |
| App UI cards | readings | `reading_type` → `ui_card_group` via `reading_type_registry` |

---

## 6. Sources explicitly excluded (this phase)

| Source | Reason |
|--------|--------|
| `component/katamaros/?sm=` without full view | Returns sidebar only / wrong locale |
| `option=com_katamaros&sm=` | Incomplete body in tests |
| `option=com_synaxarium` | 404 |
| Old `/books/ar/church/synaxarium/` tree | 404 |
| Static Lent HTML as primary | Site disclaimer; use Joomla katamaros instead |
| `RUN_IN_SQL_EDITOR_CLEAN.sql` | Sample data — out of scope |

---

## 7. Validation checklist (pre-production scrape)

- [ ] 3 seasons fetched: ordinary, pentecost, great_lent
- [ ] Each core `reading_type` seen at least once
- [ ] Multiple `prophecy` on one Lent day
- [ ] Synaxarium static URL resolves for all 13×30 days
- [ ] `sm` resolver tested across Coptic year boundary (Nesi / Thout)
- [ ] UTF-8 Arabic preserved end-to-end
