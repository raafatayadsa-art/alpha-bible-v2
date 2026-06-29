import type { LucideIcon } from "lucide-react";

export function ProfileAccentIcon({
  icon: Icon,
  accent,
  size = "md",
}: {
  icon: LucideIcon;
  accent: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const iconDim = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";

  return (
    <div
      className={`grid ${dim} shrink-0 place-items-center rounded-[14px] border`}
      style={{
        borderColor: `${accent}33`,
        background: `${accent}14`,
      }}
    >
      <Icon className={iconDim} style={{ color: accent }} strokeWidth={2.1} />
    </div>
  );
}
