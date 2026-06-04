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
  X,
  Copy,
  Send,
  MessageCircle,
} from "lucide-react";
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
  CopticCross,
  getAgpeyaPrayer,
  readPrayerPosition,
  savePrayerPosition,
  SPEED_PX_PER_SEC,
  useAgpeyaAudio,
  useAgpeyaFontSize,
  useAgpeyaLineHeight,
  useAgpeyaSpeed,
  useAgpeyaTheme,
  useSavedAgpeya,
  type AgpeyaSpeed,
} from "@/features/agpeya";
import type { AgpeyaPrayer } from "@/features/agpeya";
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
  return (
    <section
      id={`section-${id}`}
      data-section-id={id}
      className="scroll-mt-32"
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <CopticCross className={cn("h-3.5 w-3.5", dark ? "text-[#f0d78c]/80" : "text-[#c79356]")} />
        <h2 className={cn(
          "font-arabic-serif text-[15px] font-extrabold tracking-tight",
          dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
        )}>
          {label}
        </h2>
        <span className={cn("h-px flex-1", dark ? "bg-white/10" : "bg-[#c79356]/25")} />
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
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
        </div>
        <CopticCross className={cn("h-4 w-4", dark ? "text-[#f0d78c]/70" : "text-[#c79356]")} />
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
        "mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold",
        dark ? "bg-[#f0d78c]/15 text-[#f0d78c]" : "bg-[#5a3d92]/10 text-[#5a3d92]",
      )}>
        <CopticCross className="h-3 w-3" />
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
        "mb-2 flex items-center gap-2 font-arabic-serif text-[14px] font-bold",
        dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
      )}>
        <CopticCross className="h-3.5 w-3.5" />
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

