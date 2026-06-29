import { createPortal } from "react-dom";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Bookmark, BookmarkCheck, FilePen, Highlighter, Layers, Sparkles, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayName } from "@/lib/bible-books";
import {
  VERSE_HIGHLIGHT_COLORS,
  highlightColorMeta,
  type VerseHighlightColor,
} from "@/lib/verse-highlights";

export type VerseActionTarget = {
  verseId: string;
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  saved: boolean;
};

type Props = {
  target: VerseActionTarget | null;
  spiritualMode?: boolean;
  highlightColor?: VerseHighlightColor | null;
  onClose: () => void;
  onShareCommunity: () => void;
  onMeditate: () => void;
  onAddNote: () => void;
  onToggleSave: () => void;
  onHighlight: (color: VerseHighlightColor | null) => void;
};

type OpenPanel = "none" | "colors" | "tools";

export function VerseActionSheet({
  target,
  spiritualMode = false,
  highlightColor = null,
  onClose,
  onShareCommunity,
  onMeditate,
  onAddNote,
  onToggleSave,
  onHighlight,
}: Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>("none");

  useEffect(() => {
    setOpenPanel("none");
  }, [target?.verseId]);

  if (!target || typeof document === "undefined") return null;

  const refLabel = `${displayName(target.bookName || target.book)} ${target.chapter}:${target.verse}`;
  const activeMeta = highlightColor ? highlightColorMeta(highlightColor) : null;

  const togglePanel = (panel: Exclude<OpenPanel, "none">) => {
    setOpenPanel((prev) => (prev === panel ? "none" : panel));
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center" dir="rtl">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-[#050508]/55 backdrop-blur-[6px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`إجراءات ${refLabel}`}
        className={cn(
          "relative z-[1] w-full max-w-[var(--alpha-content-narrow-width)] overflow-visible rounded-t-[28px] border shadow-[0_-24px_64px_-16px_rgba(0,0,0,0.55)] animate-in slide-in-from-bottom-6 fade-in duration-300",
          spiritualMode
            ? "border-t border-[#7af0b8]/22 bg-gradient-to-b from-[#101a14]/96 via-[#0b1410]/94 to-[#060c09]/92 backdrop-blur-2xl"
            : "border-t border-[#e7c97a]/45 bg-gradient-to-b from-white/96 via-[#fffaf3]/94 to-[#f3ebe0]/92 backdrop-blur-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <SheetGlow spiritualMode={spiritualMode} />

        <div className="relative flex justify-center pt-3 pb-1" aria-hidden>
          <div
            className={cn(
              "h-1 w-11 rounded-full",
              spiritualMode ? "bg-white/20 shadow-[0_0_12px_rgba(122,240,184,0.35)]" : "bg-[#c79356]/40 shadow-[0_0_12px_rgba(231,201,122,0.35)]",
            )}
          />
        </div>

        <div className="relative flex items-start justify-between gap-3 px-4 pb-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full border backdrop-blur-xl transition active:scale-95",
              spiritualMode
                ? "border-white/12 bg-white/8 text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "border-[#e7c97a]/35 bg-white/72 text-[#7a6548] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_14px_-8px_rgba(120,80,30,0.35)]",
            )}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-right">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-wide backdrop-blur-md",
                spiritualMode
                  ? "border-[#f0d78c]/30 bg-[#f0d78c]/10 text-[#f0d78c]"
                  : "border-[#e7c97a]/40 bg-[#f0d78c]/15 text-[#7a5a18]",
              )}
            >
              <span className="opacity-80">✦</span>
              {refLabel}
              <span className="opacity-80">✦</span>
            </span>
          </div>
        </div>

        <div className="px-4 pb-5">
          <div
            className={cn(
              "relative overflow-hidden rounded-[20px] border px-4 py-3.5 backdrop-blur-xl",
              spiritualMode
                ? "border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_28px_-12px_rgba(0,0,0,0.45)]"
                : "border-[#e7c97a]/30 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_32px_-14px_rgba(120,80,30,0.28)]",
            )}
            style={
              activeMeta
                ? {
                    boxShadow: spiritualMode
                      ? `inset 0 0 0 1px ${activeMeta.ring}33, 0 8px 28px -12px rgba(0,0,0,0.45), 0 0 24px -8px ${activeMeta.ring}33`
                      : `inset 0 0 0 1px ${activeMeta.ring}44, inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 32px -14px rgba(120,80,30,0.28), 0 0 20px -6px ${activeMeta.bg}88`,
                    background: spiritualMode ? `${activeMeta.bg}12` : `${activeMeta.bg}44`,
                  }
                : undefined
            }
          >
            <p
              className={cn(
                "relative font-arabic-serif text-[14px] font-medium leading-[1.95]",
                spiritualMode ? "text-white/88" : "text-[#3a2a18]",
              )}
            >
              {target.text}
            </p>
          </div>
        </div>

        {/* Toolbar — expandable upward */}
        <div className="relative px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-1">
          <div className="flex items-end justify-center gap-3">
            {/* Highlight trigger + colors popover */}
            <div className="relative flex flex-1 flex-col items-center">
              {openPanel === "colors" ? (
                <ColorPopover
                  spiritualMode={spiritualMode}
                  highlightColor={highlightColor}
                  onPick={(color) => {
                    onHighlight(color);
                    setOpenPanel("none");
                  }}
                />
              ) : null}

              <CircleTrigger
                spiritualMode={spiritualMode}
                active={openPanel === "colors"}
                label="تلوين"
                onClick={() => togglePanel("colors")}
                ariaExpanded={openPanel === "colors"}
                style={
                  activeMeta
                    ? {
                        background: `linear-gradient(145deg, ${activeMeta.bg} 0%, ${activeMeta.ring}88 100%)`,
                        borderColor: activeMeta.ring,
                        boxShadow: `0 0 18px -4px ${activeMeta.ring}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                      }
                    : undefined
                }
              >
                {activeMeta ? (
                  <span className="text-[13px] font-black text-white drop-shadow-sm">✓</span>
                ) : (
                  <Highlighter className={cn("h-5 w-5", spiritualMode ? "text-[#f0d78c]" : "text-[#c79356]")} strokeWidth={2.2} />
                )}
              </CircleTrigger>
            </div>

            {/* Tools trigger + actions popover */}
            <div className="relative flex flex-1 flex-col items-center">
              {openPanel === "tools" ? (
                <ToolsPopover
                  spiritualMode={spiritualMode}
                  saved={target.saved}
                  onMeditate={() => {
                    setOpenPanel("none");
                    onMeditate();
                  }}
                  onAddNote={() => {
                    setOpenPanel("none");
                    onAddNote();
                  }}
                  onToggleSave={() => {
                    setOpenPanel("none");
                    onToggleSave();
                  }}
                />
              ) : null}

              <CircleTrigger
                spiritualMode={spiritualMode}
                active={openPanel === "tools"}
                label="أدوات"
                onClick={() => togglePanel("tools")}
                ariaExpanded={openPanel === "tools"}
              >
                <Layers className={cn("h-5 w-5", spiritualMode ? "text-[#8fd4ff]" : "text-[#5b8fd1]")} strokeWidth={2.1} />
              </CircleTrigger>
            </div>

            {/* Community share — standalone */}
            <div className="flex flex-1 flex-col items-center">
              <button
                type="button"
                onClick={onShareCommunity}
                className={cn(
                  "flex w-full max-w-[118px] flex-col items-center gap-2 rounded-[20px] border px-2 py-3 backdrop-blur-xl transition active:scale-[0.97]",
                  spiritualMode
                    ? "border-[#7af0b8]/28 bg-gradient-to-b from-[#1f8a5a]/18 to-[#1f8a5a]/08 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(31,138,90,0.45)]"
                    : "border-[#1f8a5a]/30 bg-gradient-to-b from-white/78 to-[#e8f8ef]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_8px_22px_-12px_rgba(31,138,90,0.35)]",
                )}
              >
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md",
                    spiritualMode
                      ? "border-[#7af0b8]/30 bg-gradient-to-br from-[#7af0b8]/20 to-[#1f8a5a]/15 text-[#8ef0b8]"
                      : "border-[#1f8a5a]/28 bg-gradient-to-br from-[#bbf7d0]/85 to-[#1f8a5a]/18 text-[#1f8a5a]",
                  )}
                >
                  <Users className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <span className={cn("text-[9px] font-extrabold leading-tight", spiritualMode ? "text-[#8ef0b8]" : "text-[#1f6a48]")}>
                  مجتمعي
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SheetGlow({ spiritualMode }: { spiritualMode: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[120%] -translate-x-1/2 opacity-70"
        style={{
          background: spiritualMode
            ? "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(122,240,184,0.18) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(231,201,122,0.28) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          spiritualMode ? "bg-gradient-to-r from-transparent via-[#7af0b8]/35 to-transparent" : "bg-gradient-to-r from-transparent via-[#e7c97a]/55 to-transparent",
        )}
      />
    </>
  );
}

function CircleTrigger({
  children,
  label,
  onClick,
  spiritualMode,
  active,
  ariaExpanded,
  style,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  spiritualMode: boolean;
  active: boolean;
  ariaExpanded: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-label={label}
      className="flex flex-col items-center gap-2"
    >
      <span
        className={cn(
          "grid h-[52px] w-[52px] place-items-center rounded-full border-2 backdrop-blur-xl transition-all duration-200 active:scale-95",
          active && "scale-105",
          !style &&
            (spiritualMode
              ? "border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_20px_-10px_rgba(0,0,0,0.5)]"
              : "border-[#e7c97a]/35 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-10px_rgba(120,80,30,0.3)]"),
          active &&
            !style &&
            (spiritualMode
              ? "border-[#f0d78c]/40 ring-2 ring-[#f0d78c]/25"
              : "border-[#c79356]/45 ring-2 ring-[#e7c97a]/30"),
        )}
        style={style}
      >
        {children}
      </span>
      <span className={cn("text-[9px] font-extrabold", spiritualMode ? "text-white/65" : "text-[#8a7355]")}>{label}</span>
    </button>
  );
}

function PopoverShell({
  spiritualMode,
  children,
  className,
}: {
  spiritualMode: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute bottom-[calc(100%+10px)] z-20 animate-in fade-in slide-in-from-bottom-3 duration-200",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-[20px] border p-2.5 backdrop-blur-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]",
          spiritualMode
            ? "border-white/12 bg-[#0f1a14]/92 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "border-[#e7c97a]/35 bg-white/88 shadow-[0_12px_40px_-12px_rgba(120,80,30,0.28),inset_0_1px_0_rgba(255,255,255,0.85)]",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "mx-auto mt-1 h-2 w-2 rotate-45 border-b border-r",
          spiritualMode ? "border-white/12 bg-[#0f1a14]/92" : "border-[#e7c97a]/35 bg-white/88",
        )}
      />
    </div>
  );
}

function ColorPopover({
  spiritualMode,
  highlightColor,
  onPick,
}: {
  spiritualMode: boolean;
  highlightColor: VerseHighlightColor | null;
  onPick: (color: VerseHighlightColor | null) => void;
}) {
  return (
    <PopoverShell spiritualMode={spiritualMode} className="max-w-[calc(100vw-2rem)]">
      <div className="flex max-w-[240px] items-center gap-2.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VERSE_HIGHLIGHT_COLORS.map((c) => {
          const selected = highlightColor === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              aria-pressed={selected}
              title={c.label}
              onClick={() => onPick(selected ? null : c.id)}
              className={cn(
                "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all active:scale-95",
                selected && "scale-110",
              )}
              style={{
                background: `linear-gradient(145deg, ${c.bg} 0%, ${c.ring}88 100%)`,
                borderColor: selected ? c.ring : `${c.ring}55`,
                boxShadow: selected
                  ? `0 0 0 2px ${c.bg}aa, 0 0 16px -2px ${c.ring}`
                  : `inset 0 1px 0 rgba(255,255,255,0.35)`,
              }}
            >
              {selected ? <span className="text-[10px] font-black text-white">✓</span> : null}
            </button>
          );
        })}
      </div>
    </PopoverShell>
  );
}

function ToolsPopover({
  spiritualMode,
  saved,
  onMeditate,
  onAddNote,
  onToggleSave,
}: {
  spiritualMode: boolean;
  saved: boolean;
  onMeditate: () => void;
  onAddNote: () => void;
  onToggleSave: () => void;
}) {
  const items: {
    id: string;
    label: string;
    Icon: typeof Sparkles;
    tone: string;
    shell: string;
    onClick: () => void;
  }[] = [
    {
      id: "meditate",
      label: "تأمل",
      Icon: Sparkles,
      tone: spiritualMode ? "text-[#8fd4ff]" : "text-[#4a7eb8]",
      shell: spiritualMode ? "border-[#6eb5f0]/25 bg-[#6eb5f0]/10" : "border-[#5b8fd1]/25 bg-[#5b8fd1]/08",
      onClick: onMeditate,
    },
    {
      id: "note",
      label: "ملاحظة",
      Icon: FilePen,
      tone: spiritualMode ? "text-[#f0d78c]" : "text-[#7a5a18]",
      shell: spiritualMode ? "border-[#f0d78c]/25 bg-[#f0d78c]/10" : "border-[#c79356]/28 bg-[#f0d78c]/12",
      onClick: onAddNote,
    },
    {
      id: "save",
      label: saved ? "محفوظة" : "حفظ",
      Icon: saved ? BookmarkCheck : Bookmark,
      tone: spiritualMode ? "text-[#f0d78c]" : saved ? "text-[#7a5a18]" : "text-[#8a7355]",
      shell: saved
        ? spiritualMode
          ? "border-[#f0d78c]/35 bg-[#f0d78c]/12"
          : "border-[#c79356]/35 bg-[#f0d78c]/18"
        : spiritualMode
          ? "border-white/12 bg-white/[0.05]"
          : "border-[#e7c97a]/28 bg-white/60",
      onClick: onToggleSave,
    },
  ];

  return (
    <PopoverShell spiritualMode={spiritualMode} className="min-w-[132px]">
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={cn(
              "flex items-center justify-end gap-2.5 rounded-xl border px-3 py-2.5 transition active:scale-[0.98]",
              item.shell,
            )}
          >
            <span className={cn("text-[12px] font-extrabold", item.tone)}>{item.label}</span>
            <span className={cn("grid h-8 w-8 place-items-center rounded-lg border border-current/20 bg-current/10", item.tone)}>
              <item.Icon className="h-4 w-4" strokeWidth={2.1} />
            </span>
          </button>
        ))}
      </div>
    </PopoverShell>
  );
}
