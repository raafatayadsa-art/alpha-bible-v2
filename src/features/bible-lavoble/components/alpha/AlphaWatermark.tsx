export function AlphaWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <span
        className="absolute -top-10 -left-6 text-[#a07823] leading-none"
        style={{
          fontSize: "clamp(220px, 60vw, 360px)",
          opacity: 0.04,
          filter: "blur(2px)",
        }}
      >
        Ⲁ
      </span>
      <span
        className="absolute -bottom-16 -right-8 text-[#a07823] leading-none"
        style={{
          fontSize: "clamp(220px, 60vw, 360px)",
          opacity: 0.04,
          filter: "blur(2px)",
        }}
      >
        Ⲱ
      </span>
    </div>
  );
}