import katamerosReadingBg from "@/assets/katameros-reading-bg.png";

/** Parchment begins below header + safe area — top medallion on asset is hidden. */
const KATAMEROS_BG_TOP = "calc(max(env(safe-area-inset-top, 0px), 14px) + 56px)";

/** Full-screen parchment background for all Katameros screens. */
export function KatamerosScreenBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Flat shell cap — removes ornate top cross “mini frame” above header */}
      <div
        className="absolute inset-x-0 top-0 z-[1] bg-[#f4ead8]"
        style={{ height: KATAMEROS_BG_TOP }}
      />
      <img
        src={katamerosReadingBg}
        alt=""
        className="absolute inset-x-0 bottom-0 w-full object-cover"
        style={{ top: KATAMEROS_BG_TOP, objectPosition: "center top" }}
        decoding="async"
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-[#f5edd8]/08"
        style={{ top: KATAMEROS_BG_TOP }}
      />
    </div>
  );
}
