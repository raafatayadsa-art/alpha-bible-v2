import katamerosReadingBg from "@/assets/katameros-reading-bg.png";

/** Full-screen parchment background for all Katameros screens. */
export function KatamerosScreenBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={katamerosReadingBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#f5edd8]/08" />
    </div>
  );
}
