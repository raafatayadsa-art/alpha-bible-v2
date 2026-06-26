/**
 * Church geocoding helpers — Google Maps Places API (New).
 * Used by scripts/geocode-churches.mjs (one-time batch geocoder).
 */

export const GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1/places:searchText";

/** Egypt bounding box — reject obvious mis-hits. */
export const EGYPT_BOUNDS = {
  minLat: 22.0,
  maxLat: 31.85,
  minLng: 24.65,
  maxLng: 36.95,
};

export const DEFAULT_COUNTRY = "Egypt";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeWhitespace(value) {
  return normalizeGeocodeText(value);
}

/** Normalize Arabic/ Latin punctuation, line breaks, and comma noise for queries. */
export function normalizeGeocodeText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, " ")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/[،,;/|]+/g, "،")
    .replace(/(?:،\s*){2,}/g, "، ")
    .replace(/\s+/g, " ")
    .replace(/\s*،\s*$/u, "")
    .replace(/^،\s*/u, "")
    .trim();
}

function joinQueryParts(...parts) {
  return parts
    .map((part) => normalizeGeocodeText(part))
    .filter(Boolean)
    .join("، ");
}

function textContains(haystack, needle) {
  if (!haystack || !needle) return false;
  const h = normalizeGeocodeText(haystack).toLowerCase();
  const n = normalizeGeocodeText(needle).toLowerCase();
  return h.includes(n);
}

function nameAlreadyContainsCountry(name) {
  return /(?:^|،\s*)(?:مصر|egypt)(?:\s|$)/iu.test(normalizeGeocodeText(name));
}

export function normalizeCountry(raw) {
  const v = normalizeWhitespace(raw).toLowerCase();
  if (!v) return DEFAULT_COUNTRY;
  if (v === "eg" || v === "egy" || v.includes("egypt") || v.includes("مصر")) return DEFAULT_COUNTRY;
  return normalizeWhitespace(raw);
}

export function normalizeGovernorate(raw) {
  return normalizeWhitespace(raw)
    .replace(/^محافظ[ةه]\s+/u, "")
    .replace(/^governorate\s+/i, "")
    .trim();
}

export function inEgyptBounds(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= EGYPT_BOUNDS.minLat &&
    lat <= EGYPT_BOUNDS.maxLat &&
    lng >= EGYPT_BOUNDS.minLng &&
    lng <= EGYPT_BOUNDS.maxLng
  );
}

/**
 * Build ordered search strategies.
 * Priority: church_name-derived queries first, then city/governorate fallbacks.
 */
