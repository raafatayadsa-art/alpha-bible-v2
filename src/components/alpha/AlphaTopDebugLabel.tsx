import {
  ALPHA_TOP_DEBUG_TARGETS,
  useAlphaTopDebugTarget,
} from "./alpha-top-debug";

/** Floating badge — shows which shell layer is bordered (?alphaTopDebug=1..8). */
export function AlphaTopDebugLabel() {
  const active = useAlphaTopDebugTarget();
  if (!active) return null;

  const label = ALPHA_TOP_DEBUG_TARGETS[active];

  return (
    <div
      dir="ltr"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] z-[9999] flex justify-center px-3"
      data-alpha-top-debug-label
    >
      <div className="rounded-xl border-2 border-red-600 bg-red-600/95 px-4 py-2 text-center shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-wide text-red-100">
          TOP DEBUG — target {active}/8
        </p>
        <p className="mt-0.5 text-[13px] font-extrabold text-white">{label}</p>
        <p className="mt-1 text-[10px] text-red-100/90">
          ?alphaTopDebug={active} → next: ?alphaTopDebug={active < 8 ? active + 1 : 1}
        </p>
      </div>
    </div>
  );
}
