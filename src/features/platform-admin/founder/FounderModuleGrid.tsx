import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Siren } from "lucide-react";
import { MC } from "../platform-store";
import { PlatformSectionTitle, formatPlatformNumber } from "../PlatformPremiumUI";
import type { FounderModuleDef } from "./founder-modules-config";
import { FounderIcon3D } from "./FounderIcon3D";

function FounderModuleCard({ module }: { module: FounderModuleDef }) {
  const Icon = module.icon;

  return (
    <Link
      to={module.to}
      className="block overflow-hidden rounded-[20px] border p-3.5 transition active:scale-[0.98]"
      style={{
        borderColor: MC.panelBorder,
        background: MC.panel,
      }}
    >
      <div className="flex items-start gap-3" dir="rtl">
        <FounderIcon3D icon={Icon} accent={module.accent} size="lg" />
        <div className="min-w-0 flex-1 text-right">
          <div className="flex items-start justify-between gap-2">
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: MC.green }} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <h3 className="text-[14px] font-extrabold leading-tight" style={{ color: MC.white }}>
                  {module.title}
                </h3>
                {module.badge != null && module.badge > 0 ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[12px] font-extrabold tabular-nums"
                    style={{
                      background: module.to.includes("media") ? MC.gold : MC.red,
                      color: module.to.includes("media") ? MC.midnight : MC.white,
                    }}
                  >
                    {module.badge > 99 ? "99+" : formatPlatformNumber(module.badge)}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: `${module.accent}cc` }}>
                {module.titleEn}
              </p>
              <p className="mt-1 text-[10px] font-semibold leading-snug" style={{ color: MC.muted }}>
                {module.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {module.metrics && module.metrics.length > 0 ? (
        <div
          className="mt-3 grid gap-px overflow-hidden rounded-[14px] border"
          style={{
            borderColor: MC.panelBorder,
            background: MC.panelBorder,
            gridTemplateColumns: `repeat(${module.metrics.length}, minmax(0, 1fr))`,
          }}
        >
          {module.metrics.map((m) => (
            <div key={m.label} className="px-2 py-2.5 text-center" style={{ background: MC.panel }}>
              <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: MC.muted }}>
                {m.label}
              </p>
              <p className="mt-0.5 font-mono text-[22px] font-extrabold leading-none tabular-nums" style={{ color: module.accent }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export function FounderModuleSection({
  id,
  title,
  modules,
}: {
  id: string;
  title: string;
  modules: FounderModuleDef[];
}) {
  return (
    <>
      <PlatformSectionTitle>{title}</PlatformSectionTitle>
      <div id={id} className="mb-3 grid grid-cols-1 gap-3 scroll-mt-24 sm:grid-cols-2">
        {modules.map((m) => (
          <FounderModuleCard key={m.to} module={m} />
        ))}
      </div>
    </>
  );
}

export function FounderEmergencyModuleCard({ to }: { to: string }) {
  return (
    <>
      <PlatformSectionTitle>Emergency</PlatformSectionTitle>
      <div id="founder-emergency" className="scroll-mt-24">
        <Link
          to={to}
          className="block overflow-hidden rounded-[20px] border p-4 transition active:scale-[0.98]"
          style={{
            borderColor: `${MC.red}44`,
            background: MC.panel,
          }}
        >
          <div className="flex items-center gap-3" dir="rtl">
            <FounderIcon3D icon={Siren} accent={MC.red} size="lg" />
            <div className="flex-1 text-right">
              <h3 className="text-[15px] font-extrabold" style={{ color: MC.white }}>
                Emergency Center
              </h3>
              <p className="mt-1 text-[10px] font-semibold" style={{ color: MC.muted }}>
                Maintenance · Lockdown · Platform broadcast
              </p>
            </div>
            <span
              className="shrink-0 rounded-full border px-3 py-1 text-[9px] font-extrabold"
              style={{ borderColor: `${MC.red}55`, color: MC.red }}
            >
              فتح
            </span>
          </div>
        </Link>
      </div>
    </>
  );
}
