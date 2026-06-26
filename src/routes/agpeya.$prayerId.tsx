import { createFileRoute, ErrorComponentProps, Link, notFound, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  X,
  Copy,
  Send,
  MessageCircle,
} from "lucide-react";
import { AutoScrollControls, ReaderArticleProgress } from "@/components/bible";
import {
  PresentationMode,
  DisplayButton,
  type PresentationContent,
} from "@/components/presentation/PresentationMode";
import {
  adjacentAgpeyaPrayers,
  AGPEYA_DRAFT_NOTICE,
  AgpeyaErrorState,
  AgpeyaNotFoundState,
  AgpeyaSkeleton,
  getAgpeyaPrayer,
  readPrayerPosition,
  readLastOpenedPrayer,
  savePrayerPosition,
  useAgpeyaAudio,
  useAgpeyaTheme,
  useSavedAgpeya,
  useAgpeyaSections,
  type AgpeyaSupabaseSection,
  isMidnightRoute,
  buildMidnightDisplayGroups,
  type MidnightDisplayGroup,
} from "@/features/agpeya";
import { useTypographyPrefs } from "@/lib/reading-state";
import { bindScroll } from "@/lib/chapter-scroll";
import type { AgpeyaPrayer } from "@/features/agpeya";
import { CopticDivider, CopticWatermark } from "@/components/coptic";
import { cn } from "@/lib/utils";

/* ---------- Lifecycle states ---------- */

function ReaderPending() {
  return <AgpeyaSkeleton />;
}

function ReaderNotFound() {
  return <AgpeyaNotFoundState />;
}

function ReaderError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <AgpeyaErrorState
      message={error?.message}
      onRetry={() => { router.invalidate(); reset(); }}
    />
  );
}

export const Route = createFileRoute("/agpeya/$prayerId")({
  ssr: false,
  head: ({ params }) => {
    const p = getAgpeyaPrayer(params.prayerId);
    return {
      meta: [
        { title: p ? `ألفا — ${p.title}` : "ألفا — الأجبية" },
        { name: "description", content: p?.subtitle ?? "قراءة صلوات الأجبية." },
      ],
    };
  },
  loader: ({ params }) => {
    const prayer = getAgpeyaPrayer(params.prayerId);
    if (!prayer) throw notFound();
    return { prayer };
  },
  pendingComponent: ReaderPending,
  errorComponent: ReaderError,
  notFoundComponent: ReaderNotFound,
  component: PrayerReader,
});

/* ---------- Section model ---------- */

interface PrayerSection {
  id: string;
  label: string;
  render: (ctx: { dark: boolean }) => React.ReactNode;
}

function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function buildSections(prayer: AgpeyaPrayer): PrayerSection[] {
  const out: PrayerSection[] = [];

  const text = prayer.tabs.text?.body ?? "";
  const paras = paragraphs(text);
  if (paras.length > 0) {
    const intro = paras.slice(0, Math.max(1, Math.ceil(paras.length / 2)));
    const thanks = paras.slice(intro.length);
    out.push({
      id: "intro",
      label: "مقدمة الساعة",
      render: ({ dark }) => <ProseCard dark={dark} paragraphs={intro} />,
    });
    if (thanks.length) {
      out.push({
        id: "thanksgiving",
        label: "صلاة الشكر",
        render: ({ dark }) => <ProseCard dark={dark} paragraphs={thanks} />,
      });
    }
  }

  const psalms = prayer.tabs.psalms?.psalms ?? [];
  const psalm50 = psalms.find((p) => p.number === 50);
  const otherPsalms = psalms.filter((p) => p !== psalm50);

  if (psalm50) {
    out.push({
      id: "psalm-50",
      label: "المزمور ٥٠",
      render: ({ dark }) => <PsalmCard dark={dark} psalm={psalm50} />,
    });
  }

  if (otherPsalms.length) {
    out.push({
      id: "psalms",
      label: "المزامير",
      render: ({ dark }) => (
        <div className="space-y-3">
          {otherPsalms.map((p, i) => (
            <PsalmCard key={`${p.number}-${i}`} dark={dark} psalm={p} />
          ))}
        </div>
      ),
    });
  }

  const gospel = prayer.tabs.gospel?.gospel ?? [];
  if (gospel.length) {
    out.push({
      id: "gospel",
      label: "الإنجيل",
      render: ({ dark }) => (
        <div className="space-y-3">
          {gospel.map((g, i) => (
            <GospelCard key={i} dark={dark} g={g} />
          ))}
        </div>
      ),
    });
  }

  const frags = prayer.tabs.fragments?.fragments ?? [];
  const creed = frags.find((f) => /قانون الإيمان|الإيمان/i.test(f.title));
  const otherFrags = frags.filter((f) => f !== creed);

  if (otherFrags.length) {
    out.push({
      id: "fragments",
      label: "القطع",
      render: ({ dark }) => (
        <div className="space-y-3">
          {otherFrags.map((f, i) => (
            <FragmentCard key={i} dark={dark} f={f} />
          ))}
        </div>
      ),
    });
  }

  if (creed) {
    out.push({
      id: "creed",
      label: "قانون الإيمان",
      render: ({ dark }) => <FragmentCard dark={dark} f={creed} />,
    });
  }

  const info = prayer.tabs.info?.info ?? [];
  const infoList = info.length ? info : buildInfoFallback(prayer);
  if (infoList.length) {
    out.push({
      id: "info",
      label: "معلومات",
      render: ({ dark }) => <InfoCard dark={dark} entries={infoList} />,
    });
  }

  return out;
}

