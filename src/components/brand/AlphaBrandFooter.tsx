import { cn } from "@/lib/utils";
import { ALPHA_OFFICIAL_SLOGAN } from "./alpha-brand";

export const ALPHA_VERSION_LINE = "ⲁⲗⲫⲁ · Alpha Coptic · إصدار 1.0" as const;

type AlphaBrandFooterProps = {
  className?: string;
  /** Larger slogan for publisher / hero screens. */
  size?: "default" | "prominent";
};

/** Official slogan + version line — luxury footer for branded screens. */
export function AlphaBrandFooter({ className, size = "default" }: AlphaBrandFooterProps) {
  const prominent = size === "prominent";
  return (
    <footer className={cn("flex flex-col items-center text-center", prominent ? "py-6" : "mt-8", className)}>
      <p
        className={cn(
          "whitespace-nowrap font-bold uppercase leading-none",
          prominent ? "text-[9.5px] tracking-[0.14em]" : "text-[7.5px] tracking-[0.1em]",
        )}
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
        className={cn(
          "font-semibold tracking-wide",
          prominent ? "mt-2.5 text-[11px]" : "mt-2 text-[9.5px]",
        )}
        style={{ color: "rgba(184,137,58,0.65)" }}
      >
        {ALPHA_VERSION_LINE}
      </p>
    </footer>
  );
}
