import { useState } from "react";
import { X, Check, UserX, Download, QrCode, Users } from "lucide-react";
import {
  type PostRegistration,
  type RegistrationKind,
  confirmRegistration,
  cancelRegistration,
  exportRegistrationsCsv,
  usePostRegistrations,
} from "./post-registrations";
import { useCanManagePosts } from "./post-store";

function statusLabel(s: PostRegistration["status"]) {
  if (s === "confirmed") return "حضور مؤكد";
  if (s === "cancelled") return "ملغي";
  return "مسجّل";
}

function statusTone(s: PostRegistration["status"]) {
  if (s === "confirmed") return "#1f8a5a";
  if (s === "cancelled") return "#a85450";
  return "#b8893a";
}

/** Compact live participant counter — tap opens admin list for servants/priests. */
export function ParticipantsCounter({
  postId,
  postTitle,
  kind,
  capacity,
  className = "",
}: {
  postId: string;
  postTitle: string;
  kind: RegistrationKind;
  capacity?: number;
  className?: string;
}) {
  const { count } = usePostRegistrations(postId, kind);
  const canManage = useCanManagePosts();
  const [open, setOpen] = useState(false);

  const label =
    capacity != null
      ? `👥 ${count.toLocaleString("ar-EG")} / ${capacity.toLocaleString("ar-EG")}`
      : `👥 ${count.toLocaleString("ar-EG")} مشارك`;

  if (count === 0 && !canManage) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canManage) setOpen(true);
        }}
        className={
          "inline-flex items-center gap-1 rounded-full bg-white/80 border border-[#efe2c4] px-2 py-0.5 text-[10px] font-extrabold text-[#5a3a18] " +
          (canManage ? "active:scale-95 cursor-pointer" : "cursor-default") +
          " " +
          className
        }
        aria-label="المشاركون"
      >
        {label}
      </button>
      {open && canManage ? (
        <ParticipantsAdminSheet
          postId={postId}
          postTitle={postTitle}
          kind={kind}
          capacity={capacity}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function ParticipantsAdminSheet({
  postId,
  postTitle,
  kind,
  capacity,
  onClose,
}: {
  postId: string;
  postTitle: string;
  kind?: RegistrationKind;
  capacity?: number;
  onClose: () => void;
}) {
  const { rows, count } = usePostRegistrations(postId, kind);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]"
    >
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#1a0f04]/55 backdrop-blur-sm" />
      <div className="relative flex w-full max-w-[var(--alpha-dock-max-width)] max-h-[min(88dvh,640px)] flex-col rounded-[28px] border border-white/75 bg-[#fbf3e1]/95 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] text-right overflow-hidden">
        <div className="shrink-0 flex items-start justify-between gap-2 p-4 pb-2 border-b border-[#efe2c4]/80">
          <div className="min-w-0">
            <h3 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-tight inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#b8893a]" />
              المشاركون
            </h3>
            <p className="mt-0.5 text-[10.5px] text-[#7a5a30] truncate">{postTitle}</p>
            <p className="mt-1 text-[11px] font-bold text-[#3a2a18]">
              {count.toLocaleString("ar-EG")}
              {capacity != null ? ` / ${capacity.toLocaleString("ar-EG")}` : ""} مشارك
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2">
          {rows.length === 0 ? (
            <p className="text-center text-[12px] text-[#6a543a] py-6">لا يوجد مشاركون بعد.</p>
          ) : (
            rows.map((r) => (
              <ParticipantRow key={r.id} row={r} />
            ))
          )}
        </div>

        <div className="shrink-0 flex gap-2 p-4 pt-2 border-t border-[#efe2c4]/80">
          <button
            type="button"
            onClick={() => exportRegistrationsCsv(postId, postTitle)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/90 border border-[#efe2c4] py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" />
            تصدير
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] py-2.5 text-[12px] font-extrabold text-white active:scale-[0.98]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantRow({ row }: { row: PostRegistration }) {
  const [busy, setBusy] = useState(false);
  const tone = statusTone(row.status);

  return (
    <div className="rounded-2xl bg-white/85 border border-[#efe2c4] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-arabic-serif text-[13px] font-extrabold text-[#3a2a18] truncate">{row.userName}</p>
          <p className="mt-0.5 text-[10px] text-[#6a543a] truncate">{row.churchName}</p>
          <p className="mt-1 text-[10px] text-[#8a6a3a]">
            {new Date(row.registeredAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          {row.seats > 1 ? (
            <p className="mt-0.5 text-[10px] font-bold text-[#7a5a30]">{row.seats.toLocaleString("ar-EG")} أماكن</p>
          ) : null}
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold border"
          style={{ color: tone, borderColor: `${tone}44`, background: `${tone}12` }}
        >
          {statusLabel(row.status)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 justify-end">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-[#fbf3e1] border border-[#efe2c4] px-2 py-0.5 text-[9px] font-bold text-[#8a6a3a]"
          title="QR — قريباً"
        >
          <QrCode className="h-3 w-3 opacity-50" />
          QR
        </span>
        {row.status !== "confirmed" ? (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await confirmRegistration(row.id);
              setBusy(false);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/12 border border-[#1f8a5a]/30 px-2 py-0.5 text-[10px] font-extrabold text-[#1f8a5a] active:scale-95 disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            تأكيد
          </button>
        ) : null}
        {row.status !== "cancelled" ? (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await cancelRegistration(row.id);
              setBusy(false);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[#a85450]/10 border border-[#a85450]/25 px-2 py-0.5 text-[10px] font-extrabold text-[#a85450] active:scale-95 disabled:opacity-50"
          >
            <UserX className="h-3 w-3" />
            إلغاء
          </button>
        ) : null}
      </div>
    </div>
  );
}
