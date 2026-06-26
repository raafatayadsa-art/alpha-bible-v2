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
  adjacentKholagyGroups,
  computeKholagyScrollState,
  fetchKholagyGroup,
  KholagyReaderHeaderActions,
  KholagyReadingCardStyles,
  KholagyVerseRow,
  kholagyGroupsQueryOptions,
  readKholagyPosition,
  saveKholagyPosition,
  saveLastOpenedKholagy,
  useKholagyDisplayMode,
  useKholagyTheme,
  type KholagyGroup,
  type KholagyVerse,
} from "@/features/kholagy";

export const Route = createFileRoute("/kholagy/$groupId")({
  ssr: false,
  loader: async ({ params }) => {
    if (params.groupId === "liturgy" || params.groupId === "category") throw notFound();
    const group = await fetchKholagyGroup(params.groupId);
    if (!group) throw notFound();
    return { group };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `ألفا — ${loaderData?.group.title ?? "الخولاجي"}` },
      { name: "description", content: "قراءة الخولاجي المقدس — تسبحة وأوشيات." },
    ],
  }),
  component: KholagyReader,
});

type VerseSection = {
  id: string;
  label: string;
  verse: KholagyVerse;
};

function verseSectionId(verse: KholagyVerse): string {
  return `verse-${verse.id}`;
}

function buildSections(group: KholagyGroup): VerseSection[] {
  return group.verses.map((verse, i) => ({
    id: verseSectionId(verse),
    label: group.verses.length > 1 ? `قطعة ${i + 1}` : "النص",
    verse,
  }));
}

function KholagyReader() {
  const { group } = Route.useLoaderData() as { group: KholagyGroup };
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const freshStartId = useRouterState({
    select: (s) => (s.location.state as { kholagyFreshStart?: string } | undefined)?.kholagyFreshStart ?? null,
  });

  const { data: allGroups = [] } = useQuery(kholagyGroupsQueryOptions());
  const { prev, next } = useMemo(
    () => adjacentKholagyGroups(allGroups, groupId),
    [allGroups, groupId],
  );

  const sections = useMemo(() => buildSections(group), [group]);
  const [theme, setTheme] = useKholagyTheme();
  const dark = theme === "dark";
  const { prefs, setPrefs } = useTypographyPrefs();
  const fontSize = prefs.fontSize;
  const lineHeight = prefs.lineHeight;
  const setFontSize = (n: number) => setPrefs({ ...prefs, fontSize: n });
  const setLineHeight = (n: number) => setPrefs({ ...prefs, lineHeight: n });

  const [displayMode, setDisplayMode] = useKholagyDisplayMode();
  const [displayPickerOpen, setDisplayPickerOpen] = useState(false);
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
  }, [groupId, sections.length]);

  useEffect(() => {
    saveLastOpenedKholagy(groupId, group.title);
  }, [groupId, group.title]);

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
    setSectionFills(sections.map(() => 0));
  }, [groupId, sections]);

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
    (targetKey: string) => {
      freshStartRef.current = targetKey;
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
      void navigate({
        to: "/kholagy/$groupId",
        params: { groupId: targetKey },
        state: { kholagyFreshStart: targetKey },
      });
    },
    [navigate],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || sections.length === 0) return;

    const forceFresh = freshStartRef.current === groupId || freshStartId === groupId;
    const pos = readKholagyPosition(groupId);
    const shouldRestore = !forceFresh && Boolean(pos && pos.scrollPercent > 0.001);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (shouldRestore && pos) {
          el.scrollTop = pos.scrollPercent * Math.max(0, el.scrollHeight - el.clientHeight);
        } else {
          el.scrollTop = 0;
          if (forceFresh) {
            saveKholagyPosition(groupId, { scrollPercent: 0, updatedAt: Date.now() });
          }
        }
        if (forceFresh) {
          freshStartRef.current = null;
          if (freshStartId === groupId) {
            void navigate({
              to: "/kholagy/$groupId",
              params: { groupId },
              replace: true,
              state: {},
            });
          }
        }
        el.dispatchEvent(new Event("scroll"));
      });
    });
  }, [groupId, sections.length, freshStartId, navigate]);

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
        saveKholagyPosition(groupId, { scrollPercent: state.progress, updatedAt: now });
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
  }, [sections, groupId]);

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
    const text = `${group.title} — الخولاجي المقدس`;
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

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dy) < 40 && Math.abs(dx) > 70) {
      if (dx < 0 && next) openAdjacent(next.key);
      else if (dx > 0 && prev) openAdjacent(prev.key);
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
            to="/kholagy"
            aria-label="رجوع للخولاجي"
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
            <h1 className="font-arabic-serif flex items-center justify-center gap-2 text-[16px] font-bold leading-tight">
              <span className={cn("text-[14px]", dark ? "text-[#c4b0ff]/70" : "text-[#8a6ec1]/75")} aria-hidden>Ⲁ</span>
              <span className="line-clamp-2">{group.title}</span>
              <span className={cn("text-[14px]", dark ? "text-[#c4b0ff]/70" : "text-[#8a6ec1]/75")} aria-hidden>Ⲱ</span>
            </h1>
            <p className={cn("mt-0.5 text-[11px]", dark ? "text-white/50" : "text-[#6a5488]")}>
              {group.verseCount} {group.verseCount === 1 ? "قطعة" : "قطع"} · الخولاجي المقدس
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

        {sections.length > 1 ? (
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
                    "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-95",
                    active
                      ? "border-[#8a6ec1] bg-gradient-to-br from-[#8a6ec1] to-[#5a3d92] text-white shadow-[0_6px_18px_-8px_rgba(122,92,176,0.7)]"
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
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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
                  {sections.length > 1 ? (
                    <h2
                      className={cn(
                        "mb-2 text-center text-[13px] font-bold tracking-wide",
                        dark ? "text-[#c4b0ff]/80" : "text-[#8a6ec1]",
                      )}
                    >
                      {s.label}
                    </h2>
                  ) : null}
                  <KholagyVerseRow
                    verse={s.verse}
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
              نهاية اللحن — المجد لله إلى الأبد
            </p>

            <nav className="mt-6 flex items-center justify-between gap-3">
              {prev ? (
                <button
                  type="button"
                  onClick={() => openAdjacent(prev.key)}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-right active:scale-[0.98]",
                    dark
                      ? "border-white/10 bg-white/5 text-[#c4b0ff]"
                      : "border-[#c4b0e8]/40 bg-white/75 text-[#3a2560]",
                  )}
                >
                  <ChevronRight className="h-4 w-4 -scale-x-100" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] opacity-70">السابق</div>
                    <div className="truncate text-[13px] font-bold">{prev.title}</div>
                  </div>
                </button>
              ) : (
                <div className="flex-1" />
              )}
              {next ? (
                <button
                  type="button"
                  onClick={() => openAdjacent(next.key)}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left active:scale-[0.98]",
                    dark
                      ? "border-white/10 bg-white/5 text-[#c4b0ff]"
                      : "border-[#c4b0e8]/40 bg-white/75 text-[#3a2560]",
                  )}
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="text-[10.5px] opacity-70">التالي</div>
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
      <p className="font-arabic-serif text-[18px] font-bold text-[#3a2560]">لم يُعثر على هذا اللحن</p>
      <Link to="/kholagy" className="rounded-full bg-[#5a3d92] px-5 py-2.5 text-[13px] font-bold text-white">
        العودة للخولاجي
      </Link>
    </div>
  );
}

Route.notFoundComponent = NotFoundView;
