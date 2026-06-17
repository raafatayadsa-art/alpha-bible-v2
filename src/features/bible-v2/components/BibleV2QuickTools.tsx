import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock, FilePen, SearchCheck } from "lucide-react";
import { useBibleSearch } from "@/features/bible-search";
import { useCurrentSession } from "@/lib/reading-state";
import { bibleV2Tokens } from "../tokens";
import { BibleV2QuickToolIcon } from "./BibleV2QuickToolIcon";

type ToolTone = "gold" | "navy";

const panelShadow = [
  "inset 0 1px 0 rgba(255,255,255,0.95)",
  "inset 0 -1px 0 rgba(255,255,255,0.35)",
  `0 16px 36px -16px ${bibleV2Tokens.shadowCard}`,
  `0 6px 18px -10px ${bibleV2Tokens.shadowWarm}`,
  "0 0 0 1px rgba(212,175,55,0.1)",
].join(", ");

const tileClass =
  "group flex flex-col items-center gap-2 rounded-[18px] px-1 py-2.5 transition duration-200 hover:bg-white/50 active:scale-[0.97]";

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
      <span
        className="text-center text-[10.5px] font-semibold leading-tight transition-colors group-hover:text-[#2a1f12]"
        style={{ color: bibleV2Tokens.textSecondary }}
      >
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to as "/"}
        {...(params ? { params: params as never } : {})}
        className={tileClass}
        aria-label={label}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={tileClass} aria-label={label}>
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
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px]" style={{ color: bibleV2Tokens.gold }}>
          ✦
        </span>
        <h2 className="text-[15px] font-extrabold" style={{ color: bibleV2Tokens.navy }}>
          أدوات سريعة
        </h2>
      </div>

      <div
        className="rounded-[24px] border border-white/75 p-2 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(250,247,242,0.52) 48%, rgba(255,255,255,0.68) 100%)",
          boxShadow: panelShadow,
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <div className="grid grid-cols-4 gap-1">
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
      </div>
    </section>
  );
}
