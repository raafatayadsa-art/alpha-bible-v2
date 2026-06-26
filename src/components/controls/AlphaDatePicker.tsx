import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { MESSAGING_GLASS_SHELL } from "@/components/alpha/messaging-ui";

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

const ITEM_H = 36;
const WHEEL_H = 120;
const WHEEL_PAD = (WHEEL_H - ITEM_H) / 2;
const WHEEL_FONT_SIZE = "17px";
const DAY_COL_W = 54;
const MONTH_COL_W = 110;
const YEAR_COL_W = 76;
const DEFAULT_MIN_YEAR = 1940;
const SNAP_MS = 130;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function toIso(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIso(value: string): { day: number; month: number; year: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1) return null;
  return { day, month, year };
}

/** Official Alpha date display — `15 مارس 2018` */
export function formatAlphaDateDisplay(value: string): string {
  const parsed = parseIso(value);
  if (!parsed) return "";
  return `${parsed.day} ${AR_MONTHS[parsed.month - 1]} ${parsed.year}`;
}

function clampDay(day: number, month: number, year: number): number {
  return Math.min(day, daysInMonth(month, year));
}

function defaultParts(): { day: number; month: number; year: number } {
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
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

  const valueIdx = items.findIndex((i) => i.v === value);

  const scrollToIndex = useCallback((idx: number, smooth = false) => {
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
  }, [items.length]);

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
    <div className="relative shrink-0" style={{ width: "100%" }}>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="alpha-date-wheel no-scrollbar overflow-y-auto overscroll-contain snap-y snap-mandatory"
        style={{
          height: WHEEL_H,
          paddingTop: WHEEL_PAD,
          paddingBottom: WHEEL_PAD,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - focusedIdx);
          const isFocused = idx === focusedIdx;
          const wheelColor = isFocused ? "#1F2937" : dist === 1 ? "#6B7280" : "#9CA3AF";
          const wheelOpacity = isFocused ? 1 : dist === 1 ? 0.65 : 0.38;
          return (
            <button
              key={item.v}
              type="button"
              onClick={() => {
                onChange(item.v);
                hapticTick();
                scrollToIndex(idx, true);
              }}
              className="alpha-date-wheel-item relative z-[30] block w-full snap-center"
              style={{ height: ITEM_H }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center overflow-hidden px-0.5 text-center leading-none"
                style={{
                  fontSize: WHEEL_FONT_SIZE,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: wheelColor,
                  opacity: wheelOpacity,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AlphaDatePickerSheet({
  open,
  title,
  day,
  month,
  year,
  minYear,
  maxYear,
  onDayChange,
  onMonthChange,
  onYearChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  day: number;
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  onDayChange: (d: number) => void;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dayItems = useMemo(() => {
    const max = daysInMonth(month, year);
    return Array.from({ length: max }, (_, i) => {
      const d = i + 1;
      return { v: String(d), label: String(d) };
    });
  }, [month, year]);

  const monthItems = useMemo(
    () => AR_MONTHS.map((name, i) => ({ v: String(i + 1), label: name })),
    [],
  );

  const yearItems = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = maxYear - i;
        return { v: String(y), label: String(y) };
      }),
    [maxYear, minYear],
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{`
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
          className="absolute inset-0 bg-black/28 backdrop-blur-[3px] animate-in fade-in duration-200"
        />
        <div
          className={cn("relative z-[1] w-full max-w-[320px] overflow-hidden", MESSAGING_GLASS_SHELL)}
          style={{ animation: "alphaDateSheetIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <div className="relative flex h-12 items-center justify-center px-4 pt-1" dir="rtl">
            <p className="text-[14px] font-bold text-[#1F2937]">{title}</p>
            <button
              type="button"
              onClick={onConfirm}
              className="absolute inset-y-0 start-4 flex items-center pt-0.5 text-[16px] font-bold text-[#166534] transition-colors hover:text-[#14532D] active:text-[#0F3D22]"
            >
              تم
            </button>
            <button
              type="button"
              onClick={onClose}
              className="absolute inset-y-0 end-4 flex items-center pt-0.5 text-[14px] font-semibold text-[#EF4444]"
            >
              إلغاء
            </button>
          </div>

          <div className="relative mx-2.5 mb-3 mt-1 overflow-hidden rounded-[14px] border border-white/32 bg-white/42 backdrop-blur-sm">
            <div
              className="mx-auto grid px-1 pt-2"
              style={{
                width: DAY_COL_W + MONTH_COL_W + YEAR_COL_W,
                gridTemplateColumns: `${DAY_COL_W}px ${MONTH_COL_W}px ${YEAR_COL_W}px`,
              }}
            >
              {(["اليوم", "الشهر", "السنة"] as const).map((label) => (
                <p
                  key={label}
                  className="text-center text-[10.5px] font-extrabold tracking-wide text-[#8a6a3a]"
                >
                  {label}
                </p>
              ))}
            </div>

            <div className="relative px-0 pb-1.5">
              <div
                className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 rounded-[11px] border border-white/95 bg-white/82 shadow-[0_0_18px_rgba(255,255,255,0.5),0_4px_14px_rgba(212,168,87,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm"
                style={{
                  height: ITEM_H,
                  left: "50%",
                  width: DAY_COL_W + MONTH_COL_W + YEAR_COL_W,
                  transform: "translate(-50%, -50%)",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute top-0 z-20 h-7 bg-gradient-to-b from-white/72 to-transparent"
                style={{
                  left: "50%",
                  width: DAY_COL_W + MONTH_COL_W + YEAR_COL_W,
                  transform: "translateX(-50%)",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0 z-20 h-7 bg-gradient-to-t from-white/72 to-transparent"
                style={{
                  left: "50%",
                  width: DAY_COL_W + MONTH_COL_W + YEAR_COL_W,
                  transform: "translateX(-50%)",
                }}
                aria-hidden
              />

              <div
                className="relative z-[25] mx-auto grid items-stretch"
                style={{
                  width: DAY_COL_W + MONTH_COL_W + YEAR_COL_W,
                  gridTemplateColumns: `${DAY_COL_W}px ${MONTH_COL_W}px ${YEAR_COL_W}px`,
                }}
              >
                <WheelColumn
                  items={dayItems}
                  value={String(day)}
                  onChange={(v) => onDayChange(Number(v))}
                />
                <WheelColumn
                  items={monthItems}
                  value={String(month)}
                  onChange={(v) => onMonthChange(Number(v))}
                />
                <WheelColumn
                  items={yearItems}
                  value={String(year)}
                  onChange={(v) => onYearChange(Number(v))}
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

export type AlphaDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  title?: string;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  className?: string;
};

/**
 * Official Alpha date picker — all date fields app-wide must use this component.
 * Stores value as `yyyy-mm-dd`.
 */
export function AlphaDatePicker({
  value,
  onChange,
  disabled,
  title = "اختر التاريخ",
  placeholder = "اختر التاريخ",
  minYear = DEFAULT_MIN_YEAR,
  maxYear = new Date().getFullYear(),
  className,
}: AlphaDatePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseIso(value) ?? defaultParts();
  const [draftDay, setDraftDay] = useState(parsed.day);
  const [draftMonth, setDraftMonth] = useState(parsed.month);
  const [draftYear, setDraftYear] = useState(parsed.year);

  const openSheet = () => {
    if (disabled) return;
    const p = parseIso(value) ?? defaultParts();
    setDraftDay(p.day);
    setDraftMonth(p.month);
    setDraftYear(p.year);
    setOpen(true);
  };

  const handleMonthChange = (m: number) => {
    setDraftMonth(m);
    setDraftDay((d) => clampDay(d, m, draftYear));
  };

  const handleYearChange = (y: number) => {
    setDraftYear(y);
    setDraftDay((d) => clampDay(d, draftMonth, y));
  };

  const handleConfirm = () => {
    const day = clampDay(draftDay, draftMonth, draftYear);
    onChange(toIso(day, draftMonth, draftYear));
    setOpen(false);
  };

  const display = formatAlphaDateDisplay(value);

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
          <CalendarDays className="h-4 w-4 shrink-0 text-[#b8893a]" strokeWidth={2} />
          <span className="truncate font-semibold text-[#3a2a18]">
            {display || placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#9a7e5a]" />
      </button>

      <AlphaDatePickerSheet
        open={open}
        title={title}
        day={draftDay}
        month={draftMonth}
        year={draftYear}
        minYear={minYear}
        maxYear={maxYear}
        onDayChange={setDraftDay}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
