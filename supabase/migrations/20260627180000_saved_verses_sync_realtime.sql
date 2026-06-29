-- DOMAIN-09 User Progress: saved_verses cross-device sync + realtime (ALPHA-121)

CREATE UNIQUE INDEX IF NOT EXISTS saved_verses_user_ref_uniq
  ON public.saved_verses (user_id, book_name, chapter_number, verse_number);

DROP POLICY IF EXISTS "Users can update own saved verses" ON public.saved_verses;
CREATE POLICY "Users can update own saved verses"
  ON public.saved_verses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.saved_verses REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'saved_verses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_verses;
  END IF;
END $$;

COMMENT ON TABLE public.saved_verses IS 'DOMAIN-09 User Progress: saved verses (synced web + mobile via book_name/chapter/verse from bible_verses)';
