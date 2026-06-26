/**
 * Classifies stored google_maps_url strings WITHOUT calling Google APIs or browser automation.
 *
 * We only auto-verify when URL structure indicates a single pinned place (e.g. /maps/place/, place_id=).
 * Search links, coordinate-only pins, short links, and ambiguous patterns → needs_review.
 * Missing/invalid URLs → failed.
 */

export type MapsUrlVerdictKind = "single_place" | "needs_review" | "failed";

export type MapsUrlVerdict = {
  kind: MapsUrlVerdictKind;
  reason: string;
};

function normalizeMapsUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

export function classifyGoogleMapsUrl(raw: string | null | undefined): MapsUrlVerdict {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { kind: "failed", reason: "missing google_maps_url" };
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizeMapsUrl(trimmed));
  } catch {
    return { kind: "failed", reason: "invalid URL format" };
  }

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  const isGoogleMaps =
    host.includes("google.") ||
    host === "goo.gl" ||
    host === "maps.app.goo.gl" ||
    host.endsWith(".goo.gl");

  if (!isGoogleMaps) {
    return { kind: "failed", reason: "not a Google Maps host" };
  }

  const path = parsed.pathname.toLowerCase();
  const href = parsed.href;

  if (path.includes("/maps/search") || path.includes("/search/maps")) {
    return { kind: "needs_review", reason: "explicit Maps search URL (multiple results possible)" };
  }

  if (path.includes("/maps/place/") || /\/place\/[^/]+/i.test(path)) {
    return { kind: "single_place", reason: "direct /maps/place/ link" };
  }

  const placeId = parsed.searchParams.get("place_id") ?? parsed.searchParams.get("Place_ID");
  if (placeId && placeId.trim().length >= 10) {
    return { kind: "single_place", reason: "place_id query parameter" };
  }

  if (parsed.searchParams.get("cid")) {
    return { kind: "single_place", reason: "cid query parameter" };
  }

  if (parsed.searchParams.get("ftid")) {
    return { kind: "single_place", reason: "ftid query parameter" };
  }

  if (/!1s0x[0-9a-f]+:0x[0-9a-f]+/i.test(href) && path.includes("place")) {
    return { kind: "single_place", reason: "embedded place reference in place URL" };
  }

  if (host.includes("goo.gl") || host.includes("maps.app.goo.gl")) {
    return {
      kind: "needs_review",
      reason: "short link — cannot resolve to a single place without HTTP redirect lookup",
    };
  }

  const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
  if (q) {
    if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(q.trim())) {
      return { kind: "needs_review", reason: "coordinates-only query (unnamed pin)" };
    }
    return { kind: "needs_review", reason: "text search query without /maps/place/ path" };
  }

  if (/@-?\d+\.?\d*\s*,\s*-?\d+\.?\d*/.test(path) && !path.includes("place")) {
    return { kind: "needs_review", reason: "map viewport @lat,lng without place path" };
  }

  return { kind: "needs_review", reason: "ambiguous URL pattern — manual review required" };
}

export const AUTO_VERIFY_MECHANISM = {
  title: "URL structure heuristics (no Google API, no browser automation)",
  points: [
    "Reads only the stored google_maps_url string — no HTTP requests to Google.",
    "Auto-verifies ONLY when the URL structure indicates one pinned place (/maps/place/, place_id=, cid=, ftid=).",
    "Marks needs_review for search URLs, coordinate-only pins, short links, and ambiguous patterns.",
    "Counts failed when URL is missing, invalid, or not a Google Maps host.",
    "Does NOT guess result counts — never auto-verifies uncertain links.",
  ],
} as const;
