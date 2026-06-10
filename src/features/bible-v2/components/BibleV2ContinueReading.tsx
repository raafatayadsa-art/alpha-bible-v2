import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import continueBook from "@/features/bible-lavoble/assets/continue-book.jpg";
import { defaultContinueReading } from "@/features/bible-home/data/continueReading";
import { useCurrentSession } from "@/lib/reading-state";
import { bibleV2Tokens } from "../tokens";

function resolveContinueData(session: ReturnType<typeof useCurrentSession>) {
  if (!session) return defaultContinueReading;
  return {
    ...defaultContinueReading,
    reference: `${session.bookName || session.book} ${session.chapter}${session.verse ? `:${session.verse}` : ""}`,
    progressPercent: Math.min(100, Math.max(0, session.progressPercent)),
    bookParam: session.book,
    chapter: session.chapter,
  };
}

export function BibleV2ContinueReading() {
  const session = useCurrentSession();
  const data = resolveContinueData(session);
  const hasReader = !!(data.bookParam && data.chapter);
  const progress = data.progressPercent;

  const destination = hasReader
    ? { to: "/$book/$chapter" as const, params: { book: data.bookParam!, chapter: String(data.chapter) } }
    : { to: "/books" as const, search: { testament: "all" as const } };

  return (
    <section className="relative mx-4 mt-7 mb-1 pl-2">
      <Link
        {...destination}
        className="group block transition active:scale-[0.99]"
        aria-label={`${data.ctaLabel} — ${data.reference}`}
      >
        <article
          className="relative min-h-[128px] overflow-visible rounded-[26px] border border-white/70 backdrop-blur-2xl transition duration-300 group-hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(250,247,242,0.45) 48%, rgba(255,255,255,0.58) 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.95)",
              "inset 0 -1px 0 rgba(255,255,255,0.35)",
              `0 20px 44px -18px ${bibleV2Tokens.shadowCard}`,
              `0 8px 24px -12px ${bibleV2Tokens.shadowWarm}`,
              "0 0 0 1px rgba(212,175,55,0.12)",
            ].join(", "),
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]"
            style={{
              background:
                "linear-gradient(125deg, rgba(255,255,255,0.55) 0%, transparent 42%, rgba(212,175,55,0.06) 100%)",
            }}
          />

          <div className="relative flex min-h-[128px] items-stretch" dir="ltr">
            <div
              className="pointer-events-none absolute -left-3 top-1/2 z-20 -translate-y-[54%] transition duration-500 group-hover:-translate-y-[56%] group-hover:scale-[1.02]"
              style={{ width: 92, height: 118 }}
            >
              <div
                className="relative h-full w-full"
                style={{
                  transform: "rotate(-6deg)",
                  filter: "drop-shadow(0 18px 28px rgba(30,43,84,0.42)) drop-shadow(0 6px 12px rgba(0,0,0,0.22))",
                }}
              >
                <img
                  src={continueBook}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain object-bottom"
                  draggable={false}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.28) 0%, transparent 45%, rgba(0,0,0,0.08) 100%)",
                  }}
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between py-4 pr-4 pl-[88px] text-right" dir="rtl">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-extrabold leading-tight" style={{ color: bibleV2Tokens.navy }}>
                    استمر في القراءة
                  </h3>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/80 bg-white/50 text-[#8a7544] shadow-[0_4px_12px_-6px_rgba(120,90,40,0.25)] backdrop-blur-md transition group-hover:bg-white/70">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] font-bold text-[#b08a2e]">{data.reference}</p>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#5a4a32]/90">
                  {data.preview}
                </p>
              </div>

              <div className="mt-3.5">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-bold">
                  <span style={{ color: bibleV2Tokens.textMuted }}>تقدّم القراءة</span>
                  <span style={{ color: bibleV2Tokens.goldDeep }}>{progress}%</span>
                </div>
                <div
                  className="relative h-2 overflow-hidden rounded-full border border-white/60"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(237,224,200,0.55) 100%)",
                    boxShadow: "inset 0 1px 3px rgba(120,90,40,0.12)",
                  }}
                >
                  <div
                    className="relative h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${bibleV2Tokens.goldSoft} 0%, ${bibleV2Tokens.gold} 55%, ${bibleV2Tokens.goldDeep} 100%)`,
                      boxShadow: `0 0 12px rgba(212,175,55,0.45), inset 0 1px 0 rgba(255,255,255,0.45)`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-y-0 right-0 w-3 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </section>
  );
}
