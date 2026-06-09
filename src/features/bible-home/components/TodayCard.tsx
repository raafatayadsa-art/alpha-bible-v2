import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft } from "lucide-react";
import type { TodayCardData } from "../data/todayCard";
import { bibleHomeColors } from "../tokens/colors";

export function TodayCard({ data }: { data: TodayCardData }) {
  return (
    <Link
      to="/bible/today"
      className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[24px] border p-3 text-right transition active:scale-[0.99]"
      style={{
        backgroundColor: bibleHomeColors.ivory,
        borderColor: bibleHomeColors.cardBorder,
        boxShadow: `0 12px 30px -18px ${bibleHomeColors.shadowSoft}`,
      }}
      dir="rtl"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-white/80 shadow-sm">
        <img src={data.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-extrabold" style={{ color: bibleHomeColors.textPrimary }}>
          {data.title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed" style={{ color: bibleHomeColors.textSecondary }}>
          {data.subtitle}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <CalendarDays className="h-5 w-5" style={{ color: bibleHomeColors.goldDeep }} strokeWidth={2.2} />
        <ChevronLeft className="h-3.5 w-3.5" style={{ color: bibleHomeColors.textMuted }} strokeWidth={2.4} />
      </div>
    </Link>
  );
}
