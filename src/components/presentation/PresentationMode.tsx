import { useEffect, useRef, useState } from "react";
import { X, Cast } from "lucide-react";
import { CopticCross } from "@/components/coptic";
import {
  AlphaReadingControlBar,
} from "@/components/controls/AlphaReadingControlBar";
import {
  PRESENTATION_SPEED_PX,
  PRESENTATION_SPEED_LABEL,
  PRESENTATION_SPACING_LH,
  PRESENTATION_SPACING_LABEL,
  cyclePresentationSpeed,
  cyclePresentationSpacing,
  type PresentationSpeed,
  type PresentationSpacing,
} from "@/components/controls/alpha-control-cycles";

export type PresentationSection = {
  id?: string;
  title?: string;
  body: string;
  meta?: string;
};

export type PresentationContent = {
  title: string;
  subtitle?: string;
  sections: PresentationSection[];
};

export function PresentationMode({
  open,
  onOpenChange,
  content,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: PresentationContent;
}) {
  const [fontScale, setFontScale] = useState(1);
  const [dark, setDark] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PresentationSpeed>("medium");
  const [spacing, setSpacing] = useState<PresentationSpacing>("normal");
  const [chromeVisible, setChromeVisible] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide chrome after 5s of inactivity
  useEffect(() => {
    if (!open) return;
    const bump = () => {
      setChromeVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setChromeVisible(false), 5000);
    };
    bump();
    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "touchstart",
      "click",
      "keydown",
      "wheel",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true } as AddEventListenerOptions));
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    };
  }, [open]);

  // Reset scroll on open
  useEffect(() => {
    if (open) {
      setPlaying(false);
      requestAnimationFrame(() => {
        if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
      });
    }
  }, [open, content.title]);

  // Keyboard + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === "+" || e.key === "=") setFontScale((s) => Math.min(2, s + 0.1));
      if (e.key === "-") setFontScale((s) => Math.max(0.7, s - 0.1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  // Auto-scroll using rAF on the actual scroll container
  useEffect(() => {
    if (!open || !playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const el = scrollerRef.current;
    if (!el) return;

    const pxPerSec = PRESENTATION_SPEED_PX[speed];
    let acc = 0;

    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      acc += dt * pxPerSec;
      if (acc >= 1) {
        const delta = acc;
        acc = 0;
        const maxScroll = el.scrollHeight - el.clientHeight;
        const next = Math.min(maxScroll, el.scrollTop + delta);
        el.scrollTop = next;
        if (next >= maxScroll - 0.5) {
          setPlaying(false);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [open, playing, speed]);

  if (!open) return null;

  const bg = dark
    ? "bg-[#0b1a2c] text-[#f3e6c4]"
    : "bg-[#fbf3e1] text-[#3a2a18]";
  const accent = dark ? "#f0d78c" : "#b8893a";
  const glassBtn = dark
    ? "bg-white/[0.06] border-[#c9a96b]/20 text-[#f0e3bd] backdrop-blur"
    : "bg-[#fff7e3]/55 border-[#e6d2a6]/45 text-[#5b3a18] backdrop-blur";

  const chromeOpacity = chromeVisible
    ? "opacity-100"
    : "opacity-0 pointer-events-none";

  const titleSize = 30 * fontScale;
  const bodySize = 22 * fontScale;
  const sectionTitleSize = 24 * fontScale;
  const bodyLineHeight = PRESENTATION_SPACING_LH[spacing];

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-[100] ${bg} flex flex-col`}
      role="dialog"
      aria-modal="true"
      aria-label="وضع العرض الكنسي"
    >
      {/* Alpha–Omega signature */}
      <span
        aria-hidden
        className="pointer-events-none absolute font-bold leading-none select-none z-0"
        style={{ right: "-4vw", top: "50%", transform: "translateY(-50%)", fontSize: "min(70vw, 70vh)", color: accent, opacity: dark ? 0.05 : 0.035 }}
      >
        Ⲁ
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute font-bold leading-none select-none z-0"
        style={{ left: "-4vw", top: "50%", transform: "translateY(-50%)", fontSize: "min(70vw, 70vh)", color: accent, opacity: dark ? 0.05 : 0.035 }}
      >
        Ⲱ
      </span>

      {/* Slim header */}
      <header
        className={`relative z-10 flex items-center justify-between px-4 transition-opacity duration-300 ease-out ${chromeOpacity}`}
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)", paddingBottom: 6 }}
      >
        <div className="inline-flex items-center gap-2 text-[12px] font-bold opacity-70">
          <CopticCross size={14} />
          <span>{content.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="إغلاق العرض"
            onClick={() => onOpenChange(false)}
            className={`grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform ${glassBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Scrollable stage */}
      <main
        ref={scrollerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 lg:px-32 py-8"
      >
        <div className="max-w-[1100px] mx-auto w-full text-center">
          <p
            className="font-bold tracking-[0.25em] opacity-60 mb-3"
            style={{ fontSize: 13 * fontScale, color: accent }}
          >
            {content.subtitle ?? "ألفا · للأقباط الأرثوذكس"}
          </p>
          <h1
            className="font-arabic-serif font-extrabold leading-tight mb-4"
            style={{ fontSize: titleSize }}
          >
            {content.title}
          </h1>
          <div
            className="mx-auto h-[2px] w-24 rounded-full mb-8"
            style={{ background: accent, opacity: 0.5 }}
          />

          {content.sections.map((section, i) => (
            <section key={section.id ?? i} className="mb-12 last:mb-0">
              {section.title && (
                <h2
                  className="font-arabic-serif font-extrabold mb-5"
                  style={{ fontSize: sectionTitleSize, color: accent }}
                >
                  {section.title}
                </h2>
              )}
              <div
                className="font-arabic-serif whitespace-pre-wrap text-center"
                style={{ fontSize: bodySize, lineHeight: bodyLineHeight }}
              >
                {section.body}
              </div>
              {section.meta && (
                <p
                  className="mt-5 font-bold opacity-70"
                  style={{ fontSize: 14 * fontScale, color: accent }}
                >
                  {section.meta}
                </p>
              )}
            </section>
          ))}

          <p
            className="mt-12 text-[10px] font-bold tracking-[0.4em] opacity-30"
            style={{ color: accent }}
          >
            ALPHA · وضع العرض الكنسي
          </p>
        </div>
      </main>

      {/* Compact premium green-glass footer control bar */}
      <footer
        className={`relative z-10 px-4 transition-opacity duration-300 ease-out ${chromeOpacity}`}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)", paddingTop: 6 }}
      >
        <AlphaReadingControlBar
          dark={dark}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          speedLabel={PRESENTATION_SPEED_LABEL[speed]}
          onCycleSpeed={() => setSpeed((s) => cyclePresentationSpeed(s))}
          spacingLabel={PRESENTATION_SPACING_LABEL[spacing]}
          onCycleSpacing={() => setSpacing((s) => cyclePresentationSpacing(s))}
          fontDisplay={`${Math.round(fontScale * 100)}%`}
          onFontDecrease={() => setFontScale((s) => Math.max(0.7, +(s - 0.1).toFixed(2)))}
          onFontIncrease={() => setFontScale((s) => Math.min(2, +(s + 0.1).toFixed(2)))}
          onToggleTheme={() => setDark((v) => !v)}
          className="mx-auto w-fit"
        />
      </footer>
    </div>
  );
}

export function DisplayButton({
  onClick,
  tone = "light",
  label = "عرض على شاشة",
}: {
  onClick: () => void;
  tone?: "light" | "dark";
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        "grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform " +
        (tone === "dark"
          ? "bg-black/35 backdrop-blur text-white border-white/15"
          : "bg-white/85 border-[#efe2c4] text-[#3a2a18] backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.45)]")
      }
    >
      <Cast className="h-4 w-4" />
    </button>
  );
}
