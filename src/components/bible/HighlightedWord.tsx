import { cn } from "@/lib/utils";

export type HighlightKind = "person" | "place" | "prophecy" | "symbol" | "concept";

/**
 * Subtle gold-tinted highlight with soft glow.
 * Kind only adds a barely-there hue shift; never noisy.
 */
const toneMap: Record<HighlightKind, string> = {
  person: "text-[#7a4a26]",
  place: "text-[#7a4a26]",
  prophecy: "text-[#7a4a26]",
  symbol: "text-[#7a4a26]",
  concept: "text-[#7a4a26]",
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
        "relative inline px-0.5 align-baseline font-bold transition-colors",
        "underline decoration-[#c79356]/45 decoration-[1.5px] underline-offset-[5px]",
        "hover:decoration-[#a87a35] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c79356]/60 rounded-sm",
        toneMap[kind],
      )}
      style={{ textShadow: "0 0 6px rgba(231,201,122,0.30)" }}
    >
      {children}
    </button>
  );
}
