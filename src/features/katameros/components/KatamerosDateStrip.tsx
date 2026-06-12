import { CopticCross } from "@/components/coptic";
import { cn } from "@/lib/utils";

type KatamerosDateStripProps = {
  copticDate: string;
  gregorianDate: string;
  variant?: "hero" | "image-hero" | "detail" | "inline";
  align?: "center" | "end";
  className?: string;
};

/** Dual Coptic + Gregorian dates — matches approved Alpha date styling. */
export function KatamerosDateStrip({
  copticDate,
  gregorianDate,
  variant = "hero",
  align = "center",
  className,
}: KatamerosDateStripProps) {
  if (!copticDate && !gregorianDate) return null;

  const copticClass =
    variant === "image-hero"
      ? "text-[10px] font-bold text-[#f0dfaa]/90 drop-shadow-sm"
      : variant === "inline"
        ? "text-[10.5px] font-bold text-[#b8893a]"
        : "text-[11px] font-bold text-[#b8893a]";

  const gregClass =
    variant === "image-hero"
      ? "text-[9.5px] text-[#fefce8]/80 drop-shadow-sm"
      : variant === "inline"
        ? "text-[10px] text-[#6a543a]"
        : "text-[10.5px] text-[#6a543a]";

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        align === "end" ? "items-end text-right" : "items-center text-center",
        className,
      )}
    >
      {copticDate ? (
        <div className={cn("inline-flex items-center gap-1", copticClass)}>
          <CopticCross size={10} className={variant === "image-hero" ? "text-[#f0dfaa]" : undefined} />
          <span>{copticDate}</span>
        </div>
      ) : null}
      {gregorianDate ? <div className={gregClass}>{gregorianDate}</div> : null}
    </div>
  );
}
