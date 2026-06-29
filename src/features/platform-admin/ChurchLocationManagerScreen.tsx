import { useCallback, useEffect, useState } from "react";
import { Check, MapPin, X } from "lucide-react";
import {
  CyberBtn,
  CyberPanel,
  CyberSearch,
  MissionSubShell,
} from "./mission-control-ui";
import { MC } from "./platform-store";
import {
  fetchChurchLocationPage,
  fetchChurchLocationStats,
  verifyChurchLocation,
  runAutoVerifyAll,
  AUTO_VERIFY_MECHANISM,
  buildChurchGoogleMapsSearchQuery,
  googleMapsSearchUrl,
  type AutoVerifyReport,
  type ChurchLocationFilter,
  type ChurchLocationRow,
  type ChurchLocationStats,
} from "./church-location-api";
import { usePlatformStore } from "./platform-store";
import {
  formatPlatformNumber,
  PlatformControlHero,
  PlatformPremiumStyles,
  PlatformStatsBar,
  PlatformGlowBtn,
  PP_GOLD,
  PP_GOLD_BRIGHT,
} from "./PlatformPremiumUI";

function formatCount(n: number): string {
  return formatPlatformNumber(n);
}

function ChurchLocationCard({
  row,
  onVerified,
  onToast,
}: {
  row: ChurchLocationRow;
  onVerified: (churchId: number) => void;
  onToast: (msg: string) => void;
}) {
  const [finalUrl, setFinalUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { addAudit } = usePlatformStore();
  const verified = row.location_verified === true;
  const needsReview = row.location_status === "needs_review";
  const fallbackUrl = row.google_maps_url?.trim() ?? "";
  const canVerify = Boolean(finalUrl.trim() || fallbackUrl);

  const openMapsSearch = () => {
    const query = buildChurchGoogleMapsSearchQuery(row);
    window.open(googleMapsSearchUrl(query), "_blank", "noopener,noreferrer");
  };

  const verify = async () => {
    if (!canVerify) {
      onToast("أدخل رابط Google Maps أو تأكد من وجود google_maps_url");
      return;
    }
    setVerifying(true);
    try {
      await verifyChurchLocation(row.id, finalUrl);
      addAudit(`اعتماد موقع كنيسة #${row.id}`, row.church_name.slice(0, 80));
      onVerified(row.id);
    } catch (e) {
      onToast(e instanceof Error ? e.message : "تعذّر اعتماد الموقع");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <article
      className="clm-card-shell relative overflow-hidden rounded-[14px] border px-2.5 py-2"
      style={{
        borderColor: verified ? `${MC.green}40` : `${PP_GOLD}20`,
        background: MC.panel,
        boxShadow: verified
          ? `0 8px 24px -12px ${MC.green}22, inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 8px 22px -14px rgba(80,175,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: verified
            ? `linear-gradient(90deg, transparent, ${MC.green}88, transparent)`
            : `linear-gradient(90deg, transparent, ${PP_GOLD}66, transparent)`,
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-right">
          <h3 className="text-[12.5px] font-extrabold leading-tight text-white line-clamp-1">{row.church_name}</h3>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate">
            {[row.city, row.governorate].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold leading-none"
          style={{
            borderColor: verified ? `${MC.green}50` : needsReview ? `${PP_GOLD}55` : `${MC.red}45`,
            background: verified ? `${MC.green}16` : needsReview ? `${PP_GOLD}18` : `${MC.red}12`,
            color: verified ? "#6ee7b7" : needsReview ? PP_GOLD_BRIGHT : "#fca5a5",
          }}
        >
          {verified ? "موثق" : needsReview ? "مراجعة" : "غير موثق"}
        </span>
      </div>

      {!verified ? (
        <div className="mt-2 space-y-1.5">
          <div
            dir="rtl"
            className="flex items-stretch gap-1.5 rounded-[11px] border px-1.5 py-1.5"
            style={{
              borderColor: `${PP_GOLD}22`,
              background: "rgba(0,0,0,0.28)",
            }}
          >
            <PlatformGlowBtn
              tone="blue"
              glyph="Ⲙ"
              label="Maps"
              sublabel="Search"
              icon={MapPin}
              onClick={openMapsSearch}
              compact
              className="min-w-0 flex-1"
            />
            <div
              aria-hidden
              className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#34C759]/30 to-transparent"
            />
            <button
              type="button"
              disabled={!canVerify || verifying}
              onClick={() => void verify()}
              className="relative min-h-[44px] min-w-0 flex-1 overflow-hidden rounded-[10px] border px-2 py-2 transition active:scale-[0.98] disabled:opacity-45"
              style={{
                borderColor: `${MC.green}55`,
                background: "linear-gradient(180deg, rgba(31,138,90,0.24) 0%, rgba(0,0,0,0.22) 100%)",
                boxShadow: "0 0 10px rgba(31,138,90,0.16)",
              }}
            >
              <div className="flex flex-row items-center justify-center gap-1.5">
                <Check
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: "#6ee7b7", filter: "drop-shadow(0 0 6px rgba(110,231,183,0.5))" }}
                />
                <span className="text-[10px] font-extrabold leading-none text-[#6ee7b7]">
                  {verifying ? "…" : "Verify"}
                </span>
              </div>
            </button>
          </div>

          <div className="rounded-[10px] border px-2 py-1.5" style={{ borderColor: `${PP_GOLD}18`, background: "rgba(0,0,0,0.22)" }}>
            <label
              htmlFor={`final-url-${row.id}`}
              className="block text-[9px] font-extrabold uppercase tracking-wide text-slate-500"
            >
              Final Google Maps URL
            </label>
            <input
              id={`final-url-${row.id}`}
              value={finalUrl}
              onChange={(e) => setFinalUrl(e.target.value)}
              placeholder={fallbackUrl ? "Paste URL or leave empty for fallback" : "https://maps.google.com/..."}
              dir="ltr"
              className="mt-1 w-full rounded-lg border-0 bg-transparent px-0 py-1 text-[10.5px] font-semibold text-[#c8e8ff] outline-none placeholder:text-slate-600 focus:ring-0"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

function AutoVerifyReportDialog({
  report,
  onClose,
}: {
  report: AutoVerifyReport;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[650] flex items-end justify-center bg-black/65 p-3 backdrop-blur-md sm:items-center">
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[20px] border p-4 text-right"
        style={{
          borderColor: `${PP_GOLD}36`,
          background: MC.panel,
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-extrabold text-white">Auto Verify Report</h3>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
              {report.totalProcessed.toLocaleString("en-US")} churches processed
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-xl border"
            style={{ borderColor: `${PP_GOLD}28`, background: "rgba(0,0,0,0.35)" }}
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <ReportStat label="Verified Automatically" value={report.verifiedAutomatically} color={MC.green} />
          <ReportStat label="Needs Manual Review" value={report.needsManualReview} color={PP_GOLD_BRIGHT} />
          <ReportStat label="Failed" value={report.failed} color="#fca5a5" />
        </div>

        <div
          className="rounded-xl border px-3 py-2.5 mb-3"
          style={{ borderColor: `${PP_GOLD}22`, background: "rgba(0,0,0,0.28)" }}
        >
          <p className="text-[10px] font-extrabold text-[#8fd4ff]">{AUTO_VERIFY_MECHANISM.title}</p>
          <ul className="mt-2 space-y-1.5">
            {AUTO_VERIFY_MECHANISM.points.map((point) => (
              <li key={point} className="text-[9.5px] leading-relaxed text-slate-400">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[9px] font-bold text-amber-400/90">
            لا Browser Automation · لا Google Places API
          </p>
        </div>

        <ReportSample title="Verified samples" items={report.samples.verified} tone={MC.green} />
        <ReportSample title="Needs review samples" items={report.samples.needsReview} tone={PP_GOLD_BRIGHT} />
        <ReportSample title="Failed samples" items={report.samples.failed} tone="#fca5a5" />
      </div>
    </div>
  );
}

function ReportStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl border px-2 py-2 text-center"
      style={{ borderColor: `${color}33`, background: "rgba(0,0,0,0.25)" }}
    >
      <p className="text-[18px] font-extrabold leading-none" style={{ color }}>
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-[8px] font-bold leading-tight text-slate-500">{label}</p>
    </div>
  );
}

function ReportSample({
  title,
  items,
  tone,
}: {
  title: string;
  items: { id: number; name: string; reason: string }[];
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-2">
      <p className="mb-1 text-[9px] font-extrabold" style={{ color: tone }}>
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <p key={item.id} className="text-[9px] text-slate-500 leading-snug">
            <span className="font-bold text-slate-300">#{item.id}</span> {item.name}
            <span className="text-slate-600"> — {item.reason}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function ChurchLocationFilterChips({
  filter,
  onChange,
}: {
  filter: ChurchLocationFilter;
  onChange: (f: ChurchLocationFilter) => void;
}) {
  const chips: { id: ChurchLocationFilter; label: string }[] = [
    { id: "unverified", label: "غير الموثقة فقط" },
    { id: "all", label: "الكل" },
    { id: "verified", label: "الموثقة فقط" },
  ];

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
      {chips.map((chip) => {
        const active = filter === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition active:scale-95"
            style={
              active
                ? {
                    borderColor: `${PP_GOLD}66`,
                    background: `linear-gradient(180deg, ${PP_GOLD}22 0%, rgba(0,0,0,0.2) 100%)`,
                    color: PP_GOLD_BRIGHT,
                    boxShadow: `0 0 16px ${PP_GOLD}22`,
                  }
                : {
                    borderColor: `${MC.panelBorder}`,
                    background: "rgba(0,0,0,0.2)",
                    color: "rgba(148,163,184,0.85)",
                  }
            }
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChurchLocationManagerScreen() {
  const [stats, setStats] = useState<ChurchLocationStats | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<ChurchLocationFilter>("unverified");
  const [rows, setRows] = useState<ChurchLocationRow[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoProgress, setAutoProgress] = useState<{ done: number; total: number } | null>(null);
  const [autoReport, setAutoReport] = useState<AutoVerifyReport | null>(null);
  const { addAudit } = usePlatformStore();

  const hasMore = rows.length < total;

  const statsItems = [
    { label: "إجمالي الكنائس", value: stats ? formatCount(stats.total) : "…", color: MC.white },
    { label: "موثقة", value: stats ? formatCount(stats.verified) : "…", color: MC.green },
    { label: "غير موثقة", value: stats ? formatCount(stats.unverified) : "…", color: MC.red },
    { label: "نسبة الإنجاز", value: stats ? `${stats.progressPct}%` : "…", color: PP_GOLD },
  ];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const refreshStats = useCallback(async () => {
    const next = await fetchChurchLocationStats();
    setStats(next);
  }, []);

  const loadPage = useCallback(
    async (pageIndex: number, append: boolean) => {
      const result = await fetchChurchLocationPage(pageIndex, debouncedSearch, filter);
      setTotal(result.total);
      setRows((prev) => (append ? [...prev, ...result.rows] : result.rows));
    },
    [debouncedSearch, filter],
  );

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 280);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setLoading(true);
    void loadPage(0, false)
      .catch((e) => showToast(e instanceof Error ? e.message : "تعذّر التحميل"))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filter, loadPage, showToast]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      await loadPage(nextPage, true);
      setPage(nextPage);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "تعذّر التحميل");
    } finally {
      setLoadingMore(false);
    }
  };

  const onVerified = useCallback(
    async (churchId: number) => {
      setRows((prev) => prev.filter((r) => r.id !== churchId));
      setTotal((prev) => Math.max(0, prev - 1));
      showToast("تم اعتماد الموقع — التالي");
      await refreshStats();
    },
    [refreshStats, showToast],
  );

  const runAutoVerify = async () => {
    const totalUnverified = stats?.unverified ?? 0;
    if (totalUnverified === 0) {
      showToast("لا توجد كنائس غير موثقة");
      return;
    }
    const ok = window.confirm(
      `🤖 Auto Verify All\n\n` +
        `سيتم فحص ${totalUnverified} كنيسة غير موثقة.\n\n` +
        `الآلية: تحليل بنية google_maps_url فقط (بدون Google API أو Browser Automation).\n\n` +
        `• رابط مكان واحد (/maps/place/) → اعتماد تلقائي\n` +
        `• بحث / غامض → needs_review\n` +
        `• بدون رابط → Failed\n\n` +
        `متابعة؟`,
    );
    if (!ok) return;

    setAutoRunning(true);
    setAutoProgress({ done: 0, total: totalUnverified });
    try {
      const report = await runAutoVerifyAll((done) => {
        setAutoProgress({ done, total: totalUnverified });
      });
      addAudit(
        "Auto Verify All",
        `✓${report.verifiedAutomatically} review${report.needsManualReview} fail${report.failed}`,
      );
      setAutoReport(report);
      setPage(0);
      setLoading(true);
      await Promise.all([refreshStats(), loadPage(0, false)]).finally(() => setLoading(false));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "تعذّر التشغيل التلقائي");
    } finally {
      setAutoRunning(false);
      setAutoProgress(null);
    }
  };

  return (
    <MissionSubShell title="Church Location Manager" titleEn="مدير مواقع الكنائس">
      <PlatformPremiumStyles />

      <PlatformControlHero subtitle="Search → pick church → paste Final URL → Verify Location" />

      <PlatformStatsBar items={statsItems} />

      <button
        type="button"
        disabled={autoRunning || loading}
        onClick={() => void runAutoVerify()}
        className="mb-3 w-full rounded-xl border px-3 py-2.5 text-[11px] font-extrabold transition active:scale-[0.98] disabled:opacity-45"
        style={{
          borderColor: `${PP_GOLD}44`,
          background: "linear-gradient(180deg, rgba(143,212,255,0.12) 0%, rgba(0,0,0,0.22) 100%)",
          color: PP_GOLD_BRIGHT,
          boxShadow: `0 0 16px ${PP_GOLD}14`,
        }}
      >
        {autoRunning
          ? `🤖 Auto Verify All… ${autoProgress?.done ?? 0} / ${autoProgress?.total ?? "…"}`
          : "🤖 Auto Verify All"}
      </button>

      <div
        className="mb-3 overflow-hidden rounded-xl border"
        style={{ borderColor: `${PP_GOLD}18`, background: "rgba(0,0,0,0.28)" }}
      >
        <CyberSearch
          value={search}
          onChange={setSearch}
          placeholder="ابحث باسم الكنيسة أو المدينة أو المحافظة…"
        />
      </div>

      <ChurchLocationFilterChips filter={filter} onChange={setFilter} />

      <p className="mb-2 text-[10px] font-bold text-slate-500">
        {formatCount(rows.length)} / {formatCount(total)} نتيجة
      </p>

      <div className="space-y-1.5 pb-8">
        {loading && rows.length === 0 ? (
          <CyberPanel glow={PP_GOLD}>
            <p className="text-center text-[12px] font-bold text-slate-400">جاري التحميل…</p>
          </CyberPanel>
        ) : null}

        {!loading && rows.length === 0 ? (
          <CyberPanel glow={PP_GOLD}>
            <p className="text-center text-[12px] font-bold text-slate-400">
              {filter === "unverified" ? "🎉 كل المواقع موثقة" : "لا توجد نتائج"}
            </p>
          </CyberPanel>
        ) : null}

        {rows.map((row) => (
          <ChurchLocationCard
            key={row.id}
            row={row}
            onVerified={(id) => void onVerified(id)}
            onToast={showToast}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="pb-[max(env(safe-area-inset-bottom),12px)]">
          <CyberBtn
            label={loadingMore ? "جاري التحميل…" : "تحميل المزيد"}
            variant="ghost"
            className="w-full"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          />
        </div>
      ) : null}

      {autoReport ? (
        <AutoVerifyReportDialog report={autoReport} onClose={() => setAutoReport(null)} />
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-[max(env(safe-area-inset-bottom),16px)] left-1/2 z-[700] -translate-x-1/2 rounded-full border px-4 py-2 text-[11px] font-extrabold text-white backdrop-blur-md"
          style={{
            borderColor: `${PP_GOLD}55`,
            background: "rgba(15,22,40,0.94)",
            boxShadow: `0 0 24px ${PP_GOLD}28`,
            color: PP_GOLD_BRIGHT,
          }}
        >
          {toast}
        </div>
      ) : null}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>
    </MissionSubShell>
  );
}
