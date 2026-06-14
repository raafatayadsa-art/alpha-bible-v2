export type AlphaScreenKind = "home" | "main" | "internal" | "reading";

const HOME_EXACT = new Set(["/", "/home"]);

const MAIN_ROOTS = [
  "/church",
  "/profile",
  "/settings",
  "/books",
  "/bible",
  "/synaxarium",
  "/feasts",
  "/agpeya",
  "/katameros",
  "/audio",
  "/search",
  "/prayer-requests",
] as const;

/** Inline text-reading routes — right-edge nav disabled. */
const READING_PREFIXES = ["/agpeya/"] as const;

function isChapterReader(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && /^\d+$/.test(parts[1]!);
}

function isReadingDetail(pathname: string, root: string) {
  return pathname.startsWith(`${root}/`) && pathname !== root && pathname !== `${root}/`;
}

/** Classify the current route for header + gesture policy. */
export function getAlphaScreenKind(pathname: string): AlphaScreenKind {
  if (HOME_EXACT.has(pathname)) return "home";

  if (READING_PREFIXES.some((p) => pathname.startsWith(p))) return "reading";
  if (isChapterReader(pathname)) return "reading";
  if (isReadingDetail(pathname, "/synaxarium")) return "reading";
  if (isReadingDetail(pathname, "/feasts")) return "reading";

  if (MAIN_ROOTS.some((p) => pathname === p || pathname === `${p}/`)) return "main";

  return "internal";
}

export function canOpenNavFromEdge(kind: AlphaScreenKind) {
  return kind !== "reading";
}

export function canBackFromEdge(kind: AlphaScreenKind, hasHistory: boolean) {
  if (!hasHistory) return false;
  return kind !== "home";
}
