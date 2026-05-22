import { cn } from "@/lib/utils";

export type HighlightKind = "person" | "place" | "prophecy" | "symbol" | "concept";

const toneMap: Record<HighlightKind, string> = {
  person:
    "decoration-[#6a4ab5]/40 hover:decoration-[#6a4ab5] text-[#4a2f8a]",
  place:
    "decoration-[#3a6fb5]/40 hover:decoration-[#3a6fb5] text-[#1f4d8a]",
  prophecy:
    "decoration-[#b8893a]/50 hover:decoration-[#b8893a] text-[#7a4a26]",
  symbol:
    "decoration-[#a87a35]/40 hover:decoration-[#a87a35] text-[#7a4a26]",
  concept:
    "decoration-[#c79356]/40 hover:decoration-[#c79356] text-[#7a4a26]",
};

export function HighlightedWord({
  children,
  kind = "concept",
  onSelect,
}: {
  children: React.ReactNode;
  kind?: HighlightKind;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative inline px-0.5 underline underline-offset-4 decoration-2 transition-colors",
        "rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c79356]/60",
        toneMap[kind],
      )}
    >
      {children}
    </button>
  );
}
