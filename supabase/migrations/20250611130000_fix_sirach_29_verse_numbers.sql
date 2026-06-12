-- Fix Sirach (يشوع بن سيراخ) chapter 29 verse numbering.
-- Verses 16–17 exist in DB as 18–19; verses 18–33 were stored as 20–35.
-- Van Dyck chapter has 33 verses total (not 35).
-- Safe two-step renumber to avoid unique-key collisions on (book_name, chapter_number, verse_number).

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

-- Verify (should return 33 rows, min=1, max=33):
-- SELECT MIN(verse_number), MAX(verse_number), COUNT(*)
-- FROM bible_verses
-- WHERE book_name = 'سفر يشوع بن سيراخ' AND chapter_number = 29;
