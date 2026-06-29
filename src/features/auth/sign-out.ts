import { supabase } from "@/integrations/supabase/client";
import { refreshAuthContext } from "./auth-context";
import { handleAuthUserTransition } from "./user-data-isolation";

/** End the current Supabase session on this device. */
export async function signOutCurrentDevice(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  handleAuthUserTransition(null);
  await refreshAuthContext();
}

/** Revoke all active sessions for this account (global sign-out). */
export async function signOutAllDevices(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) throw error;
  handleAuthUserTransition(null);
  await refreshAuthContext();
}
