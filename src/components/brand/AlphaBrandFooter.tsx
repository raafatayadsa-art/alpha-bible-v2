import { cn } from "@/lib/utils";
import { ALPHA_OFFICIAL_SLOGAN } from "./alpha-brand";

export const ALPHA_VERSION_LINE = "ⲁⲗⲫⲁ · Alpha Coptic · إصدار 1.0" as const;

type AlphaBrandFooterProps = {
  className?: string;
};

/** Official slogan + version line — luxury footer for branded screens. */
export function AlphaBrandFooter({ className }: AlphaBrandFooterProps) {
  return (
    <footer className={cn("mt-8 flex flex-col items-center text-center", className)}>
      <p
        className="whitespace-nowrap text-[7.5px] font-bold uppercase tracking-[0.1em] leading-none"
        style={{
          background: "linear-gradient(90deg, #9a7a42 0%, #d4a857 38%, #e8c878 62%, #9a7a42 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 6px rgba(212,168,87,0.28))",
        }}
        aria-label={ALPHA_OFFICIAL_SLOGAN}
      >
        {ALPHA_OFFICIAL_SLOGAN}
      </p>
      <p
        className="mt-2 text-[9.5px] font-semibold tracking-wide"
        style={{ color: "rgba(184,137,58,0.65)" }}
      >
        {ALPHA_VERSION_LINE}
      </p>
    </footer>
  );
}
