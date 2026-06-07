import { type ReactNode, useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, Copy, FileText, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MC } from "./platform-store";
import type { ApprovalDocument, ApprovalItem, ApprovalStatus } from "./types";
import {
  APPROVAL_KIND_LABELS,
  APPROVAL_STATUS_LABELS_AR,
  getSubmitterInitials,
  getSubmitterName,
  normalizeApprovalStatus,
  statusBadgeStyle,
} from "./types";

export function ApprovalStatusBadge({ status, className }: { status: ApprovalStatus; className?: string }) {
  const s = normalizeApprovalStatus(status);
  const style = statusBadgeStyle(status);
  return (
    <span
      className={cn("rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide", className)}
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {APPROVAL_STATUS_LABELS_AR[s]}
    </span>
  );
}

export function ApprovalPriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: MC.red,
    high: MC.gold,
    normal: MC.blue,
    low: MC.muted,
  };
  const color = colors[priority] ?? MC.muted;
  return (
    <span className="rounded-full border px-2 py-0.5 text-[8px] font-bold" style={{ borderColor: `${color}44`, color }}>
      {priority === "critical" ? "حرج" : priority === "high" ? "عالي" : priority === "normal" ? "عادي" : "منخفض"}
    </span>
  );
}

export function SubmitterAvatar({ item, size = "md" }: { item: ApprovalItem; size?: "md" | "lg" }) {
  const name = getSubmitterName(item);
  const dims = size === "lg" ? "h-14 w-14 text-[13px]" : "h-11 w-11 text-[11px]";
  if (item.submitterAvatarUrl || item.idImageUrl || item.thumbnailUrl) {
    const src = item.submitterAvatarUrl ?? item.idImageUrl ?? item.thumbnailUrl;
    return (
      <img
        src={src}
        alt=""
        className={cn(dims, "shrink-0 rounded-[14px] border object-cover")}
        style={{ borderColor: MC.panelBorder, boxShadow: `0 0 16px -6px ${MC.purple}66` }}
      />
    );
  }
  return (
    <div
      className={cn(dims, "grid shrink-0 place-items-center rounded-[14px] border font-extrabold")}
      style={{
        borderColor: `${MC.purple}44`,
        background: `linear-gradient(155deg, rgba(139,122,184,0.35), rgba(15,22,40,0.95))`,
        color: MC.white,
        boxShadow: `0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      {getSubmitterInitials(name)}
    </div>
  );
}

type ActionVariant = "review" | "approve" | "reject" | "changes";

const PREMIUM_STYLES: Record<
  ActionVariant,
  { gradient: string; border: string; color: string; glow: string; icon?: ReactNode }
> = {
  review: {
    gradient: "linear-gradient(155deg, rgba(139,122,184,0.42) 0%, rgba(45,38,72,0.95) 100%)",
    border: "rgba(139,122,184,0.55)",
    color: MC.white,
    glow: MC.purple,
    icon: <Search className="h-4 w-4" strokeWidth={2.4} />,
  },
  approve: {
    gradient: "linear-gradient(155deg, rgba(196,165,116,0.35) 0%, rgba(74,143,110,0.28) 55%, rgba(20,32,28,0.95) 100%)",
    border: "rgba(74,143,110,0.5)",
    color: MC.green,
    glow: MC.green,
  },
  reject: {
    gradient: "linear-gradient(155deg, rgba(184,92,88,0.32) 0%, rgba(40,18,18,0.95) 100%)",
    border: "rgba(184,92,88,0.5)",
    color: MC.red,
    glow: MC.red,
  },
  changes: {
    gradient: "linear-gradient(155deg, rgba(196,165,116,0.32) 0%, rgba(48,38,22,0.95) 100%)",
    border: "rgba(196,165,116,0.48)",
    color: MC.gold,
    glow: MC.gold,
  },
};

export function ApprovalActionButton({
  variant,
  label,
  onClick,
  className,
  disabled,
  fullWidth = true,
}: {
  variant: ActionVariant;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const s = PREMIUM_STYLES[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-[14px] border px-4 text-[11px] font-extrabold",
        "transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
        fullWidth ? "w-full" : "",
        className,
      )}
      style={{
        background: s.gradient,
        borderColor: s.border,
        color: s.color,
        boxShadow: `0 6px 20px rgba(0,0,0,0.45), 0 0 24px -8px ${s.glow}88, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)" }} />
      {s.icon}
      <span className="relative">{label}</span>
    </button>
  );
}

export function ApprovalDetailRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: MC.panelBorder }}>
      <span className="shrink-0 text-[10px] font-semibold" style={{ color: MC.muted }}>
        {label}
      </span>
      {children ?? (
        <span className="max-w-[62%] text-left text-[11px] font-bold leading-snug" style={{ color: MC.white }}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

export function RiskScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? MC.red : score >= 40 ? MC.gold : MC.green;
  const label = score >= 70 ? "مرتفع" : score >= 40 ? "متوسط" : "منخفض";
  return (
    <div
      className="flex items-center gap-2 rounded-[12px] border px-3 py-2"
      style={{ borderColor: `${color}44`, background: `${color}14` }}
    >
      <span className="text-[22px] font-extrabold tabular-nums" style={{ color }}>
        {score}
      </span>
      <div>
        <p className="text-[9px] font-bold" style={{ color: MC.muted }}>
          Risk Score
        </p>
        <p className="text-[10px] font-extrabold" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function WorkflowStepBar({ status }: { status: ApprovalStatus }) {
  const s = normalizeApprovalStatus(status);
  const steps = [
    { key: "pending", label: "Pending" },
    { key: "under_review", label: "Review" },
    { key: "decision", label: "Decision" },
  ];
  const activeIdx = s === "pending" || s === "needs_changes" ? 0 : s === "under_review" ? 1 : 2;
  return (
    <div className="mb-3 flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="h-1.5 w-full rounded-full"
            style={{
              background: i <= activeIdx ? MC.purple : "rgba(138,148,168,0.2)",
              boxShadow: i === activeIdx ? `0 0 8px ${MC.purple}` : undefined,
            }}
          />
          <span className="text-[7px] font-bold" style={{ color: i <= activeIdx ? MC.white : MC.muted }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ApprovalReasonSheet({
  open,
  title,
  placeholder,
  confirmLabel,
  confirmVariant = "reject",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  confirmVariant?: ActionVariant;
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    if (!text.trim()) {
      setError("هذا الحقل إجباري");
      return;
    }
    onConfirm(text.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-[16px] border p-4"
        style={{ background: MC.midnight, borderColor: MC.panelBorder, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <h3 className="mb-3 text-[14px] font-extrabold" style={{ color: MC.white }}>
          {title}
        </h3>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          rows={4}
          placeholder={placeholder}
          className="mb-2 w-full resize-none rounded-[12px] border bg-black/30 px-3 py-2.5 text-[12px] font-semibold outline-none focus:ring-1"
          style={{ borderColor: MC.panelBorder, color: MC.white }}
        />
        {error && (
          <p className="mb-2 text-[10px] font-bold" style={{ color: MC.red }}>
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <ApprovalActionButton variant="review" label="إلغاء" onClick={onClose} />
          <ApprovalActionButton variant={confirmVariant} label={confirmLabel} onClick={submit} />
        </div>
      </div>
    </div>
  );
}

export function ApprovalKindChip({ kind }: { kind: ApprovalItem["kind"] }) {
  return (
    <span className="rounded-[8px] border px-2 py-0.5 text-[8px] font-bold" style={{ borderColor: `${MC.purple}44`, color: MC.purple }}>
      {APPROVAL_KIND_LABELS[kind]}
    </span>
  );
}

export function DocumentCountChip({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[9px] font-bold"
      style={{ borderColor: MC.panelBorder, color: MC.muted, background: "rgba(0,0,0,0.2)" }}
    >
      <FileText className="h-3 w-3" strokeWidth={2} />
      {count} مستند
    </span>
  );
}

/** Compact purple review button for list rows — reference layout */
export function ReviewListButton({ label = "مراجعة الطلب" }: { label?: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border px-3 py-2 text-[10px] font-extrabold transition hover:brightness-110 active:scale-[0.97]"
      style={{
        background: "linear-gradient(155deg, rgba(139,122,184,0.45), rgba(45,38,72,0.95))",
        borderColor: "rgba(139,122,184,0.55)",
        color: MC.white,
        boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 20px -8px ${MC.purple}88, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      <Search className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
      <ChevronLeft className="h-3.5 w-3.5 rotate-180" strokeWidth={2.4} />
    </span>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div>
        <p className="text-[12px] font-extrabold" style={{ color: MC.white }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[9px] font-semibold" style={{ color: MC.muted }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function DocumentLightbox({ doc, onClose }: { doc: ApprovalDocument | null; onClose: () => void }) {
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-h-[85vh] max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 left-0 grid h-8 w-8 place-items-center rounded-full border"
          style={{ borderColor: MC.panelBorder, color: MC.white }}
        >
          <X className="h-4 w-4" />
        </button>
        <img src={doc.url} alt={doc.label} className="max-h-[75vh] w-full rounded-[16px] border object-contain" style={{ borderColor: MC.panelBorder }} />
        <p className="mt-2 text-center text-[12px] font-bold" style={{ color: MC.white }}>
          {doc.label}
        </p>
      </div>
    </div>
  );
}

export function DocumentsGrid({ documents, onOpen }: { documents: ApprovalDocument[]; onOpen: (doc: ApprovalDocument) => void }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
      {documents.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => onOpen(doc)}
          className="relative w-[100px] shrink-0 overflow-hidden rounded-[14px] border text-right transition active:scale-[0.98]"
          style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
        >
          <img src={doc.url} alt="" className="h-[72px] w-full object-cover" />
          <div className="p-1.5">
            <p className="truncate text-[8px] font-bold" style={{ color: MC.white }}>
              {doc.label}
            </p>
          </div>
          {doc.verified && (
            <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full" style={{ background: MC.green }}>
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function VerificationResultsList({ checks }: { checks: { label: string; passed: boolean }[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c) => (
        <li key={c.label} className="flex items-center justify-between gap-2 rounded-[10px] border px-2.5 py-2" style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.18)" }}>
          <span className="text-[10px] font-bold" style={{ color: MC.white }}>
            {c.label}
          </span>
          <span
            className="grid h-5 w-5 place-items-center rounded-full"
            style={{ background: c.passed ? `${MC.green}33` : `${MC.red}33`, color: c.passed ? MC.green : MC.red }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AiReviewPanel({ ai }: { ai: { confidence: number; matchScore: number; riskScore: number; riskLevel: string; notes: string } }) {
  const riskColor = ai.riskLevel === "high" ? MC.red : ai.riskLevel === "medium" ? MC.gold : MC.green;
  const riskLabel = ai.riskLevel === "high" ? "High Risk" : ai.riskLevel === "medium" ? "Medium Risk" : "Low Risk";
  return (
    <div className="rounded-[14px] border p-3" style={{ borderColor: `${MC.purple}44`, background: "rgba(139,122,184,0.08)" }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-extrabold" style={{ color: MC.white }}>
          AI Review
        </p>
        <span className="rounded-full border px-2 py-0.5 text-[8px] font-bold" style={{ borderColor: `${riskColor}55`, color: riskColor }}>
          {riskLabel}
        </span>
      </div>
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-[9px] font-bold" style={{ color: MC.muted }}>
          <span>Confidence</span>
          <span style={{ color: MC.green }}>{ai.confidence}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${ai.confidence}%`, background: `linear-gradient(90deg, ${MC.green}, ${MC.gold})` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[9px]">
        <div className="rounded-[10px] border px-2 py-1.5" style={{ borderColor: MC.panelBorder }}>
          <p style={{ color: MC.muted }}>Match Score</p>
          <p className="font-extrabold" style={{ color: MC.white }}>
            {ai.matchScore}%
          </p>
        </div>
        <div className="rounded-[10px] border px-2 py-1.5" style={{ borderColor: MC.panelBorder }}>
          <p style={{ color: MC.muted }}>Risk Score</p>
          <p className="font-extrabold" style={{ color: riskColor }}>
            {ai.riskScore}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold leading-snug" style={{ color: MC.muted }}>
        {ai.notes}
      </p>
    </div>
  );
}

export function FixedDecisionFooter({
  onApprove,
  onReject,
  onChanges,
  disabled,
}: {
  onApprove: () => void;
  onReject: () => void;
  onChanges: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t px-2.5 pb-[max(env(safe-area-inset-bottom),72px)] pt-2.5 backdrop-blur-xl"
      style={{ borderColor: MC.panelBorder, background: "rgba(8,12,24,0.96)" }}
    >
      <div className="mx-auto max-w-lg space-y-2">
        <ApprovalActionButton variant="approve" label="اعتماد الطلب" onClick={onApprove} disabled={disabled} />
        <div className="grid grid-cols-2 gap-2">
          <ApprovalActionButton variant="changes" label="طلب تعديل" onClick={onChanges} disabled={disabled} fullWidth />
          <ApprovalActionButton variant="reject" label="رفض الطلب" onClick={onReject} disabled={disabled} fullWidth />
        </div>
      </div>
    </div>
  );
}

export function ApproveSuccessModal({ open, requestNo, onClose }: { open: boolean; requestNo: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[18px] border p-5 text-center" style={{ background: MC.midnight, borderColor: `${MC.green}44`, boxShadow: `0 0 40px -10px ${MC.green}88` }}>
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full" style={{ background: `${MC.green}22`, color: MC.green }}>
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h3 className="mb-1 text-[15px] font-extrabold" style={{ color: MC.white }}>
          تم اعتماد الطلب
        </h3>
        <p className="mb-4 text-[11px]" style={{ color: MC.muted }}>
          #{requestNo} — تم إرسال إشعار لصاحب الطلب وتسجيل العملية في Audit Logs
        </p>
        <ApprovalActionButton variant="approve" label="العودة لمركز الموافقات" onClick={onClose} />
      </div>
    </div>
  );
}

export function DetailsHeader({
  title,
  requestNo,
  status,
  onBack,
  onCopy,
}: {
  title: string;
  requestNo: string;
  status: ApprovalStatus;
  onBack: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="mb-3 flex items-start gap-2 pt-[max(env(safe-area-inset-top),8px)]">
      <button
        type="button"
        onClick={onBack}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border transition active:scale-95"
        style={{ borderColor: MC.panelBorder, background: MC.panel }}
      >
        <ArrowLeft className="h-5 w-5 rotate-180" style={{ color: MC.muted }} strokeWidth={2} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: MC.purple }}>
          Review Request
        </p>
        <h1 className="truncate text-[14px] font-extrabold" style={{ color: MC.white }}>
          {title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <ApprovalStatusBadge status={status} />
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[9px] font-bold"
            style={{ borderColor: MC.panelBorder, color: MC.muted }}
          >
            #{requestNo}
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BasicInfoGrid({ rows }: { rows: { label: string; value?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-[12px] border px-2.5 py-2" style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}>
          <p className="text-[8px] font-semibold" style={{ color: MC.muted }}>
            {r.label}
          </p>
          <p className="text-[10px] font-bold" style={{ color: MC.white }}>
            {r.value ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
