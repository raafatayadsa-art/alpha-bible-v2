import { supabase } from "@/integrations/supabase/client";
import type { PublisherContentItem, PublisherContentKind, PublisherRecord, PublisherType } from "./types";
import { mapContentFromRow, mapPublisherFromRow, type PublisherContentRow, type PublisherRow } from "./publisher-api-internals";

export const AUDIO_PUBLISHER_TYPES: PublisherType[] = ["hymn_team", "choir", "church_service"];
export const LIBRARY_PUBLISHER_TYPES: PublisherType[] = ["publishing_house", "monastery", "institution"];

export type DiscoveryContentItem = PublisherContentItem & {
  publisherName: string;
  publisherLogoUrl: string | null;
  publisherType: PublisherType;
};

const PUBLISHER_SELECT =
  "id, publisher_type, name, english_name, bio, logo_url, cover_url, phone, email, website_url, facebook_url, youtube_url, status, is_trusted, is_public, owner_user_id, church_id, monastery_id, follower_count, content_count, likes_count, readiness_score, submitted_for_review_at, published_at, created_at, updated_at";

export type AudioPublisherCardModel = PublisherRecord;

const AUDIO_LISTEN_KINDS: PublisherContentKind[] = ["hymn", "album", "playlist", "lecture"];

const AUDIO_PUBLISH_KINDS = AUDIO_LISTEN_KINDS;

/** Publish audio-type publisher when they have approved public listen content (dev RLS allows authenticated update). */
export async function ensureAudioPublisherPublished(publisherId: string): Promise<boolean> {
  const { data: pub, error: pubErr } = await supabase
    .from("publishers")
    .select("publisher_type, status, is_public")
    .eq("id", publisherId)
    .maybeSingle();

  if (pubErr || !pub) {
    if (pubErr) console.warn("[ensureAudioPublisherPublished]", pubErr.message);
    return false;
  }

  if (!AUDIO_PUBLISHER_TYPES.includes(pub.publisher_type as PublisherType)) return false;
  if (pub.status === "published" && pub.is_public) return true;

  const { count, error: countErr } = await supabase
    .from("publisher_content_items")
    .select("id", { count: "exact", head: true })
    .eq("publisher_id", publisherId)
    .eq("status", "approved")
    .eq("visibility", "public")
    .in("content_kind", AUDIO_PUBLISH_KINDS);

  if (countErr || !count) return false;

  const now = new Date().toISOString();
  const { error: upErr } = await supabase
    .from("publishers")
    .update({
      status: "published",
      is_public: true,
      is_trusted: true,
      published_at: now,
      updated_at: now,
    })
    .eq("id", publisherId);

  if (upErr) {
    console.warn("[ensureAudioPublisherPublished]", upErr.message);
    return false;
  }
  return true;
}

/** Repair stuck audio publishers so /audio feed can populate. */
export async function repairAudioPublishersForFeed(): Promise<number> {
  const { data: candidates, error } = await supabase
    .from("publishers")
    .select("id, status, is_public")
    .in("publisher_type", AUDIO_PUBLISHER_TYPES)
    .or("status.neq.published,is_public.eq.false");

  if (error || !candidates?.length) return 0;

  let repaired = 0;
  for (const row of candidates) {
    const ok = await ensureAudioPublisherPublished(row.id);
    if (ok && (row.status !== "published" || !row.is_public)) repaired += 1;
  }
  return repaired;
}

async function fetchPublisherListenTotals(publisherIds: string[]): Promise<Map<string, number>> {
  if (!publisherIds.length) return new Map();

  const { data, error } = await supabase
    .from("publisher_content_items")
    .select("publisher_id, likes_count")
    .in("publisher_id", publisherIds)
    .eq("status", "approved")
    .eq("visibility", "public")
    .in("content_kind", AUDIO_LISTEN_KINDS);

  if (error) {
    console.warn("[fetchPublisherListenTotals]", error.message);
    return new Map();
  }

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const id = (row as { publisher_id: string; likes_count?: number }).publisher_id;
    const likes = (row as { likes_count?: number }).likes_count ?? 0;
    totals.set(id, (totals.get(id) ?? 0) + likes);
  }
  return totals;
}

