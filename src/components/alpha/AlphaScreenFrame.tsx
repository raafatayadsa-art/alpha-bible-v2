import type { CSSProperties, HTMLAttributes, ReactNode, UIEventHandler } from "react";
import { cn } from "@/lib/utils";
import { backdropToRootClass, type AlphaViewportBackdrop } from "./alpha-viewport";
import { AlphaBackground } from "./AlphaBackground";
import { useAlphaBackgroundVariant } from "./AlphaBackgroundProvider";
import { alphaTopDebugBorderStyle, isAlphaTopDebugActive, useAlphaTopDebugTarget } from "./alpha-top-debug";

/** Approved onboarding welcome screen frame — single source of truth. */
export const ALPHA_SCREEN_FRAME = {
  /** Fluid — responsive widths live in alpha-responsive.css (--alpha-frame-max-width: 100%) */
  maxWidth: "100%",
  minHeight: "100dvh",
  safeAreaTop: "max(env(safe-area-inset-top), 24px)",
  safeAreaBottom: "max(24px, env(safe-area-inset-bottom))",
  shellBackground: "#f4ead8",
} as const;

export const alphaScreenFrameStyleVars = {
  "--alpha-safe-top": ALPHA_SCREEN_FRAME.safeAreaTop,
  "--alpha-safe-bottom": ALPHA_SCREEN_FRAME.safeAreaBottom,
} as CSSProperties;

type AlphaScreenFrameProps = {
  children: ReactNode;
  className?: string;
  frameClassName?: string;
  dir?: "rtl" | "ltr";
  showShellBackground?: boolean;
  /** Explicit overscroll backdrop when shell is hidden (e.g. messaging, connect). */
  viewportBackdrop?: AlphaViewportBackdrop;
  /**
   * fixed — full viewport, no frame scroll (inner panels scroll).
   * scroll | flow — single frame scroll container (flow alias for compatibility).
   */
  mode?: "fixed" | "scroll" | "flow";
  onScroll?: UIEventHandler<HTMLDivElement>;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "dir">;

function resolveFrameBackdrop(
  showShellBackground: boolean,
  viewportBackdrop?: AlphaViewportBackdrop,
): AlphaViewportBackdrop | null {
  if (viewportBackdrop) return viewportBackdrop;
  if (showShellBackground) return "shell";
  return null;
}

export function AlphaScreenFrame({
  children,
  className,
  frameClassName,
  dir = "rtl",
  showShellBackground = true,
  viewportBackdrop,
  mode = "flow",
  onScroll,
  style,
  ...outerProps
}: AlphaScreenFrameProps) {
  const isFixed = mode === "fixed";
  const backdrop = resolveFrameBackdrop(showShellBackground, viewportBackdrop);
  const rootBackdropClass = backdrop ? backdropToRootClass(backdrop) : null;
  const { variant: bgVariant } = useAlphaBackgroundVariant();
  const showAlphaBackground = backdrop === "shell" || backdrop === "messaging";
  const topDebug = useAlphaTopDebugTarget();
  const rootBorder =
    isAlphaTopDebugActive(1, topDebug) || isAlphaTopDebugActive(2, topDebug);

  return (
    <div
      dir={dir}
      data-alpha-top-debug={
        isAlphaTopDebugActive(1, topDebug)
          ? "screen-frame"
          : isAlphaTopDebugActive(2, topDebug)
            ? "viewport-root"
            : undefined
      }
      className={cn("alpha-viewport-root alpha-screen-frame", rootBackdropClass, className)}
      style={{
        ...alphaScreenFrameStyleVars,
        ...alphaTopDebugBorderStyle(rootBorder),
        ...style,
      }}
      {...outerProps}
    >
      {showAlphaBackground ? <AlphaBackground variant={bgVariant} /> : null}
      <div
        data-alpha-top-debug={isAlphaTopDebugActive(3, topDebug) ? "viewport-stage" : undefined}
        className={cn("alpha-viewport-stage alpha-viewport-phone w-full min-w-0", frameClassName)}
        style={alphaTopDebugBorderStyle(isAlphaTopDebugActive(3, topDebug))}
      >
        {isFixed ? (
          <div className="alpha-viewport-panel--fixed">{children}</div>
        ) : (
          <div className="alpha-viewport-panel--scroll">
            <div className="alpha-viewport-scroll alpha-screen-frame-scroll alpha-app-shell" onScroll={onScroll}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Routes that render outside the shared mobile frame (admin / onboarding shell). */
export function shouldUseAlphaScreenFrame(pathname: string): boolean {
  if (pathname === "/intro") return false;
  if (pathname.startsWith("/platform")) return false;
  if (pathname.startsWith("/dev")) return false;
  if (pathname === "/diagnostics") return false;
  if (pathname === "/alpha-connect" || pathname === "/call" || pathname === "/personal-call") return false;
  if (pathname === "/messages" || pathname.startsWith("/messages/")) return false;
  return true;
}
