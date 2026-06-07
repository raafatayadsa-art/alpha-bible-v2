import { cn } from "@/lib/utils";
import alphaLogo from "@/assets/alpha-logo.png";

type AlphaOfficialLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = {
  sm: "h-7",
  md: "h-10",
  lg: "h-[80px]",
  xl: "h-[96px]",
} as const;

/** Official Alpha logo — transparent PNG only; never duplicate ALPHA / ⲀⲖⲈⲪⲀ text beneath. */
export function AlphaOfficialLogo({ className, size = "md" }: AlphaOfficialLogoProps) {
  return (
    <div className={cn("flex w-full justify-center", className)}>
      <img
        src={alphaLogo}
        alt="Alpha"
        className={cn("w-auto object-contain select-none", SIZES[size])}
        draggable={false}
        style={{
          filter:
            "drop-shadow(0 0 10px rgba(212,168,87,0.5)) drop-shadow(0 0 22px rgba(216,168,58,0.22))",
        }}
      />
    </div>
  );
}
