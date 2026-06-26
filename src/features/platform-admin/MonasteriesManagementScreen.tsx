import { useCallback, useEffect, useState } from "react";
import { Loader2, Mountain } from "lucide-react";
import { churchPageStatusLabel } from "@/features/church-page";
import {
  fetchMonasteriesForManagement,
  fetchMonasteryManagementStats,
  type MonasteryManagementRow,
  type MonasteryManagementStats,
} from "./monasteries-management-api";
import { MissionSubShell } from "./mission-control-ui";
import { MC } from "./platform-store";
import {
  PlatformControlHero,
  PlatformPremiumStyles,
  PlatformStatsBar,
  formatPlatformNumber,
  PP_GOLD,
} from "./PlatformPremiumUI";

export function MonasteriesManagementScreen() {
  const [stats, setStats] = useState<MonasteryManagementStats | null>(null);
  const [rows, setRows] = useState<MonasteryManagementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [nextStats, nextRows] = await Promise.all([
      fetchMonasteryManagementStats(),
      fetchMonasteriesForManagement(),
    ]);
    setStats(nextStats);
    setRows(nextRows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <MissionSubShell title="Monasteries Management" subtitle="إدارة صفحات الأديرة · ALPHA-107">
      <PlatformPremiumStyles />
      <PlatformControlHero subtitle="Monasteries table · seed data via Supabase · public pages next phase" />

      <PlatformStatsBar
        items={[
          { label: "Total", value: formatPlatformNumber(stats?.total ?? 0), color: PP_GOLD },
          { label: "Inactive", value: formatPlatformNumber(stats?.inactive ?? 0), color: MC.steel },
          { label: "Pending", value: formatPlatformNumber(stats?.pending_claim ?? 0), color: MC.gold },
          { label: "Verified", value: formatPlatformNumber(stats?.verified ?? 0), color: MC.green },
          { label: "Suspended", value: formatPlatformNumber(stats?.suspended ?? 0), color: MC.red },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: MC.purple }} />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-[14px] border px-3 py-2.5"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <div className="flex items-start justify-between gap-3 text-right">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-extrabold leading-snug" style={{ color: MC.white }}>
                    {row.name}
                  </p>
                  {row.englishName ? (
                    <p className="mt-0.5 text-[10px] font-bold" style={{ color: MC.muted }}>
                      {row.englishName}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] font-bold" style={{ color: MC.muted }}>
                    {[row.city, row.governorate].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="mt-1 text-[10px] font-bold" style={{ color: MC.cyan }}>
                    {churchPageStatusLabel(row.pageStatus)} · {row.memberCount.toLocaleString("ar-EG")} متابع
                  </p>
                </div>
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: "rgba(139,122,184,0.18)", color: MC.purple }}
                >
                  <Mountain className="h-4 w-4" />
                </span>
              </div>
            </article>
          ))}
          {!rows.length ? (
            <p className="py-10 text-center text-[11px] font-bold leading-relaxed" style={{ color: MC.muted }}>
              جدول الأديرة جاهز — أضِف الصفوف من Supabase ثم ستظهر هنا.
            </p>
          ) : null}
        </div>
      )}
    </MissionSubShell>
  );
}
