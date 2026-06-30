import { cn } from "@/lib/utils";
import { AlphaOfficialSlogan } from "./AlphaOfficialSlogan";

type AlphaBrandIdentityProps = {
  className?: string;
  logoSize?: "sm" | "md" | "lg";
};

/** Official slogan — logo removed app-wide. */
export function AlphaBrandIdentity({ className }: AlphaBrandIdentityProps) {
  return (
    <div className={cn("flex w-full flex-col items-center text-center", className)}>
      <AlphaOfficialSlogan prominent className="w-full" />
    </div>
  );
}
