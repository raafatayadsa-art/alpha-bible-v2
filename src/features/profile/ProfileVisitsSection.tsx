import { Church, MapPin, Mountain } from "lucide-react";
import { listPilgrimagePassport, passportStats } from "@/features/church/trip-reservations/pilgrimage-passport";
import type { PilgrimagePassportEntry } from "@/features/church/trip-reservations/trip-features-roadmap";

const DEMO_VISITS: PilgrimagePassportEntry[] = [
  {
    id: "demo-monastery",
    userId: "demo",
    kind: "monastery",
    title: "دير القديس أنطونيوس",
    completedAt: "2025-11-12",
  },
  {
    id: "demo-church",
    userId: "demo",
    kind: "trip",
    title: "كنيسة مارجرجس — المنيا",
    completedAt: "2025-09-03",
  },
];

function visitIcon(kind: PilgrimagePassportEntry["kind"]) {
  if (kind === "monastery" || kind === "retreat") return Mountain;
  return Church;
}

function VisitCard({ entry }: { entry: PilgrimagePassportEntry }) {
  const Icon = visitIcon(entry.kind);
  const tone = entry.kind === "monastery" || entry.kind === "retreat" ? "#1f8a5a" : "#6a4ab5";

  return (
    <div className="flex shrink-0 w-[148px] flex-col gap-2 rounded-[18px] border border-[#efe2c4] bg-white/85 p-2.5 shadow-[0_8px_20px_-14px_rgba(120,80,30,0.28)]">
      <div
        className="grid h-16 w-full place-items-center rounded-xl border"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${tone}18, ${tone}06)`,
          borderColor: `${tone}28`,
          color: tone,
        }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.1} />
      </div>
      <div className="text-right min-w-0">
        <p className="text-[11px] font-extrabold text-[#3a2a18] line-clamp-2 leading-snug">{entry.title}</p>
        <p className="mt-1 text-[9px] text-[#6a543a] inline-flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          {new Date(entry.completedAt).toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

export function ProfileVisitsSection() {
  const saved = listPilgrimagePassport();
  const stats = passportStats();
  const visits = saved.length ? saved.slice(0, 8) : DEMO_VISITS;

  return (
    <>
      <div className="mt-5 mb-2.5 flex items-end justify-between gap-2 px-0.5">
        <div className="flex gap-1.5 text-[9px] font-bold text-[#8a6a3a]">
          {stats.total > 0 ? (
            <>
              <span className="rounded-full bg-[#f4ead8] px-2 py-0.5">{stats.monasteries} أديرة</span>
              <span className="rounded-full bg-[#f4ead8] px-2 py-0.5">{stats.trips} رحلات</span>
            </>
          ) : (
            <span className="rounded-full bg-[#f4ead8] px-2 py-0.5">معاينة · سجّل من رحلاتك</span>
          )}
        </div>
        <h2 className="text-[13px] font-extrabold text-[#3a2a18]">أماكن الزيارة</h2>
      </div>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-2.5">
          {visits.map((entry) => (
            <VisitCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </>
  );
}
