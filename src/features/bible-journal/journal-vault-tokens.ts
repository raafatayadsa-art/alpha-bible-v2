/** Premium journal vault — notes (study blue) + meditations (spirit green). */

export const JOURNAL_VAULT = {
  bgDeep: "#030208",
  gold: "#e7c97a",
  goldMuted: "#b8893a",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.58)",
  border: "rgba(231,201,122,0.28)",
  cardBg: "#07040f",
  noteAccent: "#6eb5f0",
  noteAccentBright: "#8fd4ff",
  noteBg: "rgba(110,181,240,0.1)",
  meditationAccent: "#8fd4b8",
  meditationAccentBright: "#a8e8cc",
  meditationBg: "rgba(100,200,160,0.1)",
  meditationGlow: "rgba(143,212,180,0.35)",
} as const;

export const STUDY_TAG_LABELS: Record<string, string> = {
  study: "دراسة",
  application: "تطبيق",
  prayer: "صلاة",
  question: "سؤال",
};

export function resolveStudyTagLabel(tag: string | undefined): string | undefined {
  if (!tag) return undefined;
  if (STUDY_TAG_LABELS[tag]) return STUDY_TAG_LABELS[tag];
  if (typeof window === "undefined") return tag;
  try {
    const raw = window.localStorage.getItem("ab:journal:custom:study-tags");
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; label: string }[];
      const match = parsed.find((item) => item.id === tag);
      if (match) return match.label;
    }
  } catch {
    /* ignore */
  }
  return tag;
}

export function formatJournalAgo(ms: number): string {
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
