import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Church, Loader2 } from "lucide-react";
import { churchPageStatusLabel } from "@/features/church-page";
import {
  fetchChurchManagementStats,
  fetchChurchesForManagement,
  patchChurchPageStatus,
  type ChurchManagementRow,
  type ChurchManagementStats,
  type ChurchPageStatusFilter,
} from "./churches-management-api";
import { MissionSubShell } from "./mission-control-ui";
import { MC } from "./platform-store";
import {
  PlatformControlHero,
  PlatformPremiumStyles,
  PlatformStatsBar,
  formatPlatformNumber,
  PP_GOLD,
} from "./PlatformPremiumUI";

const FILTERS: { key: ChurchPageStatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "inactive", label: "غير مفعّلة" },
  { key: "pending_claim", label: "طلب استلام" },
  { key: "verified", label: "موثّقة" },
  { key: "suspended", label: "موقوفة" },
];

export function ChurchesManagementScreen() {
  const [filter, setFilter] = useState<ChurchPageStatusFilter>("all");
  const [stats, setStats] = useState<ChurchManagementStats | null>(null);
  const [rows, setRows] = useState<ChurchManagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [nextStats, nextRows] = await Promise.all([
      fetchChurchManagementStats(),
      fetchChurchesForManagement(filter),
    ]);
    setStats(nextStats);
    setRows(nextRows);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setStatus = async (churchId: number, pageStatus: ChurchPageStatusFilter) => {
    if (pageStatus === "all") return;
    setActingId(churchId);
    await patchChurchPageStatus(churchId, pageStatus);
    setActingId(null);
    await reload();
  };

  return (
    <MissionSubShell title="Churches Management" subtitle="إدارة حالة صفحات الكنائس · page_status">
      <PlatformPremiumStyles />
      <PlatformControlHero subtitle="ALPHA-107 · Churches page lifecycle · read + quick status patch" />

      <PlatformStatsBar
        items={[
          { label: "Total", value: formatPlatformNumber(stats?.total ?? 0), color: PP_GOLD },
          { label: "Inactive", value: formatPlatformNumber(stats?.inactive ?? 0), color: MC.steel },
          { label: "Pending", value: formatPlatformNumber(stats?.pending_claim ?? 0), color: MC.gold },
          { label: "Verified", value: formatPlatformNumber(stats?.verified ?? 0), color: MC.green },
          { label: "Suspended", value: formatPlatformNumber(stats?.suspended ?? 0), color: MC.red },
        ]}
      />

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-extrabold"
            style={{
              borderColor: filter === f.key ? PP_GOLD : MC.panelBorder,
              color: filter === f.key ? PP_GOLD : MC.muted,
              background: filter === f.key ? "rgba(196,165,116,0.12)" : "transparent",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

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
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2 text-right">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-extrabold leading-snug" style={{ color: MC.white }}>
                      {row.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold" style={{ color: MC.muted }}>
                      {[row.city, row.governorate].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="mt-1 text-[10px] font-bold" style={{ color: MC.cyan }}>
                      {churchPageStatusLabel(row.pageStatus)} · {row.memberCount.toLocaleString("ar-EG")} عضو
                    </p>
                  </div>
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                    style={{ background: "rgba(196,165,116,0.15)", color: PP_GOLD }}
                  >
                    <Church className="h-4 w-4" />
                  </span>
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <Link
                    to="/church/directory/$placeId"
                    params={{ placeId: String(row.id) }}
                    className="rounded-full border px-2.5 py-1 text-[9px] font-extrabold"
                    style={{ borderColor: MC.panelBorder, color: MC.purple }}
                  >
                    صفحة
                  </Link>
                  {actingId === row.id ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" style={{ color: MC.purple }} />
                  ) : (
                    <>
                      {row.pageStatus !== "verified" ? (
                        <button
                          type="button"
                          onClick={() => void setStatus(row.id, "verified")}
                          className="rounded-full px-2.5 py-1 text-[9px] font-extrabold text-emerald-300"
                          style={{ background: "rgba(74,143,110,0.18)" }}
                        >
                          توثيق
                        </button>
                      ) : null}
                      {row.pageStatus !== "suspended" ? (
                        <button
                          type="button"
                          onClick={() => void setStatus(row.id, "suspended")}
                          className="rounded-full px-2.5 py-1 text-[9px] font-extrabold text-red-300"
                          style={{ background: "rgba(184,92,88,0.18)" }}
                        >
                          إيقاف
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!rows.length ? (
            <p className="py-10 text-center text-[11px] font-bold" style={{ color: MC.muted }}>
              لا توجد كنائس في هذا الفلتر.
            </p>
          ) : null}
        </div>
      )}
    </MissionSubShell>
  );
}
