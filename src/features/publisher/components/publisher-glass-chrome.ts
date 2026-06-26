import { cn } from "@/lib/utils";
import { MESSAGING_GLASS_SHELL } from "@/components/alpha/messaging-ui";

export const PUBLISHER_GLASS_INPUT =
  "w-full rounded-xl border border-[#efe2c4]/90 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/25 transition";

export const PUBLISHER_GLASS_LABEL = "text-[10px] font-extrabold text-[#8a6a3a]";

export const PUBLISHER_GLASS_SHEET_OVERLAY =
  "fixed inset-0 z-[70] flex items-end justify-center px-4 sm:items-center";

export const PUBLISHER_GLASS_SHEET_BACKDROP =
  "absolute inset-0 bg-black/28 backdrop-blur-[3px]";

export function publisherGlassSheetPanel(className?: string) {
  return cn(
    "relative z-[1] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden",
    MESSAGING_GLASS_SHELL,
    className,
  );
}
