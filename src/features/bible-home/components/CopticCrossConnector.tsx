import { CopticCross } from "@/components/coptic";
import { bibleHomeColors } from "../tokens/colors";

export function CopticCrossConnector() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[calc(100%-18px)] z-20 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <div
        className="grid h-9 w-9 place-items-center rounded-full border border-white/80 backdrop-blur-sm"
        style={{
          background: "linear-gradient(145deg, #fff8ea 0%, #f5e8c8 100%)",
          boxShadow: `0 0 0 2px rgba(255,255,255,0.6), 0 0 18px ${bibleHomeColors.glowGold}, 0 8px 20px -8px ${bibleHomeColors.shadowSoft}`,
        }}
      >
        <CopticCross size={16} className="text-[#b8893a]" />
      </div>
    </div>
  );
}
