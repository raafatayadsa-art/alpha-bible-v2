import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock, FilePen, SearchCheck } from "lucide-react";
import { useBibleSearch } from "@/features/bible-search";
import { useCurrentSession } from "@/lib/reading-state";
import { bibleV2Tokens } from "../tokens";
import { BibleV2QuickToolIcon } from "./BibleV2QuickToolIcon";

type ToolTone = "gold" | "navy";

const TILE_CLASS =
  "group flex flex-col items-center gap-2.5 rounded-[22px] border border-[#efe4c6]/90 bg-gradient-to-b from-[#fffdf8] to-[#f3e8d4] px-2 py-3.5 transition duration-300 hover:-translate-y-1 active:scale-[0.96]";

const tileShadow = [
  "inset 0 2px 0 rgba(255,255,255,0.95)",
  "inset 0 -4px 10px rgba(120,90,40,0.06)",
  `0 14px 30px -12px ${bibleV2Tokens.shadowCard}`,
  `0 6px 14px -8px ${bibleV2Tokens.shadowWarm}`,
].join(", ");

function QuickToolTile({
  label,
  icon,
  tone,
  onClick,
  to,
  params,
}: {
  label: string;
  icon: LucideIcon;
  tone: ToolTone;
  onClick?: () => void;
  to?: string;
  params?: Record<string, string>;
}) {
  const inner = (
    <>
      <BibleV2QuickToolIcon icon={icon} tone={tone} />
      <span className="text-center text-[11px] font-bold leading-tight text-[#3a2c10]">{label}</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to as "/"}
        {...(params ? { params: params as never } : {})}
        className={TILE_CLASS}
        style={{ boxShadow: tileShadow, transform: "translateY(-2px)" }}
        aria-label={label}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={TILE_CLASS}
      style={{ boxShadow: tileShadow, transform: "translateY(-2px)" }}
      aria-label={label}
    >
      {inner}
    </button>
  );
}

export function BibleV2QuickTools() {
  const session = useCurrentSession();
  const { openSearch } = useBibleSearch();

  const lastReadTo = session
    ? { to: "/$book/$chapter" as const, params: { book: session.book, chapter: String(session.chapter) } }
    : { to: "/books" as const };

  return (
    <section dir="rtl" className="mx-4 mt-6">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="text-[13px] text-[#d4af37]">✦</span>
        <h2 className="text-[15px] font-extrabold" style={{ color: bibleV2Tokens.navy }}>
          أدوات سريعة
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <QuickToolTile label="المفضلة" icon={Bookmark} tone="gold" to="/bible/saved" />
        <QuickToolTile
          label="آخر قراءة"
          icon={Clock}
          tone="gold"
          to={lastReadTo.to}
          params={"params" in lastReadTo ? lastReadTo.params : undefined}
        />
        <QuickToolTile label="ملاحظاتي" icon={FilePen} tone="navy" to="/bible/notes" />
        <QuickToolTile label="بحث متقدم" icon={SearchCheck} tone="navy" onClick={openSearch} />
      </div>
    </section>
  );
}
