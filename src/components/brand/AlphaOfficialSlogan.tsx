import { cn } from "@/lib/utils";
import { ALPHA_OFFICIAL_SLOGAN } from "./alpha-brand";

type Props = {
  className?: string;
  /** Larger full-width banner for hero / footer screens. */
  prominent?: boolean;
};

/** Official slogan — full width, dark, uppercase. */
export function AlphaOfficialSlogan({ className, prominent = false }: Props) {
  return (
    <p
      className={cn(
        "w-full max-w-full px-1 text-center font-bold uppercase leading-snug text-[#2a1f12]",
        prominent
          ? "text-[clamp(10px,3.1vw,14px)] tracking-[0.1em]"
          : "text-[clamp(9px,2.6vw,12px)] tracking-[0.08em]",
        className,
      )}
      aria-label={ALPHA_OFFICIAL_SLOGAN}
    >
      {ALPHA_OFFICIAL_SLOGAN}
    </p>
  );
}
