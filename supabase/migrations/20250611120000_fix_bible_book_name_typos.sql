-- Fix misspelled bible_verses.book_name values (duplicate orphan books).
-- Safe to run multiple times: only rows with the wrong name are updated.

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
