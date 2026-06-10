import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { bibleV2Tokens } from "../tokens";

export interface BibleV2TestamentData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: ReactNode;
  tone: "gold" | "blue";
  badgeInImage?: boolean;
  to: "/books-v2";
  search: { testament: "old" | "new" };
}

export function BibleV2TestamentCard({ data }: { data: BibleV2TestamentData }) {
  const isGold = data.tone === "gold";
  const cardGrad = isGold ? "from-[#fbf3dc] to-[#f5e6b8]" : "from-[#eef2fa] to-[#dce6f5]";
  const badgeGrad = isGold
    ? "from-[#e8c85a] via-[#d4a93a] to-[#8a6420]"
    : "from-[#4a6bb5] via-[#3d5a9a] to-[#1e2b54]";
  const btnGrad = isGold
    ? "from-[#d4a93a] via-[#b8892a] to-[#7a5a18]"
    : "from-[#3d5a9a] via-[#28406e] to-[#1e2b54]";
  const outerRing = isGold ? "rgba(212,175,55,0.42)" : "rgba(61,90,154,0.32)";
  const liftShadow = isGold
    ? "0 28px 52px -18px rgba(120,80,30,0.38), 0 12px 24px -12px rgba(184,137,58,0.28)"
    : "0 28px 52px -18px rgba(30,43,84,0.32), 0 12px 24px -12px rgba(61,90,154,0.22)";

  return (
    <Link
      to={data.to}
      search={data.search}
      dir="rtl"
      aria-label={data.title}
      className={`group relative flex flex-1 flex-col overflow-hidden rounded-[28px] bg-gradient-to-b ${cardGrad} text-right transition duration-300 hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.98]`}
      style={{
        boxShadow: [
          "inset 0 2px 0 rgba(255,255,255,0.95)",
          "inset 0 -3px 8px rgba(0,0,0,0.04)",
          `0 0 0 1px ${outerRing}`,
          liftShadow,
        ].join(", "),
        transform: "translateY(-4px)",
      }}
    >
      <div className="relative h-[178px] w-full overflow-hidden">
        <img
          src={data.image}
          alt=""
          loading="eager"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: isGold
              ? "linear-gradient(180deg, rgba(255,248,230,0.08) 0%, transparent 40%, rgba(90,60,20,0.12) 100%)"
              : "linear-gradient(180deg, rgba(230,240,255,0.1) 0%, transparent 40%, rgba(20,35,70,0.14) 100%)",
          }}
        />
        {!data.badgeInImage && data.badge ? (
          <div
            className={`absolute left-1/2 top-3 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b ${badgeGrad} text-xl text-white ring-2 ring-white/90`}
            style={{
              boxShadow: "0 10px 24px -6px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.35)",
            }}
          >
            {data.badge}
          </div>
        ) : null}
      </div>

      <div
        className="flex flex-1 flex-col items-center px-3 pb-4 pt-3.5 text-center"
        style={{ boxShadow: "inset 0 8px 12px -10px rgba(255,255,255,0.9)" }}
      >
        <h3 className="text-[17px] font-extrabold tracking-tight" style={{ color: bibleV2Tokens.navy }}>
          {data.title}
        </h3>
        <p className="mt-1.5 whitespace-pre-line text-[11px] leading-snug text-[#6a5a32]">{data.subtitle}</p>
        <div className="mt-auto pt-3.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-l ${btnGrad} px-6 py-2.5 text-white ring-1 ring-white/35`}
            style={{
              boxShadow: isGold
                ? "0 8px 20px -6px rgba(120,80,30,0.45), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "0 8px 20px -6px rgba(30,43,84,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-[12px] font-bold">استكشف</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
