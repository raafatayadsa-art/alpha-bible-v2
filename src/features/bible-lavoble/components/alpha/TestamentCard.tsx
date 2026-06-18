import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export interface TestamentCardData {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  badge: ReactNode;
  tone: "gold" | "blue";
}

interface TestamentCardProps {
  data: TestamentCardData;
  onClick?: () => void;
}

export function TestamentCard({ data, onClick }: TestamentCardProps) {
  const isGold = data.tone === "gold";
  const cardRing = isGold ? "ring-[#e0c378]" : "ring-[#bcc8df]";
  const cardGrad = isGold
    ? "from-[#fbf3dc]/90 to-[#f3e0a8]/70"
    : "from-[#eef2fa]/90 to-[#d9e2f3]/70";
  const badgeGrad = isGold
    ? "from-[#e0b94a] to-[#a87a1f]"
    : "from-[#3d5a9a] to-[#1e2b54]";
  const btnGrad = isGold
    ? "from-[#d4a93a] via-[#b8892a] to-[#7a5a18]"
    : "from-[#3d5a9a] via-[#28406e] to-[#1e2b54]";

  return (
    <button
      dir="rtl"
      onClick={onClick}
      className={`group relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-gradient-to-b ${cardGrad} ring-1 ${cardRing} shadow-[0_12px_28px_-12px_rgba(120,90,40,0.35)] text-right transition active:scale-[0.98]`}
    >
      {/* Image section */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={data.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {/* Badge — centered at top of image */}
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b ${badgeGrad} shadow-[0_6px_16px_-4px_rgba(0,0,0,0.4)] ring-2 ring-white/80 text-white text-xl`}
        >
          {data.badge}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pt-4 pb-4 text-center">
        <h3
          className="text-[17px] font-bold text-[#1e2b54]"
        >
          {data.title}
        </h3>
        <p
          className="mt-1.5 text-[11px] leading-snug text-[#6a5a32] whitespace-pre-line"
        >
          {data.subtitle}
        </p>
        <div
          className={`mt-auto pt-3 w-full flex justify-center`}
        >
          <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-l ${btnGrad} px-6 py-2 text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/30`}>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-[12px] font-bold">
              {data.cta}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}