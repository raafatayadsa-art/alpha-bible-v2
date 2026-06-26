import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Loader2, Shield, ShieldCheck, Scale } from "lucide-react";
import { PUBLISHER_STATUS_LABELS, PUBLISHER_TYPE_LABELS } from "@/features/publisher";
import {
  fetchCopyrightReportsAdmin,
  fetchPublishersAdmin,
  PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS,
  PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS,
  resolveCopyrightReportAdmin,
  togglePublisherTrustedAdmin,
  type CopyrightReportRow,
  type PublisherAdminRow,
} from "./publisher-center-api";
import { MissionSubShell } from "./mission-control-ui";
import { MC } from "./platform-store";
import { PlatformControlHero, PlatformPremiumStyles, formatPlatformNumber } from "./PlatformPremiumUI";

type Tab = "publishers" | "copyright";

export function PublisherCenterScreen() {
  const [tab, setTab] = useState<Tab>("publishers");
  const [publishers, setPublishers] = useState<PublisherAdminRow[]>([]);
  const [reports, setReports] = useState<CopyrightReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [pubs, reps] = await Promise.all([fetchPublishersAdmin(), fetchCopyrightReportsAdmin()]);
    setPublishers(pubs);
    setReports(reps);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleTrusted = async (row: PublisherAdminRow) => {
    setActingId(row.id);
    await togglePublisherTrustedAdmin(row.id, !row.isTrusted);
    setActingId(null);
    await reload();
  };

  const resolveReport = async (reportId: string, action: "remove" | "keep" | "dismiss") => {
    setActingId(reportId);
    await resolveCopyrightReportAdmin(reportId, action);
    setActingId(null);
    await reload();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "publishers", label: "الناشرون" },
    { key: "copyright", label: "بلاغات حقوق النشر" },
  ];

  return (
    <MissionSubShell title="Publisher Center" titleEn="ALPHA-PUBLISHER-LEGAL-001">
      <PlatformPremiumStyles />
      <PlatformControlHero subtitle="طلبات · نشر مباشر للموثوقين · بلاغات حقوق النشر" />

      <div className="mb-3 flex gap-1.5">
        <Link
          to="/platform/content-review"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border py-2 text-[10px] font-extrabold"
          style={{ borderColor: MC.cyan, color: MC.cyan }}
        >
          <BookOpen className="h-3.5 w-3.5" />
          مراجعة المحتوى
        </Link>
        <Link
          to="/platform/approvals"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border py-2 text-[10px] font-extrabold"
          style={{ borderColor: MC.purple, color: MC.purple }}
        >
          <Shield className="h-3.5 w-3.5" />
          الاعتمادات
        </Link>
      </div>

      <div className="mb-3 flex gap-1 rounded-xl border p-1" style={{ borderColor: MC.panelBorder, background: MC.panel }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="flex-1 rounded-lg py-2 text-[10px] font-extrabold"
            style={{
              background: tab === t.key ? `${MC.purple}33` : "transparent",
              color: tab === t.key ? MC.white : MC.muted,
            }}
          >
            {t.label}
            {t.key === "copyright" && reports.length ? ` (${reports.length})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: MC.purple }} />
        </div>
      ) : tab === "publishers" ? (
        <div className="space-y-2">
          {publishers.some((row) => row.status === "pending_publication") ? (
            <div
              className="rounded-[14px] border px-3 py-2.5"
              style={{ borderColor: `${MC.gold}55`, background: `${MC.gold}12` }}
            >
              <p className="text-[11px] font-extrabold" style={{ color: MC.gold }}>
                {formatPlatformNumber(publishers.filter((r) => r.status === "pending_publication").length)} صفحة
                بانتظار اعتماد النشر
              </p>
              <Link
                to="/platform/approvals"
                className="mt-2 inline-flex text-[10px] font-extrabold underline"
                style={{ color: MC.cyan }}
              >
                فتح مركز الاعتمادات →
              </Link>
            </div>
          ) : null}
          <p className="text-[10px] font-bold" style={{ color: MC.muted }}>
            {formatPlatformNumber(publishers.length)} ناشر — «نشر مباشر» يعتمد المحتوى الجديد فوراً (التعديلات تمر بالمراجعة)
          </p>
          {publishers.map((row) => (
            <article
              key={row.id}
              className="rounded-[14px] border px-3 py-2.5"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <div className="text-right">
                <p className="text-[12px] font-extrabold" style={{ color: MC.white }}>
                  {row.name}
                  {row.isTrusted ? (
                    <span className="mr-1.5 inline-flex items-center gap-0.5 text-[9px] text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      موثوق
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[10px] font-bold" style={{ color: MC.muted }}>
                  {PUBLISHER_TYPE_LABELS[row.publisherType]} · {PUBLISHER_STATUS_LABELS[row.status]} ·{" "}
                  {row.contentCount} محتوى
                </p>
              </div>
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  disabled={actingId === row.id}
                  onClick={() => void toggleTrusted(row)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-extrabold"
                  style={{
                    background: row.isTrusted ? "rgba(184,92,88,0.18)" : "rgba(74,143,110,0.18)",
                    color: row.isTrusted ? "#fca5a5" : "#6ee7b7",
                  }}
                >
                  {row.isTrusted ? "إلغاء النشر المباشر" : "نشر مباشر بدون تحقق"}
                </button>
                {row.isPublic && row.status === "published" ? (
                  <Link
                    to="/publisher/$publisherId"
                    params={{ publisherId: row.id }}
                    className="inline-flex flex-1 items-center justify-center rounded-full border py-1.5 text-[10px] font-extrabold"
                    style={{ borderColor: `${MC.cyan}44`, color: MC.cyan }}
                  >
                    عرض الصفحة
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((row) => (
            <article
              key={row.id}
              className="rounded-[14px] border px-3 py-2.5"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <div className="flex items-start gap-2">
                <Scale className="mt-0.5 h-4 w-4 shrink-0" style={{ color: MC.red }} />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[12px] font-extrabold" style={{ color: MC.white }}>
                    {row.contentTitle}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold" style={{ color: MC.muted }}>
                    {row.publisherName} · {PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS[row.reportKind]}
                  </p>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed" style={{ color: MC.cyan }}>
                    {row.description}
                  </p>
                  <p className="mt-1 text-[9px] font-bold" style={{ color: MC.muted }}>
                    {PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS[row.status]}
                  </p>
                </div>
              </div>
              {actingId === row.id ? (
                <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin" style={{ color: MC.purple }} />
              ) : (
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => void resolveReport(row.id, "remove")}
                    className="flex-1 rounded-full py-1.5 text-[9px] font-extrabold text-red-300"
                    style={{ background: "rgba(184,92,88,0.18)" }}
                  >
                    إزالة
                  </button>
                  <button
                    type="button"
                    onClick={() => void resolveReport(row.id, "keep")}
                    className="flex-1 rounded-full py-1.5 text-[9px] font-extrabold text-emerald-300"
                    style={{ background: "rgba(74,143,110,0.18)" }}
                  >
                    إبقاء
                  </button>
                  <button
                    type="button"
                    onClick={() => void resolveReport(row.id, "dismiss")}
                    className="flex-1 rounded-full py-1.5 text-[9px] font-extrabold text-amber-300"
                    style={{ background: "rgba(196,165,116,0.15)" }}
                  >
                    رفض البلاغ
                  </button>
                </div>
              )}
            </article>
          ))}
          {!reports.length ? (
            <p className="py-10 text-center text-[11px] font-bold" style={{ color: MC.muted }}>
              لا توجد بلاغات مفتوحة.
            </p>
          ) : null}
        </div>
      )}
    </MissionSubShell>
  );
}
