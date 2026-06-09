import { Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft } from "lucide-react";
import type { ContinueReadingData } from "../data/continueReading";
import { bibleHomeColors } from "../tokens/colors";

export function ContinueReadingCard({ data }: { data: ContinueReadingData }) {
  const hasReader = !!(data.bookParam && data.chapter);

  const destination = hasReader
    ? { to: "/$book/$chapter" as const, params: { book: data.bookParam!, chapter: String(data.chapter) } }
    : { to: "/books" as const, search: { testament: "all" as const } };

  return (
    <Link
      {...destination}
      className="block transition active:scale-[0.99]"
      aria-label={hasReader ? `${data.ctaLabel} — ${data.reference}` : data.ctaLabel}
    >
      <article
        className="relative overflow-hidden rounded-[32px] border shadow-[0_16px_40px_-20px_rgba(120,90,40,0.22)]"
        style={{ borderColor: bibleHomeColors.cardBorder, backgroundColor: bibleHomeColors.ivory }}
      >
        <div className="relative flex min-h-[148px]" dir="ltr">
          <div className="relative w-[45%] shrink-0">
            <img src={data.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(30,20,8,0.08) 0%, rgba(251,246,236,0.2) 50%, rgba(251,246,236,0.98) 92%, rgba(251,246,236,1) 100%)",
              }}
            />
            <span
              className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10.5px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(184,137,58,0.55)]"
              style={{ background: `linear-gradient(135deg, ${bibleHomeColors.gold} 0%, ${bibleHomeColors.goldDeep} 100%)` }}
            >
              {data.ctaLabel}
              <ChevronLeft className="h-3 w-3 -scale-x-100" strokeWidth={2.6} />
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between p-4 text-right" dir="rtl">
            <div>
              <p className="inline-flex items-center justify-end gap-1 text-[10px] font-bold" style={{ color: bibleHomeColors.goldDeep }}>
                <Bookmark className="h-3 w-3 fill-current/20" strokeWidth={2.4} />
                {data.label}
              </p>
              <h2 className="mt-1.5 text-[15px] font-extrabold leading-snug" style={{ color: bibleHomeColors.textPrimary }}>
                {data.reference}
              </h2>
              <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed" style={{ color: bibleHomeColors.textSecondary }}>
                {data.preview}
              </p>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[9px] font-semibold" style={{ color: bibleHomeColors.textMuted }}>
                <span>{data.progressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#ede0c8]/80">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.progressPercent}%`,
                    background: `linear-gradient(90deg, ${bibleHomeColors.goldSoft}, ${bibleHomeColors.gold})`,
                    boxShadow: `0 0 10px ${bibleHomeColors.glowGold}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
