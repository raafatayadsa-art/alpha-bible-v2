import type { ChurchDirectoryRow } from "./types";

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Client-side match for name, city, governorate, and patron saint. */
export function matchesChurchDirectoryQuery(
  row: Pick<ChurchDirectoryRow, "name" | "city" | "governorate" | "patronSaint">,
  query: string,
): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const haystack = normalizeSearchText(
    [row.name, row.city, row.governorate, row.patronSaint].filter(Boolean).join(" "),
  );

  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function filterChurchDirectoryRows(
  rows: ChurchDirectoryRow[],
  query: string,
): ChurchDirectoryRow[] {
  const q = query.trim();
  if (!q) return rows;
  return rows.filter((row) => matchesChurchDirectoryQuery(row, q));
}

/** Apply governorate/city/saint/verified filters (client-side for map pins). */
export function matchesChurchDirectoryFilters(
  row: Pick<ChurchDirectoryRow, "name" | "city" | "governorate" | "patronSaint" | "isVerified">,
  filters: {
    governorate?: string;
    city?: string;
    patronSaint?: string;
    verifiedOnly?: boolean;
  },
): boolean {
  const gov = filters.governorate?.trim();
  const city = filters.city?.trim();
  const saint = filters.patronSaint?.trim();
  if (gov && row.governorate?.trim() !== gov) return false;
  if (city && row.city?.trim() !== city) return false;
  if (saint && row.patronSaint?.trim() !== saint) return false;
  if (filters.verifiedOnly && !row.isVerified) return false;
  return true;
}

export function filterChurchDirectoryByFilters(
  rows: ChurchDirectoryRow[],
  filters: {
    query?: string;
    governorate?: string;
    city?: string;
    patronSaint?: string;
    verifiedOnly?: boolean;
  },
): ChurchDirectoryRow[] {
  return rows.filter(
    (row) =>
      matchesChurchDirectoryQuery(row, filters.query ?? "") &&
      matchesChurchDirectoryFilters(row, filters),
  );
}
