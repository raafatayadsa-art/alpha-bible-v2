-- Daily verse pool for home hero card (آية اليوم)
-- Table may already exist on remote; safe to re-run locally.

CREATE TABLE IF NOT EXISTS public.daily_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  verse_text text,
  category text,
  is_active boolean DEFAULT true,
  display_count integer DEFAULT 0,
  last_displayed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_verses' AND policyname = 'daily_verses_read'
  ) THEN
    CREATE POLICY daily_verses_read ON public.daily_verses FOR SELECT USING (true);
  END IF;
END $$;

COMMENT ON TABLE public.daily_verses IS 'Curated verse references for the home آية اليوم hero card; text resolved from bible_verses when verse_text is null.';
