import { supabase } from "@/integrations/supabase/client";
import type { ChurchPostDetails } from "@/data/church-posts";

export type TripPostContext = {
  postId: string;
  title: string;
  churchId: number | null;
  organizerUserId: string | null;
};

const cache = new Map<string, TripPostContext>();

function parseChurchId(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function resolveTripPostContext(postId: string): Promise<TripPostContext | null> {
  if (!postId) return null;
  const cached = cache.get(postId);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("church_posts")
    .select("id, title, church_id, details")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) return null;

  const details = (data.details ?? null) as ChurchPostDetails | null;
  const ctx: TripPostContext = {
    postId: String(data.id),
    title: String(data.title ?? "رحلة"),
    churchId: parseChurchId(data.church_id as string | number),
    organizerUserId: details?.organizerUserId?.trim() || null,
  };
  cache.set(postId, ctx);
  return ctx;
}

export function clearTripPostContextCache(postId?: string) {
  if (postId) cache.delete(postId);
  else cache.clear();
}
