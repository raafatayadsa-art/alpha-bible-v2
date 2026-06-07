/**
 * useAgpeyaSections
 *
 * Loads Agpeya reader content from Supabase.
 *
 * Flow:
 *  1. Route/local id → agpeya_prayers.prayer_key
 *  2. SELECT id FROM agpeya_prayers WHERE prayer_key = ?
 *  3. SELECT * FROM agpeya_sections WHERE prayer_id = UUID ORDER BY display_order ASC
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchExtraPrayerSections, isExtraPrayerRoute } from "./extra-sections";

export interface AgpeyaSupabaseSection {
  id: number;
  prayer_id: string;
  title_ar: string;
  content_ar: string;
  display_order: number;
}

export type AgpeyaSectionsFetchState =
  | { status: "loading" }
  | { status: "success"; sections: AgpeyaSupabaseSection[] }
  | { status: "error"; message: string }
  | { status: "empty" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Legacy route ids in data.ts → agpeya_prayers.prayer_key */
const LOCAL_ID_TO_PRAYER_KEY: Record<string, string> = {
  baker: "matins",
  third: "third_hour",
  sixth: "sixth_hour",
  ninth: "ninth_hour",
  vespers: "vespers",
  compline: "compline",
  veil: "veil",
  "midnight-1": "midnight",
  "midnight-2": "midnight",
  "midnight-3": "midnight",
};

function toPrayerKey(routeOrKey: string): string {
  return LOCAL_ID_TO_PRAYER_KEY[routeOrKey] ?? routeOrKey;
}

export async function fetchAgpeyaSections(routeOrKey: string): Promise<{
  currentPrayerKey: string;
  resolvedUUID: string | null;
  sections: AgpeyaSupabaseSection[];
  error: string | null;
}> {
  if (isExtraPrayerRoute(routeOrKey)) {
    return fetchExtraPrayerSections(routeOrKey);
  }

  const currentPrayerKey = toPrayerKey(routeOrKey);

  if (UUID_RE.test(routeOrKey)) {
    const { data, error } = await supabase
      .from("agpeya_sections")
      .select("id, prayer_id, title_ar, content_ar, display_order")
      .eq("prayer_id", routeOrKey)
      .order("display_order", { ascending: true });

    if (error) {
      return { currentPrayerKey, resolvedUUID: routeOrKey, sections: [], error: error.message };
    }

    return {
      currentPrayerKey,
      resolvedUUID: routeOrKey,
      sections: (data ?? []) as AgpeyaSupabaseSection[],
      error: null,
    };
  }

  const { data: prayerRow, error: prayerError } = await supabase
    .from("agpeya_prayers")
    .select("id")
    .eq("prayer_key", currentPrayerKey)
    .maybeSingle();

  if (prayerError) {
    return { currentPrayerKey, resolvedUUID: null, sections: [], error: prayerError.message };
  }

  const resolvedUUID = prayerRow?.id ?? null;
  if (!resolvedUUID) {
    return { currentPrayerKey, resolvedUUID: null, sections: [], error: null };
  }

  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .eq("prayer_id", resolvedUUID)
    .order("display_order", { ascending: true });

  if (error) {
    return { currentPrayerKey, resolvedUUID, sections: [], error: error.message };
  }

  return {
    currentPrayerKey,
    resolvedUUID,
    sections: (data ?? []) as AgpeyaSupabaseSection[],
    error: null,
  };
}

export function useAgpeyaSections(routeOrKey: string): AgpeyaSectionsFetchState {
  const [state, setState] = useState<AgpeyaSectionsFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchAgpeyaSections(routeOrKey)
      .then(({ currentPrayerKey, resolvedUUID, sections, error }) => {
        if (cancelled) return;

        // eslint-disable-next-line no-console
        console.log("[agpeya] currentPrayerKey:", currentPrayerKey);
        // eslint-disable-next-line no-console
        console.log("[agpeya] resolvedUUID:", resolvedUUID);
        // eslint-disable-next-line no-console
        console.log("[agpeya] loadedSectionsCount:", sections.length);

        if (error) {
          setState({ status: "error", message: error });
          return;
        }

        if (sections.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "success", sections });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        // eslint-disable-next-line no-console
        console.log("[agpeya] loadedSectionsCount:", 0);
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [routeOrKey]);

  return state;
}
