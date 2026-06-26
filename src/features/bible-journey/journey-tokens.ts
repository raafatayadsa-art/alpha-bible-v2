/** ALPHA-101 — quiet spiritual palette (no gamification badges). */

export const JOURNEY = {
  gold: "#c79356",
  goldSoft: "#e7c97a",
  goldDeep: "#7a4a26",
  purple: "#7c6aad",
  purpleSoft: "#a894d4",
  purpleBg: "rgba(124,106,173,0.14)",
  beige: "#f4ead8",
  beigeDeep: "#ecdcb6",
  beigeMuted: "#b8893a",
  text: "#3a2a18",
  textMuted: "#6a543a",
  card: "rgba(255,255,255,0.88)",
  cardBorder: "#efe2c4",
  completeBg: "linear-gradient(145deg, rgba(231,201,122,0.28) 0%, rgba(199,147,86,0.16) 100%)",
  inProgressBg: "linear-gradient(145deg, rgba(168,148,212,0.22) 0%, rgba(124,106,173,0.12) 100%)",
  idleBg: "linear-gradient(145deg, rgba(244,234,216,0.95) 0%, rgba(236,220,182,0.75) 100%)",
} as const;

export const BOOK_STATUS_META = {
  complete: { label: "مكتمل", emoji: "✅", tone: "complete" as const },
  "in-progress": { label: "قيد القراءة", emoji: "🔄", tone: "in-progress" as const },
  "not-started": { label: "لم يبدأ", emoji: "⏳", tone: "not-started" as const },
};
