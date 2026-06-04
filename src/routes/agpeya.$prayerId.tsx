import { createFileRoute, ErrorComponentProps, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  Minus,
  Plus,
  Sun,
  Moon,
  Play,
  Pause,
  Gauge,
  Rows3,
  Search,
  X,
  Copy,
  Send,
  MessageCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  adjacentAgpeyaPrayers,
  AGPEYA_DRAFT_NOTICE,
  AgpeyaErrorState,
  AgpeyaNotFoundState,
  AgpeyaSkeleton,
  CopticCross,
  CopticDivider,
  getAgpeyaPrayer,
  readPrayerPosition,
  savePrayerPosition,
  splitForHighlight,
  SPEED_PX_PER_SEC,
  useAgpeyaAudio,
  useAgpeyaFontSize,
  useAgpeyaLineHeight,
  useAgpeyaSpeed,
  useAgpeyaTheme,
  useSavedAgpeya,
  type AgpeyaFragment,
  type AgpeyaGospelPassage,
  type AgpeyaInfoEntry,
  type AgpeyaPsalm,
  type AgpeyaSpeed,
} from "@/features/agpeya";
import type { AgpeyaPrayer, AgpeyaTabKey } from "@/features/agpeya";
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

const TABS: { key: AgpeyaTabKey; label: string }[] = [
  { key: "text", label: "نص الصلاة" },
  { key: "psalms", label: "المزامير" },
  { key: "fragments", label: "القطع" },
  { key: "gospel", label: "الإنجيل" },
  { key: "info", label: "معلومات" },
];

/* ---------- Highlight helper ---------- */

function Highlighted({ text, query, dark }: { text: string; query: string; dark: boolean }) {
  if (!query.trim()) return <>{text}</>;
  const parts = splitForHighlight(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className={cn(
              "rounded px-0.5 py-0",
              dark ? "bg-[#f0d78c] text-[#1a1208]" : "bg-[#ffe79a] text-[#3a2410]",
            )}
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

/* ---------- Tab renderers ---------- */

function TextTab({ body, query, dark }: { body: string; query: string; dark: boolean }) {
  const paragraphs = body.split(/\n\s*\n/);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className={cn("mb-5", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
          <Highlighted text={para} query={query} dark={dark} />
        </p>
      ))}
    </>
  );
}

