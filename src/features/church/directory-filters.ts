import type { DirectoryChurch } from "./churches-directory-api";

export type DirectoryLocationFilters = {
  diocese: string;
  governorate: string;
  city: string;
  query: string;
};

export const EMPTY_DIRECTORY_FILTERS: DirectoryLocationFilters = {
  diocese: "",
  governorate: "",
  city: "",
  query: "",
};

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v?.trim())).map((v) => v!.trim()))].sort(
    (a, b) => a.localeCompare(b, "ar"),
  );
}

export function directoryDioceseOptions(churches: DirectoryChurch[]): string[] {
  return uniqueSorted(churches.map((c) => c.diocese));
}

export function directoryGovernorateOptions(
  churches: DirectoryChurch[],
  diocese: string,
): string[] {
  const pool = diocese ? churches.filter((c) => c.diocese === diocese) : churches;
  return uniqueSorted(pool.map((c) => c.governorate));
}

export function directoryCityOptions(
  churches: DirectoryChurch[],
  diocese: string,
  governorate: string,
): string[] {
  let pool = churches;
  if (diocese) pool = pool.filter((c) => c.diocese === diocese);
  if (governorate) pool = pool.filter((c) => c.governorate === governorate);
  return uniqueSorted(pool.map((c) => c.city));
}

export function filterDirectoryChurches(
  churches: DirectoryChurch[],
  filters: DirectoryLocationFilters,
): DirectoryChurch[] {
  const q = filters.query.trim();

  return churches.filter((church) => {
    if (filters.diocese && church.diocese !== filters.diocese) return false;
    if (filters.governorate && church.governorate !== filters.governorate) return false;
    if (filters.city && church.city !== filters.city) return false;
    if (!q) return true;
    return [church.name, church.priestName ?? "", church.city ?? "", church.governorate ?? "", church.diocese ?? ""]
      .some((part) => part.includes(q));
  });
}

export function hasActiveDirectoryFilters(filters: DirectoryLocationFilters): boolean {
  return Boolean(filters.diocese || filters.governorate || filters.city || filters.query.trim());
}
