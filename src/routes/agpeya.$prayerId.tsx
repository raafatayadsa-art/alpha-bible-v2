import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import {
  adjacentAgpeyaPrayers,
  getAgpeyaPrayer,
  readPrayerPosition,
  savePrayerPosition,
  SPEED_PX_PER_SEC,
  useAgpeyaFontSize,
  useAgpeyaSpeed,
  useAgpeyaTheme,
  useSavedAgpeya,
  type AgpeyaSpeed,
} from "@/features/agpeya";
import type { AgpeyaTabKey } from "@/features/agpeya";
import { cn } from "@/lib/utils";

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
  component: PrayerReader,
});

const TABS: { key: AgpeyaTabKey; label: string }[] = [
  { key: "text", label: "نص الصلاة" },
  { key: "psalms", label: "المزامير" },
  { key: "gospel", label: "الإنجيل" },
  { key: "fragments", label: "القطع" },
  { key: "info", label: "معلومات" },
];

function PrayerReader() {
  const { prayerId } = Route.useParams();
  const prayer = getAgpeyaPrayer(prayerId);
  const navigate = useNavigate();
  if (!prayer) throw notFound();

  const { prev, next } = useMemo(() => adjacentAgpeyaPrayers(prayerId), [prayerId]);
  const availableTabs = TABS.filter((t) => prayer.tabs[t.key]?.body);

  const initial = readPrayerPosition(prayerId);
  const [tab, setTab] = useState<AgpeyaTabKey>(
    initial?.tab && availableTabs.some((t) => t.key === initial.tab) ? initial.tab : availableTabs[0]?.key ?? "text",
  );
  const [fontSize, setFontSize] = useAgpeyaFontSize();
  const [theme, setTheme] = useAgpeyaTheme();
  const [speed, setSpeed] = useAgpeyaSpeed();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedNotice, setSavedNotice] = useState(false);
  const { isSaved, toggle } = useSavedAgpeya();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const dark = theme === "dark";
  const content = prayer.tabs[tab]?.body ?? "";

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

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: `${prayer.title} — الأجبية`, text: prayer.title, url };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 1500);
      }
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
            <h1 className="font-arabic-serif truncate text-[16px] font-bold leading-tight">{prayer.title}</h1>
            {prayer.subtitle && (
              <p className={cn("truncate text-[11px]", dark ? "text-white/55" : "text-[#7a5a32]")}>
                {prayer.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton dark={dark} ariaLabel="مشاركة" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </IconButton>
            <IconButton
              dark={dark}
              ariaLabel={isSaved(prayerId) ? "إلغاء الحفظ" : "حفظ"}
              active={isSaved(prayerId)}
              onClick={() => {
                toggle(prayerId);
                setSavedNotice(true);
                setTimeout(() => setSavedNotice(false), 1200);
              }}
            >
              <Bookmark className={cn("h-4 w-4", isSaved(prayerId) && "fill-current")} />
            </IconButton>
          </div>
        </div>

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
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        <article
          className="mx-auto max-w-[640px] px-5 py-8 font-arabic-serif leading-[2.05]"
          style={{ fontSize, lineHeight: 2.05 }}
        >
          {content
            .split(/\n\s*\n/)
            .map((para, i) => (
              <p key={i} className={cn("mb-5", dark ? "text-[#e8e2cf]" : "text-[#2a1a08]")}>
                {para}
              </p>
            ))}
          <div className={cn("mt-10 border-t pt-5 text-center text-[12px]", dark ? "border-white/10 text-white/55" : "border-[#c79356]/25 text-[#8a5a1f]")}>
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

          <span className={cn("mx-1 h-4 w-px", dark ? "bg-white/15" : "bg-[#c79356]/30")} />

          {/* Speed cycle */}
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

      {savedNotice && (
        <div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[12px] font-semibold text-white shadow-lg"
          role="status"
        >
          تم
        </div>
      )}
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
