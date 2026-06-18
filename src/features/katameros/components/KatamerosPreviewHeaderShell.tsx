import { AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import { cn } from "@/lib/utils";
import type { KatamerosCurvePreviewVariant } from "@/features/katameros/katameros-curve-preview";

type KatamerosPreviewHeaderShellProps = {
  children: React.ReactNode;
  /** When "c", header band is opaque so PNG cannot bleed through. */
  previewVariant?: KatamerosCurvePreviewVariant | null;
  className?: string;
};

/**
 * Preview-only header wrapper — production unchanged when previewVariant is null/undefined.
 */
export function KatamerosPreviewHeaderShell({
  children,
  previewVariant,
  className,
}: KatamerosPreviewHeaderShellProps) {
  const opaque = previewVariant === "c";

  return (
    <AlphaHeaderShell
      className={cn(
        opaque &&
          "bg-[#f4ead8]/97 backdrop-blur-md shadow-[0_10px_24px_-18px_rgba(120,80,30,0.28)]",
        className,
      )}
    >
      {children}
    </AlphaHeaderShell>
  );
}
