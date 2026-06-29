-- DOMAIN-09 User Progress: cross-device payload sync + realtime (ALPHA-121)

ALTER TABLE public.users_progress
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.users_progress
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS users_progress_user_id_uniq
  ON public.users_progress (user_id);

ALTER TABLE public.users_progress REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'users_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users_progress;
  END IF;
END $$;

COMMENT ON COLUMN public.users_progress.payload IS 'DOMAIN-09: merged local app state (reading, highlights, journal, journey) for web+mobile sync';
