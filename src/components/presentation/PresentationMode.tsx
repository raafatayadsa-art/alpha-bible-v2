import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Moon,
  Sun,
  Cast,
} from "lucide-react";
import { CopticCross } from "@/components/coptic";

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
  const [index, setIndex] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [dark, setDark] = useState(false);
  const total = content.sections.length;
  const section = content.sections[Math.min(index, Math.max(0, total - 1))];

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, content.title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") setIndex((i) => Math.max(0, i - 1)); // RTL: right = prev
      if (e.key === "ArrowLeft") setIndex((i) => Math.min(total - 1, i + 1));
      if (e.key === "+" || e.key === "=") setFontScale((s) => Math.min(2, s + 0.1));
      if (e.key === "-") setFontScale((s) => Math.max(0.7, s - 0.1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, total, onOpenChange]);

  if (!open) return null;

  const bg = dark
    ? "bg-[#0b1a2c] text-[#f3e6c4]"
    : "bg-[#fbf3e1] text-[#3a2a18]";
  const accent = dark ? "#f0d78c" : "#b8893a";
  const glassBtn = dark
    ? "bg-white/10 border-white/15 text-[#f3e6c4]"
    : "bg-white/85 border-[#efe2c4] text-[#3a2a18]";

  const titleSize = 28 * fontScale;
  const bodySize = 22 * fontScale;
  const sectionTitleSize = 24 * fontScale;

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-[100] ${bg} flex flex-col`}
      role="dialog"
      aria-modal="true"
      aria-label="وضع العرض الكنسي"
    >
      {/* Coptic identity ornaments — subtle */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-6 right-8 text-[44px] font-bold opacity-15 leading-none"
        style={{ color: accent }}
      >
        Ⲁ
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute top-6 left-8 text-[44px] font-bold opacity-15 leading-none"
        style={{ color: accent }}
      >
        Ⲱ
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] opacity-30"
        style={{ color: accent }}
      >
        ALPHA · وضع العرض الكنسي
      </span>

      {/* Header bar (visible only on phone — kept slim for projection) */}
      <header
        className="relative z-10 flex items-center justify-between px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <div className="inline-flex items-center gap-2 text-[12px] font-bold opacity-70">
          <CopticCross size={14} />
          <span>{content.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={dark ? "وضع نهاري" : "وضع ليلي"}
            onClick={() => setDark((v) => !v)}
            className={`grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform ${glassBtn}`}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="بث للشاشة (قريباً)"
            title="Chromecast / AirPlay — قريباً"
            disabled
            className={`grid h-9 w-9 place-items-center rounded-full border opacity-40 ${glassBtn}`}
          >
            <Cast className="h-4 w-4" />
          </button>
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

      {/* Stage */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 lg:px-32 py-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-[1100px] w-full">
          <p
            className="font-bold tracking-[0.25em] opacity-60 mb-3"
            style={{ fontSize: 13 * fontScale, color: accent }}
          >
            {content.subtitle ?? "ألفا · للأقباط الأرثوذكس"}
          </p>
          <h1
            className="font-arabic-serif font-extrabold leading-tight mb-6"
            style={{ fontSize: titleSize }}
          >
            {content.title}
          </h1>
          <div
            className="mx-auto h-[2px] w-24 rounded-full mb-6"
            style={{ background: accent, opacity: 0.5 }}
          />
          {section?.title && (
            <h2
              className="font-arabic-serif font-extrabold mb-5"
              style={{ fontSize: sectionTitleSize, color: accent }}
            >
              {section.title}
            </h2>
          )}
          <div
            className="font-arabic-serif leading-[2.1] whitespace-pre-wrap"
            style={{ fontSize: bodySize }}
          >
            {section?.body}
          </div>
          {section?.meta && (
            <p
              className="mt-6 font-bold opacity-70"
              style={{ fontSize: 14 * fontScale, color: accent }}
            >
              {section.meta}
            </p>
          )}
        </div>
      </main>

      {/* Phone controls (visible — content area above is intended for projection) */}
      <footer
        className="relative z-10 px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)", paddingTop: 8 }}
      >
        <div
          className={`mx-auto max-w-[520px] rounded-2xl border backdrop-blur-xl px-3 py-2.5 flex items-center justify-between gap-2 ${
            dark
              ? "bg-white/10 border-white/15"
              : "bg-white/85 border-[#efe2c4] shadow-[0_12px_28px_-16px_rgba(120,80,30,0.5)]"
          }`}
        >
          <button
            type="button"
            aria-label="السابق"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index <= 0}
            className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-[12px] font-bold border active:scale-95 transition-transform disabled:opacity-40 ${glassBtn}`}
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="تصغير الخط"
              onClick={() => setFontScale((s) => Math.max(0.7, s - 0.1))}
              className={`grid h-10 w-10 place-items-center rounded-xl border active:scale-95 transition-transform ${glassBtn}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className="text-[11px] font-bold tabular-nums w-10 text-center opacity-80"
              aria-live="polite"
            >
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              aria-label="تكبير الخط"
              onClick={() => setFontScale((s) => Math.min(2, s + 0.1))}
              className={`grid h-10 w-10 place-items-center rounded-xl border active:scale-95 transition-transform ${glassBtn}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            aria-label="التالي"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index >= total - 1}
            className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-[12px] font-bold border active:scale-95 transition-transform disabled:opacity-40 ${glassBtn}`}
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        {total > 1 && (
          <p
            className="mt-1.5 text-center text-[11px] font-bold opacity-60"
            style={{ color: accent }}
          >
            {index + 1} / {total}
          </p>
        )}
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
