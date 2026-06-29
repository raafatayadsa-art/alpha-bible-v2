import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";

export type DrillBreakdownRow = {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down";
};

export type DrillData = {
  title: string;
  subtitle?: string;
  value?: string;
  delta?: string;
  deltaTone?: "up" | "down";
  series?: { label: string; value: number }[];
  breakdown?: DrillBreakdownRow[];
  extraBreakdown?: DrillBreakdownRow[];
  cityRows?: { name: string; code: string; count: string }[];
  extra?: ReactNode;
};

function BreakdownList({ rows }: { rows: DrillBreakdownRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map((b) => (
        <div
          key={b.label}
          className="flex items-center justify-between rounded-[14px] border px-4 py-3.5"
          style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.28)" }}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[14px] font-extrabold" style={{ color: MC.white }}>
              {b.value}
            </span>
            {b.hint ? (
              <span
                className="text-[11px] font-bold"
                style={{
                  color: b.tone === "up" ? MC.green : b.tone === "down" ? MC.red : MC.muted,
                }}
              >
                {b.hint}
              </span>
            ) : null}
          </div>
          <span className="text-[13px] font-semibold" style={{ color: MC.muted }}>
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DrillSheet({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: DrillData | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88vh] max-w-lg overflow-y-auto rounded-t-[22px] border-x-0 border-b-0 px-5 pb-8 pt-3 [&>button.absolute]:hidden"
        style={{ background: MC.midnight, borderColor: MC.panelBorder }}
      >
        <div className="relative">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: MC.panelBorder }} />
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute end-0 top-0 grid h-9 w-9 place-items-center rounded-full border active:scale-95"
            style={{ borderColor: `${PP_GOLD}66`, background: "rgba(0,0,0,0.35)" }}
          >
            <X className="h-4 w-4" style={{ color: PP_GOLD }} />
          </button>
        </div>

        {data && (
          <>
            <SheetHeader className="items-end pe-10 text-right">
              <SheetTitle className="text-[17px] font-extrabold" style={{ color: MC.white }}>
                {data.title}
              </SheetTitle>
              {data.subtitle && (
                <SheetDescription className="text-[11px] font-bold" style={{ color: MC.muted }}>
                  {data.subtitle}
                </SheetDescription>
              )}
            </SheetHeader>

            {(data.value || data.delta) && (
              <div className="mt-5 flex items-baseline justify-between">
                <span
                  className="text-[14px] font-extrabold"
                  style={{ color: data.deltaTone === "down" ? MC.red : MC.green }}
                >
                  {data.delta}
                </span>
                <span className="font-mono text-[34px] font-extrabold tabular-nums leading-none" style={{ color: MC.white }}>
                  {data.value}
                </span>
              </div>
            )}

            {data.series && (
              <div className="mt-5 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series}>
                    <defs>
                      <linearGradient id="founderDrillFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PP_GOLD} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={PP_GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      stroke={MC.muted}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: MC.midnight,
                        border: `1px solid ${MC.panelBorder}`,
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: MC.muted }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={PP_GOLD}
                      strokeWidth={2}
                      fill="url(#founderDrillFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.breakdown && data.breakdown.length > 0 ? (
              <div className="mt-5">
                <BreakdownList rows={data.breakdown} />
              </div>
            ) : null}

            {data.extraBreakdown && data.extraBreakdown.length > 0 ? (
              <div className="mt-3">
                <BreakdownList rows={data.extraBreakdown} />
              </div>
            ) : null}

            {data.cityRows && data.cityRows.length > 0 ? (
              <div className="mt-5 space-y-2">
                <p className="text-right text-[13px] font-extrabold" style={{ color: MC.white }}>
                  أكثر المدن نشاطًا
                </p>
                {data.cityRows.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between rounded-[14px] border px-4 py-3.5"
                    style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.28)" }}
                  >
                    <span className="font-mono text-[16px] font-extrabold tabular-nums" style={{ color: MC.green }}>
                      {c.count}
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: MC.white }}>
                      {c.name}{" "}
                      <span className="text-[10px] font-bold" style={{ color: MC.muted }}>
                        {c.code}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {data.extra}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
