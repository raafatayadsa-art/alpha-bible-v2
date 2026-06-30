import { cn } from "@/lib/utils";
import { AlphaOfficialSlogan } from "./AlphaOfficialSlogan";

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
    <footer className={cn("flex w-full flex-col items-center text-center", prominent ? "py-6" : "mt-8", className)}>
      <AlphaOfficialSlogan prominent={prominent} className="w-full" />
      <p
        className={cn(
          "font-semibold tracking-wide text-[#6a543a]",
          prominent ? "mt-2.5 text-[11px]" : "mt-2 text-[9.5px]",
        )}
      >
        {ALPHA_VERSION_LINE}
      </p>
    </footer>
  );
}
