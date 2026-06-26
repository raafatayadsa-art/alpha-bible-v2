import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Copy,
  FileText,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MC } from "./platform-store";
import type { ApprovalDocument, ApprovalItem, ApprovalStatus } from "./types";
import {
  APPROVAL_KIND_LABELS,
  APPROVAL_STATUS_LABELS_AR,
  enrichApprovalItem,
  getApprovalDocuments,
  getChurchLabel,
  getDocumentCount,
  getApprovalDetailRows,
  getApprovalPayloadServants,
  getSubmitterInitials,
  getSubmitterName,
  normalizeApprovalStatus,
  statusBadgeStyle,
} from "./types";

const panelStyle = (glow = MC.purple) => ({
  background: MC.panel,
  borderColor: MC.panelBorder,
  boxShadow: `0 10px 40px -12px rgba(0,0,0,0.55), 0 0 28px -14px ${glow}55, inset 0 1px 0 rgba(255,255,255,0.07)`,
});

export function RefStatusBadge({ status }: { status: ApprovalStatus }) {
  const s = normalizeApprovalStatus(status);
  const style = statusBadgeStyle(status);
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {APPROVAL_STATUS_LABELS_AR[s]}
    </span>
  );
}

export function RefStatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: typeof Shield;
}) {
  return (
    <div className="rounded-[14px] border p-2 text-center backdrop-blur-md" style={panelStyle(color)}>
      <Icon className="mx-auto mb-1 h-4 w-4" style={{ color }} strokeWidth={2} />
      <p className="text-[7px] font-semibold leading-tight" style={{ color: MC.muted }}>
        {label}
      </p>
      <p className="text-[20px] font-extrabold tabular-nums leading-none" style={{ color: MC.white }}>
        {value}
      </p>
    </div>
  );
}

