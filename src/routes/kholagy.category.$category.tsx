import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Heart, Music2 } from "lucide-react";
import { useMemo } from "react";
import {
  KHOLAGY_CATEGORY_LABEL,
  kholagyAccentForGroup,
  kholagyGroupsQueryOptions,
  parseKholagyBrowseCategory,
  type KholagyBrowseCategory,
  type KholagyGroup,
} from "@/features/kholagy";
import { CopticWatermark } from "@/components/coptic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kholagy/category/$category")({
  ssr: false,
  loader: ({ params }) => {
    const category = parseKholagyBrowseCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `ألفا — ${loaderData ? KHOLAGY_CATEGORY_LABEL[loaderData.category] : "الخولاجي"}`,
      },
      { name: "description", content: "ألحان الخولاجي — قراءة هادئة مع تمرير تلقائي." },
    ],
  }),
  component: KholagyCategoryBrowse,
});

function KholagyGroupCard({ group, indexInCategory }: { group: KholagyGroup; indexInCategory: number }) {
  const accent = kholagyAccentForGroup(group.category, indexInCategory);
  const liftShadow =
    "0 14px 28px -16px rgba(90,50,120,0.32), inset 0 1px 0 rgba(255,255,255,0.58)";

  return (
    <Link
      to="/kholagy/$groupId"
      params={{ groupId: group.key }}
      className={cn(
        "group relative block overflow-hidden rounded-[24px] border p-4 pt-5 min-h-[156px] transition duration-300 active:scale-[0.98]",
        accent.card,
      )}
      style={{
        boxShadow: `0 0 0 1px ${accent.glow}66, ${liftShadow}`,
      }}
    >
      <div className="relative flex flex-col items-center text-center gap-2.5">
        <span
          className={cn(
            "grid h-[60px] w-[60px] place-items-center rounded-full border border-white/65",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_-10px_rgba(90,50,120,0.35)]",
            accent.iconBg,
          )}
        >
          <Music2 className={cn("h-8 w-8", accent.iconColor)} />
        </span>
        <div className="space-y-0.5">
          <div className={cn("font-arabic-serif text-[16px] font-extrabold leading-snug line-clamp-2", accent.title)}>
            {group.title}
          </div>
          <div className={cn("text-[11.5px] font-medium", accent.meta)}>
            {group.verseCount} {group.verseCount === 1 ? "قطعة" : "قطع"}
          </div>
        </div>
      </div>
      <span
        className={cn(
          "absolute bottom-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full text-[10px]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
          accent.chev,
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function KholagyCategoryBrowse() {
  const { category } = Route.useLoaderData() as { category: KholagyBrowseCategory };
  const router = useRouter();
  const { data: groups = [], isPending, isError } = useQuery(kholagyGroupsQueryOptions());

  const items = useMemo(
    () => groups.filter((g) => g.category === category),
    [groups, category],
  );

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
            <p className="text-[10px] font-bold tracking-wide text-[#8a6ec1]">✦ KHOLAGY ✦</p>
            <h1 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2560]">
              {KHOLAGY_CATEGORY_LABEL[category]}
            </h1>
          </div>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        {isPending ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[156px] animate-pulse rounded-[24px] border border-[#d4c4f0]/50 bg-white/50" />
            ))}
          </div>
        ) : isError || items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#d4c4f0] bg-white p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-[#8a6ec1]" />
            <p className="mt-3 font-arabic-serif text-[16px] font-bold">لا توجد ألحان في هذا القسم</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((group, index) => (
              <KholagyGroupCard key={group.key} group={group} indexInCategory={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