function PsalmsTab({ psalms, query, dark }: { psalms: AgpeyaPsalm[]; query: string; dark: boolean }) {
  return (
    <div className="space-y-6">
      {psalms.map((ps, i) => (
        <section key={i}>
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-[12px] font-extrabold tabular-nums",
                dark ? "bg-[#f0d78c] text-[#1a1208]" : "bg-gradient-to-br from-[#e7b35a] to-[#b87a22] text-white",
              )}>
                {ps.number}
              </span>
              <div>
                <div className={cn("font-arabic-serif text-[15px] font-bold", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
                  مزمور {ps.number}
                </div>
                {ps.title && (
                  <div className={cn("text-[11.5px]", dark ? "text-white/55" : "text-[#8a5a1f]")}>
                    {ps.title}
                  </div>
                )}
              </div>
            </div>
            <CopticCross className={cn("h-4 w-4", dark ? "text-[#f0d78c]/70" : "text-[#c79356]")} />
          </header>
          <ol className="space-y-2.5">
            {ps.verses.map((v, vi) => (
              <li key={vi} className="flex gap-2">
                <span className={cn("shrink-0 select-none text-[11px] font-bold tabular-nums leading-relaxed", dark ? "text-[#f0d78c]/70" : "text-[#c79356]")}>
                  {vi + 1}
                </span>
                <span className={cn(dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
                  <Highlighted text={v} query={query} dark={dark} />
                </span>
              </li>
            ))}
          </ol>
          {i < psalms.length - 1 && <CopticDivider dark={dark} />}
        </section>
      ))}
    </div>
  );
}

function GospelTab({ gospel, query, dark }: { gospel: AgpeyaGospelPassage[]; query: string; dark: boolean }) {
  return (
    <div className="space-y-6">
      {gospel.map((g, i) => (
        <article
          key={i}
          className={cn(
            "rounded-2xl border p-5",
            dark ? "border-white/10 bg-white/5" : "border-[#c79356]/30 bg-white/55",
          )}
        >
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold mb-3",
            dark ? "bg-[#f0d78c]/15 text-[#f0d78c]" : "bg-[#1f4032]/10 text-[#1f4032]",
          )}>
            <CopticCross className="h-3 w-3" />
            {g.reference}
          </div>
          {g.intro && (
            <p className={cn("mb-4 text-[13.5px] italic", dark ? "text-white/65" : "text-[#7a5a32]")}>
              <Highlighted text={g.intro} query={query} dark={dark} />
            </p>
          )}
          {g.passage.split(/\n\s*\n/).map((para, pi) => (
            <p key={pi} className={cn("mb-4", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
              <Highlighted text={para} query={query} dark={dark} />
            </p>
          ))}
          {g.conclusion && (
            <p className={cn("mt-3 text-[12.5px] text-center font-bold", dark ? "text-[#f0d78c]" : "text-[#1f4032]")}>
              {g.conclusion}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function FragmentsTab({ fragments, query, dark }: { fragments: AgpeyaFragment[]; query: string; dark: boolean }) {
  return (
    <div className="space-y-4">
      {fragments.map((f, i) => (
        <article
          key={i}
          className={cn(
            "rounded-2xl border p-4",
            dark ? "border-white/10 bg-white/5" : "border-[#c79356]/30 bg-white/55",
          )}
        >
          <h3 className={cn("font-arabic-serif text-[15px] font-bold mb-2 flex items-center gap-2", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
            <CopticCross className="h-3.5 w-3.5" />
            {f.title}
          </h3>
          {f.body.split(/\n+/).map((line, li) => (
            <p key={li} className={cn("mb-2", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
              <Highlighted text={line} query={query} dark={dark} />
            </p>
          ))}
        </article>
      ))}
    </div>
  );
}

function InfoTab({ info, query, dark }: { info: AgpeyaInfoEntry[]; query: string; dark: boolean }) {
  return (
    <dl className={cn(
      "divide-y rounded-2xl border",
      dark ? "divide-white/10 border-white/10 bg-white/5" : "divide-[#c79356]/20 border-[#c79356]/30 bg-white/55",
    )}>
      {info.map((entry, i) => (
        <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
          <dt className={cn("shrink-0 text-[12px] font-bold", dark ? "text-[#f0d78c]/85" : "text-[#8a5a1f]")}>
            {entry.label}
          </dt>
          <dd className={cn("text-[13.5px] flex-1", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
            <Highlighted text={entry.value} query={query} dark={dark} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Build a metadata-derived info list as a graceful fallback. */
function buildInfoFromMeta(p: AgpeyaPrayer): AgpeyaInfoEntry[] {
  const out: AgpeyaInfoEntry[] = [];
  if (p.description) out.push({ label: "المعنى", value: p.description });
  if (p.clock) out.push({ label: "الوقت", value: p.clock });
  if (p.psalmsCount) out.push({ label: "عدد المزامير", value: `${p.psalmsCount} مزمور` });
  if (p.gospelCount) out.push({ label: "عدد القطع الإنجيلية", value: `${p.gospelCount} قطعة` });
  if (p.durationMin) out.push({ label: "زمن القراءة التقريبي", value: `${p.durationMin} دقيقة` });
  return out;
}

/** Flatten all searchable strings of a tab for match counting. */
function flattenTab(tab: AgpeyaTabKey, prayer: AgpeyaPrayer, infoFallback: AgpeyaInfoEntry[]): string[] {
  const t = prayer.tabs[tab];
  if (!t) return [];
  switch (tab) {
    case "text": return t.body ? [t.body] : [];
    case "psalms": return (t.psalms ?? []).flatMap((p) => [p.title ?? "", ...p.verses]);
    case "gospel": return (t.gospel ?? []).flatMap((g) => [g.reference, g.intro ?? "", g.passage, g.conclusion ?? ""]);
    case "fragments": return (t.fragments ?? []).flatMap((f) => [f.title, f.body]);
    case "info": {
      const list = t.info && t.info.length ? t.info : infoFallback;
      return list.flatMap((e) => [e.label, e.value]);
    }
  }
}

/* ---------- Reader ---------- */

function PrayerReader() {
  const { prayer } = Route.useLoaderData() as { prayer: AgpeyaPrayer };
  const prayerId = prayer.id;
  const navigate = useNavigate();

  const { prev, next } = useMemo(() => adjacentAgpeyaPrayers(prayerId), [prayerId]);

  const infoFallback = useMemo(() => buildInfoFromMeta(prayer), [prayer]);

  // Determine which tabs have any content (structured or body).
  const availableTabs = useMemo(() => {
    return TABS.filter((t) => {
      const c = prayer.tabs[t.key];
      if (!c) return t.key === "info"; // info always available via fallback
      return Boolean(c.body || c.psalms?.length || c.gospel?.length || c.fragments?.length || c.info?.length);
    });
  }, [prayer]);

  const initial = readPrayerPosition(prayerId);
  const [tab, setTab] = useState<AgpeyaTabKey>(
    initial?.tab && availableTabs.some((t) => t.key === initial.tab) ? initial.tab : availableTabs[0]?.key ?? "text",
  );
  const [fontSize, setFontSize] = useAgpeyaFontSize();
  const [lineHeight, setLineHeight] = useAgpeyaLineHeight();
  const [theme, setTheme] = useAgpeyaTheme();
  const [speed, setSpeed] = useAgpeyaSpeed();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const { isSaved, toggle } = useSavedAgpeya();

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
    else setQuery("");
  }, [searchOpen]);

  // Share dialog
  const [shareOpen, setShareOpen] = useState(false);

  // Audio scaffolding — reserved for future player.
  const [, setAudioState] = useAgpeyaAudio();
  useEffect(() => { setAudioState({ prayerId, positionSec: 0 }); }, [prayerId, setAudioState]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const dark = theme === "dark";

  const matchStrings = useMemo(() => flattenTab(tab, prayer, infoFallback), [tab, prayer, infoFallback]);
  const matchCount = useMemo(() => {
    if (!query.trim()) return 0;
    try {
      const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return matchStrings.reduce((acc, s) => acc + (s.match(re)?.length ?? 0), 0);
    } catch { return 0; }
  }, [matchStrings, query]);

  // Restore scroll position on tab change
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pos = readPrayerPosition(prayerId);
    if (pos && pos.tab === tab) {
      requestAnimationFrame(() => {
        el.scrollTop = pos.scrollPercent * Math.max(0, el.scrollHeight - el.clientHeight);
      });
    } else {
      el.scrollTop = 0;
    }
  }, [tab, prayerId]);

  // Track scroll progress and persist (throttled)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    let lastSave = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, el.scrollHeight - el.clientHeight);
        const pct = Math.min(1, Math.max(0, el.scrollTop / max));
        setProgress(pct);
        const now = Date.now();
        if (now - lastSave > 400) {
          lastSave = now;
          savePrayerPosition(prayerId, { tab, scrollPercent: pct, updatedAt: now });
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tab, prayerId]);

  // Auto-scroll loop
  useEffect(() => {
    if (!playing) return;
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const step = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      acc += (SPEED_PX_PER_SEC[speed] * dt) / 1000;
      if (acc >= 1) {
        const d = Math.floor(acc);
        acc -= d;
        el.scrollTop += d;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
          setPlaying(false);
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

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

  const navigateToScrollNextMatch = (dir: 1 | -1) => {
    const root = scrollerRef.current;
    if (!root) return;
    const marks = Array.from(root.querySelectorAll("mark")) as HTMLElement[];
    if (!marks.length) return;
    const top = root.scrollTop;
    const sorted = marks.map((m) => m.offsetTop);
    let target: number | undefined;
    if (dir === 1) target = sorted.find((y) => y > top + 4);
    else { for (let i = sorted.length - 1; i >= 0; i--) if (sorted[i] < top - 4) { target = sorted[i]; break; } }
    if (target == null) target = dir === 1 ? sorted[0] : sorted[sorted.length - 1];
    root.scrollTo({ top: target - 80, behavior: "smooth" });
  };

  const speeds: AgpeyaSpeed[] = ["slow", "medium", "fast"];
  const speedLabel: Record<AgpeyaSpeed, string> = { slow: "بطيء", medium: "متوسط", fast: "سريع" };

  const currentTabContent = prayer.tabs[tab];

  return (
    <div
      dir="rtl"
      className={cn(
        "min-h-dvh flex flex-col transition-colors",
        dark
          ? "bg-[#08131f] text-[#e8e2cf]"
          : "bg-[radial-gradient(120%_60%_at_50%_-10%,#fff5dd_0%,#fbeac6_45%,#f3d9a5_100%)] text-[#3a2410]",
      )}
    >
      {/* Top bar */}
      <header
        className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b",
          dark ? "bg-[#0b1a2c]/80 border-white/10" : "bg-[#fbf3e1]/85 border-[#c79356]/25",
        )}
      >
        <div className="mx-auto flex max-w-[640px] items-center justify-between px-4 py-3">
          <Link
            to="/agpeya"
            aria-label="رجوع للأجبية"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border active:scale-95",
              dark ? "bg-white/5 border-white/15 text-[#f0d78c]" : "bg-white/60 border-[#c79356]/35 text-[#8a5a1f]",
            )}
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="min-w-0 text-center px-2">
            <h1 className="font-arabic-serif truncate text-[16px] font-bold leading-tight flex items-center justify-center gap-1.5">
              {prayer.title}
              {isSaved(prayerId) && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", dark ? "bg-[#f0d78c]/20 text-[#f0d78c]" : "bg-[#1f4032]/10 text-[#1f4032]")}>
                  محفوظة
                </span>
              )}
            </h1>
            {prayer.subtitle && (
              <p className={cn("truncate text-[11px]", dark ? "text-white/55" : "text-[#7a5a32]")}>
                {prayer.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton dark={dark} ariaLabel="بحث داخل الصلاة" active={searchOpen} onClick={() => setSearchOpen((s) => !s)}>
              <Search className="h-4 w-4" />
            </IconButton>
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

        {/* Search bar */}
        {searchOpen && (
          <div className="mx-auto max-w-[640px] px-3 pb-2">
            <div className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5",
              dark ? "bg-white/5 border-white/10" : "bg-white/85 border-[#c79356]/35",
            )}>
              <Search className={cn("h-4 w-4", dark ? "text-white/55" : "text-[#8a5a1f]")} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter") navigateToScrollNextMatch(e.shiftKey ? -1 : 1);
                }}
                placeholder="ابحث داخل القسم الحالي…"
                className={cn(
                  "flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:opacity-60",
                  dark ? "text-[#f0d78c] placeholder:text-white/40" : "text-[#3a2410] placeholder:text-[#8a5a1f]/70",
                )}
              />
              {query && (
                <span className={cn("text-[11px] tabular-nums", dark ? "text-white/55" : "text-[#8a5a1f]")}>
                  {matchCount}
                </span>
              )}
              <button type="button" onClick={() => navigateToScrollNextMatch(-1)} aria-label="السابق" disabled={!matchCount}
                className={cn("grid h-6 w-6 place-items-center rounded-full disabled:opacity-30", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => navigateToScrollNextMatch(1)} aria-label="التالي" disabled={!matchCount}
                className={cn("grid h-6 w-6 place-items-center rounded-full disabled:opacity-30", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث"
                className={cn("grid h-6 w-6 place-items-center rounded-full", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mx-auto max-w-[640px] px-3 pb-2">
          <div
            className={cn(
              "flex gap-1 overflow-x-auto rounded-full border p-1 no-scrollbar",
              dark ? "bg-white/5 border-white/10" : "bg-white/55 border-[#c79356]/30",
            )}
          >
            {availableTabs.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-all",
                    active
                      ? dark
                        ? "bg-gradient-to-br from-[#f0d78c] to-[#c79356] text-[#1a1208] shadow"
                        : "bg-gradient-to-br from-[#1f4032] to-[#234a3a] text-white shadow"
                      : dark
                        ? "text-white/70"
                        : "text-[#5b3a18]",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className={cn("h-[3px] w-full", dark ? "bg-white/5" : "bg-[#c79356]/15")}>
          <div
            className={cn("h-full transition-[width] duration-150", dark ? "bg-[#f0d78c]" : "bg-[#1f4032]")}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      {/* Reader body */}
      <main
        ref={scrollerRef}
        className="flex-1 overflow-y-auto relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Faint Coptic cross watermark */}
        <CopticCross
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-40 w-40 opacity-[0.04]",
            dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
          )}
        />

        <article
          className="relative mx-auto max-w-[640px] px-5 pt-5 pb-8 font-arabic-serif"
          style={{ fontSize, lineHeight }}
        >
          {/* Draft notice */}
          <div className={cn(
            "mb-6 rounded-xl border px-3 py-2 text-[11.5px] font-semibold text-center",
            dark ? "border-[#f0d78c]/25 bg-[#f0d78c]/5 text-[#f0d78c]" : "border-[#c79356]/40 bg-[#fff7e0] text-[#8a5a1f]",
          )}>
            {AGPEYA_DRAFT_NOTICE}
          </div>

          {(() => {
            if (tab === "text") {
              const body = currentTabContent?.body ?? "";
              if (!body.trim()) return <EmptyTab dark={dark} />;
              return <TextTab body={body} query={query} dark={dark} />;
            }
            if (tab === "psalms") {
              const list = currentTabContent?.psalms ?? [];
              if (!list.length) return <EmptyTab dark={dark} message="لا توجد مزامير لهذه الصلاة." />;
              return <PsalmsTab psalms={list} query={query} dark={dark} />;
            }
            if (tab === "gospel") {
              const list = currentTabContent?.gospel ?? [];
              if (!list.length) return <EmptyTab dark={dark} message="لا يوجد إنجيل مرافق لهذه الصلاة." />;
              return <GospelTab gospel={list} query={query} dark={dark} />;
            }
            if (tab === "fragments") {
              const list = currentTabContent?.fragments ?? [];
              if (!list.length) return <EmptyTab dark={dark} message="لا توجد قطع متاحة." />;
              return <FragmentsTab fragments={list} query={query} dark={dark} />;
            }
            const info = (currentTabContent?.info && currentTabContent.info.length) ? currentTabContent.info : infoFallback;
            return <InfoTab info={info} query={query} dark={dark} />;
          })()}

          <div className={cn("mt-10 border-t pt-5 text-center text-[12px] flex flex-col items-center gap-2", dark ? "border-white/10 text-white/55" : "border-[#c79356]/25 text-[#8a5a1f]")}>
            <CopticCross className={cn("h-4 w-4", dark ? "text-[#f0d78c]" : "text-[#c79356]")} />
            نهاية الصلاة — بركة الرب تشملكم
          </div>
        </article>

        {/* Prev/Next navigation */}
        <nav className="mx-auto max-w-[640px] px-4 pb-40 flex items-center justify-between gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => navigate({ to: "/agpeya/$prayerId", params: { prayerId: prev.id } })}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-right active:scale-[0.98] transition-transform",
                dark ? "bg-white/5 border-white/10 text-[#f0d78c]" : "bg-white/70 border-[#c79356]/35 text-[#5b3a18]",
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
              onClick={() => navigate({ to: "/agpeya/$prayerId", params: { prayerId: next.id } })}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-2xl border px-4 py-3 text-left active:scale-[0.98] transition-transform",
                dark ? "bg-white/5 border-white/10 text-[#f0d78c]" : "bg-white/70 border-[#c79356]/35 text-[#5b3a18]",
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
      </main>

      {/* Floating reader controls */}
      <div
        dir="rtl"
        className="fixed inset-x-0 z-40 mx-auto flex w-full max-w-[640px] items-center justify-center px-4"
        style={{ bottom: "max(env(safe-area-inset-bottom), 14px)" }}
      >
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-2xl",
            dark
              ? "bg-[#0b1a2c]/80 border-white/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85)]"
              : "bg-white/80 border-[#c79356]/40 shadow-[0_18px_40px_-20px_rgba(120,80,30,0.45)]",
          )}
        >
          <ControlBtn dark={dark} ariaLabel="تصغير الخط" onClick={() => setFontSize(Math.max(14, fontSize - 1))}>
            <Minus className="h-3.5 w-3.5" />
          </ControlBtn>
          <span className={cn("min-w-[26px] text-center text-[11px] font-bold tabular-nums", dark ? "text-[#f0d78c]" : "text-[#5b3a18]")}>
            {fontSize}
          </span>
          <ControlBtn dark={dark} ariaLabel="تكبير الخط" onClick={() => setFontSize(Math.min(34, fontSize + 1))}>
            <Plus className="h-3.5 w-3.5" />
          </ControlBtn>

          <span className={cn("mx-1 h-4 w-px", dark ? "bg-white/15" : "bg-[#c79356]/30")} />

          <ControlBtn dark={dark} ariaLabel={dark ? "وضع النهار" : "الوضع الليلي"} onClick={() => setTheme(dark ? "light" : "dark")}>
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </ControlBtn>

          <ControlBtn
            dark={dark}
            ariaLabel="تباعد الأسطر"
            onClick={() => {
              const steps = [1.7, 1.9, 2.05, 2.25, 2.5];
              const idx = steps.findIndex((s) => Math.abs(s - lineHeight) < 0.05);
              setLineHeight(steps[(idx + 1) % steps.length] ?? 2.05);
            }}
          >
            <Rows3 className="h-3.5 w-3.5" />
          </ControlBtn>

          <span className={cn("mx-1 h-4 w-px", dark ? "bg-white/15" : "bg-[#c79356]/30")} />

          <button
            type="button"
            onClick={() => {
              const i = speeds.indexOf(speed);
              setSpeed(speeds[(i + 1) % speeds.length]);
            }}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
              dark ? "bg-white/5 text-[#f0d78c]" : "bg-[#fbf3e1] text-[#5b3a18]",
            )}
            aria-label="سرعة التمرير"
          >
            <Gauge className="h-3 w-3" />
            {speedLabel[speed]}
          </button>

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className={cn(
              "ms-1 grid h-9 w-9 place-items-center rounded-full text-white active:scale-95 transition-all",
              "bg-gradient-to-br from-[#3eb482] to-[#1f6e54]",
              playing
                ? "shadow-[0_0_14px_rgba(62,180,130,0.85)] ring-1 ring-[#7af0b8]/40"
                : "shadow-[0_6px_14px_-6px_rgba(31,94,74,0.6)] ring-1 ring-[#7af0b8]/25",
            )}
            aria-label={playing ? "إيقاف التمرير" : "تشغيل التمرير"}
          >
            {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          </button>
        </div>
      </div>

      {/* Share fallback dialog */}
      {shareOpen && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-[420px] rounded-3xl border p-5 shadow-2xl",
              dark ? "bg-[#0b1a2c] border-white/10 text-[#e8e2cf]" : "bg-white border-[#c79356]/35 text-[#3a2410]",
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
    </div>
  );
}

function EmptyTab({ dark, message = "لا يوجد محتوى لهذا القسم بعد." }: { dark: boolean; message?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border px-5 py-10 text-center text-[13px] flex flex-col items-center gap-2",
      dark ? "border-white/10 bg-white/5 text-white/65" : "border-[#c79356]/30 bg-white/55 text-[#7a5a32]",
    )}>
      <CopticCross className={cn("h-5 w-5", dark ? "text-[#f0d78c]/60" : "text-[#c79356]")} />
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
        "grid h-9 w-9 place-items-center rounded-full border transition-all active:scale-95",
        dark
          ? active ? "bg-[#f0d78c] text-[#1a1208] border-[#f0d78c]" : "bg-white/5 border-white/15 text-[#f0d78c]"
          : active ? "bg-[#1f4032] text-white border-[#1f4032]" : "bg-white/60 border-[#c79356]/35 text-[#8a5a1f]",
      )}
    >
      {children}
    </button>
  );
}

function ControlBtn({
  children, onClick, ariaLabel, dark,
}: { children: React.ReactNode; onClick: () => void; ariaLabel: string; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full transition-all active:scale-90",
        dark ? "text-[#f0d78c] hover:bg-white/10" : "text-[#5b3a18] hover:bg-[#c79356]/15",
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
        "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11.5px] font-bold active:scale-95 transition-transform",
        dark ? "border-white/10 bg-white/5 text-[#f0d78c]" : "border-[#c79356]/30 bg-[#fbf3e1] text-[#5b3a18]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
