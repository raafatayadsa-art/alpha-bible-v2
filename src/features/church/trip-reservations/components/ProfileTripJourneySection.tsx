import { Award, BookOpen } from "lucide-react";
import { listMyCertificates } from "../trip-certificates";
import { listPilgrimagePassport, passportStats } from "../pilgrimage-passport";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";

const GLASS =
  "rounded-[22px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 p-3.5";

export function ProfileTripJourneySection() {
  const certs = listMyCertificates();
  const passport = listPilgrimagePassport();
  const stats = passportStats();

  if (!certs.length && !passport.length) return null;

  return (
    <>
      {passport.length > 0 ? (
        <div className="mt-3">
          <div className={GLASS + " text-right"} dir="rtl">
            <p className="text-[13px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#1f8a5a]" /> جواز الحج الروحي
            </p>
            <div className="mt-2 flex gap-2 text-center">
              <MiniStat label="إجمالي" value={stats.total} />
              <MiniStat label="أديرة" value={stats.monasteries} />
              <MiniStat label="مؤتمرات" value={stats.conferences} />
              <MiniStat label="رحلات" value={stats.trips} />
            </div>
            <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto">
              {passport.slice(0, 5).map((e) => (
                <li key={e.id} className="text-[10px] text-[#6a543a] flex justify-between gap-2">
                  <span className="truncate font-bold text-[#3a2a18]">{e.title}</span>
                  <span className="shrink-0">{new Date(e.completedAt).toLocaleDateString("ar-EG")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {certs.length > 0 ? (
        <div className="mt-3">
          <div className={GLASS + " text-right"} dir="rtl">
            <p className="text-[13px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#b8893a]" /> شهادات المشاركة
            </p>
            <ul className="mt-2 space-y-2">
              {certs.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center gap-2 rounded-xl bg-white/70 border border-[#efe2c4] p-2">
                  <AlphaQrCode value={c.verifyQr} size={48} className="shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold text-[#3a2a18] truncate">{c.eventTitle}</p>
                    <p className="text-[9px] text-[#6a543a]">{c.eventDate} · {c.organizerName}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl bg-white/70 border border-[#efe2c4] py-1.5">
      <p className="text-[14px] font-extrabold text-[#3a2a18] tabular-nums">{value}</p>
      <p className="text-[8px] font-bold text-[#8a6a3a]">{label}</p>
    </div>
  );
}
