import { useMemo, useState } from "react";
import { Expand, Flag, MapPin } from "lucide-react";
import { useChurchDirectoryMapPins } from "@/features/church-directory";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import {
  buildGlobalMapDrill,
  buildTopCitiesFromPins,
  type Dash,
} from "./founder-dashboard-data";
import type { DrillData } from "./DrillSheet";
import { FounderGlobeMap } from "./FounderGlobeMap";

export function FounderGlobalActivity({
  dash,
  onDrill,
}: {
  dash: Dash;
  onDrill: (data: DrillData) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { data: pins = [], isLoading: pinsLoading } = useChurchDirectoryMapPins();
  const topCities = useMemo(() => buildTopCitiesFromPins(pins), [pins]);
  const activeCities = useMemo(() => {
    const set = new Set(pins.map((p) => p.city || p.governorate).filter(Boolean));
    return set.size;
  }, [pins]);

  return (
    <CyberPanel glow={MC.cyan} className="mb-3">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-extrabold transition active:scale-95"
          style={{ borderColor: `${MC.cyan}44`, color: MC.cyan, background: "rgba(0,0,0,0.25)" }}
        >
          <Expand className="h-3.5 w-3.5" />
          {expanded ? "طي الخريطة" : "توسيع الخريطة"}
        </button>
        <button
          type="button"
          onClick={() => onDrill(buildGlobalMapDrill(dash, pins))}
          className="text-right transition active:scale-[0.98]"
        >
          <p className="text-[14px] font-extrabold" style={{ color: MC.white }}>
            النشاط العالمي
          </p>
          <p className="text-[9px] font-bold" style={{ color: MC.muted }}>
            خريطة الكنائس · {pinsLoading ? "…" : formatPlatformNumber(pins.length)} موقع
          </p>
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "كنائس على الخريطة", value: formatPlatformNumber(pins.length), icon: null, live: false, highlight: true },
          { label: "مدن نشطة", value: formatPlatformNumber(activeCities), icon: MapPin },
          { label: "مستخدمون", value: formatPlatformNumber(dash.stats.users), icon: Flag },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] border px-2 py-2.5 text-center"
            style={{
              borderColor: stat.highlight ? `${MC.green}44` : MC.panelBorder,
              background: stat.highlight ? "rgba(34,197,94,0.08)" : "rgba(0,0,0,0.22)",
            }}
          >
            <p
              className="font-mono text-[22px] font-extrabold tabular-nums leading-none"
              style={{ color: stat.highlight ? MC.green : MC.white }}
            >
              {dash.loading || pinsLoading ? "…" : stat.value}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold" style={{ color: MC.muted }}>
              {stat.icon ? <stat.icon className="h-3.5 w-3.5" style={{ color: MC.cyan }} /> : null}
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <FounderGlobeMap className={expanded ? "min-h-[280px]" : "min-h-[200px]"} />

      <div className="mt-3 space-y-2">
        <p className="text-right text-[11px] font-extrabold" style={{ color: MC.white }}>
          أكثر المدن نشاطًا
        </p>
        {topCities.length === 0 ? (
          <p className="py-2 text-center text-[10px] font-bold" style={{ color: MC.muted }}>
            لا توجد بيانات مدن بعد
          </p>
        ) : (
          topCities.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-[12px] border px-3 py-2.5"
              style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.22)" }}
            >
              <span className="font-mono text-[15px] font-extrabold tabular-nums" style={{ color: MC.green }}>
                {formatPlatformNumber(c.count)}
              </span>
              <span className="text-[12px] font-bold" style={{ color: MC.white }}>
                {c.name}
              </span>
            </div>
          ))
        )}
      </div>

      {!expanded ? (
        <p className="mt-2 text-center text-[9px] font-bold" style={{ color: PP_GOLD }}>
          اضغط «توسيع الخريطة» للعرض الكامل
        </p>
      ) : null}
    </CyberPanel>
  );
}
