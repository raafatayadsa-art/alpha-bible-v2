import type { ReactNode } from "react";

type Variant =
  | "urgent"
  | "meeting"
  | "trip"
  | "prayer"
  | "celebration"
  | "condolence"
  | "reflection";

const variantClasses: Record<Variant, string> = {
  urgent: "bg-urgent text-urgent-foreground",
  meeting: "bg-meeting text-meeting-foreground",
  trip: "bg-trip text-trip-foreground",
  prayer: "bg-prayer text-prayer-foreground",
  celebration: "bg-celebration text-celebration-foreground",
  condolence: "bg-condolence text-condolence-foreground",
  reflection: "bg-reflection text-reflection-foreground",
};

/**
 * Action button shared across all card types.
 * Identical size/shape/height — only the color changes via `variant`.
 * Designed to slightly overhang the parent card (Apple floating style).
 */
export function ActionButton({
  variant,
  icon,
  children,
}: {
  variant: Variant;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        "h-11 px-5 inline-flex items-center justify-center gap-2 rounded-full font-display font-bold text-[14px] tracking-tight shadow-luxe transition-transform active:scale-[0.97] " +
        variantClasses[variant]
      }
    >
      <span>{children}</span>
      {icon ? (
        <span className="inline-flex items-center justify-center w-5 h-5">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
