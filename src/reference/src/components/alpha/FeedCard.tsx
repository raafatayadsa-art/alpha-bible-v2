import type { ReactNode } from "react";

type Variant =
  | "urgent"
  | "meeting"
  | "trip"
  | "prayer"
  | "celebration"
  | "condolence";

const pillStyles: Record<Variant, string> = {
  urgent: "bg-urgent-soft text-urgent",
  meeting: "bg-meeting-soft text-meeting",
  trip: "bg-trip-soft text-trip",
  prayer: "bg-prayer-soft text-prayer",
  celebration: "bg-celebration-soft text-celebration",
  condolence: "bg-condolence-soft text-condolence",
};

const cardBgStyles: Record<Variant, string> = {
  urgent: "bg-card",
  meeting: "bg-card",
  trip: "bg-card",
  prayer:
    "bg-[linear-gradient(155deg,oklch(0.97_0.025_300)_0%,oklch(0.99_0.005_80)_60%)]",
  celebration:
    "bg-[linear-gradient(155deg,oklch(0.98_0.03_80)_0%,oklch(0.99_0.005_80)_60%)]",
  condolence:
    "bg-[linear-gradient(155deg,oklch(0.96_0.005_280)_0%,oklch(0.99_0.005_80)_60%)]",
};

/**
 * Premium feed card shell.
 * Image on the right (RTL), content on the left, type pill top-left,
 * action button slightly overhangs the bottom-left corner.
 */
export function FeedCard({
  variant,
  pillIcon,
  pillLabel,
  imageUrl,
  imageAlt,
  children,
  action,
}: {
  variant: Variant;
  pillIcon: ReactNode;
  pillLabel: string;
  imageUrl: string;
  imageAlt: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="px-3">
      <div
        className={
          "relative rounded-[26px] border border-border/60 shadow-luxe overflow-hidden " +
          cardBgStyles[variant]
        }
      >
        <div className="flex" dir="rtl">
          {/* image (right side in RTL) */}
          <div className="relative w-[34%] shrink-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              width={640}
              height={640}
            />
          </div>

          {/* content (left side in RTL) */}
          <div className="flex-1 p-3.5 pb-5 min-w-0">
            <div className="flex items-center justify-end mb-1.5">
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-display font-bold " +
                  pillStyles[variant]
                }
              >
                <span className="w-3 h-3 inline-flex items-center justify-center">
                  {pillIcon}
                </span>
                {pillLabel}
              </span>
            </div>
            {children}
          </div>
        </div>

        {/* Floating action button overhang */}
        <div
          className="absolute bottom-[-14px] left-3 z-10"
          style={{ insetInlineStart: 12 }}
        >
          {action}
        </div>
      </div>
      {/* spacing to accommodate overhanging button */}
      <div className="h-5" />
    </div>
  );
}
