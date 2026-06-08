import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const ITEM_H = 26;
const WHEEL_H = 96;
const WHEEL_PAD = (WHEEL_H - ITEM_H) / 2;
const SNAP_MS = 130;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function to12h(h24: number): { h: number; ampm: "am" | "pm" } {
  const ampm: "am" | "pm" = h24 >= 12 ? "pm" : "am";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return { h, ampm };
}

function to24h(h12: number, ampm: "am" | "pm"): number {
  if (ampm === "am") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function parseTime(value: string): { h12: number; min: number; ampm: "am" | "pm" } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h24 = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h24) || !Number.isFinite(min) || min < 0 || min > 59 || h24 < 0 || h24 > 23) {
    return null;
  }
  const t = to12h(h24);
  return { h12: t.h, min, ampm: t.ampm };
}

function toTimeValue(h12: number, min: number, ampm: "am" | "pm"): string {
  return `${pad2(to24h(h12, ampm))}:${pad2(min)}`;
}

function defaultParts(): { h12: number; min: number; ampm: "am" | "pm" } {
  return { h12: 9, min: 0, ampm: "am" as const };
}

/** Official Alpha time display — Arabic 12h */
export function formatAlphaTimeDisplay(value: string): string {
  const parsed = parseTime(value);
  if (!parsed) return "";
  const dt = new Date();
  dt.setHours(to24h(parsed.h12, parsed.ampm), parsed.min, 0, 0);
  return dt.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit", hour12: true });
}

function hapticTick() {
  try {
    navigator.vibrate?.(6);
  } catch {
    /* unsupported */
  }
}

