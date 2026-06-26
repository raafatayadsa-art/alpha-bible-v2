import { CHURCH_DIR } from "../tokens";

export function ChurchDirectoryMapLegend({ pinCount }: { pinCount: number }) {
  return (
    <div
      dir="rtl"
      className="pointer-events-none absolute inset-x-3 z-[480] flex justify-center"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
    >
      <div
        className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-2xl border px-3 py-2 backdrop-blur-xl"
        style={{
          background: "rgba(12, 16, 36, 0.82)",
          borderColor: "rgba(212, 175, 55, 0.35)",
          boxShadow: "0 12px 32px -16px rgba(0,0,0,0.65)",
        }}
      >
        <LegendItem color={CHURCH_DIR.purple} label="كنيسة موثّقة" />
        <LegendItem color={CHURCH_DIR.gold} label="شبكة الكنائس" />
        <LegendItem color={CHURCH_DIR.gold} label="موقع معتمد — Alpha Control" />
        <span className="text-[10px] font-bold" style={{ color: "rgba(245,242,237,0.72)" }}>
          {pinCount} {pinCount === 1 ? "كنيسة" : "كنائس"} على الخريطة
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color: "#F5F2ED" }}>
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
      />
      {label}
    </span>
  );
}
