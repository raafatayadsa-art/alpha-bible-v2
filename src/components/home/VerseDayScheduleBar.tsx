import type { DailyVerseScheduleItem } from "@/lib/daily-verse";
import { cn } from "@/lib/utils";

type VerseDayScheduleBarProps = {
  items: DailyVerseScheduleItem[];
  selectedDayKey: string;
  onSelectDay: (dayKey: string) => void;
  compact?: boolean;
};

/** Interactive week strip — pick a day to load its scheduled daily verse. */
export function VerseDayScheduleBar({
  items,
  selectedDayKey,
  onSelectDay,
  compact = false,
}: VerseDayScheduleBarProps) {
  if (!items.length) return null;

  return (
    <div
      className={cn("w-full", compact ? "px-0" : "px-0.5")}
      dir="rtl"
      role="tablist"
      aria-label="جدول آيات الأسبوع"
    >
      <div className="flex items-stretch justify-between gap-1">
        {items.map((item) => {
          const selected = item.dayKey === selectedDayKey;
          return (
            <button
              key={item.dayKey}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${item.weekdayLabel} — ${item.reference}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDay(item.dayKey);
              }}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition active:scale-95",
                selected ? "alpha-verse-schedule-day--active" : "alpha-verse-schedule-day",
              )}
            >
              <span
                className={cn(
                  "text-[8px] font-extrabold leading-none",
                  selected ? "text-[var(--alpha-accent-green-deep)]" : "text-white/55",
                )}
              >
                {item.weekdayLabel}
              </span>
              <span
                className={cn(
                  "h-1 w-full max-w-[22px] rounded-full transition-all",
                  selected
                    ? "bg-gradient-to-l from-[var(--alpha-accent-green)] to-[var(--alpha-accent-green-deep)] shadow-[0_0_8px_rgba(45,154,106,0.55)]"
                    : "bg-white/20",
                )}
              />
            </button>
          );
        })}
      </div>
      {items.find((i) => i.dayKey === selectedDayKey)?.reference ? (
        <p
          className="mt-1 truncate text-center text-[8px] font-bold text-[var(--alpha-accent-green)]/90"
          dir="ltr"
        >
          {items.find((i) => i.dayKey === selectedDayKey)?.reference}
        </p>
      ) : null}
    </div>
  );
}
