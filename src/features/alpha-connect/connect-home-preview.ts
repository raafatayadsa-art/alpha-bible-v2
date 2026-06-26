/** Dev-only home card preview — unread / pulse testing. Set localStorage to "0" to hide. */
const PREVIEW_UNREAD_KEY = "ab.alpha-connect.home-preview-unread";

export function getConnectHomePreviewUnread(): number {
  if (!import.meta.env.DEV || typeof window === "undefined") return 0;
  const stored = localStorage.getItem(PREVIEW_UNREAD_KEY);
  if (stored === "0") return 0;
  return 1;
}

export function setConnectHomePreviewUnread(count: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREVIEW_UNREAD_KEY, String(Math.max(0, count)));
}