function buildInfoFallback(p: AgpeyaPrayer) {
  const out: { label: string; value: string }[] = [];
  if (p.description) out.push({ label: "المعنى", value: p.description });
  if (p.clock) out.push({ label: "الوقت", value: p.clock });
  if (p.psalmsCount) out.push({ label: "عدد المزامير", value: `${p.psalmsCount} مزمور` });
  if (p.gospelCount) out.push({ label: "عدد القطع الإنجيلية", value: `${p.gospelCount} قطعة` });
  if (p.durationMin) out.push({ label: "زمن القراءة التقريبي", value: `${p.durationMin} دقيقة` });
  return out;
}

/* ---------- Reading cards ---------- */

function SectionShell({
  id, label, dark, children,
}: { id: string; label: string; dark: boolean; children: React.ReactNode }) {
  const gold = dark ? "text-[#f0d78c]/70" : "text-[#b8893a]/70";
  return (
    <section
      id={`section-${id}`}
      data-section-id={id}
      className="scroll-mt-32"
    >
      <header className="mb-3 flex items-center justify-center gap-2 px-1">
        <h2
          dir="ltr"
          className={cn(
            "font-arabic-serif flex items-center justify-center gap-2 text-[15px] font-extrabold tracking-tight text-center",
            dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
          )}
        >
          <span className={cn("text-[14px] font-bold leading-none", gold)} aria-hidden>Ⲁ</span>
          <span dir="rtl">{label}</span>
          <span className={cn("text-[14px] font-bold leading-none", gold)} aria-hidden>Ⲱ</span>
        </h2>
      </header>
      {children}
    </section>
  );
}

function GlassCard({
  dark, children, className,
}: { dark: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 backdrop-blur-xl transition-colors",
        dark
          ? "border-white/10 bg-white/[0.04] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-[#c79356]/25 bg-white/70 shadow-[0_10px_28px_-18px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.85)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProseCard({ dark, paragraphs }: { dark: boolean; paragraphs: string[] }) {
  return (
    <GlassCard dark={dark}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={cn(
            i < paragraphs.length - 1 && "mb-4",
            dark ? "text-[#e8e2cf]" : "text-[#2a1a08]",
          )}
        >
          {p}
        </p>
      ))}
    </GlassCard>
  );
}

