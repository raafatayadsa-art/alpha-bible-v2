import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subscribeAuthContext, waitForAuthUserId, getAuthUserSync } from "@/features/auth";
import {
  pushLocalSavedVersesToRemote,
  syncSavedVersesFromRemote,
} from "@/lib/saved-verses-sync";
import { flushUserProgressPush, pullUserProgressFromRemote, runFullUserProgressSync } from "@/lib/user-progress-sync";

let started = false;
let savedVersesChannel: ReturnType<typeof supabase.channel> | null = null;
let progressChannel: ReturnType<typeof supabase.channel> | null = null;

async function bootstrapAlphaUserSync() {
  if (started || typeof window === "undefined") return;

  const uid = await waitForAuthUserId(12000);
  if (!uid) return;

  started = true;

  await syncSavedVersesFromRemote(true);
  await runFullUserProgressSync();
  await pushLocalSavedVersesToRemote();

  savedVersesChannel = supabase
    .channel(`saved-verses-sync-${uid}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "saved_verses",
        filter: `user_id=eq.${uid}`,
      },
      () => {
        void syncSavedVersesFromRemote(true);
      },
    )
    .subscribe();

  progressChannel = supabase
    .channel(`user-progress-sync-${uid}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users_progress",
        filter: `user_id=eq.${uid}`,
      },
      () => {
        void pullUserProgressFromRemote();
      },
    )
    .subscribe();

  const flushOnHide = () => {
    if (document.visibilityState === "hidden") {
      void flushUserProgressPush();
    }
  };
  document.addEventListener("visibilitychange", flushOnHide);
  window.addEventListener("pagehide", () => {
    void flushUserProgressPush();
  });
}

export function teardownAlphaUserSync() {
  if (savedVersesChannel) {
    void supabase.removeChannel(savedVersesChannel);
    savedVersesChannel = null;
  }
  if (progressChannel) {
    void supabase.removeChannel(progressChannel);
    progressChannel = null;
  }
  started = false;
}

/** Mount once in root — full cross-device sync after auth is ready. */
export function AlphaUserSyncBootstrap() {
  useEffect(() => {
    const startIfAuthed = () => {
      if (getAuthUserSync()?.id) {
        void bootstrapAlphaUserSync();
      } else {
        teardownAlphaUserSync();
      }
    };

    startIfAuthed();

    const offAuth = subscribeAuthContext(() => {
      teardownAlphaUserSync();
      startIfAuthed();
    });

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      teardownAlphaUserSync();
      window.setTimeout(startIfAuthed, 300);
    });

    return () => {
      offAuth();
      sub.subscription.unsubscribe();
      teardownAlphaUserSync();
    };
  }, []);

  return null;
}

/** @deprecated use AlphaUserSyncBootstrap */
export const SavedVersesBootstrap = AlphaUserSyncBootstrap;
