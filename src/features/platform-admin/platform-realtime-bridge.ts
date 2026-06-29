import { supabase } from "@/integrations/supabase/client";
import { syncPlatformModulesFromServer } from "@/lib/platform-modules";
import { syncPlatformControlAll } from "./platform-control-sync";

let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

/** Live bridge: Supabase changes → pull latest settings → broadcast to all app clients. */
export function startPlatformRealtimeBridge(): () => void {
  if (started || typeof window === "undefined") return () => {};

  started = true;

  channel = supabase
    .channel("platform-settings-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "platform_modules" },
      () => void handleRemotePlatformChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "platform_emergency" },
      () => void handleRemotePlatformChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "platform_settings" },
      () => void handleRemotePlatformChange(),
    )
    .subscribe();

  return () => {
    started = false;
    void channel?.unsubscribe();
    channel = null;
  };
}

async function handleRemotePlatformChange() {
  try {
    await syncPlatformControlAll();
  } catch {
    await syncPlatformModulesFromServer();
  }
}
