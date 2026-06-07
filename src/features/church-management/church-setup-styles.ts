import { cn } from "@/lib/utils";

/** Matches Alpha «إنهاء القراءة» (katameros) — #1f6e54 → #3eb482 */
const alphaFinishGreen =
  "[background:linear-gradient(to_left,#1f6e54,#3eb482)] shadow-[0_8px_18px_-10px_rgba(31,110,84,0.6)] active:scale-95 transition-transform text-white font-bold";

export const setupGreenButton = cn(
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[14px]",
  alphaFinishGreen,
);

export const setupGreenButtonSm = cn(
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl px-4 text-[12.5px]",
  alphaFinishGreen,
);

export const setupInput =
  "w-full rounded-xl border border-[#efe2c4]/90 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/25 transition";

export const setupTextarea =
  "w-full min-h-[88px] rounded-xl border border-[#efe2c4]/90 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/25 transition resize-y";

export const setupSectionCard =
  "relative rounded-[22px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fffdf8]/95 to-[#f8f2e8]/95 backdrop-blur-xl overflow-hidden shadow-[0_12px_32px_-20px_rgba(120,80,30,0.4),inset_0_1px_0_rgba(255,255,255,0.85)]";

export const setupLabel = "mb-1.5 block text-[11px] font-bold text-[#6a543a]";
