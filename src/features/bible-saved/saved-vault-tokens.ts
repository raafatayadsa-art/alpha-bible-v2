/** Premium saved-verses vault — light ivory theme. */

export const SAVED_VAULT = {
  bg: "#FAF7F2",
  bgDeep: "#F5EFE6",
  gold: "#D4AF37",
  goldBright: "#E7C97A",
  goldMuted: "#B8893A",
  text: "#2A1F12",
  textMuted: "#8A7355",
  border: "rgba(212, 175, 55, 0.32)",
  cardBg: "#FFFCF7",
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
