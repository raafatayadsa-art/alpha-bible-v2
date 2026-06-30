const COVER_KEY = "ab:profile:cover";

/** User-editable cover — falls back to Alpha default when unset. */
export function getProfileCover(defaultUrl: string): string {
  if (typeof window === "undefined") return defaultUrl;
  try {
    return localStorage.getItem(COVER_KEY) || defaultUrl;
  } catch {
    return defaultUrl;
  }
}

export function setProfileCover(url: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COVER_KEY, url);
  } catch {
    /* quota */
  }
}
