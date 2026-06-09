import type { ReactNode } from "react";

/**
 * iPhone 15/16 Pro frame: 393×852 with iOS safe-area aware padding.
 * Children render in a scrollable area; pass `tabBar` for a sticky bottom bar.
 */
export function PhoneFrame({
  children,
  tabBar,
}: {
  children: ReactNode;
  tabBar?: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-stretch justify-center bg-[oklch(0.93_0.015_80)] py-0 sm:py-6">
      <div
        className="relative w-full sm:w-[393px] min-h-screen sm:min-h-[852px] bg-background sm:rounded-[44px] sm:shadow-luxe overflow-hidden flex flex-col"
        style={{ maxWidth: 393 }}
      >
        {/* Status bar / Dynamic Island spacer (iOS) */}
        <div className="h-[54px] shrink-0" aria-hidden />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-[120px]">
          {children}
        </div>

        {tabBar}
      </div>
    </div>
  );
}
