-- Step 1–2: Bible data fixes (run once in Supabase SQL Editor)
-- 1) Merge 5 misspelled book_name duplicates
-- 2) Renumber Sirach (يشوع بن سيراخ) chapter 29 verses 18–35 → 16–33

-- ── Book name typos ─────────────────────────────────────────────
UPDATE bible_verses
SET book_name = 'رسالة بولس الرسول إلى تيطس'
WHERE book_name = 'رسالة بول الرسول إلى تيطس';

UPDATE bible_verses
SET book_name = 'رسالة بولس الرسول الثانية إلى أهل تسالونيكي'
WHERE book_name = 'رسالة بولس الرسول الثانية إلى أهل تسالونيك';

UPDATE bible_verses
SET book_name = 'سفر أخبار الأيام الثاني'
WHERE book_name = 'سفر أخبار لأيام الثاني';

UPDATE bible_verses
SET book_name = 'سفر المزامير'
WHERE book_name = 'سفر المزاير';

UPDATE bible_verses
SET book_name = 'سفر يهوديت'
WHERE book_name = 'سفر يوديت';

-- ── Sirach 29 verse numbering ───────────────────────────────────
UPDATE bible_verses
SET verse_number = verse_number + 1000
WHERE book_name = 'سفر يشوع بن سيراخ'
  AND chapter_number = 29
  AND verse_number >= 18;

UPDATE bible_verses
SET verse_number = verse_number - 1002
WHERE book_name = 'سفر يشوع بن سيراخ'
  AND chapter_number = 29
  AND verse_number >= 1000;

-- ── Verify ──────────────────────────────────────────────────────
-- SELECT book_name, COUNT(*) FROM bible_verses
-- WHERE book_name IN (
--   'رسالة بول الرسول إلى تيطس','سفر المزاير','سفر يوديت',
--   'سفر أخبار لأيام الثاني','رسالة بولس الرسول الثانية إلى أهل تسالونيك'
-- ) GROUP BY book_name;
-- Expected: 0 rows

-- SELECT MIN(verse_number), MAX(verse_number), COUNT(*)
-- FROM bible_verses
-- WHERE book_name = 'سفر يشوع بن سيراخ' AND chapter_number = 29;
-- Expected: min=1, max=33, count=33
