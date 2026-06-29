import { useMemo } from "react";
import { MC } from "../platform-store";
import { PP_GOLD, formatPlatformNumber } from "../PlatformPremiumUI";

const HOTSPOTS = [
  { id: "eg", name: "مصر", code: "EG", x: 55, y: 52, intensity: 1, live: 8420 },
  { id: "us", name: "الولايات المتحدة", code: "US", x: 22, y: 42, intensity: 0.85, live: 3118 },
  { id: "ca", name: "كندا", code: "CA", x: 24, y: 32, intensity: 0.55, live: 1902 },
  { id: "au", name: "أستراليا", code: "AU", x: 82, y: 75, intensity: 0.6, live: 1210 },
  { id: "uk", name: "المملكة المتحدة", code: "GB", x: 48, y: 35, intensity: 0.7, live: 1604 },
  { id: "br", name: "البرازيل", code: "BR", x: 33, y: 68, intensity: 0.5, live: 980 },
  { id: "et", name: "إثيوبيا", code: "ET", x: 58, y: 60, intensity: 0.65, live: 1240 },
  { id: "de", name: "ألمانيا", code: "DE", x: 51, y: 38, intensity: 0.55, live: 880 },
] as const;

export type Hotspot = (typeof HOTSPOTS)[number];

function DotGrid() {
  const dots = useMemo(() => {
    const out: { x: number; y: number; o: number }[] = [];
    const clusters = [
      { cx: 22, cy: 42, r: 14 },
      { cx: 32, cy: 68, r: 10 },
      { cx: 50, cy: 38, r: 10 },
      { cx: 58, cy: 58, r: 14 },
      { cx: 70, cy: 45, r: 16 },
      { cx: 82, cy: 75, r: 7 },
    ];
    for (let i = 0; i < 620; i++) {
      const c = clusters[i % clusters.length];
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * c.r;
      out.push({
        x: c.cx + Math.cos(a) * r,
        y: c.cy + Math.sin(a) * r * 0.7,
        o: 0.12 + Math.random() * 0.5,
      });
    }
    return out;
  }, []);

  return (
    <svg viewBox="0 0 100 90" className="absolute inset-0 h-full w-full">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.38} fill={MC.purple} opacity={d.o} />
      ))}
    </svg>
  );
}

export function WorldMap({
  onSelect,
  className = "",
  minHeight = 224,
}: {
  onSelect: (h: Hotspot) => void;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[18px] border ${className}`}
      style={{
        minHeight,
        borderColor: `${MC.purple}44`,
        background: "linear-gradient(180deg, #040810 0%, #060a14 45%, #03060c 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px -16px rgba(93,50,145,0.55)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 55% 52%, rgba(139,92,246,0.18), transparent 65%),
            radial-gradient(ellipse 45% 35% at 22% 42%, rgba(251,191,36,0.12), transparent 60%),
            radial-gradient(ellipse 40% 30% at 48% 35%, rgba(59,130,246,0.08), transparent 55%)
          `,
        }}
      />
      <DotGrid />

      {HOTSPOTS.map((h) => {
        const size = 10 + h.intensity * 14;
        return (
          <button
            key={h.id}
            type="button"
            onClick={() => onSelect(h)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            aria-label={h.name}
          >
            <span className="relative flex flex-col items-center">
              <span
                className="absolute inline-flex animate-ping rounded-full opacity-40"
                style={{
                  width: size + 16,
                  height: size + 16,
                  background: PP_GOLD,
                  animationDuration: `${2.2 + h.intensity}s`,
                }}
              />
              <span
                className="absolute inline-flex rounded-full blur-md"
                style={{
                  width: size + 10,
                  height: size + 10,
                  background: `radial-gradient(circle, ${PP_GOLD}cc, transparent 70%)`,
                }}
              />
              <span
                className="relative inline-flex rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle at 35% 30%, #fff8e7, ${PP_GOLD} 45%, #c4841a 100%)`,
                  boxShadow: `0 0 0 2px rgba(6,10,20,0.9), 0 0 22px ${PP_GOLD}cc, 0 0 44px ${PP_GOLD}55`,
                }}
              />
              <span
                className="pointer-events-none absolute top-full mt-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-extrabold opacity-95 transition group-hover:opacity-100"
                style={{
                  borderColor: `${PP_GOLD}44`,
                  background: "rgba(4,8,16,0.92)",
                  color: MC.white,
                  boxShadow: `0 0 12px ${PP_GOLD}33`,
                }}
              >
                {h.code} {h.name}
              </span>
            </span>
          </button>
        );
      })}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-14"
        style={{ background: "linear-gradient(180deg, rgba(4,8,16,0.65) 0%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={{ background: "linear-gradient(0deg, rgba(4,8,16,0.75) 0%, transparent 100%)" }}
      />

      <div
        className="absolute bottom-3 start-3 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] backdrop-blur-md"
        style={{ borderColor: `${MC.purple}55`, background: "rgba(4,8,16,0.72)", color: MC.muted }}
      >
        <span>منخفض</span>
        <span
          className="h-1.5 w-16 rounded-full"
          style={{ background: `linear-gradient(to right, ${MC.purple}44, ${MC.purple}, ${PP_GOLD})` }}
        />
        <span>مرتفع</span>
      </div>
    </div>
  );
}

export { HOTSPOTS };

export function hotspotDrill(h: Hotspot): import("./DrillSheet").DrillData {
  return {
    title: h.name,
    subtitle: `${h.code} · نشاط المنطقة`,
    value: formatPlatformNumber(h.live),
    delta: h.intensity >= 0.8 ? "+12%" : "+4%",
    deltaTone: "up",
    breakdown: [
      { label: "الرمز", value: h.code },
      { label: "الدولة", value: h.name },
      { label: "الشدة", value: h.intensity >= 0.8 ? "مرتفع" : "متوسط", tone: "up" },
    ],
  };
}
