import { cn } from "@/lib/utils";
import { AlphaOfficialLogo } from "./AlphaOfficialLogo";

type AlphaBrandLogoOnlyProps = {
  title?: string;
  className?: string;
};

/** Official logo only at top — no duplicated ALPHA / ⲀⲖⲈⲪⲀ text. */
export function AlphaBrandLogoOnly({ title, className }: AlphaBrandLogoOnlyProps) {
  return (
    <header className={cn("flex flex-col items-center", className)}>
      <AlphaOfficialLogo size="xl" />
      {title && (
        <h1 className="mt-3 font-arabic-serif text-[17px] font-extrabold text-[#3a2a18]">
          {title}
        </h1>
      )}
    </header>
  );
}
