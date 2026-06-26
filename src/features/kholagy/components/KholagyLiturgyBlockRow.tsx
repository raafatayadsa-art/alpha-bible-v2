import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import type { KholagyColumn, KholagyDisplayMode } from "../kholagy-display";
import { columnsForMode } from "../kholagy-display";
import {
  kholagyColumnShellClass,
  kholagyColumnTextClass,
} from "../kholagy-reading-layout";
import type { KholagyLiturgyBlock } from "../types";

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

const ROLE_STYLE: Record<string, string> = {
  priest: "bg-[#5a3d92]/12 text-[#5a3d92] border-[#8a6ec1]/35",
  deacon: "bg-[#4a9e6e]/12 text-[#2e7a4a] border-[#6aab82]/35",
  people: "bg-[#b8893a]/12 text-[#8a5a1f] border-[#e7c075]/45",
  rubrics: "bg-black/5 text-[#6a5488] border-[#c4b0e8]/35",
};

function cellText(block: KholagyLiturgyBlock, col: KholagyColumn): string {
  switch (col) {
    case "ar":
      return block.arabicText;
    case "cop":
      return block.copticText;
    case "en":
      return block.englishText;
  }
}

export function KholagyLiturgyBlockRow({
  block,
  mode,
  dark,
  active = false,
}: {
  block: KholagyLiturgyBlock;
  mode: KholagyDisplayMode;
  dark: boolean;
  active?: boolean;
}) {
  const cols = columnsForMode(mode);
  const hasVisibleText = cols.some((col) => cellText(block, col).trim().length > 0);
  if (!hasVisibleText) return null;
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${glow}, transparent)`,
          }}
        />
      ) : null}
      {block.roleLabelAr ? (
        <div className="relative z-[3] flex justify-center px-3 pt-3">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
              ROLE_STYLE[block.role ?? "rubrics"] ?? ROLE_STYLE.rubrics,
            )}
          >
            {block.roleLabelAr}
          </span>
        </div>
      ) : null}
      <div
        dir="rtl"
        className="kholagy-verse-columns relative grid w-full min-w-0"
        style={{ "--kg-cols": cols.length } as CSSProperties}
      >
        {cols.map((col, i) => {
          const meta = COLUMN_META[col];
          const text = cellText(block, col);
          return (
            <div key={col} className={kholagyColumnShellClass(i, dark)}>
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
