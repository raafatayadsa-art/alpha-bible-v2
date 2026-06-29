import { Check } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { buildHealthChecks, buildHealthDrill, type Dash } from "./founder-dashboard-data";
import type { DrillData } from "./DrillSheet";

function HealthRing({ score, onClick }: { score: number; onClick?: () => void }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const label = score >= 95 ? "ممتاز" : score >= 85 ? "جيد" : "انتباه";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="حالة المنصة"
      className="relative mx-auto grid h-[128px] w-[128px] place-items-center rounded-full transition active:scale-[0.97]"
      style={{ boxShadow: `0 0 28px -8px ${MC.green}88` }}
    >
      <svg className="-rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={MC.green}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${MC.green})` }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono text-[28px] font-extrabold tabular-nums" style={{ color: MC.green }}>
          {score}%
        </p>
        <p className="text-[11px] font-extrabold" style={{ color: PP_GOLD }}>
          {label}
        </p>
        <p className="text-[8px] font-bold uppercase tracking-wide" style={{ color: MC.muted }}>
          Alpha Health
        </p>
      </div>
    </button>
  );
}

export function FounderAlphaHealthPanel({
  dash,
  onDrill,
}: {
  dash: Dash;
  onDrill: (data: DrillData) => void;
}) {
  const checks = buildHealthChecks(dash);

  return (
    <CyberPanel glow={MC.green} className="mb-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <ul className="space-y-2 text-right" dir="rtl">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-mono text-[12px] font-extrabold tabular-nums" style={{ color: c.warn ? MC.gold : MC.cyan }}>
                {c.value}
              </span>
              <span className="flex items-center gap-2">
                <span style={{ color: MC.white }}>{c.label}</span>
                <span
                  className="grid h-2 w-2 place-items-center rounded-full"
                  style={{
                    background: c.ok && !c.warn ? MC.green : c.warn ? MC.gold : MC.red,
                    boxShadow: `0 0 6px ${c.ok && !c.warn ? MC.green : c.warn ? MC.gold : MC.red}`,
                  }}
                >
                  <Check className="h-1.5 w-1.5 text-transparent" />
                </span>
              </span>
            </li>
          ))}
        </ul>
        <HealthRing score={dash.healthScore} onClick={() => onDrill(buildHealthDrill(dash))} />
      </div>
    </CyberPanel>
  );
}
