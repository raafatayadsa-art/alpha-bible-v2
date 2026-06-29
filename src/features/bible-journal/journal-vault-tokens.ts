/** Premium journal — light ivory + gold; notes (study blue) + meditations (spirit green). */

export const JOURNAL_VAULT = {
  bgDeep: "#FAF7F2",
  gold: "#D4AF37",
  goldMuted: "#B8893A",
  text: "#2A1F12",
  textMuted: "#8A7355",
  border: "rgba(212, 175, 55, 0.35)",
  cardBg: "#FFFFFF",
  noteAccent: "#3D7AB8",
  noteAccentBright: "#4A8EC8",
  noteBg: "rgba(110, 181, 240, 0.14)",
  meditationAccent: "#3D8A68",
  meditationAccentBright: "#5A9E78",
  meditationBg: "rgba(100, 200, 160, 0.14)",
  meditationGlow: "rgba(100, 200, 160, 0.28)",
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