function WheelColumn({
  items,
  value,
  onChange,
}: {
  items: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const snappingRef = useRef(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [tickKey, setTickKey] = useState(0);

  const valueIdx = items.findIndex((i) => i.v === value);

  const scrollToIndex = useCallback(
    (idx: number, smooth = false) => {
      const el = ref.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      snappingRef.current = smooth;
      el.scrollTo({ top: clamped * ITEM_H, behavior: smooth ? "smooth" : "auto" });
      setFocusedIdx(clamped);
      if (smooth) {
        window.setTimeout(() => {
          snappingRef.current = false;
        }, 300);
      }
    },
    [items.length],
  );

  const scrollToValue = useCallback(
    (v: string, smooth = false) => {
      const idx = items.findIndex((i) => i.v === v);
      if (idx >= 0) scrollToIndex(idx, smooth);
    },
    [items, scrollToIndex],
  );

  useEffect(() => {
    scrollToValue(value, false);
  }, [value, scrollToValue]);

  useEffect(() => {
    if (valueIdx >= 0) setFocusedIdx(valueIdx);
  }, [valueIdx]);

  const commitIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped]?.v;
      if (next && next !== value) {
        onChange(next);
        setTickKey((k) => k + 1);
        hapticTick();
      }
      scrollToIndex(clamped, true);
    },
    [items, onChange, scrollToIndex, value],
  );

  const handleScroll = () => {
    const el = ref.current;
    if (!el || snappingRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      setFocusedIdx(idx);
    });

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      commitIndex(idx);
    }, SNAP_MS);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="alpha-date-wheel no-scrollbar overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory"
        style={{
          height: WHEEL_H,
          paddingTop: WHEEL_PAD,
          paddingBottom: WHEEL_PAD,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - focusedIdx);
          const isSelected = item.v === value;
          const isFocused = idx === focusedIdx;
          const wheelColor = isFocused ? "#1F2937" : dist === 1 ? "#6B7280" : "#9CA3AF";
          const wheelOpacity = isFocused ? 1 : dist === 1 ? 0.75 : 0.45;
          return (
            <button
              key={item.v}
              type="button"
              onClick={() => {
                onChange(item.v);
                setTickKey((k) => k + 1);
                hapticTick();
                scrollToIndex(idx, true);
              }}
              className="alpha-date-wheel-item relative z-[30] snap-center block w-full text-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: ITEM_H,
                fontSize: isFocused ? "15px" : dist === 1 ? "13px" : "12px",
                fontWeight: isFocused ? 700 : 500,
                color: wheelColor,
                opacity: wheelOpacity,
                transform: isFocused ? "scale(1.06)" : dist === 1 ? "scale(0.97)" : "scale(0.92)",
                textShadow: isFocused ? "0 1px 2px rgba(255,255,255,0.9)" : "none",
                animation:
                  isSelected && isFocused && tickKey > 0
                    ? "alphaDateWheelTick 0.24s cubic-bezier(0.22,1,0.36,1) both"
                    : undefined,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AlphaTimePickerSheet({
  open,
  title,
  h12,
  min,
  ampm,
  onHourChange,
  onMinChange,
  onAmpmChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  h12: number;
  min: number;
  ampm: "am" | "pm";
  onHourChange: (h: number) => void;
  onMinChange: (m: number) => void;
  onAmpmChange: (a: "am" | "pm") => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const hourItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1), label: String(i + 1) })),
    [],
  );

  const minItems = useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({ v: String(i), label: pad2(i) })),
    [],
  );

  const ampmItems = useMemo(
    () => [
      { v: "am", label: "صباحاً" },
      { v: "pm", label: "مساءً" },
    ],
    [],
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{`
        @keyframes alphaDateWheelTick {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.06); }
        }
        @keyframes alphaDateSheetIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[120] flex items-end justify-center px-4"
        dir="rtl"
        style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 32px), 40px)" }}
      >
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute inset-0 bg-[#1a1408]/22 backdrop-blur-[4px] animate-in fade-in duration-200"
        />
        <div
          className="relative z-[1] w-full max-w-[360px] overflow-hidden rounded-[26px] border border-white/88 bg-white/68 shadow-[0_28px_64px_-22px_rgba(30,24,12,0.28),0_0_48px_-16px_rgba(212,168,87,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl"
          style={{ animation: "alphaDateSheetIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4a857]/45 to-transparent"
          />

          <div className="flex items-center justify-between px-5 py-3" dir="ltr">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[52px] text-left text-[13px] font-semibold text-[#EF4444] transition-colors hover:text-[#DC2626] active:text-[#B91C1C] active:scale-[0.97]"
            >
              إلغاء
            </button>
            <p className="font-arabic-serif text-center text-[14px] font-extrabold tracking-tight text-[#3a2a18]">
              {title}
            </p>
            <button
              type="button"
              onClick={onConfirm}
              className="min-w-[52px] text-right text-[13px] font-extrabold text-[#10B981] transition-colors hover:text-[#059669] active:text-[#047857] active:scale-[0.97]"
            >
              تم
            </button>
          </div>

          <div className="relative mx-3 mb-3 overflow-hidden rounded-[18px] border border-white/80 bg-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md">
            <div className="flex px-1 pt-2">
              {(["الساعة", "الدقيقة", "ص/م"] as const).map((label) => (
                <p
                  key={label}
                  className="min-w-0 flex-1 text-center text-[9.5px] font-extrabold tracking-wide text-[#8a6a3a]"
                >
                  {label}
                </p>
              ))}
            </div>

            <div className="relative px-0 pb-1.5">
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[26px] -translate-y-1/2 rounded-[11px] border border-white/95 bg-white/82 shadow-[0_0_18px_rgba(255,255,255,0.5),0_4px_14px_rgba(212,168,87,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-7 bg-gradient-to-b from-white/72 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 bg-gradient-to-t from-white/72 to-transparent"
                aria-hidden
              />

              <div className="relative z-[25] flex">
                <WheelColumn
                  items={hourItems}
                  value={String(h12)}
                  onChange={(v) => onHourChange(Number(v))}
                />
                <WheelColumn
                  items={minItems}
                  value={String(min)}
                  onChange={(v) => onMinChange(Number(v))}
                />
                <WheelColumn
                  items={ampmItems}
                  value={ampm}
                  onChange={(v) => onAmpmChange(v as "am" | "pm")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export type AlphaTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  title?: string;
  placeholder?: string;
  className?: string;
};

/**
 * Official Alpha time picker — all time fields app-wide must use this component.
 * Stores value as `HH:mm` (24h).
 */
export function AlphaTimePicker({
  value,
  onChange,
  disabled,
  title = "اختر الوقت",
  placeholder = "اختر الوقت",
  className,
}: AlphaTimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseTime(value) ?? defaultParts();
  const [draftH12, setDraftH12] = useState(parsed.h12);
  const [draftMin, setDraftMin] = useState(parsed.min);
  const [draftAmpm, setDraftAmpm] = useState(parsed.ampm);

  const openSheet = () => {
    if (disabled) return;
    const p = parseTime(value) ?? defaultParts();
    setDraftH12(p.h12);
    setDraftMin(p.min);
    setDraftAmpm(p.ampm);
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(toTimeValue(draftH12, draftMin, draftAmpm));
    setOpen(false);
  };

  const display = formatAlphaTimeDisplay(value);

  const triggerCls =
    className ??
    "w-full rounded-xl border border-[#efe2c4]/90 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/25 transition";

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        disabled={disabled}
        className={cn(
          triggerCls,
          "flex w-full items-center justify-between gap-2 text-right",
          !display && "text-[#9a7e5a]/80",
          disabled && "cursor-default opacity-70",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-[#b8893a]" strokeWidth={2} />
          <span className="truncate font-semibold text-[#3a2a18]">{display || placeholder}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#9a7e5a]" />
      </button>

      <AlphaTimePickerSheet
        open={open}
        title={title}
        h12={draftH12}
        min={draftMin}
        ampm={draftAmpm}
        onHourChange={setDraftH12}
        onMinChange={setDraftMin}
        onAmpmChange={setDraftAmpm}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
