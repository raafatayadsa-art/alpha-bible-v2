# Bible Source Comparison Report

Generated: 2026-06-12T02:30:51.273Z

## Sources

- **Source A (Alpha):** Supabase `bible_verses` table (canonical book names after typo merge)
- **Source B (Katameros):** `katameros-data/katameros-preparation/data/books/*.json`

> Structure-only comparison (book → chapter → verse). Text wording not compared.

## Summary

| Metric | Count |
| --- | ---: |
| Total books (Alpha) | 73 |
| Total books (Katameros) | 69 |
| Missing books (either source) | 4 |
| Missing chapters | 55 |
| Missing verses (in Alpha) | 717 |
| Extra verses (in Alpha only) | 426 |
| Empty verses (Alpha) | 0 |
| Empty verses (Katameros) | 0 |
| Total issue rows | 143 |

### Recommended source

**Alpha Bible (Supabase)** as the primary app source — it includes deuterocanonical books missing from Katameros JSON files (Tobit, Judith, 1–2 Maccabees). Use **Katameros JSON** only for Katameros `bookId` reference resolution, with a parser that handles single-block chapters and Orthodox chapter splits (Esther, Daniel, Psalms 151).

## Issue table

| Book # | Book name (Alpha) | Book name (Katameros) | Chapter | Issue type | Alpha count | Katameros count | Details |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- |
| 67 | سفر طوبيا | — | — | missing_book_katameros | 14 ch / 297 v | 0 | Expected Katameros book 67.json is absent; Alpha has سفر طوبيا |
| 69 | سفر يهوديت | — | — | missing_book_katameros | 16 ch / 346 v | 0 | Expected Katameros book 69.json is absent; Alpha has سفر يهوديت |
| 70 | سفر المكابيين الأول | — | — | missing_book_katameros | 16 ch / 929 v | 0 | Expected Katameros book 70.json is absent; Alpha has سفر المكابيين الأول |
| 71 | سفر المكابيين الثاني | — | — | missing_book_katameros | 15 ch / 558 v | 0 | Expected Katameros book 71.json is absent; Alpha has سفر المكابيين الثاني |
| 1 | سفر التكوين | التكوين | 27 | extra_verse_alpha | 46 | 45 | Verses in Alpha but not Katameros: 46 |
| 2 | سفر الخروج | لخروج | — | book_name_mismatch | سفر الخروج | لخروج | Display names differ (ID mapping still applied) |
| 12 | سفر الملوك الثاني | لملوك الثاني | — | book_name_mismatch | سفر الملوك الثاني | لملوك الثاني | Display names differ (ID mapping still applied) |
| 14 | سفر أخبار الأيام الثاني | أخبار الأيام الثاني | 31 | extra_verse_alpha | 21 | 1 | Verses in Alpha but not Katameros: 2, 3, 4, 5, 6, 7… (+14 more) |
| 16 | سفر نحميا | نحميا | 7 | extra_verse_alpha | 74 | 73 | Verses in Alpha but not Katameros: 74 |
| 17 | سفر أستير | أستير | — | chapter_count_mismatch | 16 | 10 | Alpha chapters: 16, Katameros chapters: 10, declared numChapters: 10 |
| 17 | سفر أستير | أستير | 10 | extra_verse_alpha | 10 | 3 | Verses in Alpha but not Katameros: 4, 5, 6, 7, 8, 9, 10 |
| 17 | سفر أستير | أستير | 11 | missing_chapter_katameros | 12 | 0 | Chapter 11 in Alpha only (12 verses) |
| 17 | سفر أستير | أستير | 12 | missing_chapter_katameros | 6 | 0 | Chapter 12 in Alpha only (6 verses) |
| 17 | سفر أستير | أستير | 13 | missing_chapter_katameros | 18 | 0 | Chapter 13 in Alpha only (18 verses) |
| 17 | سفر أستير | أستير | 14 | missing_chapter_katameros | 19 | 0 | Chapter 14 in Alpha only (19 verses) |
| 17 | سفر أستير | أستير | 15 | missing_chapter_katameros | 19 | 0 | Chapter 15 in Alpha only (19 verses) |
| 17 | سفر أستير | أستير | 16 | missing_chapter_katameros | 24 | 0 | Chapter 16 in Alpha only (24 verses) |
| 18 | سفر أيوب | أيوب | 31 | extra_verse_alpha | 40 | 1 | Verses in Alpha but not Katameros: 2, 3, 4, 5, 6, 7… (+33 more) |
| 19 | سفر المزامير | المزامير | — | chapter_count_mismatch | 151 | 150 | Alpha chapters: 151, Katameros chapters: 150, declared numChapters: 150 |
| 19 | سفر المزامير | المزامير | 31 | extra_verse_alpha | 24 | 1 | Verses in Alpha but not Katameros: 2, 3, 4, 5, 6, 7… (+17 more) |
| 19 | سفر المزامير | المزامير | 72 | missing_verse_alpha | 19 | 20 | Verses in Katameros but not Alpha: 20 |
| 19 | سفر المزامير | المزامير | 150 | missing_verse_alpha | 5 | 6 | Verses in Katameros but not Alpha: 6 |
| 19 | سفر المزامير | المزامير | 151 | missing_chapter_katameros | 8 | 0 | Chapter 151 in Alpha only (8 verses) |
| 20 | سفر الأمثال | الأمثال | 31 | extra_verse_alpha | 31 | 1 | Verses in Alpha but not Katameros: 2, 3, 4, 5, 6, 7… (+24 more) |
| 23 | سفر إشعياء | أشعياء | 31 | extra_verse_alpha | 9 | 1 | Verses in Alpha but not Katameros: 2, 3, 4, 5, 6, 7, 8, 9 |
| 24 | سفر إرميا | أرمياء | — | book_name_mismatch | سفر إرميا | أرمياء | Display names differ (ID mapping still applied) |
| 25 | مراثي إرميا | مراثي أرمياء | — | book_name_mismatch | مراثي إرميا | مراثي أرمياء | Display names differ (ID mapping still applied) |
| 27 | سفر دانيال | دانيال | — | chapter_count_mismatch | 14 | 12 | Alpha chapters: 14, Katameros chapters: 12, declared numChapters: 12 |
| 27 | سفر دانيال | دانيال | 3 | extra_verse_alpha | 100 | 30 | Verses in Alpha but not Katameros: 31, 32, 33, 34, 35, 36… (+64 more) |
| 27 | سفر دانيال | دانيال | 13 | missing_chapter_katameros | 65 | 0 | Chapter 13 in Alpha only (65 verses) |
| 27 | سفر دانيال | دانيال | 14 | missing_chapter_katameros | 42 | 0 | Chapter 14 in Alpha only (42 verses) |
| 40 | إنجيل متى | متى | 17 | missing_verse_alpha | 25 | 27 | Verses in Katameros but not Alpha: 26, 27 |
| 45 | رسالة بولس الرسول إلى أهل رومية | رومية | — | book_name_mismatch | رسالة بولس الرسول إلى أهل رومية | رومية | Display names differ (ID mapping still applied) |
| 46 | رسالة بولس الرسول الأولى إلى أهل كورنثوس | كورنثوس | — | book_name_mismatch | رسالة بولس الرسول الأولى إلى أهل كورنثوس | كورنثوس | Display names differ (ID mapping still applied) |
| 47 | رسالة بولس الرسول الثانية إلى أهل كورنثوس | كورنثوس | — | book_name_mismatch | رسالة بولس الرسول الثانية إلى أهل كورنثوس | كورنثوس | Display names differ (ID mapping still applied) |
| 48 | رسالة بولس الرسول إلى أهل غلاطية | كورنثوس | — | book_name_mismatch | رسالة بولس الرسول إلى أهل غلاطية | كورنثوس | Display names differ (ID mapping still applied) |
| 49 | رسالة بولس الرسول إلى أهل أفسس | أفسس | — | book_name_mismatch | رسالة بولس الرسول إلى أهل أفسس | أفسس | Display names differ (ID mapping still applied) |
| 50 | رسالة بولس الرسول إلى أهل فيلبي | فيليبي | — | book_name_mismatch | رسالة بولس الرسول إلى أهل فيلبي | فيليبي | Display names differ (ID mapping still applied) |
| 51 | رسالة بولس الرسول إلى أهل كولوسي | كولوسي | — | book_name_mismatch | رسالة بولس الرسول إلى أهل كولوسي | كولوسي | Display names differ (ID mapping still applied) |
| 52 | رسالة بولس الرسول الأولى إلى أهل تسالونيكي | تسالونيكي | — | book_name_mismatch | رسالة بولس الرسول الأولى إلى أهل تسالونيكي | تسالونيكي | Display names differ (ID mapping still applied) |
| 53 | رسالة بولس الرسول الثانية إلى أهل تسالونيكي | تسالونيكي | — | book_name_mismatch | رسالة بولس الرسول الثانية إلى أهل تسالونيكي | تسالونيكي | Display names differ (ID mapping still applied) |
| 54 | رسالة بولس الرسول الأولى إلى تيموثاوس | تيموثاوس | — | book_name_mismatch | رسالة بولس الرسول الأولى إلى تيموثاوس | تيموثاوس | Display names differ (ID mapping still applied) |
| 54 | رسالة بولس الرسول الأولى إلى تيموثاوس | تيموثاوس | 6 | extra_verse_alpha | 22 | 21 | Verses in Alpha but not Katameros: 22 |
| 55 | رسالة بولس الرسول الثانية إلى تيموثاوس | تيموثاوس | — | book_name_mismatch | رسالة بولس الرسول الثانية إلى تيموثاوس | تيموثاوس | Display names differ (ID mapping still applied) |
| 56 | رسالة بولس الرسول إلى تيطس | تيطس | — | book_name_mismatch | رسالة بولس الرسول إلى تيطس | تيطس | Display names differ (ID mapping still applied) |
| 57 | رسالة بولس الرسول إلى فليمون | فيليمون | — | book_name_mismatch | رسالة بولس الرسول إلى فليمون | فيليمون | Display names differ (ID mapping still applied) |
| 58 | رسالة بولس الرسول إلى العبرانيين | العبرانيين | — | book_name_mismatch | رسالة بولس الرسول إلى العبرانيين | العبرانيين | Display names differ (ID mapping still applied) |
| 60 | رسالة بطرس الرسول الأولى | بطرس | — | book_name_mismatch | رسالة بطرس الرسول الأولى | بطرس | Display names differ (ID mapping still applied) |
| 61 | رسالة بطرس الرسول الثانية | بطرس | — | book_name_mismatch | رسالة بطرس الرسول الثانية | بطرس | Display names differ (ID mapping still applied) |
| 62 | رسالة يوحنا الرسول الأولى | يوحنا | — | book_name_mismatch | رسالة يوحنا الرسول الأولى | يوحنا | Display names differ (ID mapping still applied) |
| 63 | رسالة يوحنا الرسول الثانية | يوحنا | — | book_name_mismatch | رسالة يوحنا الرسول الثانية | يوحنا | Display names differ (ID mapping still applied) |
| 64 | رسالة يوحنا الرسول الثالثة | يوحنا | — | book_name_mismatch | رسالة يوحنا الرسول الثالثة | يوحنا | Display names differ (ID mapping still applied) |
| 64 | رسالة يوحنا الرسول الثالثة | يوحنا | 1 | extra_verse_alpha | 15 | 14 | Verses in Alpha but not Katameros: 15 |
| 66 | رؤيا يوحنا اللاهوتي | رؤيا | — | book_name_mismatch | رؤيا يوحنا اللاهوتي | رؤيا | Display names differ (ID mapping still applied) |
| 68 | سفر باروخ | سفر باروخ | — | chapter_count_mismatch | 6 | 16 | Alpha chapters: 6, Katameros chapters: 16, declared numChapters: 16 |
| 68 | سفر باروخ | سفر باروخ | 1 | extra_verse_alpha | 22 | 12 | Verses in Alpha but not Katameros: 13, 14, 15, 16, 17, 18… (+4 more) |
| 68 | سفر باروخ | سفر باروخ | 2 | extra_verse_alpha | 35 | 18 | Verses in Alpha but not Katameros: 19, 20, 21, 22, 23, 24… (+11 more) |
| 68 | سفر باروخ | سفر باروخ | 3 | extra_verse_alpha | 38 | 15 | Verses in Alpha but not Katameros: 16, 17, 18, 19, 20, 21… (+17 more) |
| 68 | سفر باروخ | سفر باروخ | 4 | extra_verse_alpha | 37 | 17 | Verses in Alpha but not Katameros: 18, 19, 20, 21, 22, 23… (+14 more) |
| 68 | سفر باروخ | سفر باروخ | 5 | missing_verse_alpha | 5 | 29 | Verses in Katameros but not Alpha: 6, 7, 8, 9, 10, 11… (+18 more) |
| 68 | سفر باروخ | سفر باروخ | 6 | extra_verse_alpha | 72 | 21 | Verses in Alpha but not Katameros: 22, 23, 24, 25, 26, 27… (+45 more) |
| 68 | سفر باروخ | سفر باروخ | 7 | missing_chapter_alpha | 0 | 25 | Chapter 7 in Katameros only (25 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 8 | missing_chapter_alpha | 0 | 34 | Chapter 8 in Katameros only (34 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 9 | missing_chapter_alpha | 0 | 19 | Chapter 9 in Katameros only (19 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 10 | missing_chapter_alpha | 0 | 20 | Chapter 10 in Katameros only (20 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 11 | missing_chapter_alpha | 0 | 21 | Chapter 11 in Katameros only (21 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 12 | missing_chapter_alpha | 0 | 20 | Chapter 12 in Katameros only (20 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 13 | missing_chapter_alpha | 0 | 31 | Chapter 13 in Katameros only (31 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 14 | missing_chapter_alpha | 0 | 18 | Chapter 14 in Katameros only (18 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 15 | missing_chapter_alpha | 0 | 15 | Chapter 15 in Katameros only (15 verse keys) |
| 68 | سفر باروخ | سفر باروخ | 16 | missing_chapter_alpha | 0 | 31 | Chapter 16 in Katameros only (31 verse keys) |
| 72 | سفر الحكمة | سفر الحكمة | — | chapter_count_mismatch | 19 | 16 | Alpha chapters: 19, Katameros chapters: 16, declared numChapters: 16 |
| 72 | سفر الحكمة | سفر الحكمة | 1 | missing_verse_alpha | 16 | 67 | Verses in Katameros but not Alpha: 17, 18, 19, 20, 21, 22… (+45 more) |
| 72 | سفر الحكمة | سفر الحكمة | 2 | missing_verse_alpha | 25 | 70 | Verses in Katameros but not Alpha: 26, 27, 28, 29, 30, 31… (+39 more) |
| 72 | سفر الحكمة | سفر الحكمة | 3 | missing_verse_alpha | 19 | 60 | Verses in Katameros but not Alpha: 20, 21, 22, 23, 24, 25… (+35 more) |
| 72 | سفر الحكمة | سفر الحكمة | 4 | missing_verse_alpha | 20 | 61 | Verses in Katameros but not Alpha: 21, 22, 23, 24, 25, 26… (+35 more) |
| 72 | سفر الحكمة | سفر الحكمة | 5 | missing_verse_alpha | 24 | 68 | Verses in Katameros but not Alpha: 25, 26, 27, 28, 29, 30… (+38 more) |
| 72 | سفر الحكمة | سفر الحكمة | 6 | missing_verse_alpha | 27 | 63 | Verses in Katameros but not Alpha: 28, 29, 30, 31, 32, 33… (+30 more) |
| 72 | سفر الحكمة | سفر الحكمة | 7 | missing_verse_alpha | 30 | 50 | Verses in Katameros but not Alpha: 31, 32, 33, 34, 35, 36… (+14 more) |
| 72 | سفر الحكمة | سفر الحكمة | 8 | missing_verse_alpha | 21 | 32 | Verses in Katameros but not Alpha: 22, 23, 24, 25, 26, 27… (+5 more) |
| 72 | سفر الحكمة | سفر الحكمة | 9 | missing_verse_alpha | 19 | 73 | Verses in Katameros but not Alpha: 20, 21, 22, 23, 24, 25… (+48 more) |
| 72 | سفر الحكمة | سفر الحكمة | 10 | missing_verse_alpha | 21 | 89 | Verses in Katameros but not Alpha: 22, 23, 24, 25, 26, 27… (+62 more) |
| 72 | سفر الحكمة | سفر الحكمة | 11 | missing_verse_alpha | 27 | 74 | Verses in Katameros but not Alpha: 28, 29, 30, 31, 32, 33… (+41 more) |
| 72 | سفر الحكمة | سفر الحكمة | 12 | missing_verse_alpha | 27 | 54 | Verses in Katameros but not Alpha: 28, 29, 30, 31, 32, 33… (+21 more) |
| 72 | سفر الحكمة | سفر الحكمة | 13 | missing_verse_alpha | 19 | 54 | Verses in Katameros but not Alpha: 20, 21, 22, 23, 24, 25… (+29 more) |
| 72 | سفر الحكمة | سفر الحكمة | 14 | missing_verse_alpha | 31 | 49 | Verses in Katameros but not Alpha: 32, 33, 34, 35, 36, 37… (+12 more) |
| 72 | سفر الحكمة | سفر الحكمة | 15 | missing_verse_alpha | 19 | 41 | Verses in Katameros but not Alpha: 20, 21, 22, 23, 24, 25… (+16 more) |
| 72 | سفر الحكمة | سفر الحكمة | 16 | extra_verse_alpha | 29 | 24 | Verses in Alpha but not Katameros: 25, 26, 27, 28, 29 |
| 72 | سفر الحكمة | سفر الحكمة | 17 | missing_chapter_katameros | 20 | 0 | Chapter 17 in Alpha only (20 verses) |
| 72 | سفر الحكمة | سفر الحكمة | 18 | missing_chapter_katameros | 25 | 0 | Chapter 18 in Alpha only (25 verses) |
| 72 | سفر الحكمة | سفر الحكمة | 19 | missing_chapter_katameros | 20 | 0 | Chapter 19 in Alpha only (20 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | — | chapter_count_mismatch | 51 | 18 | Alpha chapters: 51, Katameros chapters: 18, declared numChapters: 15 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 1 | extra_verse_alpha | 40 | 36 | Verses in Alpha but not Katameros: 37, 38, 39, 40 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 2 | missing_verse_alpha | 23 | 33 | Verses in Katameros but not Alpha: 24, 25, 26, 27, 28, 29… (+4 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 3 | missing_verse_alpha | 34 | 40 | Verses in Katameros but not Alpha: 35, 36, 37, 38, 39, 40 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 4 | missing_verse_alpha | 36 | 50 | Verses in Katameros but not Alpha: 37, 38, 39, 40, 41, 42… (+8 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 5 | missing_verse_alpha | 18 | 27 | Verses in Katameros but not Alpha: 19, 20, 21, 22, 23, 24… (+3 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 6 | extra_verse_alpha | 37 | 31 | Verses in Alpha but not Katameros: 32, 33, 34, 35, 36, 37 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 7 | missing_verse_alpha | 40 | 42 | Verses in Katameros but not Alpha: 41, 42 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 8 | missing_verse_alpha | 22 | 36 | Verses in Katameros but not Alpha: 23, 24, 25, 26, 27, 28… (+8 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 9 | missing_verse_alpha | 25 | 29 | Verses in Katameros but not Alpha: 26, 27, 28, 29 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 10 | missing_verse_alpha | 34 | 38 | Verses in Katameros but not Alpha: 35, 36, 37, 38 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 11 | missing_verse_alpha | 36 | 38 | Verses in Katameros but not Alpha: 37, 38 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 12 | missing_verse_alpha | 19 | 46 | Verses in Katameros but not Alpha: 20, 21, 22, 23, 24, 25… (+21 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 13 | extra_verse_alpha | 32 | 26 | Verses in Alpha but not Katameros: 27, 28, 29, 30, 31, 32 |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 14 | missing_verse_alpha | 27 | 46 | Verses in Katameros but not Alpha: 28, 29, 30, 31, 32, 33… (+13 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 15 | missing_verse_alpha | 22 | 40 | Verses in Katameros but not Alpha: 23, 24, 25, 26, 27, 28… (+12 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 16 | missing_chapter_katameros | 31 | 0 | Chapter 16 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 17 | missing_chapter_katameros | 31 | 0 | Chapter 17 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 18 | missing_chapter_katameros | 33 | 0 | Chapter 18 in Alpha only (33 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 19 | missing_chapter_katameros | 28 | 0 | Chapter 19 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 20 | missing_chapter_katameros | 33 | 0 | Chapter 20 in Alpha only (33 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 21 | missing_chapter_katameros | 31 | 0 | Chapter 21 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 22 | extra_verse_alpha | 33 | 12 | Verses in Alpha but not Katameros: 1, 2, 3, 4, 5, 6… (+15 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 23 | extra_verse_alpha | 38 | 8 | Verses in Alpha but not Katameros: 1, 2, 3, 4, 5, 6… (+24 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 24 | extra_verse_alpha | 47 | 15 | Verses in Alpha but not Katameros: 16, 17, 18, 19, 20, 21… (+26 more) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 25 | missing_chapter_katameros | 36 | 0 | Chapter 25 in Alpha only (36 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 26 | missing_chapter_katameros | 28 | 0 | Chapter 26 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 27 | missing_chapter_katameros | 33 | 0 | Chapter 27 in Alpha only (33 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 28 | missing_chapter_katameros | 30 | 0 | Chapter 28 in Alpha only (30 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 29 | missing_chapter_katameros | 33 | 0 | Chapter 29 in Alpha only (33 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 30 | missing_chapter_katameros | 27 | 0 | Chapter 30 in Alpha only (27 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 31 | missing_chapter_katameros | 42 | 0 | Chapter 31 in Alpha only (42 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 32 | missing_chapter_katameros | 28 | 0 | Chapter 32 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 33 | missing_chapter_katameros | 33 | 0 | Chapter 33 in Alpha only (33 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 34 | missing_chapter_katameros | 31 | 0 | Chapter 34 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 35 | missing_chapter_katameros | 26 | 0 | Chapter 35 in Alpha only (26 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 36 | missing_chapter_katameros | 28 | 0 | Chapter 36 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 37 | missing_chapter_katameros | 34 | 0 | Chapter 37 in Alpha only (34 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 38 | missing_chapter_katameros | 39 | 0 | Chapter 38 in Alpha only (39 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 39 | missing_chapter_katameros | 41 | 0 | Chapter 39 in Alpha only (41 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 40 | missing_chapter_katameros | 32 | 0 | Chapter 40 in Alpha only (32 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 41 | missing_chapter_katameros | 28 | 0 | Chapter 41 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 42 | missing_chapter_katameros | 26 | 0 | Chapter 42 in Alpha only (26 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 43 | missing_chapter_katameros | 37 | 0 | Chapter 43 in Alpha only (37 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 44 | missing_chapter_katameros | 27 | 0 | Chapter 44 in Alpha only (27 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 45 | missing_chapter_katameros | 31 | 0 | Chapter 45 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 46 | missing_chapter_katameros | 23 | 0 | Chapter 46 in Alpha only (23 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 47 | missing_chapter_katameros | 31 | 0 | Chapter 47 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 48 | missing_chapter_katameros | 28 | 0 | Chapter 48 in Alpha only (28 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 49 | missing_chapter_katameros | 19 | 0 | Chapter 49 in Alpha only (19 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 50 | missing_chapter_katameros | 31 | 0 | Chapter 50 in Alpha only (31 verses) |
| 73 | سفر يشوع بن سيراخ | سفر يشوع بن سيراخ | 51 | missing_chapter_katameros | 38 | 0 | Chapter 51 in Alpha only (38 verses) |
