import { Sparkles } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { buildPlatformIndicators, type Dash } from "./founder-dashboard-data";
import type { DrillData } from "./DrillSheet";
import { FounderIcon3D } from "./FounderIcon3D";

const GLOW_GREEN = MC.greenBright;

export function FounderPlatformIndicators({
  dash,
  onDrill,
}: {
  dash: Dash;
  onDrill: (data: DrillData) => void;
}) {
  const indicators = buildPlatformIndicators(dash);

  return (
    <CyberPanel glow={MC.green} className="mb-3">
      <div className="mb-3 flex items-center justify-between">
        <Sparkles className="h-5 w-5" style={{ color: MC.green }} />
        <div className="text-right">
          <p className="text-[14px] font-extrabold" style={{ color: MC.white }}>
            مؤشرات المنصة
          </p>
          <p className="text-[10px] font-bold" style={{ color: MC.muted }}>
            اضغط للتفاصيل
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {indicators.map((item) => {
          const Icon = item.icon;
          const deltaColor =
            item.deltaTone === "down" ? MC.red : item.deltaTone === "up" ? GLOW_GREEN : MC.muted;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onDrill(item.drill)}
              className="min-h-[118px] rounded-[16px] border p-3.5 text-right transition active:scale-[0.97]"
              style={{
                borderColor: MC.panelBorder,
                background: MC.panel,
                boxShadow: "none",
              }}
            >
              <div className="mb-2.5 flex justify-end">
                <FounderIcon3D icon={Icon} accent={item.color} size="md" />
              </div>
              <p
                className="font-mono text-[26px] font-extrabold tabular-nums leading-none"
                style={{ color: MC.white }}
              >
                {dash.loading ? "…" : item.value}
              </p>
              <p className="mt-1.5 truncate text-[11px] font-extrabold" style={{ color: MC.muted }}>
                {item.label}
              </p>
              <p
                className="mt-0.5 text-[10px] font-extrabold tabular-nums"
                style={{
                  color: deltaColor,
                  textShadow: item.deltaTone === "up" ? `0 0 10px ${GLOW_GREEN}aa` : undefined,
                }}
              >
                {item.delta}
              </p>
            </button>
          );
        })}
      </div>
    </CyberPanel>
  );
}