export async function fetchAudioPublisherFeed(limit = 24): Promise<AudioPublisherCardModel[]> {
  const pubs = await fetchDiscoveryPublishers(AUDIO_PUBLISHER_TYPES, { limit });
  if (!pubs.length) return [];

  const listenTotals = await fetchPublisherListenTotals(pubs.map((p) => p.id));
  return pubs
    .map((p) => ({
      ...p,
      listenCount: listenTotals.get(p.id) ?? 0,
    }))
    .filter((p) => p.contentCount > 0 || (p.listenCount ?? 0) > 0);
}

const CONTENT_SELECT =
  "id, publisher_id, content_kind, title, description, cover_url, media_url, visibility, allow_download, likes_count, duration_seconds, status, sort_order, payload, created_at, updated_at";

export async function fetchDiscoveryPublishers(
  types: PublisherType[],
  opts?: { trustedOnly?: boolean; limit?: number },
): Promise<PublisherRecord[]> {
  let q = supabase
    .from("publishers")
    .select(PUBLISHER_SELECT)
    .eq("status", "published")
    .eq("is_public", true)
    .in("publisher_type", types)
    .order("is_trusted", { ascending: false })
    .order("follower_count", { ascending: false });

  if (opts?.trustedOnly) q = q.eq("is_trusted", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) {
    console.warn("[fetchDiscoveryPublishers]", error.message);
    return [];
  }
  return (data as PublisherRow[]).map(mapPublisherFromRow);
}

export async function fetchDiscoveryContent(
  kinds: PublisherContentKind[],
  limit = 12,
): Promise<DiscoveryContentItem[]> {
  const { data, error } = await supabase
    .from("publisher_content_items")
    .select(`${CONTENT_SELECT}, publishers!inner(name, logo_url, publisher_type, status, is_public)`)
    .eq("status", "approved")
    .eq("visibility", "public")
    .in("content_kind", kinds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[fetchDiscoveryContent]", error.message);
    return [];
  }

  return (data ?? []).flatMap((row) => {
    const nested = (row as { publishers?: { name: string; logo_url: string | null; publisher_type: PublisherType; status: string; is_public: boolean } | null }).publishers;
    if (!nested || nested.status !== "published" || !nested.is_public) return [];
    const item = mapContentFromRow(row as PublisherContentRow);
    return [
      {
        ...item,
        publisherName: nested.name,
        publisherLogoUrl: nested.logo_url,
        publisherType: nested.publisher_type,
      },
    ];
  });
}

export async function fetchPublishedContentById(
  contentId: string,
): Promise<{ item: PublisherContentItem; publisher: PublisherRecord } | null> {
  const { data, error } = await supabase
    .from("publisher_content_items")
    .select(`${CONTENT_SELECT}, publishers(${PUBLISHER_SELECT})`)
    .eq("id", contentId)
    .eq("status", "approved")
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;

  const pubNested = (data as { publishers?: PublisherRow | PublisherRow[] | null }).publishers;
  const pubRow = Array.isArray(pubNested) ? pubNested[0] : pubNested;
  if (!pubRow || pubRow.status !== "published" || !pubRow.is_public) return null;

  return {
    item: mapContentFromRow(data as PublisherContentRow),
    publisher: mapPublisherFromRow(pubRow),
  };
}

export async function countPublisherContentByKind(
  publisherId: string,
  kind: PublisherContentKind,
): Promise<number> {
  const { count, error } = await supabase
    .from("publisher_content_items")
    .select("id", { count: "exact", head: true })
    .eq("publisher_id", publisherId)
    .eq("content_kind", kind)
    .eq("status", "approved");

  if (error) return 0;
  return count ?? 0;
}
