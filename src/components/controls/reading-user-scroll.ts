/** Dispatched when the user manually scrolls (touch, wheel, scroll rail). */
export const READING_USER_SCROLL_EVENT = "ab:reading-user-scroll";

export function dispatchReadingUserScroll() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(READING_USER_SCROLL_EVENT));
}
