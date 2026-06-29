import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useSpiritualRecord } from "@/features/community/spiritual-record-store";
import { cn } from "@/lib/utils";

export function ProfileSpiritualRecordSection({ dark = false }: { dark?: boolean }) {
  const record = useSpiritualRecord();
  const ringPercent = Math.min(100, Math.max(8, record.overallStreak * 12));

  const cells = [
    { label: "خطة القراءة", value: record.readingStreak, accent: "#8a6ec1" },
    { label: "الصلاة", value: record.prayerStreak, accent: "#1f8a5a" },
    { label: "الأجبية", value: record.agpeyaStreak, accent: "#c98a3c" },
  ];

  return (
    <Link
      to="/community/spiritual-record"
      className={cn(
        "block overflow-hidden rounded-[22px] border p-4 active:scale-[0.99] transition-transform",
        dark
          ? "border-[#f0d78c]/12 bg-gradient-to-b from-[#2a1f45]/90 to-[#120c08]/95"
          : "border-[#e7c97a]/28 bg-gradient-to-b from-[#2a1f45]/88 to-[#1a1228]/92",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="relative grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full border-4 border-[#e7c97a]/35"
          style={{
            background: `conic-gradient(#e7c97a 0% ${ringPercent}%, rgba(255,255,255,0.08) ${ringPercent}% 100%)`,
          }}
        >
          <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#1a1228]/95 text-center">
            <span className="text-[22px] font-black tabular-nums text-[#f0d78c]">{record.overallStreak}</span>
            <span className="text-[8px] font-bold text-white/50">يوم</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[15px] font-extrabold text-[#f0d78c]">السجل الروحي</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-white/55">
            {record.overallStreak > 0
              ? `${record.overallStreak} يوماً متتالياً من النمو الروحي`
              : "تابع قراءتك وصلواتك لبناء السلسلة"}
          </p>
        </div>
        <ChevronLeft className="h-4 w-4 shrink-0 text-[#f0d78c]/60" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-xl border border-white/10 bg-black/25 px-2 py-2.5 text-center"
          >
            <p className="text-[16px] font-black tabular-nums text-white">{cell.value}</p>
            <p className="text-[9px] font-bold text-white/45">يوم</p>
            <p className="mt-0.5 text-[9px] font-extrabold" style={{ color: cell.accent }}>
              {cell.label}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}
