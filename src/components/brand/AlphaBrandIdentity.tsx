import { cn } from "@/lib/utils";
import { ALPHA_OFFICIAL_SLOGAN } from "./alpha-brand";
import { AlphaOfficialLogo } from "./AlphaOfficialLogo";

type AlphaBrandIdentityProps = {
  className?: string;
  logoSize?: "sm" | "md" | "lg";
};

/** Official logo + official slogan — single source of truth for Alpha brand identity. */
export function AlphaBrandIdentity({ className, logoSize = "lg" }: AlphaBrandIdentityProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <AlphaOfficialLogo size={logoSize} />
      <p
        className="mt-3 max-w-[320px] text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#8a6a3a] leading-relaxed"
        aria-label={ALPHA_OFFICIAL_SLOGAN}
      >
        {ALPHA_OFFICIAL_SLOGAN}
      </p>
    </div>
  );
}
