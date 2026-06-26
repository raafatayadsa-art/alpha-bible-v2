import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Church, Heart } from "lucide-react";
import {
  KHOLAGY_LITURGY_META,
  kholagyLiturgySectionsQueryOptions,
  parseLiturgyRouteKey,
} from "@/features/kholagy";
import { CopticWatermark } from "@/components/coptic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kholagy/liturgy/$liturgyKey")({
  ssr: false,
  head: ({ params }) => {
    const liturgyKey = parseLiturgyRouteKey(params.liturgyKey);
    const meta = liturgyKey ? KHOLAGY_LITURGY_META[liturgyKey] : null;
    return {
      meta: [
        { title: `ألفا — ${meta?.labelAr ?? "القداس"}` },
        { name: "description", content: "مقاطع القداس — قراءة هادئة مع تمرير تلقائي." },
      ],
    };
  },
  component: KholagyLiturgySections,
});

function KholagyLiturgySections() {
  const { liturgyKey: rawKey } = Route.useParams();
  const liturgyKey = parseLiturgyRouteKey(rawKey);
  const router = useRouter();
  const { data: sections = [], isPending, isError } = useQuery({
    ...kholagyLiturgySectionsQueryOptions(liturgyKey ?? "cyril"),
    enabled: Boolean(liturgyKey),
  });

  if (!liturgyKey) throw notFound();

  const meta = KHOLAGY_LITURGY_META[liturgyKey];

  const goBack = () => {
    const idx =
      typeof window !== "undefined"
        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)
        : 0;
    if (idx > 0) {
      router.history.back();
      return;
    }
    void router.navigate({ to: "/kholagy" });
  };

  return (
    <div dir="rtl" className="relative min-h-[100dvh] bg-[#f6f0ff] text-[#2a1848] pb-24">
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
            <p className="text-[10px] font-bold tracking-wide text-[#8a6ec1]">✦ LITURGY ✦</p>
            <h1 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2560]">{meta.labelShort}</h1>
          </div>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        <section
          className={cn(
            "relative overflow-hidden rounded-[24px] border p-5 shadow-[0_16px_36px_-24px_rgba(90,50,120,0.45)]",
            meta.card,
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/60",
                meta.iconBg,
              )}
            >
              <Church className="h-7 w-7" style={{ color: meta.accent }} />
            </span>
            <div>
              <h2 className="font-arabic-serif text-[18px] font-extrabold leading-snug text-[#2a1848]">
                {meta.labelAr}
              </h2>
              <p className="mt-1 text-[12px] font-medium text-[#5a3d92]/80">
                {sections.length || "…"} مقطع — اختر مقطعاً للقراءة
              </p>
            </div>
          </div>
        </section>

        {isPending ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl border border-[#d4c4f0]/50 bg-white/50" />
            ))}
          </div>
        ) : isError || sections.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#d4c4f0] bg-white p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-[#8a6ec1]" />
            <p className="mt-3 font-arabic-serif text-[16px] font-bold">تعذّر تحميل مقاطع القداس</p>
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {sections.map((section, i) => (
              <li key={section.id}>
                <Link
                  to="/kholagy/liturgy/$liturgyKey/$sectionId"
                  params={{ liturgyKey, sectionId: String(section.id) }}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-[#c4b0e8]/40 bg-white/85 px-4 py-3.5 text-right shadow-[0_8px_20px_-16px_rgba(90,50,120,0.3)] transition active:scale-[0.99] touch-manipulation"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.glow}cc)` }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-arabic-serif text-[14px] font-bold leading-snug text-[#3a2560] line-clamp-2">
                      {section.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#8a6ec1]">
                      {section.blockCount} {section.blockCount === 1 ? "فقرة" : "فقرات"}
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-[#8a6ec1]" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
