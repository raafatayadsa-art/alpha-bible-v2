import { supabase } from "@/integrations/supabase/client";
import { parseGoogleMapsCoordinates } from "@/lib/google-maps-coordinates";
import { classifyGoogleMapsUrl } from "./church-location-url-classifier";

export type ChurchLocationStatus = "needs_review" | null;

export type ChurchLocationRow = {
  id: number;
  church_name: string;
  city: string | null;
  governorate: string | null;
  google_maps_url: string | null;
  location_verified: boolean;
  location_status: ChurchLocationStatus;
};

export type ChurchLocationStats = {
  total: number;
  verified: number;
  unverified: number;
  progressPct: number;
};

export type ChurchLocationFilter = "all" | "verified" | "unverified";

const PAGE_SIZE = 30;

const LIST_SELECT =
  "id, church_name, city, governorate, google_maps_url, location_verified, location_status";

const AUTO_VERIFY_BATCH = 100;

function sanitizeSearchTerm(raw: string): string {
  return raw.trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
}

export async function fetchChurchLocationStats(): Promise<ChurchLocationStats> {
  const base = supabase.from("churches").select("*", { count: "exact", head: true }).eq("is_active", true);

  const [{ count: total, error: totalErr }, { count: verified, error: verifiedErr }] = await Promise.all([
    base,
    supabase
      .from("churches")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("location_verified", true),
  ]);

  if (totalErr) throw new Error(totalErr.message);
  if (verifiedErr) throw new Error(verifiedErr.message);

  const totalN = total ?? 0;
  const verifiedN = verified ?? 0;
  const unverifiedN = Math.max(0, totalN - verifiedN);
  const progressPct = totalN > 0 ? Math.round((verifiedN / totalN) * 100) : 0;

  return { total: totalN, verified: verifiedN, unverified: unverifiedN, progressPct };
}

export async function fetchChurchLocationPage(
  page: number,
  search: string,
  filter: ChurchLocationFilter,
): Promise<{ rows: ChurchLocationRow[]; total: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("churches")
    .select(LIST_SELECT, { count: "exact" })
    .eq("is_active", true)
    .order("id", { ascending: true })
    .range(from, to);

  if (filter === "verified") query = query.eq("location_verified", true);
  if (filter === "unverified") query = query.eq("location_verified", false);

  const term = sanitizeSearchTerm(search);
  if (term) {
    const pattern = `%${term}%`;
    query = query.or(
      `church_name.ilike.${pattern},city.ilike.${pattern},governorate.ilike.${pattern}`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as ChurchLocationRow[],
    total: count ?? 0,
  };
}

export type ChurchLocationVerifyResult = {
  id: number;
  google_maps_url: string | null;
  verified_location_url: string | null;
  location_verified: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export function buildChurchGoogleMapsSearchQuery(row: Pick<
  ChurchLocationRow,
  "church_name" | "city" | "governorate"
>): string {
  return [row.church_name, row.city, row.governorate, "Egypt"]
    .map((part) => (part ?? "").replace(/\s*\n+\s*/g, " ").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Verify location: pasted final URL, or google_maps_url when input is empty. */
export async function verifyChurchLocation(
  churchId: number,
  finalUrl?: string,
): Promise<ChurchLocationVerifyResult> {
  const trimmed = finalUrl?.trim() ?? "";
  const { data, error } = await supabase.rpc("platform_verify_church_location", {
    p_church_id: churchId,
    p_final_url: trimmed || null,
  });

  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    throw new Error("لم يتم اعتماد الموقع — تحقق من صلاحيات قاعدة البيانات");
  }

  const saved = row as ChurchLocationVerifyResult;
  if (saved.location_verified !== true) {
    throw new Error("location_verified لم يُفعَّل بعد الاعتماد");
  }
  if (!saved.verified_location_url?.trim()) {
    throw new Error("verified_location_url لم يُحفظ");
  }

  // Client-side coord patch when RPC returns without coords (pre-migration fallback)
  if (saved.latitude == null || saved.longitude == null) {
    const coords = parseGoogleMapsCoordinates(saved.verified_location_url);
    if (coords) {
      await supabase
        .from("churches")
        .update({
          latitude: coords.lat,
          longitude: coords.lng,
        })
        .eq("id", churchId);
    }
  }

  return saved;
}

export async function markChurchLocationNeedsReview(churchId: number): Promise<void> {
  const { error } = await supabase.rpc("platform_mark_church_location_needs_review", {
    p_church_id: churchId,
  });
  if (error) throw new Error(error.message);
}

export type AutoVerifySample = {
  id: number;
  name: string;
  reason: string;
};

export type AutoVerifyReport = {
  verifiedAutomatically: number;
  needsManualReview: number;
  failed: number;
  totalProcessed: number;
  samples: {
    verified: AutoVerifySample[];
    needsReview: AutoVerifySample[];
    failed: AutoVerifySample[];
  };
};

async function fetchUnverifiedChurchBatch(from: number, to: number): Promise<ChurchLocationRow[]> {
  const { data, error } = await supabase
    .from("churches")
    .select(LIST_SELECT)
    .eq("is_active", true)
    .eq("location_verified", false)
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return (data ?? []) as ChurchLocationRow[];
}

/** Classify google_maps_url locally; apply verify or needs_review. No Google API / no automation. */
export async function runAutoVerifyAll(
  onProgress?: (done: number, total: number) => void,
): Promise<AutoVerifyReport> {
  const report: AutoVerifyReport = {
    verifiedAutomatically: 0,
    needsManualReview: 0,
    failed: 0,
    totalProcessed: 0,
    samples: { verified: [], needsReview: [], failed: [] },
  };

  const pushSample = (
    bucket: AutoVerifySample[],
    row: ChurchLocationRow,
    reason: string,
  ) => {
    if (bucket.length >= 8) return;
    bucket.push({ id: row.id, name: row.church_name.slice(0, 60), reason });
  };

  let offset = 0;
  let batch: ChurchLocationRow[];

  do {
    batch = await fetchUnverifiedChurchBatch(offset, offset + AUTO_VERIFY_BATCH - 1);
    if (batch.length === 0) break;

    for (const row of batch) {
      report.totalProcessed += 1;
      const verdict = classifyGoogleMapsUrl(row.google_maps_url);

      try {
        if (verdict.kind === "single_place") {
          await verifyChurchLocation(row.id);
          report.verifiedAutomatically += 1;
          pushSample(report.samples.verified, row, verdict.reason);
        } else if (verdict.kind === "needs_review") {
          await markChurchLocationNeedsReview(row.id);
          report.needsManualReview += 1;
          pushSample(report.samples.needsReview, row, verdict.reason);
        } else {
          report.failed += 1;
          pushSample(report.samples.failed, row, verdict.reason);
        }
      } catch (e) {
        report.failed += 1;
        pushSample(
          report.samples.failed,
          row,
          e instanceof Error ? e.message : "database update failed",
        );
      }

      onProgress?.(report.totalProcessed, report.totalProcessed);
    }

    offset += AUTO_VERIFY_BATCH;
  } while (batch.length === AUTO_VERIFY_BATCH);

  return report;
}

export { AUTO_VERIFY_MECHANISM } from "./church-location-url-classifier";

export { PAGE_SIZE as CHURCH_LOCATION_PAGE_SIZE };
