import { useEffect } from "react";
import { Check, Loader2, Star, Trash2, X } from "lucide-react";
import { ApprovalReasonSheet } from "./approvals-ui";
import { MC } from "./platform-store";
import {
  formatMediaDate,
  mediaCategoryLabel,
  MEDIA_STATUS_LABELS_AR,
  MEDIA_TYPE_LABELS,
  type MediaLibraryRow,
} from "./media-manager-api";

type Props = {
  row: MediaLibraryRow | null;
  acting?: boolean;
  rejectOpen?: boolean;
  actionError?: string | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRejectConfirm: (reason: string) => void;
  onRejectClose: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
};

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-[10px] border px-2.5 py-2"
      style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.18)" }}
    >
      <span className="shrink-0 text-[9px] font-bold" style={{ color: MC.muted }}>
        {label}
      </span>
      <span className="text-right text-[10px] font-extrabold leading-snug" style={{ color: MC.white }}>
        {value?.trim() || "—"}
      </span>
    </div>
  );
}

export function MediaManagerSidePanel({
  row,
  acting,
  rejectOpen = false,
  actionError,
  onClose,
  onApprove,
  onReject,
  onRejectConfirm,
  onRejectClose,
  onSetPrimary,
  onDelete,
}: Props) {
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, onClose]);

  if (!row) return null;

  const isPending = row.status === "pending";
  const isRejected = row.status === "rejected";
  const isApproved = row.status === "approved";
  const isPrimary = row.isPrimary;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex" dir="ltr">
        <button
          type="button"
          aria-label="إغلاق"
          className="flex-1 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <aside
          className="flex h-full w-full max-w-[min(100vw,420px)] flex-col overflow-hidden border-r shadow-2xl"
          style={{
            background: MC.midnight,
            borderColor: MC.panelBorder,
            boxShadow: `-12px 0 40px rgba(0,0,0,0.55), 0 0 28px -14px ${MC.purple}55`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
            style={{ borderColor: MC.panelBorder }}
          >
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border active:scale-95"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <X className="h-4 w-4" style={{ color: MC.muted }} />
            </button>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[13px] font-extrabold" style={{ color: MC.white }}>
                {row.title ?? "وسيط بدون عنوان"}
              </p>
              <p className="text-[10px] font-bold" style={{ color: MC.muted }}>
                {mediaCategoryLabel(row.category)} · {MEDIA_TYPE_LABELS[row.mediaType] ?? row.mediaType}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div
              className="overflow-hidden rounded-[14px] border"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              {row.mediaType === "video" ? (
                <video src={row.previewUrl} controls className="max-h-56 w-full object-cover" />
              ) : row.mediaType === "pdf" ? (
                <iframe title={row.title ?? "PDF"} src={row.previewUrl} className="h-56 w-full" />
              ) : (
                <img src={row.previewUrl} alt="" className="max-h-56 w-full object-cover" loading="lazy" />
              )}
            </div>

            <div className="space-y-1.5">
              <MetaRow label="الحالة" value={MEDIA_STATUS_LABELS_AR[row.status]} />
              <MetaRow label="الفئة" value={mediaCategoryLabel(row.category)} />
              <MetaRow label="نوع الوسيط" value={MEDIA_TYPE_LABELS[row.mediaType] ?? row.mediaType} />
              <MetaRow label="القديس / العنصر" value={row.saintName ?? row.entityType} />
              <MetaRow label="اسم المستخدم" value={row.uploaderName} />
              <MetaRow label="تاريخ الرفع" value={formatMediaDate(row.createdAt)} />
              <MetaRow label="Primary" value={row.isPrimary ? "نعم" : "لا"} />
              <MetaRow label="Display Order" value={String(row.displayOrder)} />
              <MetaRow label="Entity ID" value={row.entityId} />
              <MetaRow label="Storage Path" value={row.storagePath} />
              <MetaRow label="Media ID" value={row.id} />
            </div>
          </div>

          <div
            className="shrink-0 space-y-2 border-t px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]"
            style={{ borderColor: MC.panelBorder, background: "rgba(8,12,24,0.96)" }}
          >
            {actionError ? (
              <div
                className="rounded-[10px] border px-2.5 py-2 text-[10px] font-bold leading-relaxed"
                style={{ borderColor: `${MC.red}55`, background: `${MC.red}12`, color: MC.red }}
              >
                {actionError}
              </div>
            ) : null}

            {acting ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: MC.purple }} />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={isApproved}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-emerald-300 active:scale-[0.98] disabled:opacity-40"
                  style={{ background: "rgba(74,143,110,0.22)", border: `1px solid ${MC.green}55` }}
                >
                  <Check className="h-4 w-4" />
                  {isPending ? "قبول الصورة" : isRejected ? "إعادة القبول" : "معتمدة"}
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={isRejected}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-red-300 active:scale-[0.98] disabled:opacity-40"
                  style={{ background: "rgba(184,92,88,0.18)", border: `1px solid ${MC.red}55` }}
                >
                  <X className="h-4 w-4" />
                  رفض الصورة
                </button>
                <button
                  type="button"
                  onClick={onSetPrimary}
                  disabled={isPrimary}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold disabled:opacity-40 active:scale-[0.98]"
                  style={{
                    color: MC.gold,
                    background: "rgba(196,165,116,0.15)",
                    border: `1px solid ${MC.gold}55`,
                  }}
                >
                  <Star className="h-4 w-4" />
                  {isPrimary ? "صورة رئيسية حالياً" : "تعيين صورة رئيسية"}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-slate-300 active:scale-[0.98]"
                  style={{ background: "rgba(100,116,139,0.18)", border: `1px solid ${MC.panelBorder}` }}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الوسيط
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      <ApprovalReasonSheet
        open={rejectOpen}
        title="سبب الرفض"
        placeholder="اكتب سبب رفض الوسيط…"
        confirmLabel="تأكيد الرفض"
        confirmVariant="reject"
        onClose={onRejectClose}
        onConfirm={onRejectConfirm}
      />
    </>
  );
}
