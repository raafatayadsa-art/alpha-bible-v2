-- ALPHA-122 reference migration (schema already applied on production Supabase)
-- DO NOT re-apply if objects exist. Documents backend contract for the frontend integration.

-- Backfill legacy auth users missing user_profiles rows (safe to re-run):
-- INSERT INTO public.user_profiles (user_id)
-- SELECT u.id FROM auth.users u
-- WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id)
-- ON CONFLICT (user_id) DO NOTHING;

-- RPCs consumed by the app:
--   public.is_profile_completed() -> boolean
--   public.is_username_available(username_to_check text) -> boolean
--   public.claim_username(new_username text, new_display_name text) -> void
