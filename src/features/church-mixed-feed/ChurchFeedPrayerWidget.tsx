/**
 * ChurchFeedPrayerWidget — Spiritual Dark Edition
 * Deep-purple atmosphere with cross texture, candle glow, gold ledger DNA
 */
import { Link } from "@tanstack/react-router";
import { ArrowLeft, HandHeart } from "lucide-react";
import { prayerStatsFromDashboard } from "@/features/church/church-dashboard-api";
import type { ChurchDashboardPrayer } from "@/features/church/church-dashboard-api";

type Props = {
  prayers: ChurchDashboardPrayer[];
};

// Subtle SVG cross pattern
const CROSS_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
    <line x1="22" y1="4" x2="22" y2="40" stroke="white" stroke-width="1.4" stroke-opacity="0.06"/>
    <line x1="8" y1="16" x2="36" y2="16" stroke="white" stroke-width="1.4" stroke-opacity="0.06"/>
  </svg>`,
)}")`;

export function ChurchFeedPrayerWidget({ prayers }: Props) {
  const stats = prayerStatsFromDashboard(prayers);
  const latest = prayers[0];

  return (
    <Link
      to="/prayer-requests"
      className="relative mx-auto block w-full max-w-[var(--alpha-content-narrow-width)] overflow-hidden rounded-[28px] active:scale-[0.99] transition-transform"
      style={{
        background: "linear-gradient(148deg,#16102a 0%,#221840 55%,#120c22 100%)",
        border: "1px solid rgba(138,110,193,0.28)",
        boxShadow: "0 24px 48px -24px rgba(106,74,181,0.45), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Cross texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: CROSS_PATTERN, backgroundSize: "44px 44px" }}
      />

      {/* Top glow stripe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(138,110,193,0.7),transparent)" }}
      />

      {/* Radial candle glow on right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(45% 55% at 82% 40%, rgba(240,190,80,0.22), transparent 65%)",
        }}
      />

      <div className="relative z-[2] p-4" dir="rtl">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Icon bubble */}
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(145deg,rgba(138,110,193,0.3) 0%,rgba(138,110,193,0.1) 100%)",
              border: "1px solid rgba(138,110,193,0.45)",
              boxShadow: "0 0 20px rgba(138,110,193,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <HandHeart className="h-5.5 w-5.5 text-[#b89cec]" strokeWidth={2.1} style={{ filter: "drop-shadow(0 0 6px rgba(138,110,193,0.8))" }} />
          </span>

          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <h3 className="text-[13px] font-extrabold text-white/90">طلبات الصلاة</h3>
              {/* Candle emoji glow */}
              <span className="text-[16px]" style={{ filter: "drop-shadow(0 0 6px rgba(240,190,80,0.7))" }}>🕯️</span>
            </div>
            <p className="mt-0.5 text-[10px] font-bold text-white/45">
              {stats.active} طلب نشط · {stats.peoplePrayed.toLocaleString("ar-EG")} صلّوا
            </p>

            {/* Latest prayer title */}
            {latest ? (
              <div
                className="mt-2.5 rounded-xl p-2.5 text-right"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(138,110,193,0.22)",
                }}
              >
                <p className="line-clamp-2 font-arabic-serif text-[12.5px] font-extrabold leading-snug text-white/85">
                  {latest.title}
                </p>
                <p className="mt-1 text-[9.5px] text-white/35">{latest.anonymous ? "طلب صلاة" : latest.time}</p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-white/35">لا توجد طلبات نشطة حالياً</p>
            )}
          </div>
        </div>

        {/* Gold divider */}
        <div aria-hidden className="my-3 h-px w-full"
          style={{ background: "linear-gradient(90deg,transparent,rgba(138,110,193,0.4),transparent)" }} />

        {/* Footer: stats + CTA */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-extrabold active:scale-95"
            style={{
              background: "linear-gradient(135deg,rgba(138,110,193,0.25),rgba(138,110,193,0.1))",
              border: "1px solid rgba(138,110,193,0.4)",
              color: "#c4a8f0",
            }}
          >
            عرض الكل
            <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
          </span>

          <div className="flex items-center gap-3">
            {/* Active count */}
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
              style={{ background: "rgba(138,110,193,0.15)", color: "#b89cec" }}
            >
              <span className="font-black text-[13px]">{stats.active}</span>
              <span className="text-white/40">نشط</span>
            </span>
            {/* Prayed count */}
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
              style={{ background: "rgba(240,190,80,0.1)", color: "#f0c850" }}
            >
              <span className="font-black text-[13px]">{stats.peoplePrayed.toLocaleString("ar-EG")}</span>
              <span className="text-white/40">صلّوا</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
