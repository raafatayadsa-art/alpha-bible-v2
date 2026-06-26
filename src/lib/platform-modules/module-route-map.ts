import type { PlatformModuleKey } from "./types";

/** Route prefixes guarded by each module key. Longest-prefix wins via ordered scan. */
export const MODULE_ROUTE_PREFIXES: Record<PlatformModuleKey, string[]> = {
  bible: ["/bible", "/books"],
  agpeya: ["/agpeya"],
  kholagy: ["/kholagy"],
  synaxarium: ["/synaxarium"],
  katameros: ["/katameros"],
  audio: ["/publisher", "/audiov2", "/audio"],
  kids: ["/kids"],
  meditations: ["/meditations"],
  community: ["/profile/church", "/prayer-requests", "/churches-directory", "/church-feed-lab", "/church"],
  messaging: ["/alpha-connect", "/messages", "/personal-call", "/profile/messages", "/call"],
  trips: ["/church/post"],
  reservations: [],
  donations: [],
};

const ORDERED: { key: PlatformModuleKey; prefix: string }[] = Object.entries(MODULE_ROUTE_PREFIXES)
  .flatMap(([key, prefixes]) =>
    prefixes.map((prefix) => ({ key: key as PlatformModuleKey, prefix })),
  )
  .sort((a, b) => b.prefix.length - a.prefix.length);

/** True when the path is not module-gated or its module is enabled. */
export function isPathModuleEnabled(
  pathname: string,
  isModuleEnabled: (key: PlatformModuleKey) => boolean,
): boolean {
  const key = resolveModuleKeyForPath(pathname);
  return key == null || isModuleEnabled(key);
}

/** Returns module key for a pathname, or null when route is not module-gated. */
export function resolveModuleKeyForPath(pathname: string): PlatformModuleKey | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/platform")) return null;
  for (const { key, prefix } of ORDERED) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return key;
  }
  return null;
}

/** Home / nav item keys mapped to platform module keys. */
export const NAV_ITEM_MODULE_KEY: Record<string, PlatformModuleKey | undefined> = {
  bible: "bible",
  agpeya: "agpeya",
  kholagy: "kholagy",
  katameros: "katameros",
  synaxarium: "synaxarium",
  church: "community",
  audio: "audio",
  kids: "kids",
  meditations: "meditations",
  home: undefined,
  library: "bible",
  profile: undefined,
  settings: undefined,
};

/** Search hub scope → module key (undefined = always visible). */
export const SEARCH_SCOPE_MODULE: Record<string, PlatformModuleKey | undefined> = {
  all: undefined,
  bible: "bible",
  agpeya: "agpeya",
  katameros: "katameros",
  synaxarium: "synaxarium",
  feasts: undefined,
  meditations: "meditations",
};