export function RefFilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition active:scale-95",
        active ? "text-white" : "",
      )}
      style={
        active
          ? { borderColor: `${MC.purple}66`, background: `${MC.purple}28`, color: MC.white }
          : { borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)", color: MC.muted }
      }
    >
      {label}
      {count > 0 && (
        <span
          className="grid min-w-[18px] place-items-center rounded-full px-1 text-[8px] font-bold"
          style={{ background: active ? MC.purple : "rgba(138,148,168,0.25)", color: MC.white }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function formatListDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar-EG", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function getCardImage(item: ApprovalItem): { type: "image"; src: string } | { type: "icon" } {
  const enriched = enrichApprovalItem(item);
  if (item.kind === "critical_report") return { type: "icon" };
  const src =
    enriched.submitterAvatarUrl ??
    enriched.idImageUrl ??
    enriched.thumbnailUrl ??
    enriched.photos?.[0] ??
    "/placeholder.svg";
  return { type: "image", src };
}

function getCardRequestTitle(item: ApprovalItem): string {
  switch (item.kind) {
    case "church_setup":
      return "New Church Approval Request";
    case "church_claim":
      return "Church Claim Request";
    case "publisher_setup":
      return "Publisher Page Request";
    case "publisher_publication":
      return "Publisher Publication Request";
    case "content_review":
      return "Content Review";
    case "priest_verification":
      return "Priest Approval Request";
    case "servant_verification":
      return "Servant Approval Request";
    case "saint_image":
      return "Saint Image Approval";
    case "critical_report":
      return "Critical Report";
    default:
      return APPROVAL_KIND_LABELS[item.kind];
  }
}

function getCardPrimaryName(item: ApprovalItem): string {
  if (item.kind === "church_setup" || item.kind === "church_claim") return item.churchName ?? getSubmitterName(item);
  if (item.kind === "saint_image") return item.saintName ?? getSubmitterName(item);
  if (item.kind === "critical_report") return item.submittedBy ?? "—";
  return getSubmitterName(item);
}

function getCardSecondaryLine(item: ApprovalItem): string {
  if (item.kind === "church_setup" || item.kind === "church_claim") return item.diocese ?? getChurchLabel(item);
  if (item.kind === "saint_image") return item.contributorName ?? "Alpha Library";
  if (item.kind === "critical_report") return item.reportType ?? "Report";
  return getChurchLabel(item);
}

export function RefListCard({ item }: { item: ApprovalItem }) {
  const image = getCardImage(item);
  const docCount = getDocumentCount(item);
  const isClosed =
    normalizeApprovalStatus(item.status) === "approved" || normalizeApprovalStatus(item.status) === "rejected";

  return (
    <div className="overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.purple)}>
      <div className="p-3">
        <div className="mb-2 flex justify-end">
          <RefStatusBadge status={item.status} />
        </div>

        <div className="mb-3 flex gap-3">
          {image.type === "image" ? (
            <img
              src={image.src}
              alt=""
              className="h-[88px] w-[88px] shrink-0 rounded-[14px] border object-cover"
              style={{ borderColor: MC.panelBorder, boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}
            />
          ) : (
            <div
              className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-[14px] border"
              style={{ borderColor: `${MC.red}44`, background: `${MC.red}18` }}
            >
              <AlertTriangle className="h-10 w-10" style={{ color: MC.red }} strokeWidth={1.8} />
            </div>
          )}

          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-bold leading-snug" style={{ color: MC.purple }}>
              {getCardRequestTitle(item)}
            </p>
            <p className="mt-0.5 text-[13px] font-extrabold leading-snug" style={{ color: MC.white }}>
              {getCardPrimaryName(item)}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold" style={{ color: MC.muted }}>
              {getCardSecondaryLine(item)}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold" style={{ color: MC.muted }}>
                <Calendar className="h-3 w-3" />
                {formatListDate(item.submittedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold" style={{ color: MC.muted }}>
                <FileText className="h-3 w-3" />
                {docCount} documents
              </span>
            </div>
          </div>
        </div>

        <Link to="/platform/approvals/$id" params={{ id: item.id }} preload="intent" className="block">
          <span
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border py-3 text-[11px] font-extrabold transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(155deg, rgba(139,122,184,0.5), rgba(45,38,72,0.98))",
              borderColor: "rgba(139,122,184,0.55)",
              color: MC.white,
              boxShadow: `0 6px 24px rgba(0,0,0,0.45), 0 0 28px -8px ${MC.purple}88`,
            }}
          >
            <Search className="h-4 w-4" strokeWidth={2.4} />
            {isClosed ? "View Record" : "مراجعة الطلب"}
            <ChevronLeft className="h-4 w-4 rotate-180" strokeWidth={2.4} />
          </span>
        </Link>
      </div>
    </div>
  );
}

export function RefSearchRow({
  search,
  onSearch,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (v: string) => void;
  sort: "latest" | "oldest";
  onSort: (v: "latest" | "oldest") => void;
}) {
  return (
    <div className="mb-3 flex gap-2">
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as "latest" | "oldest")}
        className="w-[34%] shrink-0 rounded-[12px] border px-2 py-2.5 text-[10px] font-bold outline-none"
        style={{ borderColor: MC.panelBorder, background: MC.midnight, color: MC.white }}
      >
        <option value="latest">Sort by Latest</option>
        <option value="oldest">Sort by Oldest</option>
      </select>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: MC.muted }} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search: Name · Church · Request #"
          className="w-full rounded-[12px] border py-2.5 pl-3 pr-9 text-[11px] font-semibold outline-none"
          style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.35)", color: MC.white }}
        />
      </div>
    </div>
  );
}

/* ─── DETAILS SCREEN ─── */

