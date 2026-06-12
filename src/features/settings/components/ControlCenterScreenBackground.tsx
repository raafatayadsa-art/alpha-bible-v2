import controlCenterBg from "@/assets/control-center-bg.png";

/** Full-screen parchment background for the personal control center. */
export function ControlCenterScreenBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src={controlCenterBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#f5edd8]/08" />
    </div>
  );
}