function PsalmCard({
  dark, psalm,
}: { dark: boolean; psalm: { number: number; title?: string; verses: string[] } }) {
  return (
    <GlassCard dark={dark}>
      <header className="mb-3 flex items-center gap-2">
        <span className={cn(
          "grid h-9 w-9 place-items-center rounded-full text-[12px] font-extrabold tabular-nums",
          dark
            ? "bg-[#f0d78c] text-[#1a1208]"
            : "bg-gradient-to-br from-[#e7b35a] to-[#b87a22] text-white",
        )}>
          {psalm.number}
        </span>
        <div>
          <div className={cn("font-arabic-serif text-[14px] font-bold", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
            مزمور {psalm.number}
          </div>
          {psalm.title && (
            <div className={cn("text-[11px]", dark ? "text-white/55" : "text-[#8a5a1f]")}>
              {psalm.title}
            </div>
          )}
        </div>
      </header>
      <ol className="space-y-2.5">
        {psalm.verses.map((v, vi) => (
          <li key={vi} className="flex gap-2">
            <span className={cn(
              "shrink-0 select-none text-[11px] font-bold tabular-nums leading-relaxed",
              dark ? "text-[#f0d78c]/70" : "text-[#c79356]",
            )}>
              {vi + 1}
            </span>
            <span className={cn(dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>{v}</span>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}

function GospelCard({
  dark, g,
}: { dark: boolean; g: { reference: string; intro?: string; passage: string; conclusion?: string } }) {
  return (
    <GlassCard dark={dark}>
      <div className={cn(
        "mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
        dark ? "bg-[#f0d78c]/15 text-[#f0d78c]" : "bg-[#5a3d92]/10 text-[#5a3d92]",
      )}>
        {g.reference}
      </div>
      {g.intro && (
        <p className={cn("mb-4 text-[13.5px] italic", dark ? "text-white/65" : "text-[#7a5a32]")}>
          {g.intro}
        </p>
      )}
      {paragraphs(g.passage).map((para, pi) => (
        <p key={pi} className={cn("mb-3 last:mb-0", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
          {para}
        </p>
      ))}
      {g.conclusion && (
        <p className={cn("mt-3 text-center text-[12.5px] font-bold", dark ? "text-[#f0d78c]" : "text-[#5a3d92]")}>
          {g.conclusion}
        </p>
      )}
    </GlassCard>
  );
}

function FragmentCard({ dark, f }: { dark: boolean; f: { title: string; body: string } }) {
  return (
    <GlassCard dark={dark}>
      <h3 className={cn(
        "mb-2 font-arabic-serif text-[14px] font-bold",
        dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
      )}>
        {f.title}
      </h3>
      {f.body.split(/\n+/).map((line, li) => (
        <p key={li} className={cn("mb-2 last:mb-0", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
          {line}
        </p>
      ))}
    </GlassCard>
  );
}

function InfoCard({
  dark, entries,
}: { dark: boolean; entries: { label: string; value: string }[] }) {
  return (
    <GlassCard dark={dark} className="p-0 overflow-hidden">
      <dl className={cn("divide-y", dark ? "divide-white/10" : "divide-[#c79356]/20")}>
        {entries.map((e, i) => (
          <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
            <dt className={cn("shrink-0 text-[12px] font-bold", dark ? "text-[#f0d78c]/85" : "text-[#8a5a1f]")}>
              {e.label}
            </dt>
            <dd className={cn("text-[13.5px] flex-1", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
              {e.value}
            </dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
}

/* ---------- Reader ---------- */

function supabaseSectionToPrayerSection(
  s: AgpeyaSupabaseSection,
): PrayerSection {
  return {
    id: `sb-${s.id}`,
    label: s.title_ar,
    render: ({ dark }: { dark: boolean }) => (
      <ProseCard dark={dark} paragraphs={paragraphs(s.content_ar)} />
    ),
  };
}

function midnightGroupToPrayerSection(group: MidnightDisplayGroup): PrayerSection {
  return {
    id: `mn-${group.id}`,
    label: group.label,
    render: ({ dark }: { dark: boolean }) => (
      <div className="space-y-3">
        {group.rows.map((row) => {
          const showAsFragment =
            group.rows.length > 1 &&
            row.title_ar.trim() !== group.label.trim();

          if (showAsFragment) {
            return (
              <FragmentCard
                key={row.id}
                dark={dark}
                f={{ title: row.title_ar, body: row.content_ar }}
              />
            );
          }

          return (
            <ProseCard key={row.id} dark={dark} paragraphs={paragraphs(row.content_ar)} />
          );
        })}
      </div>
    ),
  };
}

function buildReaderSections(
  prayerId: string,
  rawSections: AgpeyaSupabaseSection[],
): PrayerSection[] {
  if (isMidnightRoute(prayerId)) {
    return buildMidnightDisplayGroups(rawSections, prayerId).map(midnightGroupToPrayerSection);
  }
  return rawSections.map(supabaseSectionToPrayerSection);
}

const SECTION_SCROLL_OFFSET = 12;

function querySectionEl(root: HTMLElement, sectionId: string): HTMLElement | null {
  return root.querySelector(`[data-section-id="${CSS.escape(sectionId)}"]`) as HTMLElement | null;
}

/** Shared scroll math for section tabs */
function computeAgpeyaScrollState(
  root: HTMLElement,
  sectionIds: string[],
): { progress: number; fills: number[]; activeId: string } | null {
  const els = sectionIds
    .map((id) => ({ id, el: querySectionEl(root, id) }))
    .filter((x): x is { id: string; el: HTMLElement } => !!x.el);
  if (!els.length) return null;

  const rootRect = root.getBoundingClientRect();
  const scrollTop = root.scrollTop;
  const maxScroll = Math.max(1, root.scrollHeight - root.clientHeight);
  const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));

  const positions = els.map(({ el }) =>
    scrollTop + el.getBoundingClientRect().top - rootRect.top,
  );

  const fills = positions.map((start, i) => {
    const adjStart = Math.max(0, start - SECTION_SCROLL_OFFSET);
    const adjEnd =
      i < positions.length - 1
        ? Math.max(adjStart + 1, positions[i + 1]! - SECTION_SCROLL_OFFSET)
        : Math.max(adjStart + 1, maxScroll + SECTION_SCROLL_OFFSET);
    if (scrollTop >= adjEnd) return 1;
    if (scrollTop <= adjStart) return 0;
    return (scrollTop - adjStart) / (adjEnd - adjStart);
  });

  let activeIndex = 0;
  for (let i = 0; i < positions.length; i++) {
    const adjStart = Math.max(0, positions[i]! - SECTION_SCROLL_OFFSET);
    if (scrollTop + 1 >= adjStart) activeIndex = i;
  }
  if (maxScroll > 8 && scrollTop >= maxScroll - 4) {
    activeIndex = positions.length - 1;
  }

  return { progress, fills, activeId: els[activeIndex]!.id };
}

function PrayerReader() {
  const { prayer } = Route.useLoaderData() as { prayer: AgpeyaPrayer };
  const { prayerId } = Route.useParams();
  const navigate = useNavigate();
  const adjacentFreshStartId = useRouterState({
    select: (s) =>
      (s.location.state as { agpeyaFreshStart?: string } | undefined)?.agpeyaFreshStart ?? null,
  });

  const { prev, next } = useMemo(() => adjacentAgpeyaPrayers(prayerId), [prayerId]);

  const sectionsState = useAgpeyaSections(prayerId);

  const sections: PrayerSection[] = useMemo(() => {
    if (sectionsState.status !== "success") return [];
    return buildReaderSections(prayerId, sectionsState.sections);
  }, [sectionsState, prayerId]);

  const { prefs, setPrefs } = useTypographyPrefs();
  const fontSize = prefs.fontSize;
  const lineHeight = prefs.lineHeight;
  const setFontSize = (n: number) => setPrefs({ ...prefs, fontSize: n });
  const setLineHeight = (n: number) => setPrefs({ ...prefs, lineHeight: n });
  const [theme, setTheme] = useAgpeyaTheme();
  const [sectionFills, setSectionFills] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const { isSaved, toggle } = useSavedAgpeya();

  useEffect(() => {
    setActiveId("");
    setSectionFills([]);
  }, [prayerId]);

  const [shareOpen, setShareOpen] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);

  const presentationContent: PresentationContent = useMemo(() => {
    const out: PresentationContent["sections"] = [];

    if (sectionsState.status === "success") {
      if (isMidnightRoute(prayerId)) {
        buildMidnightDisplayGroups(sectionsState.sections, prayerId).forEach((group) => {
          const body = group.rows
            .map((row) => {
              const heading =
                group.rows.length > 1 && row.title_ar.trim() !== group.label.trim()
                  ? `${row.title_ar}\n\n`
                  : "";
              return `${heading}${row.content_ar}`;
            })
            .join("\n\n");
          out.push({ title: group.label, body });
        });
      } else {
        sectionsState.sections.forEach((s) => {
          out.push({ title: s.title_ar, body: s.content_ar });
        });
      }
    }

    if (out.length === 0) {
      out.push({ title: prayer.title, body: prayer.subtitle ?? "" });
    }

    return { title: prayer.title, subtitle: prayer.subtitle, sections: out };
  }, [sectionsState, prayer, prayerId]);

  // Audio scaffolding — reserved for future player.
  const [, setAudioState] = useAgpeyaAudio();
  useEffect(() => { setAudioState({ prayerId, positionSec: 0 }); }, [prayerId, setAudioState]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  // Lock active chip during programmatic smooth scroll (prevents flicker on iPhone)
  const lockUntilRef = useRef<number>(0);
  /** Prev/next + swipe: prayer id that must open from the top */
  const freshStartPrayerRef = useRef<string | null>(null);
  const dark = theme === "dark";
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setScrollRoot(scrollerRef.current);
  }, [prayerId, sections.length, sectionsState.status]);

  const activeSectionIndex = useMemo(() => {
    const idx = sections.findIndex((s) => s.id === activeId);
    return idx >= 0 ? idx + 1 : 1;
  }, [sections, activeId]);

  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef<number | null>(null);
  useEffect(() => {
    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 5000);
    };
    show();
    window.addEventListener("pointerdown", show, { passive: true });
    window.addEventListener("touchstart", show, { passive: true });
    window.addEventListener("keydown", show);
    window.addEventListener("wheel", show, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
      window.removeEventListener("wheel", show);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!scrollRoot) return;
    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 5000);
    };
    return bindScroll(scrollRoot, show);
  }, [scrollRoot]);
  const chromeHidden = !chromeVisible;

  const openAdjacentPrayer = useCallback((targetPrayerId: string) => {
    freshStartPrayerRef.current = targetPrayerId;
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    void navigate({
      to: "/agpeya/$prayerId",
      params: { prayerId: targetPrayerId },
      state: { agpeyaFreshStart: targetPrayerId },
    });
  }, [navigate]);

  const handleAdjacentPrayerPress = useCallback((
    targetPrayerId: string,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    openAdjacentPrayer(targetPrayerId);
  }, [openAdjacentPrayer]);

  // Restore scroll only for the open (last-read) prayer; adjacent nav always starts at top
  useEffect(() => {
    if (sectionsState.status !== "success" || sections.length === 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    lockUntilRef.current = 0;
    const forceFreshStart =
      freshStartPrayerRef.current === prayerId || adjacentFreshStartId === prayerId;

    const last = readLastOpenedPrayer();
    const isOpenSession = last?.prayerId === prayerId;
    const pos = isOpenSession ? readPrayerPosition(prayerId) : null;
    const shouldRestore = !forceFreshStart && Boolean(pos && (pos.scrollPercent ?? 0) > 0.001);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (shouldRestore && pos) {
          el.scrollTop = pos.scrollPercent * Math.max(0, el.scrollHeight - el.clientHeight);
        } else {
          el.scrollTop = 0;
          setActiveId(sections[0]!.id);
          setSectionFills(sections.map(() => 0));
          if (forceFreshStart) {
            savePrayerPosition(prayerId, { tab: "text", scrollPercent: 0, updatedAt: Date.now() });
          }
        }

        if (forceFreshStart) {
          freshStartPrayerRef.current = null;
          if (adjacentFreshStartId === prayerId) {
            void navigate({
              to: "/agpeya/$prayerId",
              params: { prayerId },
              replace: true,
              state: {},
            });
          }
        }

        el.dispatchEvent(new Event("scroll"));
      });
    });
  }, [prayerId, sections, sectionsState.status, adjacentFreshStartId, navigate]);

  // Scroll: section tabs (shared logic)
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || sections.length === 0) return;
    let raf = 0;
    let lastSave = 0;
    const sectionIds = sections.map((s) => s.id);

    const recompute = () => {
      const state = computeAgpeyaScrollState(root, sectionIds);
      if (!state) return;

      setSectionFills((prev) => {
        if (
          prev.length !== state.fills.length
          || prev.some((v, i) => Math.abs(v - state.fills[i]!) > 0.008)
        ) {
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
        savePrayerPosition(prayerId, {
          tab: "text",
          scrollPercent: state.progress,
          updatedAt: now,
        });
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
    for (const id of sectionIds) {
      const el = querySectionEl(root, id);
      if (el) ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [sections, prayerId]);

  // Auto-center active chip in the rail
  useEffect(() => {
    const rail = chipsRef.current;
    if (!rail) return;
    const chip = rail.querySelector(`[data-chip="${activeId}"]`) as HTMLElement | null;
    if (chip) {
      chip.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);




  // Swipe navigation between prayers
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
      // RTL: swipe left (dx < 0) → next prayer; swipe right (dx > 0) → previous prayer
      if (dx < 0 && next) openAdjacentPrayer(next.id);
      else if (dx > 0 && prev) openAdjacentPrayer(prev.id);
    }
  };

  const jumpTo = (id: string) => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector(`[data-section-id="${CSS.escape(id)}"]`) as HTMLElement | null;
    if (!el) return;
    // Immediate visual feedback + lock against scroll-tracking flicker
    setActiveId(id);
    lockUntilRef.current = Date.now() + 700;
    try {
      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // Section header has its own breathing room; small gap is enough since
      // the sticky page header sits OUTSIDE this scroll container.
      const offset = 12;
      const target = root.scrollTop + (elRect.top - rootRect.top) - offset;
      const max = Math.max(0, root.scrollHeight - root.clientHeight);
      root.scrollTo({ top: Math.max(0, Math.min(max, target)), behavior: "smooth" });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[agpeya] jumpTo failed", err);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${prayer.title} — الأجبية`;

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: shareText, text: shareText, url: shareUrl });
        return;
      }
    } catch { /* fall through */ }
    setShareOpen(true);
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 1500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash("تم نسخ الرابط");
      setShareOpen(false);
    } catch { /* ignore */ }
  };




  return (
    <div
      dir="rtl"
      className={cn(
        "relative flex h-dvh flex-col overflow-hidden transition-colors",
        dark
          ? "bg-[#08131f] text-[#e8e2cf]"
          : "bg-[#f4ead8] text-[#3a2410]",
      )}
    >
      <CopticWatermark tone={dark ? "dark" : "light"} />
      {/* Top bar */}
      <header
        className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b",
          dark ? "bg-[#0b1a2c]/80 border-white/10" : "bg-[#fbf3e1]/85 border-[#c79356]/25",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="relative mx-auto flex max-w-[var(--alpha-reader-max-width)] items-center justify-between px-3 py-3">
          <Link
            to="/agpeya"
            aria-label="رجوع للأجبية"
            className={cn(
              "relative z-10 grid h-10 w-10 place-items-center rounded-full border active:scale-95",
              dark ? "bg-white/5 border-white/15 text-[#f0d78c]" : "bg-white/60 border-[#c79356]/35 text-[#8a5a1f]",
            )}
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="pointer-events-none absolute inset-x-14 flex flex-col items-center justify-center text-center">
            <h1
              dir="ltr"
              className="font-arabic-serif flex items-center justify-center gap-2 text-[17px] font-bold leading-tight"
            >
              <span className={cn("text-[15px] font-bold leading-none", dark ? "text-[#f0d78c]/75" : "text-[#b8893a]/75")} aria-hidden>Ⲁ</span>
              <span dir="rtl" className="truncate">{prayer.title}</span>
              <span className={cn("text-[15px] font-bold leading-none", dark ? "text-[#f0d78c]/75" : "text-[#b8893a]/75")} aria-hidden>Ⲱ</span>
            </h1>
            {(prayer.subtitle || isSaved(prayerId)) && (
              <p className={cn("mt-0.5 flex items-center justify-center gap-1.5 truncate text-[11px]", dark ? "text-white/55" : "text-[#7a5a32]")}>
                {prayer.subtitle}
                {isSaved(prayerId) && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    dark ? "bg-[#f0d78c]/20 text-[#f0d78c]" : "bg-[#5a3d92]/10 text-[#5a3d92]",
                  )}>
                    محفوظة
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="relative z-10 flex items-center gap-1.5">
            <DisplayButton tone={dark ? "dark" : "light"} onClick={() => setPresentOpen(true)} />
            <IconButton dark={dark} ariaLabel="مشاركة" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </IconButton>
            <IconButton
              dark={dark}
              ariaLabel={isSaved(prayerId) ? "إلغاء الحفظ" : "حفظ"}
              active={isSaved(prayerId)}
              onClick={() => {
                toggle(prayerId);
                flash(isSaved(prayerId) ? "تمت إزالة الحفظ" : "تم الحفظ");
              }}
            >
              <Bookmark className={cn("h-4 w-4", isSaved(prayerId) && "fill-current")} />
            </IconButton>
          </div>
        </div>

        {/* Section chip rail */}
        {sections.length > 0 && (
          <div
            ref={chipsRef}
            className={cn(
              "mx-auto flex max-w-[var(--alpha-reader-max-width)] gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar",
            )}
          >
            {sections.map((s, i) => {
              const fill = sectionFills[i] ?? 0;
              const active = s.id === activeId;
              const completed = !active && fill >= 0.999;
              const entering = !active && fill > 0.02 && fill < 0.999;
              return (
                <button
                  key={s.id}
                  type="button"
                  data-chip={s.id}
                  onClick={() => jumpTo(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all duration-300 active:scale-95",
                    active
                      ? "border-[#8a6bbf] bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92] text-white shadow-[0_6px_18px_-8px_rgba(122,92,176,0.7),0_0_14px_rgba(122,92,176,0.45)] ring-1 ring-[#b89dd9]/40"
                      : completed
                        ? dark
                          ? "border-[#8a6bbf]/45 bg-[#7a5cb0]/28 text-white/85 shadow-[0_0_10px_rgba(122,92,176,0.25)]"
                          : "border-[#8a6bbf]/40 bg-[#7a5cb0]/18 text-[#5a3d92] shadow-[0_0_8px_rgba(122,92,176,0.2)]"
                        : entering
                          ? dark
                            ? "border-[#8a6bbf]/35 bg-[#7a5cb0]/15 text-white/80"
                            : "border-[#8a6bbf]/30 bg-[#7a5cb0]/12 text-[#5a3d92]"
                          : dark
                            ? "border-white/10 bg-white/5 text-white/75"
                            : "border-[#c79356]/30 bg-white/55 text-[#5b3a18]",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        <ReaderArticleProgress
          spiritualMode={dark}
          scrollRoot={scrollRoot}
          articleRef={articleRef}
          positionLabel={`القسم ${activeSectionIndex} من ${sections.length}`}
          enabled={sections.length > 0}
        />
      </header>

      {/* Reader body */}
      <main
        ref={scrollerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative min-h-0 flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        <article
          ref={articleRef}
          className="relative mx-auto max-w-[var(--alpha-reader-max-width)] px-3 pb-44 pt-5 sm:px-5 font-arabic-serif"
          style={{ fontSize, lineHeight }}
        >
          {/* Draft notice */}
          <div className={cn(
            "mb-5 rounded-xl border px-3 py-2 text-center text-[11.5px] font-semibold",
            dark ? "border-[#f0d78c]/25 bg-[#f0d78c]/5 text-[#f0d78c]" : "border-[#c79356]/40 bg-[#fff7e0] text-[#8a5a1f]",
          )}>
            {AGPEYA_DRAFT_NOTICE}
          </div>

          {sectionsState.status === "loading" ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-32 animate-pulse rounded-2xl border",
                    dark ? "border-white/10 bg-white/5" : "border-[#c79356]/20 bg-white/40",
                  )}
                />
              ))}
            </div>
          ) : sectionsState.status === "error" ? (
            <EmptyTab
              dark={dark}
              message={`تعذّر تحميل محتوى الصلاة — ${sectionsState.message}`}
            />
          ) : sections.length === 0 ? (
            <EmptyTab dark={dark} message="لا يوجد محتوى لهذه الصلاة بعد." />
          ) : (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id}>
                  {i > 0 && <CopticDivider tone={dark ? "dark" : "light"} />}
                  <SectionShell id={s.id} label={s.label} dark={dark}>
                    {s.render({ dark })}
                  </SectionShell>
                </div>
              ))}
            </div>
          )}

          <CopticDivider tone={dark ? "dark" : "light"} className="mt-10" />
          <div className={cn(
            "flex flex-col items-center gap-2 pb-2 text-center text-[12px]",
            dark ? "text-white/55" : "text-[#8a5a1f]",
          )}>
            نهاية الصلاة — بركة الرب تشملكم
          </div>

          {/* Prev/Next prayer navigation (backup to swipe) */}
          <nav className="mt-6 flex items-center justify-between gap-3">
            {prev ? (
              <button
                type="button"
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => handleAdjacentPrayerPress(prev.id, e)}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-right transition-transform active:scale-[0.98]",
                  dark ? "border-white/10 bg-white/5 text-[#f0d78c]" : "border-[#c79356]/35 bg-white/70 text-[#5b3a18]",
                )}
              >
                <ChevronRight className="h-4 w-4 -scale-x-100" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] opacity-70">السابقة</div>
                  <div className="font-arabic-serif truncate text-[13.5px] font-bold">{prev.title}</div>
                </div>
              </button>
            ) : <div className="flex-1" />}
            {next ? (
              <button
                type="button"
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => handleAdjacentPrayerPress(next.id, e)}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left transition-transform active:scale-[0.98]",
                  dark ? "border-white/10 bg-white/5 text-[#f0d78c]" : "border-[#c79356]/35 bg-white/70 text-[#5b3a18]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] opacity-70">التالية</div>
                  <div className="font-arabic-serif truncate text-[13.5px] font-bold">{next.title}</div>
                </div>
                <ChevronLeft className="h-4 w-4 -scale-x-100" />
              </button>
            ) : <div className="flex-1" />}
          </nav>
        </article>
      </main>

      {/* Auto-scroll controller — unified bar (font + line spacing + theme + scroll) */}
      <AutoScrollControls
        spiritualMode={dark}
        onToggleSpiritual={() => setTheme(dark ? "light" : "dark")}
        scrollContainer={scrollRoot}
        bottomClass="bottom-[88px]"
        hidden={chromeHidden}
        barSize="comfort"
        fontSize={fontSize}
        setFontSize={(n) => setFontSize(Math.max(14, Math.min(34, n)))}
        fontMin={14}
        fontMax={34}
        fontStep={1}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
      />


      {/* Share fallback dialog */}
      {shareOpen && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShareOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-[var(--alpha-dock-max-width)] rounded-3xl border p-5 shadow-2xl",
              dark ? "border-white/10 bg-[#0b1a2c] text-[#e8e2cf]" : "border-[#c79356]/35 bg-white text-[#3a2410]",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-arabic-serif text-[16px] font-extrabold">مشاركة الصلاة</h3>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={() => setShareOpen(false)}
                className={cn("grid h-8 w-8 place-items-center rounded-full", dark ? "bg-white/5 text-[#f0d78c]" : "bg-[#fbf3e1] text-[#5b3a18]")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={cn("mb-4 text-[12.5px]", dark ? "text-white/65" : "text-[#7a5a32]")}>
              {prayer.title} — الأجبية
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ShareBtn dark={dark} label="نسخ الرابط" icon={Copy} onClick={copyLink} />
              <ShareBtn
                dark={dark} label="واتساب" icon={MessageCircle}
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
                  setShareOpen(false);
                }}
              />
              <ShareBtn
                dark={dark} label="تيليجرام" icon={Send}
                onClick={() => {
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
                  setShareOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[12px] font-semibold text-white shadow-lg"
          role="status"
        >
          {notice}
        </div>
      )}

      <PresentationMode
        open={presentOpen}
        onOpenChange={setPresentOpen}
        content={presentationContent}
      />
    </div>
  );
}

function EmptyTab({ dark, message = "لا يوجد محتوى لهذا القسم بعد." }: { dark: boolean; message?: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 rounded-2xl border px-5 py-10 text-center text-[13px]",
      dark ? "border-white/10 bg-white/5 text-white/65" : "border-[#c79356]/30 bg-white/55 text-[#7a5a32]",
    )}>
      {message}
    </div>
  );
}

function IconButton({
  children, onClick, ariaLabel, dark, active,
}: {
  children: React.ReactNode; onClick?: () => void; ariaLabel: string; dark: boolean; active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border transition-all active:scale-95",
        dark
          ? active ? "border-[#f0d78c] bg-[#f0d78c] text-[#1a1208]" : "border-white/15 bg-white/5 text-[#f0d78c]"
          : active ? "border-[#5a3d92] bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92] text-white" : "border-[#c79356]/35 bg-white/60 text-[#8a5a1f]",
      )}
    >
      {children}
    </button>
  );
}


function ShareBtn({
  label, icon: Icon, onClick, dark,
}: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11.5px] font-bold transition-transform active:scale-95",
        dark ? "border-white/10 bg-white/5 text-[#f0d78c]" : "border-[#c79356]/30 bg-[#fbf3e1] text-[#5b3a18]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
