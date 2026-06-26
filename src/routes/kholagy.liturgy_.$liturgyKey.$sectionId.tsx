import { createFileRoute, Link, notFound, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AutoScrollControls,
  ChapterReadingScrollRail,
  ReaderArticleProgress,
} from "@/components/bible";
import { CopticDivider, CopticWatermark } from "@/components/coptic";
import { bindScroll } from "@/lib/chapter-scroll";
import { useTypographyPrefs } from "@/lib/reading-state";
import { cn } from "@/lib/utils";
import {
  adjacentLiturgySections,
  computeKholagyScrollState,
  fetchKholagyLiturgySection,
  filterLiturgyBlocks,
  KholagyLiturgyBlockRow,
  KholagyReaderHeaderActions,
  KholagyReadingCardStyles,
  KHOLAGY_LITURGY_META,
  kholagyLiturgySectionsQueryOptions,
  parseLiturgyRouteKey,
  readKholagyPosition,
  saveKholagyPosition,
  saveLastOpenedKholagyLiturgy,
  useKholagyDisplayMode,
  useKholagyTheme,
  type KholagyDisplayMode,
  type KholagyLiturgyBlock,
  type KholagyLiturgySection,
} from "@/features/kholagy";

export const Route = createFileRoute("/kholagy/liturgy_/$liturgyKey/$sectionId")({
  ssr: false,
  loader: async ({ params }) => {
    const liturgyKey = parseLiturgyRouteKey(params.liturgyKey);
    const sectionId = Number(params.sectionId);
    if (!liturgyKey || !Number.isFinite(sectionId)) throw notFound();
    const section = await fetchKholagyLiturgySection(liturgyKey, sectionId);
    if (!section) throw notFound();
    return { liturgyKey, section };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `ألفا — ${loaderData?.section.title ?? "القداس"}`,
      },
      { name: "description", content: "قراءة مقطع من القداس — عربي وقبطي وإنجليزي." },
    ],
  }),
  component: KholagyLiturgyReader,
});

type BlockSection = {
  id: string;
  label: string;
  block: KholagyLiturgyBlock;
};

function blockSectionId(block: KholagyLiturgyBlock): string {
  return `block-${block.id}`;
}

function buildBlockSections(section: KholagyLiturgySection, mode: KholagyDisplayMode): BlockSection[] {
  return filterLiturgyBlocks(section.blocks, mode).map((block, i) => ({
    id: blockSectionId(block),
    label: block.roleLabelAr ?? `فقرة ${i + 1}`,
    block,
  }));
}

function liturgyPositionKey(liturgyKey: string, sectionId: number): string {
  return `liturgy:${liturgyKey}:${sectionId}`;
}