export function buildGeocodeQueries(church) {
  const churchName = normalizeGeocodeText(church.church_name);
  const city = normalizeGeocodeText(church.city);
  const governorate = normalizeGovernorate(church.governorate);
  const country = normalizeCountry(church.country);
  const address = normalizeGeocodeText(church.formatted_address);

  const queries = [];

  // 1. church_name (full string — often already contains village/city/governorate)
  if (churchName) {
    const q = nameAlreadyContainsCountry(churchName)
      ? churchName
      : joinQueryParts(churchName, country);
    queries.push({ strategy: "name_full", q });
  }

  // 2. church_name + city
  if (churchName && city && !textContains(churchName, city)) {
    queries.push({
      strategy: "name_city",
      q: joinQueryParts(churchName, city, country),
    });
  }

  // 3. church_name + city + governorate
  if (churchName && city && governorate) {
    const missingCity = !textContains(churchName, city);
    const missingGov = !textContains(churchName, governorate);
    if (missingCity || missingGov) {
      queries.push({
        strategy: "name_city_gov",
        q: joinQueryParts(
          churchName,
          missingCity ? city : "",
          missingGov ? governorate : "",
          country,
        ),
      });
    }
  } else if (churchName && governorate && !textContains(churchName, governorate)) {
    queries.push({
      strategy: "name_city_gov",
      q: joinQueryParts(churchName, governorate, country),
    });
  }

  // 4. city + governorate + Egypt
  if (city && governorate) {
    queries.push({
      strategy: "city_gov_country",
      q: joinQueryParts(city, governorate, country),
    });
  }

  // 5. governorate + Egypt
  if (governorate) {
    queries.push({
      strategy: "gov_country",
      q: joinQueryParts(governorate, country),
    });
  }

  // Bonus when formatted_address exists
  if (address) {
    queries.push({
      strategy: "formatted_address",
      q: joinQueryParts(address, city, governorate, country),
    });
  }

  const seen = new Set();
  return queries.filter((item) => {
    const key = item.q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchGooglePlaces(query, apiKey) {
  const res = await fetch(GOOGLE_PLACES_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.location,places.displayName,places.formattedAddress,places.googleMapsUri,places.types"
    },
    body: JSON.stringify({
      textQuery: query.q,
      languageCode: "ar",
      regionCode: "EG"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Google API HTTP ${res.status}: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function fetchGooglePlacesWithRetry(query, apiKey, options = {}) {
  const { retries = 3, retryBaseMs = 2000, onRetry } = options;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchGooglePlaces(query, apiKey);
    } catch (error) {
      lastError = error;
      const retriable = error.status === 429 || error.status >= 500 || error.name === "TypeError";
      if (!retriable || attempt >= retries) break;
      const waitMs = retryBaseMs * 2 ** attempt;
      onRetry?.({ attempt: attempt + 1, waitMs, error });
      await sleep(waitMs);
    }
  }
  throw lastError;
}

export function evaluateGoogleResults(data, church, query) {
  if (!data?.places?.length) {
    return { status: "failed", reason: "no_results", query, candidates: [] };
  }

  const place = data.places[0];
  if (!place.location) {
    return { status: "failed", reason: "no_location_in_result", query, candidates: data.places };
  }

  const lat = place.location.latitude;
  const lng = place.location.longitude;

  if (!inEgyptBounds(lat, lng)) {
    return { status: "failed", reason: "outside_egypt", query, candidates: data.places };
  }

  const isFallbackQuery = query?.strategy === "city_gov_country" || query?.strategy === "gov_country";
  const types = place.types || [];

  if (isFallbackQuery) {
    return {
      status: "manual_review",
      lat, lng,
      reason: "fallback_centroid",
      query, result: place
    };
  }

  if (types.includes("locality") || types.includes("administrative_area_level_1") || types.includes("administrative_area_level_2")) {
     return {
      status: "manual_review",
      lat, lng,
      reason: "returned_city_not_church",
      query, result: place
    };
  }

  return {
    status: "success",
    lat, lng,
    query, result: place,
    score: 1.0
  };
}

export async function geocodeChurch(church, options = {}) {
  const queries = buildGeocodeQueries(church);
  if (!queries.length) {
    return { status: "failed", reason: "insufficient_address_data", churchId: church.id, churchName: church.church_name, queries: [] };
  }

  const { apiKey, delayMs = 200, retries = 3, onRetry, onQuery } = options;

  if (!apiKey) throw new Error("Google Maps API Key is required. Set GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsApiKeyHere... in .env.local");

  for (let i = 0; i < queries.length; i += 1) {
    const query = queries[i];
    if (i > 0) await sleep(delayMs);
    onQuery?.({ church, query, index: i + 1, total: queries.length });

    let results;
    try {
      results = await fetchGooglePlacesWithRetry(query, apiKey, { retries, onRetry });
    } catch (error) {
      if (i === queries.length - 1) {
        return { status: "failed", reason: "google_api_error", error: error.message, churchId: church.id, churchName: church.church_name, query };
      }
      continue;
    }

    const evaluation = evaluateGoogleResults(results, church, query);
    evaluation.churchId = church.id;
    evaluation.churchName = church.church_name;
    evaluation.queriesTried = queries.slice(0, i + 1);

    if (evaluation.status === "success") return evaluation;
    if (evaluation.status === "manual_review") return evaluation;
  }

  return { status: "failed", reason: "all_strategies_exhausted", churchId: church.id, churchName: church.church_name, queries };
}

export function churchNeedsGeocoding(row) {
  return row.latitude == null || row.longitude == null;
}

export function buildUpdatePatch(existing, lat, lng) {
  const patch = {};
  if (existing.latitude == null && lat != null) patch.latitude = lat;
  if (existing.longitude == null && lng != null) patch.longitude = lng;
  return patch;
}

export function timestampReportName(prefix = "CHURCH_GEOCODING") {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}_${prefix}`;
}