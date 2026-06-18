import {
  alphaTopDebugBorderStyle,
  isAlphaTopDebugActive,
  useAlphaTopDebugTarget,
} from "./alpha-top-debug";

/** Highlights the top safe-area band when ?alphaTopDebug=8 */
export function AlphaTopDebugSafeArea() {
  const active = useAlphaTopDebugTarget();
  const show = isAlphaTopDebugActive(8, active);
  if (!show) return null;

  return (
    <div
      aria-hidden
      data-alpha-top-debug="safe-area"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9998]"
      style={{
        height: "max(env(safe-area-inset-top, 0px), 14px)",
        ...alphaTopDebugBorderStyle(true),
      }}
    />
  );
}
