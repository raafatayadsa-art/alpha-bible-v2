import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import {

  ChevronLeft,

  Music2,

  Sparkles,

  Heart,

  Clock,

  ChevronRight,

  Church,

} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {

  KHOLAGY_CATEGORY_LABEL,

  KHOLAGY_HUB_CATEGORIES,

  KHOLAGY_LITURGY_META,

  KHOLAGY_LITURGY_ORDER,

  kholagyAccentForCategory,

  kholagyGroupsQueryOptions,

  kholagyLiturgySummariesQueryOptions,

  readLastOpenedKholagy,

  readLastOpenedKholagyLiturgy,

  type KholagyBrowseCategory,

  type KholagyLiturgyKey,

} from "@/features/kholagy";

import { BottomDock } from "@/components/bible/BottomDock";

import { CopticCross, CopticWatermark } from "@/components/coptic";

import { cn } from "@/lib/utils";

import heroArt from "@/assets/home/daily-hymn.jpg";



export const Route = createFileRoute("/kholagy/")({

  ssr: false,

  head: () => ({

    meta: [

      { title: "ألفا — الخولاجي المقدس" },

      { name: "description", content: "ترانيم وأوشيات الخولاجي القبطي — تسبحة وذكصولوجيات." },

    ],

  }),

  component: KholagyHome,

});



