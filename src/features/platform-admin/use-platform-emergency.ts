/**
 * Read platform emergency flags from Supabase (with localStorage fallback via store).
 * Use in app shell to gate registration/messaging/community when flags are set.
 */
export { usePlatformStore as usePlatformEmergencyFlags } from "./platform-store";
