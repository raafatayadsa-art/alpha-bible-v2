import { cn } from "@/lib/utils";
import { AlphaBrandIdentity } from "./AlphaBrandIdentity";

type AlphaBrandHeaderProps = {
  title: string;
  className?: string;
};

/**
 * Full Alpha brand header:
 * [Official Logo] → official slogan → page title.
 */
export function AlphaBrandHeader({ title, className }: AlphaBrandHeaderProps) {
  return (
    <header className={cn("flex flex-col items-center", className)}>
      <AlphaBrandIdentity />
      <h1 className="mt-4 font-arabic-serif text-[17px] font-extrabold text-[#3a2a18]">
        {title}
      </h1>
    </header>
  );
}
