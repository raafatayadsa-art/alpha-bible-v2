/** Premium saved-verses vault — dark glass + glowing Coptic DNA. */

export const SAVED_VAULT = {
  bg: "#050814",
  bgDeep: "#030208",
  gold: "#e7c97a",
  goldBright: "#f0d78c",
  goldMuted: "#b8893a",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.58)",
  border: "rgba(231,201,122,0.32)",
  cardBg: "#07040f",
} as const;

/** Light ivory theme for the highlighted-verses tab. */
export const HIGHLIGHT_VAULT = {
  bgDeep: "#FAF7F2",
  gold: "#D4AF37",
  goldMuted: "#B8893A",
  text: "#2A1F12",
  textMuted: "#8A7355",
  border: "rgba(212, 175, 55, 0.32)",
  cardBorder: "rgba(212, 175, 55, 0.22)",
} as const;

export function formatSavedAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "أمس" : `منذ ${days} أيام`;
  return new Date(ms).toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}