function PrayerReader() {
  const { prayer } = Route.useLoaderData() as { prayer: AgpeyaPrayer };
  const prayerId = prayer.id;
  const navigate = useNavigate();

  const { prev, next } = useMemo(() => adjacentAgpeyaPrayers(prayerId), [prayerId]);
  const sections = useMemo(() => buildSections(prayer), [prayer]);

  const [fontSize, setFontSize] = useAgpeyaFontSize();
  const [lineHeight, setLineHeight] = useAgpeyaLineHeight();
  const [theme, setTheme] = useAgpeyaTheme();
  const [speed, setSpeed] = useAgpeyaSpeed();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const { isSaved, toggle } = useSavedAgpeya();

  const [shareOpen, setShareOpen] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);

  const presentationContent: PresentationContent = useMemo(() => {
    const out: PresentationContent["sections"] = [];
    const text = prayer.tabs.text?.body ?? "";
    if (text.trim()) {
      text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p, i) =>
          out.push({ title: i === 0 ? "مقدمة الساعة" : undefined, body: p }),
        );
    }
    (prayer.tabs.psalms?.psalms ?? []).forEach((ps) => {
      out.push({
        title: `المزمور ${ps.number}${ps.title ? " — " + ps.title : ""}`,
        body: ps.verses.join("\n"),
      });
    });
    (prayer.tabs.gospel?.gospel ?? []).forEach((g: any) => {
      out.push({
        title: g.title ?? "الإنجيل",
        body: g.body ?? (Array.isArray(g.verses) ? g.verses.join("\n") : ""),
        meta: g.reference,
      });
    });
    (prayer.tabs.fragments?.fragments ?? []).forEach((f: any) => {
      out.push({ title: f.title, body: f.body ?? (f.lines?.join("\n") ?? "") });
    });
    if (out.length === 0) out.push({ title: prayer.title, body: prayer.subtitle ?? "" });
    return { title: prayer.title, subtitle: prayer.subtitle, sections: out };
  }, [prayer]);

  // Audio scaffolding — reserved for future player.
  const [, setAudioState] = useAgpeyaAudio();
  useEffect(() => { setAudioState({ prayerId, positionSec: 0 }); }, [prayerId, setAudioState]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const dark = theme === "dark";

  // Restore scroll position on first mount per prayer
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pos = readPrayerPosition(prayerId);
    if (pos) {
      requestAnimationFrame(() => {
        el.scrollTop = pos.scrollPercent * Math.max(0, el.scrollHeight - el.clientHeight);
      });
    } else {
      el.scrollTop = 0;
    }
  }, [prayerId]);

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
          savePrayerPosition(prayerId, { tab: "text", scrollPercent: pct, updatedAt: now });
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [prayerId]);

  // Lock active section during programmatic smooth scroll so the tapped chip
  // stays highlighted until the scroll settles (prevents flicker on iPhone).
  const lockUntilRef = useRef<number>(0);

  // Scroll-driven active section tracking (more reliable than IO across browsers)
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || sections.length === 0) return;
    let raf = 0;
    const recompute = () => {
      try {
        if (Date.now() < lockUntilRef.current) return;
        const els = sections
          .map((s) => ({ id: s.id, el: root.querySelector(`#section-${s.id}`) as HTMLElement | null }))
          .filter((x): x is { id: string; el: HTMLElement } => !!x.el);
        if (!els.length) return;
        const rootTop = root.getBoundingClientRect().top;
        const trigger = rootTop + Math.min(180, root.clientHeight * 0.28);
        // pick last section whose top is above trigger; fallback to first
        let currentId = els[0].id;
        for (const { id, el } of els) {
          if (el.getBoundingClientRect().top - trigger <= 0) currentId = id;
          else break;
        }
        // near-bottom guard: snap to last section (only when content actually scrolls)
        const scrollable = root.scrollHeight - root.clientHeight;
        if (scrollable > 8 && root.scrollTop + root.clientHeight >= root.scrollHeight - 4) {
          currentId = els[els.length - 1].id;
        }
        setActiveId((prev) => (prev === currentId ? prev : currentId));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[agpeya] section tracking failed", err);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };
    recompute();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // Auto-center active chip in the rail
  useEffect(() => {
    const rail = chipsRef.current;
    if (!rail) return;
    const chip = rail.querySelector(`[data-chip="${activeId}"]`) as HTMLElement | null;
    if (chip) {
      chip.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

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
      if (dx < 0 && next) navigate({ to: "/agpeya/$prayerId", params: { prayerId: next.id } });
      else if (dx > 0 && prev) navigate({ to: "/agpeya/$prayerId", params: { prayerId: prev.id } });
    }
  };

  const jumpTo = (id: string) => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector(`#section-${id}`) as HTMLElement | null;
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

  const speeds: AgpeyaSpeed[] = ["slow", "medium", "fast"];
  const speedLabel: Record<AgpeyaSpeed, string> = { slow: "بطيء", medium: "متوسط", fast: "سريع" };

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
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="mx-auto flex max-w-[640px] items-center justify-between px-3 py-3">
          <Link
            to="/agpeya"
            aria-label="رجوع للأجبية"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border active:scale-95",
              dark ? "bg-white/5 border-white/15 text-[#f0d78c]" : "bg-white/60 border-[#c79356]/35 text-[#8a5a1f]",
            )}
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="min-w-0 px-2 text-center">
            <h1 className="font-arabic-serif flex items-center justify-center gap-1.5 truncate text-[16px] font-bold leading-tight">
              <span className={cn("opacity-60 text-[12px]", dark ? "text-[#f0d78c]" : "text-[#8a5a1f]")} aria-hidden>Ⲁ</span>
              {prayer.title}
              <span className={cn("opacity-60 text-[12px]", dark ? "text-[#f0d78c]" : "text-[#8a5a1f]")} aria-hidden>Ⲱ</span>
              {isSaved(prayerId) && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  dark ? "bg-[#f0d78c]/20 text-[#f0d78c]" : "bg-[#5a3d92]/10 text-[#5a3d92]",
                )}>
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
              "mx-auto flex max-w-[640px] gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar",
            )}
          >
            {sections.map((s) => {
              const active = s.id === activeId;
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
                      ? "border-[#8a6bbf] bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92] text-white shadow-[0_6px_18px_-8px_rgba(122,92,176,0.7)] ring-1 ring-[#b89dd9]/40"
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

        {/* Progress bar */}
        <div className={cn("h-[3px] w-full", dark ? "bg-white/5" : "bg-[#c79356]/15")}>
          <div
            className="h-full bg-gradient-to-r from-[#7a5cb0] via-[#9b7fd4] to-[#5a3d92] transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      {/* Reader body */}
      <main
        ref={scrollerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Faint Coptic cross watermark */}
        <CopticCross
          className={cn(
            "pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 opacity-[0.04]",
            dark ? "text-[#f0d78c]" : "text-[#5b3a18]",
          )}
        />

        <article
          className="relative mx-auto max-w-[640px] px-3 pb-44 pt-5 sm:px-5 font-arabic-serif"
          style={{ fontSize, lineHeight }}
        >
          {/* Draft notice */}
          <div className={cn(
            "mb-5 rounded-xl border px-3 py-2 text-center text-[11.5px] font-semibold",
            dark ? "border-[#f0d78c]/25 bg-[#f0d78c]/5 text-[#f0d78c]" : "border-[#c79356]/40 bg-[#fff7e0] text-[#8a5a1f]",
          )}>
            {AGPEYA_DRAFT_NOTICE}
          </div>

          {sections.length === 0 ? (
            <EmptyTab dark={dark} message="لا يوجد محتوى لهذه الصلاة بعد." />
          ) : (
            <div className="space-y-6">
              {sections.map((s) => (
                <SectionShell key={s.id} id={s.id} label={s.label} dark={dark}>
                  {s.render({ dark })}
                </SectionShell>
              ))}
            </div>
          )}

          <div className={cn(
            "mt-10 flex flex-col items-center gap-2 border-t pt-5 text-center text-[12px]",
            dark ? "border-white/10 text-white/55" : "border-[#c79356]/25 text-[#8a5a1f]",
          )}>
            <CopticCross className={cn("h-4 w-4", dark ? "text-[#f0d78c]" : "text-[#c79356]")} />
            نهاية الصلاة — بركة الرب تشملكم
          </div>

          {/* Prev/Next prayer navigation (backup to swipe) */}
          <nav className="mt-6 flex items-center justify-between gap-3">
            {prev ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/agpeya/$prayerId", params: { prayerId: prev.id } })}
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
                onClick={() => navigate({ to: "/agpeya/$prayerId", params: { prayerId: next.id } })}
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

      {/* Floating reader controls */}
      <div
        dir="rtl"
        className="fixed inset-x-0 z-40 mx-auto flex w-full max-w-[640px] items-center justify-center px-3"
        style={{ bottom: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-2xl",
            dark
              ? "border-white/10 bg-[#0b1a2c]/85 shadow-[0_20px_46px_-22px_rgba(0,0,0,0.9)]"
              : "border-[#c79356]/40 bg-white/85 shadow-[0_20px_46px_-22px_rgba(120,80,30,0.5)]",
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
              "ms-1 grid h-10 w-10 place-items-center rounded-full text-white transition-all active:scale-95",
              "bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92]",
              playing
                ? "shadow-[0_0_14px_rgba(122,92,176,0.85)] ring-1 ring-[#b89dd9]/40"
                : "shadow-[0_6px_14px_-6px_rgba(90,61,146,0.6)] ring-1 ring-[#b89dd9]/25",
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShareOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-[420px] rounded-3xl border p-5 shadow-2xl",
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

function ControlBtn({
  children, onClick, ariaLabel, dark,
}: { children: React.ReactNode; onClick: () => void; ariaLabel: string; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full transition-all active:scale-90",
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
        "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11.5px] font-bold transition-transform active:scale-95",
        dark ? "border-white/10 bg-white/5 text-[#f0d78c]" : "border-[#c79356]/30 bg-[#fbf3e1] text-[#5b3a18]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
