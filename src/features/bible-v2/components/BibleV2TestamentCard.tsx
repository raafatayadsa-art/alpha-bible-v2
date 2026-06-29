import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export interface BibleV2TestamentData {
  id: "old" | "new";
  title: string;
  subtitle: string;
  image: string;
  badge?: ReactNode;
  tone: "gold" | "blue";
  badgeInImage?: boolean;
}

export function BibleV2TestamentCard({ data }: { data: BibleV2TestamentData }) {
  const isGold = data.tone === "gold";
  const btnGrad = isGold
    ? "from-[#c49a3a] via-[#a67c2a] to-[#6b4a14]"
    : "from-[#3d5a9a] via-[#28406e] to-[#1a2448]";
  const outerRing = isGold ? "rgba(212,175,55,0.38)" : "rgba(61,90,154,0.32)";
  const liftShadow = isGold
    ? "0 24px 48px -16px rgba(90,60,20,0.42), 0 10px 22px -10px rgba(184,137,58,0.28)"
    : "0 24px 48px -16px rgba(20,30,60,0.38), 0 10px 22px -10px rgba(61,90,154,0.24)";
  return (
    <Link
      to="/books"
      search={{ testament: data.id }}
      dir="rtl"
      aria-label={data.title}
      className="group relative block aspect-[1/1.55] min-w-0 flex-1 overflow-hidden rounded-[26px] transition duration-300 hover:-translate-y-1 active:scale-[0.98]"
      style={{
        boxShadow: [`0 0 0 1px ${outerRing}`, liftShadow].join(", "),
      }}
    >
      <img
          src={data.image}
          alt=""
          loading="eager"
          draggable={false}
          className="absolute inset-0 block h-full w-full min-h-full min-w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
        />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%]"
        style={{
          background: isGold
            ? "linear-gradient(180deg, transparent 0%, rgba(74,52,24,0.18) 38%, rgba(58,40,18,0.7) 100%)"
            : "linear-gradient(180deg, transparent 0%, rgba(16,28,58,0.2) 38%, rgba(10,18,40,0.75) 100%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col items-center px-2.5 pb-5 pt-10 text-center">
        <h3 className="text-[16px] font-extrabold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
          {data.title}
        </h3>
        <p className="mt-1.5 whitespace-pre-line text-[10.5px] leading-snug text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {data.subtitle}
        </p>
        <div className="mt-3.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-l ${btnGrad} px-5 py-2 text-white ring-1 ring-white/30`}
            style={{
              boxShadow: isGold
                ? "0 8px 18px -6px rgba(60,40,12,0.55), inset 0 1px 0 rgba(255,255,255,0.22)"
                : "0 8px 18px -6px rgba(12,22,48,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-[11.5px] font-bold">استكشف</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