function KholagyLiturgyReader() {
  const { liturgyKey, section } = Route.useLoaderData();
  const { sectionId: sectionIdParam } = Route.useParams();
  const sectionId = Number(sectionIdParam);
  const meta = KHOLAGY_LITURGY_META[liturgyKey];
  const navigate = useNavigate();
  const posKey = liturgyPositionKey(liturgyKey, sectionId);
  const freshStartId = useRouterState({
    select: (s) =>
      (s.location.state as { kholagyLiturgyFreshStart?: string } | undefined)?.kholagyLiturgyFreshStart ?? null,
  });

  const { data: allSections = [] } = useQuery(kholagyLiturgySectionsQueryOptions(liturgyKey));
  const { prev, next } = useMemo(
    () => adjacentLiturgySections(allSections, sectionId),
    [allSections, sectionId],
  );

  const [displayMode, setDisplayMode] = useKholagyDisplayMode();
  const [displayPickerOpen, setDisplayPickerOpen] = useState(false);

  const sections = useMemo(
    () => buildBlockSections(section, displayMode),
    [section, displayMode],
  );
  const [theme, setTheme] = useKholagyTheme();
  const dark = theme === "dark";
  const { prefs, setPrefs } = useTypographyPrefs();
  const fontSize = prefs.fontSize;
  const lineHeight = prefs.lineHeight;
  const setFontSize = (n: number) => setPrefs({ ...prefs, fontSize: n });
  const setLineHeight = (n: number) => setPrefs({ ...prefs, lineHeight: n });

  const [activeId, setActiveId] = useState("");
  const [sectionFills, setSectionFills] = useState<number[]>([]);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const lockUntilRef = useRef(0);
  const freshStartRef = useRef<string | null>(null);
  const chromeTimer = useRef<number | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setScrollRoot(scrollerRef.current);
  }, [sectionId, sections.length]);

  useEffect(() => {
    saveLastOpenedKholagyLiturgy(liturgyKey, sectionId, section.title);
  }, [liturgyKey, sectionId, section.title]);

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
    setSectionFills(sections.map(() => 0));
  }, [sectionId, sections]);

  const showChrome = useCallback(() => {
    setChromeVisible(true);
    if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 5000);
  }, []);

  useEffect(() => {
    showChrome();
    window.addEventListener("pointerdown", showChrome, { passive: true });
    window.addEventListener("touchstart", showChrome, { passive: true });
    window.addEventListener("keydown", showChrome);
    window.addEventListener("wheel", showChrome, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", showChrome);
      window.removeEventListener("touchstart", showChrome);
      window.removeEventListener("keydown", showChrome);
      window.removeEventListener("wheel", showChrome);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    };
  }, [showChrome]);

  useEffect(() => {
    if (!scrollRoot) return;
    return bindScroll(scrollRoot, showChrome);
  }, [scrollRoot, showChrome]);

  const openAdjacent = useCallback(
    (targetId: number) => {
      const freshKey = `${liturgyKey}:${targetId}`;
      freshStartRef.current = freshKey;
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
      void navigate({
        to: "/kholagy/liturgy/$liturgyKey/$sectionId",
        params: { liturgyKey, sectionId: String(targetId) },
        state: { kholagyLiturgyFreshStart: freshKey },
      });
    },
    [navigate, liturgyKey],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || sections.length === 0) return;

    const freshKey = `${liturgyKey}:${sectionId}`;
    const forceFresh = freshStartRef.current === freshKey || freshStartId === freshKey;
    const pos = readKholagyPosition(posKey);
    const shouldRestore = !forceFresh && Boolean(pos && pos.scrollPercent > 0.001);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (shouldRestore && pos) {
          el.scrollTop = pos.scrollPercent * Math.max(0, el.scrollHeight - el.clientHeight);
        } else {
          el.scrollTop = 0;
          if (forceFresh) {
            saveKholagyPosition(posKey, { scrollPercent: 0, updatedAt: Date.now() });
          }
        }
        if (forceFresh) {
          freshStartRef.current = null;
          if (freshStartId === freshKey) {
            void navigate({
              to: "/kholagy/liturgy/$liturgyKey/$sectionId",
              params: { liturgyKey, sectionId: String(sectionId) },
              replace: true,
              state: {},
            });
          }
        }
        el.dispatchEvent(new Event("scroll"));
      });
    });
  }, [sectionId, sections.length, freshStartId, navigate, liturgyKey, posKey]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || sections.length === 0) return;
    let raf = 0;
    let lastSave = 0;
    const sectionIds = sections.map((s) => s.id);

    const recompute = () => {
      const state = computeKholagyScrollState(root, sectionIds);
      setSectionFills((prev) => {
        if (prev.length !== state.fills.length || prev.some((v, i) => Math.abs(v - state.fills[i]!) > 0.008)) {
          return state.fills;
        }
        return prev;
      });
      if (Date.now() >= lockUntilRef.current) {
        setActiveId((prev) => (prev === state.activeId ? prev : state.activeId));
      }
      const now = Date.now();
      if (now - lastSave > 400) {
        lastSave = now;
        saveKholagyPosition(posKey, { scrollPercent: state.progress, updatedAt: now });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };

    recompute();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    ro.observe(root);
    const article = root.querySelector("article");
    if (article) ro.observe(article);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [sections, posKey]);

  useEffect(() => {
    const rail = chipsRef.current;
    if (!rail) return;
    const chip = rail.querySelector(`[data-chip="${activeId}"]`) as HTMLElement | null;
    chip?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const jumpTo = (id: string) => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector(`[data-section-id="${CSS.escape(id)}"]`) as HTMLElement | null;
    if (!el) return;
    setActiveId(id);
    lockUntilRef.current = Date.now() + 700;
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const target = root.scrollTop + (elRect.top - rootRect.top) - 12;
    const max = Math.max(0, root.scrollHeight - root.clientHeight);
    root.scrollTo({ top: Math.max(0, Math.min(max, target)), behavior: "smooth" });
  };

  const activeIndex = Math.max(1, sections.findIndex((s) => s.id === activeId) + 1);
  const chromeHidden = !chromeVisible;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${section.title} — ${meta.labelShort}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setNotice("تم نسخ الرابط");
      setTimeout(() => setNotice(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "relative flex h-dvh flex-col overflow-hidden transition-colors",
        dark ? "bg-[#0c1024] text-[#ece6ff]" : "bg-[#f6f0ff] text-[#2a1848]",
      )}
    >
      <CopticWatermark tone={dark ? "dark" : "light"} />
      <KholagyReadingCardStyles />

      <header
        className={cn(
          "sticky top-0 z-30 border-b backdrop-blur-xl",
          dark ? "border-white/10 bg-[#121836]/85" : "border-[#c4b0e8]/35 bg-[#faf7ff]/90",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="relative mx-auto flex max-w-[var(--alpha-reader-max-width)] items-center justify-between px-3 py-3">
          <Link
            to="/kholagy/liturgy/$liturgyKey"
            params={{ liturgyKey }}
            aria-label="رجوع لمقاطع القداس"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border active:scale-95",
              dark
                ? "border-white/15 bg-white/5 text-[#c4b0ff]"
                : "border-[#c4b0e8]/45 bg-white/70 text-[#5a3d92]",
            )}
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="pointer-events-none absolute inset-x-14 flex flex-col items-center text-center">
            <h1 className="font-arabic-serif flex items-center justify-center gap-2 text-[15px] font-bold leading-tight">
              <span className={cn("text-[13px]", dark ? "text-[#c4b0ff]/70" : "text-[#8a6ec1]/75")} aria-hidden>
                Ⲁ
              </span>
              <span className="line-clamp-2">{section.title}</span>
              <span className={cn("text-[13px]", dark ? "text-[#c4b0ff]/70" : "text-[#8a6ec1]/75")} aria-hidden>
                Ⲱ
              </span>
            </h1>
            <p className={cn("mt-0.5 text-[11px]", dark ? "text-white/50" : "text-[#6a5488]")}>
              {meta.labelShort} · {sections.length} {sections.length === 1 ? "فقرة" : "فقرات"}
            </p>
          </div>
          <KholagyReaderHeaderActions
            dark={dark}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            displayPickerOpen={displayPickerOpen}
            onDisplayPickerOpenChange={setDisplayPickerOpen}
            onShare={() => void handleShare()}
          />
        </div>

        {sections.length > 3 ? (
          <div
            ref={chipsRef}
            className="mx-auto flex max-w-[var(--alpha-reader-max-width)] gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar"
          >
            {sections.map((s, i) => {
              const fill = sectionFills[i] ?? 0;
              const active = s.id === activeId;
              const completed = !active && fill >= 0.999;
              return (
                <button
                  key={s.id}
                  type="button"
                  data-chip={s.id}
                  onClick={() => jumpTo(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                    active
                      ? "border-[#8a6ec1] bg-gradient-to-br from-[#8a6ec1] to-[#5a3d92] text-white"
                      : completed
                        ? dark
                          ? "border-[#8a6ec1]/45 bg-[#7a5cb0]/28 text-white/85"
                          : "border-[#8a6ec1]/40 bg-[#8a6ec1]/15 text-[#5a3d92]"
                        : dark
                          ? "border-white/10 bg-white/5 text-white/75"
                          : "border-[#c4b0e8]/35 bg-white/60 text-[#5a3d92]",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <ReaderArticleProgress
          spiritualMode={dark}
          scrollRoot={scrollRoot}
          articleRef={articleRef}
          positionLabel={`${activeIndex} من ${sections.length}`}
          enabled={sections.length > 0}
        />
      </header>

      <main
        ref={scrollerRef}
        className="relative min-h-0 flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        <div ref={contentRef} className="relative mx-auto max-w-[min(100%,920px)]">
          <article
            ref={articleRef}
            className="relative px-2 pb-44 pt-4 sm:px-4 font-arabic-serif"
            style={{ fontSize, lineHeight }}
          >
            <div className="kholagy-reader-sections">
              {sections.map((s, i) => (
                <div key={s.id}>
                  {i > 0 ? <CopticDivider tone={dark ? "dark" : "light"} className="my-0.5" /> : null}
                  <section data-section-id={s.id} className="scroll-mt-4 pb-0.5">
                    <KholagyLiturgyBlockRow
                      block={s.block}
                      mode={displayMode}
                      dark={dark}
                      active={s.id === activeId}
                    />
                  </section>
                </div>
              ))}
            </div>

            <CopticDivider tone={dark ? "dark" : "light"} className="mt-8" />
            <p className={cn("pb-2 text-center text-[12px]", dark ? "text-white/50" : "text-[#8a6ec1]")}>
              نهاية المقطع — المجد لله إلى الأبد
            </p>

            <nav className="mt-6 flex items-center justify-between gap-3">
              {prev ? (
                <button
                  type="button"
                  onClick={() => openAdjacent(prev.id)}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-right active:scale-[0.98]",
                    dark
                      ? "border-white/10 bg-white/5 text-[#c4b0ff]"
                      : "border-[#c4b0e8]/40 bg-white/75 text-[#3a2560]",
                  )}
                >
                  <ChevronRight className="h-4 w-4 -scale-x-100" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] opacity-70">المقطع السابق</div>
                    <div className="truncate text-[13px] font-bold">{prev.title}</div>
                  </div>
                </button>
              ) : (
                <div className="flex-1" />
              )}
              {next ? (
                <button
                  type="button"
                  onClick={() => openAdjacent(next.id)}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left active:scale-[0.98]",
                    dark
                      ? "border-white/10 bg-white/5 text-[#c4b0ff]"
                      : "border-[#c4b0e8]/40 bg-white/75 text-[#3a2560]",
                  )}
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="text-[10.5px] opacity-70">المقطع التالي</div>
                    <div className="truncate text-[13px] font-bold">{next.title}</div>
                  </div>
                  <ChevronLeft className="h-4 w-4 -scale-x-100" />
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </nav>
          </article>
        </div>
      </main>

      <ChapterReadingScrollRail
        scrollRoot={scrollRoot}
        contentRef={contentRef}
        articleRef={articleRef}
        spiritualMode={dark}
        tone="kholagy"
      />

      <AutoScrollControls
        spiritualMode={dark}
        onToggleSpiritual={() => setTheme(dark ? "light" : "dark")}
        scrollContainer={scrollRoot}
        bottomClass="bottom-[88px]"
        hidden={chromeHidden}
        barSize="comfort"
        tone="kholagy"
        fontSize={fontSize}
        setFontSize={(n) => setFontSize(Math.max(14, Math.min(34, n)))}
        fontMin={14}
        fontMax={34}
        fontStep={1}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
      />

      {notice ? (
        <div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[12px] font-semibold text-white shadow-lg"
          role="status"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}

function NotFoundView() {
  return (
    <div dir="rtl" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f6f0ff] px-6 text-center">
      <p className="font-arabic-serif text-[18px] font-bold text-[#3a2560]">لم يُعثر على هذا المقطع</p>
      <Link to="/kholagy" className="rounded-full bg-[#5a3d92] px-5 py-2.5 text-[13px] font-bold text-white">
        العودة للخولاجي
      </Link>
    </div>
  );
}

Route.notFoundComponent = NotFoundView;