function KholagyLiturgyHubCard({
  liturgyKeys,
  sectionCounts,
}: {
  liturgyKeys: KholagyLiturgyKey[];
  sectionCounts: Partial<Record<KholagyLiturgyKey, number>>;
}) {
  const accent = kholagyAccentForCategory("liturgy");
  const liftShadow =
    "0 14px 28px -16px rgba(90,50,120,0.32), inset 0 1px 0 rgba(255,255,255,0.58)";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border p-4 pt-5",
        accent.card,
      )}
      style={{
        boxShadow: `0 0 0 1px ${accent.glow}66, ${liftShadow}`,
      }}
    >
      <div className="relative mb-3 flex items-center gap-3">
        <span
          className={cn(
            "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border border-white/65",
            accent.iconBg,
          )}
        >
          <Church className={cn("h-7 w-7", accent.iconColor)} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <h2 className={cn("font-arabic-serif text-[16px] font-extrabold", accent.title)}>
            {KHOLAGY_CATEGORY_LABEL.liturgy}
          </h2>
          <p className={cn("mt-0.5 text-[11.5px] font-medium", accent.meta)}>3 قداسات — اختر القداس</p>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-2">
        {liturgyKeys.map((key) => {
          const meta = KHOLAGY_LITURGY_META[key];
          const count = sectionCounts[key];
          return (
            <Link
              key={key}
              to="/kholagy/liturgy/$liturgyKey"
              params={{ liturgyKey: key }}
              className={cn(
                "relative z-[5] flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-[18px] border px-2 py-3 text-center transition active:scale-[0.97] touch-manipulation cursor-pointer",
                meta.card,
              )}
              style={{ boxShadow: `0 0 0 1px ${meta.glow}55` }}
            >
              <Church className="h-5 w-5 pointer-events-none" style={{ color: meta.accent }} />
              <span className="font-arabic-serif text-[11.5px] font-extrabold leading-snug text-[#2a1848] line-clamp-2 pointer-events-none">
                {meta.labelShort}
              </span>
              {count ? (
                <span className="text-[10px] font-semibold text-[#5a3d92]/70 pointer-events-none">
                  {count} مقطع
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}



function KholagyCategoryHubCard({

  category,

  hymnCount,

}: {

  category: KholagyBrowseCategory;

  hymnCount: number;

}) {

  const accent = kholagyAccentForCategory(category);

  const liftShadow =

    "0 14px 28px -16px rgba(90,50,120,0.32), inset 0 1px 0 rgba(255,255,255,0.58)";



  return (

    <Link

      to="/kholagy/category/$category"

      params={{ category }}

      className={cn(

        "group relative flex items-center gap-4 overflow-hidden rounded-[24px] border px-4 py-4 min-h-[88px] transition duration-300 active:scale-[0.98]",

        accent.card,

      )}

      style={{

        boxShadow: `0 0 0 1px ${accent.glow}66, ${liftShadow}`,

      }}

    >

      <span

        className={cn(

          "grid h-[56px] w-[56px] shrink-0 place-items-center rounded-2xl border border-white/65",

          "shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_-10px_rgba(90,50,120,0.35)]",

          accent.iconBg,

        )}

      >

        <Music2 className={cn("h-7 w-7", accent.iconColor)} />

      </span>

      <div className="min-w-0 flex-1 text-right">

        <div className={cn("font-arabic-serif text-[16px] font-extrabold leading-snug", accent.title)}>

          {KHOLAGY_CATEGORY_LABEL[category]}

        </div>

        <div className={cn("mt-0.5 text-[11.5px] font-medium", accent.meta)}>

          {hymnCount} {hymnCount === 1 ? "لحن" : "ألحان"}

        </div>

      </div>

      <ChevronLeft className={cn("h-4 w-4 shrink-0", accent.iconColor)} />

    </Link>

  );

}



function KholagyHome() {

  const router = useRouter();

  const { data: groups = [], isPending, isError } = useQuery(kholagyGroupsQueryOptions());

  const { data: liturgySummaries = [], isPending: liturgyPending } = useQuery(

    kholagyLiturgySummariesQueryOptions(),

  );

  const [lastHymn, setLastHymn] = useState(() => readLastOpenedKholagy());

  const [lastLiturgy, setLastLiturgy] = useState(() => readLastOpenedKholagyLiturgy());



  useEffect(() => {

    setLastHymn(readLastOpenedKholagy());

    setLastLiturgy(readLastOpenedKholagyLiturgy());

  }, []);



  const liturgyKeys = useMemo((): KholagyLiturgyKey[] => {

    if (liturgySummaries.length) {

      return KHOLAGY_LITURGY_ORDER.filter((key) =>

        liturgySummaries.some((s) => s.liturgyKey === key),

      );

    }

    return KHOLAGY_LITURGY_ORDER;

  }, [liturgySummaries]);



  const liturgySectionCounts = useMemo(() => {

    const map: Partial<Record<KholagyLiturgyKey, number>> = {};

    for (const summary of liturgySummaries) {

      map[summary.liturgyKey] = summary.sectionCount;

    }

    return map;

  }, [liturgySummaries]);



  const categoryCounts = useMemo(() => {

    const counts: Partial<Record<KholagyBrowseCategory, number>> = {};

    for (const g of groups) {

      if (g.category === "liturgy") continue;

      const cat = g.category as KholagyBrowseCategory;

      counts[cat] = (counts[cat] ?? 0) + 1;

    }

    return counts;

  }, [groups]);



  const goBack = () => {

    const idx =

      typeof window !== "undefined"

        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)

        : 0;

    if (idx > 0) {

      router.history.back();

      return;

    }

    void router.navigate({ to: "/home" });

  };



  return (

    <div dir="rtl" className="relative min-h-[100dvh] bg-[#f6f0ff] text-[#2a1848] pb-36">

      <CopticWatermark tone="light" />



      <header

        className="sticky top-0 z-30 border-b border-[#d4c4f0]/60 bg-[#faf7ff]/90 backdrop-blur-xl"

        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}

      >

        <div className="mx-auto flex max-w-[var(--alpha-content-max-width)] items-center justify-between px-4 py-3">

          <button

            type="button"

            onClick={goBack}

            aria-label="رجوع"

            className="grid h-10 w-10 place-items-center rounded-full border border-[#c4b0e8]/50 bg-white/70 text-[#5a3d92] active:scale-95"

          >

            <ChevronLeft className="h-4 w-4 -scale-x-100" />

          </button>

          <div className="text-center">

            <p className="text-[10px] font-bold tracking-wide text-[#8a6ec1]">✦ ALPHA ✦</p>

            <h1 className="font-arabic-serif text-[17px] font-extrabold text-[#3a2560]">الخولاجي المقدس</h1>

          </div>

          <div className="w-10" aria-hidden />

        </div>

      </header>



      <main className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">

        <section className="relative overflow-hidden rounded-[28px] border border-[#9b7ad4]/35 shadow-[0_24px_48px_-28px_rgba(90,50,120,0.55)]">

          <img src={heroArt} alt="" className="absolute inset-0 h-full w-full object-cover" />

          <div

            aria-hidden

            className="absolute inset-0"

            style={{

              background:

                "linear-gradient(135deg, rgba(58,37,96,0.92) 0%, rgba(90,61,146,0.78) 45%, rgba(184,137,58,0.55) 100%)",

            }}

          />

          <div className="relative px-5 py-7 sm:px-7 sm:py-9">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[11px] font-bold tracking-[0.12em] text-[#f0d78c]/90">KHOLAGY · ALHAN</p>

                <h2 className="mt-2 font-arabic-serif text-[26px] font-extrabold leading-tight text-white">

                  الخولاجي المقدس

                </h2>

                <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-white/82">

                  القداسات، التسبحة، الأوشيات، والذكصولوجيات — من قاعدة بيانات ألفا.

                </p>

              </div>

              <CopticCross className="shrink-0 text-[#f0d78c]" size={32} />

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              {[

                { icon: Church, label: "3 قداسات" },

                { icon: Music2, label: `${groups.length || "…"} لحن` },

                { icon: Sparkles, label: "عربي + قبطي" },

              ].map(({ icon: Icon, label }) => (

                <span

                  key={label}

                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm"

                >

                  <Icon className="h-3.5 w-3.5 text-[#f0d78c]" />

                  {label}

                </span>

              ))}

            </div>

          </div>

        </section>



        {(lastLiturgy || lastHymn) && (

          <div className="mt-4 space-y-2">

            {lastLiturgy ? (

              <Link

                to="/kholagy/liturgy/$liturgyKey/$sectionId"

                params={{

                  liturgyKey: lastLiturgy.liturgyKey as KholagyLiturgyKey,

                  sectionId: String(lastLiturgy.sectionId),

                }}

                className="flex items-center gap-3 rounded-2xl border border-[#e7c075]/45 bg-white/80 px-4 py-3.5 shadow-[0_10px_24px_-18px_rgba(90,50,120,0.35)] active:scale-[0.99]"

              >

                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#b8893a] to-[#8a5a1f] text-white">

                  <Clock className="h-5 w-5" />

                </span>

                <div className="min-w-0 flex-1">

                  <p className="text-[11px] font-bold text-[#b8893a]">تابع القداس</p>

                  <p className="truncate font-arabic-serif text-[14px] font-extrabold text-[#3a2560]">

                    {lastLiturgy.title}

                  </p>

                </div>

                <ChevronLeft className="h-4 w-4 shrink-0 text-[#b8893a]" />

              </Link>

            ) : null}

            {lastHymn ? (

              <Link

                to="/kholagy/$groupId"

                params={{ groupId: lastHymn.groupKey }}

                className="flex items-center gap-3 rounded-2xl border border-[#c4b0e8]/45 bg-white/80 px-4 py-3.5 shadow-[0_10px_24px_-18px_rgba(90,50,120,0.35)] active:scale-[0.99]"

              >

                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92] text-white">

                  <Clock className="h-5 w-5" />

                </span>

                <div className="min-w-0 flex-1">

                  <p className="text-[11px] font-bold text-[#8a6ec1]">تابع اللحن</p>

                  <p className="truncate font-arabic-serif text-[14px] font-extrabold text-[#3a2560]">

                    {lastHymn.title}

                  </p>

                </div>

                <ChevronLeft className="h-4 w-4 shrink-0 text-[#8a6ec1]" />

              </Link>

            ) : null}

          </div>

        )}



        <div className="mt-4 space-y-2">

          {liturgyPending ? (

            <div className="h-[180px] animate-pulse rounded-[24px] border border-[#d4c4f0]/50 bg-white/50" />

          ) : (

            <KholagyLiturgyHubCard liturgyKeys={liturgyKeys} sectionCounts={liturgySectionCounts} />

          )}



          {isPending ? (

            <div className="space-y-2">

              {[1, 2, 3].map((i) => (

                <div key={i} className="h-[88px] animate-pulse rounded-[24px] border border-[#d4c4f0]/50 bg-white/50" />

              ))}

            </div>

          ) : isError ? (

            <div className="rounded-3xl border border-[#d4c4f0] bg-white p-8 text-center">

              <Heart className="mx-auto h-8 w-8 text-[#8a6ec1]" />

              <p className="mt-3 font-arabic-serif text-[16px] font-bold">تعذّر تحميل الخولاجي</p>

            </div>

          ) : (

            KHOLAGY_HUB_CATEGORIES.map((cat) => {

              const count = categoryCounts[cat] ?? 0;

              if (count === 0) return null;

              return <KholagyCategoryHubCard key={cat} category={cat} hymnCount={count} />;

            })

          )}

        </div>



        <div className="mt-10 flex items-center justify-center gap-2 pb-4 text-[11px] text-[#8a6ec1]/80">

          <ChevronRight className="h-3 w-3" />

          <span>اضغط على أي قسم للتصفح والقراءة مع التمرير التلقائي</span>

        </div>

      </main>



      <BottomDock />

    </div>

  );

}


