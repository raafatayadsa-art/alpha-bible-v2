import { cn } from "@/lib/utils";

type AlphaBrandLogoOnlyProps = {
  title?: string;
  className?: string;
};

/** Page title header — official logo removed. */
export function AlphaBrandLogoOnly({ title, className }: AlphaBrandLogoOnlyProps) {
  if (!title) return null;
  return (
    <header className={cn("flex flex-col items-center", className)}>
      <h1 className="font-arabic-serif text-[17px] font-extrabold text-[#3a2a18]">{title}</h1>
    </header>
  );
}
