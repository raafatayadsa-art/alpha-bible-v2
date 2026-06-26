import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import type { KholagyColumn, KholagyDisplayMode } from "../kholagy-display";
import { columnsForMode } from "../kholagy-display";
import {
  kholagyColumnShellClass,
  kholagyColumnTextClass,
} from "../kholagy-reading-layout";
import type { KholagyVerse } from "../types";

const GOLD_GLOW = "#e7c075";
const GOLD_GLOW_DARK = "#f0d78c";

const COLUMN_META: Record<
  KholagyColumn,
  { label: string; dir: "rtl" | "ltr"; mono?: boolean }
> = {
  ar: { label: "عربي", dir: "rtl" },
  cop: { label: "ⲀⲂ", dir: "ltr", mono: true },
  en: { label: "EN", dir: "ltr" },
};

function cellText(verse: KholagyVerse, col: KholagyColumn): string {
  switch (col) {
    case "ar":
      return verse.arabicText;
    case "cop":
      return verse.copticText && verse.copticText !== "-" ? verse.copticText : "";
    case "en":
      return verse.englishText && verse.englishText !== "-" ? verse.englishText : "";
  }
}

export function KholagyVerseRow({
  verse,
  mode,
  dark,
  active = false,
}: {
  verse: KholagyVerse;
  mode: KholagyDisplayMode;
  dark: boolean;
  active?: boolean;
}) {
  const cols = columnsForMode(mode);
  const glow = active ? (dark ? GOLD_GLOW_DARK : GOLD_GLOW) : "transparent";

  return (
    <div
      className={cn(
        "kholagy-verse-card group relative overflow-hidden rounded-[22px] border transition duration-300",
        active && "kholagy-verse-card--active",
        dark
          ? active
            ? "border-[#f0d78c]/45 bg-white/[0.06]"
            : "border-white/8 bg-white/[0.03]"
          : active
            ? "border-[#e7c075]/55 bg-white/85"
            : "border-[#c4b0e8]/22 bg-white/60",
      )}
      style={{ "--kg-glow": glow } as CSSProperties}
    >
      {active ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${glow}, transparent)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22px]"
            style={{
              boxShadow: `inset 0 0 0 1px ${glow}66, inset 0 0 32px ${glow}22`,
            }}
          />
        </>
      ) : null}
      <div
        dir="rtl"
        className="kholagy-verse-columns relative grid w-full min-w-0"
        style={{ "--kg-cols": cols.length } as CSSProperties}
      >
        {cols.map((col, i) => {
          const meta = COLUMN_META[col];
          const text = cellText(verse, col);
          return (
            <div key={col} className={kholagyColumnShellClass(i, dark, "min-h-[4.5rem]")}>
              <span
                className={cn(
                  "mb-1.5 text-center text-[9px] font-bold tracking-wide",
                  active
                    ? dark
                      ? "text-[#f0d78c]/80"
                      : "text-[#b8893a]/85"
                    : dark
                      ? "text-[#c4b0ff]/45"
                      : "text-[#8a6ec1]/55",
                )}
              >
                {meta.label}
              </span>
              <p dir={meta.dir} className={kholagyColumnTextClass(col, active, dark)}>
                {text || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
