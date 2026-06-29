import type { CommunityMoment } from "./community-types";

/** Human-readable activity line for the community home feed (Screen 1). */
export function friendActivityLabel(moment: CommunityMoment): string {
  const first = moment.userName.trim().split(/\s+/)[0] || moment.userName || "عضو";

  if (moment.kind === "reading" && moment.payload.reading) {
    const r = moment.payload.reading;
    if (r.activitySummary) return `${first} ${r.activitySummary}`;
    if (r.auto) {
      return `${first} أنهى قراءة${r.reference ? ` — ${r.reference}` : ""}`;
    }
    return `${first} شارك قراءة${r.reference ? ` — ${r.reference}` : ""}`;
  }
  if (moment.kind === "prayer" && moment.payload.prayer) {
    const p = moment.payload.prayer;
    if (p.activitySummary) return `${first} ${p.activitySummary}`;
    return `${first} شارك طلب صلاة — ${p.title}`;
  }
  if (moment.kind === "agpeya" && moment.payload.agpeya) {
    const a = moment.payload.agpeya;
    if (a.activitySummary) return `${first} ${a.activitySummary}`;
    if (a.auto || moment.source === "auto_agpeya") {
      return `${first} أتم صلاة ${a.title} من الأجبية`;
    }
    return `${first} صلّى من الأجبية — ${a.title}`;
  }
  return `${first} شارك نشاطاً روحياً`;
}

export function friendActivityIconKind(moment: CommunityMoment): "reading" | "prayer" | "agpeya" {
  return moment.kind;
}