export function RefDetailsHeader({
  requestNo,
  status,
  onBack,
  onCopy,
}: {
  requestNo: string;
  status: ApprovalStatus;
  onBack: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="mb-3 flex items-start gap-2 pt-[max(env(safe-area-inset-top),6px)]">
      <button
        type="button"
        onClick={onBack}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border"
        style={{ borderColor: MC.panelBorder, background: MC.panel }}
      >
        <ArrowLeft className="h-5 w-5 rotate-180" style={{ color: MC.muted }} strokeWidth={2} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[15px] font-extrabold" style={{ color: MC.white }}>
          Review Request
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <RefStatusBadge status={status} />
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[9px] font-bold"
            style={{ borderColor: MC.panelBorder, color: MC.gold }}
          >
            #{requestNo}
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

const DETAIL_TABS = [
  { id: "details", label: "Details", icon: User },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "notes", label: "Notes", icon: ClipboardList },
] as const;

export type DetailTab = (typeof DETAIL_TABS)[number]["id"];

export function RefDetailTabs({ active, onChange }: { active: DetailTab; onChange: (t: DetailTab) => void }) {
  return (
    <div className="mb-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {DETAIL_TABS.map((tab) => {
        const Icon = tab.icon;
        const on = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="flex shrink-0 flex-col items-center gap-0.5 rounded-[12px] border px-2.5 py-1.5"
            style={
              on
                ? { borderColor: `${MC.purple}55`, background: `${MC.purple}22`, color: MC.white }
                : { borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)", color: MC.muted }
            }
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span className="text-[7px] font-bold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RefApplicantCard({ item }: { item: ApprovalItem }) {
  const enriched = enrichApprovalItem(item);
  const img = enriched.submitterAvatarUrl ?? enriched.idImageUrl ?? enriched.thumbnailUrl ?? enriched.photos?.[0];
  const detailRows = getApprovalDetailRows(enriched);

  return (
    <div className="mb-3 overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.purple)}>
      <div className="p-3.5">
        <div className="flex gap-3">
          {img ? (
            <img src={img} alt="" className="h-[96px] w-[96px] shrink-0 rounded-[14px] border object-cover" style={{ borderColor: MC.panelBorder }} />
          ) : (
            <div
              className="grid h-[96px] w-[96px] shrink-0 place-items-center rounded-[14px] border text-[14px] font-extrabold"
              style={{ borderColor: MC.panelBorder, background: `${MC.purple}22`, color: MC.white }}
            >
              {getSubmitterInitials(getSubmitterName(item))}
            </div>
          )}
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-bold" style={{ color: MC.purple }}>
              {APPROVAL_KIND_LABELS[item.kind]}
            </p>
            <p className="text-[15px] font-extrabold" style={{ color: MC.white }}>
              {getSubmitterName(item)}
            </p>
            <p className="text-[10px]" style={{ color: MC.muted }}>
              {getChurchLabel(item)}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: MC.gold }}>
              {formatListDate(item.submittedAt)}
            </p>
            <p className="text-[10px] font-bold" style={{ color: MC.muted }}>
              #{item.requestNo}
            </p>
          </div>
        </div>

        {enriched.applicantNotes ? (
          <div className="mt-3 rounded-[12px] border p-2.5 text-right" style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}>
            <p className="text-[9px] font-extrabold" style={{ color: MC.muted }}>
              ملاحظات مقدم الطلب
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-relaxed" style={{ color: MC.white }}>
              {enriched.applicantNotes}
            </p>
          </div>
        ) : null}

        <div className="mt-3 border-t pt-3" style={{ borderColor: MC.panelBorder }}>
          <p className="mb-2 text-[10px] font-extrabold" style={{ color: MC.white }}>
            بيانات الطلب
          </p>
          <div className="space-y-1.5">
            {detailRows.map((r) => (
              <div key={r.label} className="flex justify-between gap-2 text-[10px]">
                <span className="font-bold" style={{ color: MC.white }}>
                  {r.value ?? "—"}
                </span>
                <span style={{ color: MC.muted }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RefDocumentsSection({
  documents,
  onOpen,
}: {
  documents: ApprovalDocument[];
  onOpen: (doc: ApprovalDocument) => void;
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.blue)}>
      <div className="p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-extrabold" style={{ color: MC.white }}>
            Uploaded Documents ({documents.length})
          </p>
          <span className="text-[9px] font-bold" style={{ color: MC.purple }}>
            View All
          </span>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onOpen(doc)}
              className="relative w-[92px] shrink-0 overflow-hidden rounded-[12px] border text-right"
              style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)" }}
            >
              <img src={doc.url} alt="" className="h-[70px] w-full object-cover" />
              <p className="truncate p-1.5 text-[8px] font-bold" style={{ color: MC.white }}>
                {doc.label}
              </p>
              {doc.verified && (
                <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full" style={{ background: MC.green }}>
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RefVerificationPanel({ checks }: { checks: { label: string; passed: boolean }[] }) {
  return (
    <div className="rounded-[14px] border p-3 h-full" style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}>
      <p className="mb-2 text-[10px] font-extrabold" style={{ color: MC.white }}>
        Verification Results
      </p>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-semibold leading-tight" style={{ color: MC.muted }}>
              {c.label}
            </span>
            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: c.passed ? MC.green : MC.red }} strokeWidth={2} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RefAiPanel({ ai }: { ai: { confidence: number; matchScore: number; riskScore: number; notes: string } }) {
  return (
    <div className="rounded-[14px] border p-3 h-full" style={{ borderColor: `${MC.green}33`, background: `${MC.green}08` }}>
      <p className="mb-2 text-[10px] font-extrabold" style={{ color: MC.white }}>
        AI Review Result
      </p>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-[28px] font-extrabold leading-none" style={{ color: MC.green }}>
          {ai.confidence}%
        </span>
        <span className="text-[8px] font-bold" style={{ color: MC.green }}>
          Trust Score
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,0.35)" }}>
        <div className="h-full rounded-full" style={{ width: `${ai.confidence}%`, background: MC.green }} />
      </div>
      <p className="text-[9px] font-bold" style={{ color: MC.green }}>
        {ai.notes}
      </p>
      <p className="mt-1 text-[9px]" style={{ color: MC.muted }}>
        Risk: {ai.riskScore} · Match: {ai.matchScore}%
      </p>
    </div>
  );
}

export function RefProposedServantsSection({ item }: { item: ApprovalItem }) {
  const servants = getApprovalPayloadServants(item);
  const statusLabel = APPROVAL_STATUS_LABELS_AR[normalizeApprovalStatus(item.status)];

  return (
    <div className="mb-3 overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.purple)}>
      <div className="p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tabular-nums" style={{ color: MC.gold }}>
            عدد الخدام: {servants.length}
          </span>
          <p className="text-[11px] font-extrabold" style={{ color: MC.white }}>
            الخدام المقترحون
          </p>
        </div>

        {servants.length === 0 ? (
          <p className="rounded-[12px] border px-3 py-4 text-center text-[11px] font-semibold" style={{ borderColor: MC.panelBorder, color: MC.muted }}>
            لا يوجد خدام مضافون.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {servants.map((s) => (
              <div
                key={s.id ?? s.name}
                className="rounded-[14px] border p-2.5 text-right"
                style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.22)" }}
              >
                <p className="text-[12px] font-extrabold leading-snug" style={{ color: MC.white }}>
                  {s.name}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between gap-2 text-[9px]">
                    <span className="font-bold" style={{ color: MC.white }}>
                      {s.phone ?? "—"}
                    </span>
                    <span style={{ color: MC.muted }}>الهاتف</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[9px]">
                    <span className="font-bold" style={{ color: MC.white }}>
                      {s.role ?? "—"}
                    </span>
                    <span style={{ color: MC.muted }}>نوع الخدمة</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[9px]">
                    <span className="font-bold" style={{ color: MC.purple }}>
                      {statusLabel}
                    </span>
                    <span style={{ color: MC.muted }}>الحالة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RefSystemNotes({ notes }: { notes: string }) {
  return (
    <div className="mb-28 overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.steel)}>
      <div className="p-3.5">
        <p className="mb-2 text-[11px] font-extrabold" style={{ color: MC.white }}>
          System Notes
        </p>
        <p className="rounded-[12px] border px-3 py-2.5 text-[10px] leading-relaxed" style={{ borderColor: MC.panelBorder, color: MC.white, background: "rgba(0,0,0,0.22)" }}>
          {notes}
        </p>
      </div>
    </div>
  );
}

export function RefReviewerNotes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3 overflow-hidden rounded-[16px] border backdrop-blur-md" style={panelStyle(MC.gold)}>
      <div className="p-3.5">
        <p className="mb-2 text-[11px] font-extrabold" style={{ color: MC.white }}>
          Reviewer Notes (Optional)
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Internal review notes…"
          className="w-full resize-none rounded-[12px] border bg-black/30 px-3 py-2 text-[11px] outline-none"
          style={{ borderColor: MC.panelBorder, color: MC.white }}
        />
      </div>
    </div>
  );
}

function RefActionBtn({
  label,
  sub,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  sub?: string;
  variant: "approve" | "changes" | "reject";
  onClick: () => void;
  disabled?: boolean;
}) {
  const styles = {
    approve: { bg: "linear-gradient(155deg, rgba(74,143,110,0.35), rgba(20,32,28,0.95))", border: `${MC.green}55`, color: MC.green },
    changes: { bg: "linear-gradient(155deg, rgba(196,165,116,0.32), rgba(48,38,22,0.95))", border: `${MC.gold}55`, color: MC.gold },
    reject: { bg: "linear-gradient(155deg, rgba(184,92,88,0.32), rgba(40,18,18,0.95))", border: `${MC.red}55`, color: MC.red },
  };
  const s = styles[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[52px] w-full flex-col items-center justify-center rounded-[14px] border px-2 py-2 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      style={{ background: s.bg, borderColor: s.border, color: s.color, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
    >
      <span className="text-[11px] font-extrabold">{label}</span>
      {sub && <span className="text-[8px] font-semibold opacity-80">{sub}</span>}
    </button>
  );
}

export function RefDetailsFooter({
  onApprove,
  onChanges,
  onReject,
  disabled,
}: {
  onApprove: () => void;
  onChanges: () => void;
  onReject: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t px-2.5 pb-[max(env(safe-area-inset-bottom),72px)] pt-2.5 backdrop-blur-xl"
      style={{ borderColor: MC.panelBorder, background: "rgba(8,12,24,0.97)" }}
    >
      <div className="mx-auto max-w-lg space-y-2">
        <RefActionBtn label="قبول الطلب" sub="اعتماد نهائي" variant="approve" onClick={onApprove} disabled={disabled} />
        <div className="grid grid-cols-2 gap-2">
          <RefActionBtn label="طلب معلومات" sub="بيانات مطلوبة" variant="changes" onClick={onChanges} disabled={disabled} />
          <RefActionBtn label="رفض الطلب" sub="سبب إجباري" variant="reject" onClick={onReject} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}

export function RefDocumentLightbox({ doc, onClose }: { doc: ApprovalDocument | null; onClose: () => void }) {
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);
  if (!doc) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute -top-10 left-0 text-white">
          <X className="h-6 w-6" />
        </button>
        <img src={doc.url} alt={doc.label} className="max-h-[80vh] w-full rounded-[16px] border object-contain" style={{ borderColor: MC.panelBorder }} />
        <p className="mt-2 text-center text-[12px] font-bold text-white">{doc.label}</p>
      </div>
    </div>
  );
}

export function RefReasonModal({
  open,
  title,
  placeholder,
  confirmLabel,
  variant,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  variant: "reject" | "changes";
  onClose: () => void;
  onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) {
      setText("");
      setError("");
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[16px] border p-4" style={{ background: MC.midnight, borderColor: MC.panelBorder }}>
        <h3 className="mb-3 text-[14px] font-extrabold text-white">{title}</h3>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          rows={4}
          placeholder={placeholder}
          className="mb-2 w-full resize-none rounded-[12px] border bg-black/30 px-3 py-2.5 text-[12px] text-white outline-none"
          style={{ borderColor: MC.panelBorder }}
        />
        {error && <p className="mb-2 text-[10px] font-bold text-red-400">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <RefActionBtn label="Cancel" variant="changes" onClick={onClose} />
          <RefActionBtn
            label={confirmLabel}
            variant={variant}
            onClick={() => {
              if (!text.trim()) {
                setError("Required");
                return;
              }
              onConfirm(text.trim());
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function RefSuccessModal({ open, requestNo, onClose }: { open: boolean; requestNo: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-[18px] border p-5 text-center" style={{ background: MC.midnight, borderColor: `${MC.green}44` }}>
        <CheckCircle2 className="mx-auto mb-3 h-14 w-14" style={{ color: MC.green }} strokeWidth={1.5} />
        <h3 className="mb-1 text-[16px] font-extrabold text-white">Approved Successfully</h3>
        <p className="mb-4 text-[11px]" style={{ color: MC.muted }}>
          #{requestNo} — Notification sent · Audit log recorded
        </p>
        <RefActionBtn label="Back to Approvals Center" variant="approve" onClick={onClose} />
      </div>
    </div>
  );
}
