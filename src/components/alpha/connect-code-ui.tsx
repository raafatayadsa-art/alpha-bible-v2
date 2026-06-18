import type { ComponentType, ReactNode } from "react";
import { Trash2, X } from "lucide-react";
import { SECURITY_PIN_LENGTH } from "./alpha-connect-security";

export type ConnectPopupTone = "danger" | "hide" | "green";

export function ConnectPinBoxes({ value, len = SECURITY_PIN_LENGTH, error = false }: { value: string; len?: number; error?: boolean }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: len }).map((_, i) => (
        <div
          key={i}
          className={`flex h-11 w-9 items-center justify-center rounded-xl border-2 text-[15px] font-bold transition-all duration-150 ${
            error
              ? "border-destructive/70 bg-destructive/15 text-destructive"
              : i < value.length
                ? "border-[oklch(0.82_0.22_145/0.65)] bg-[oklch(0.82_0.22_145/0.15)] text-neon-green shadow-[inset_0_1px_4px_oklch(0.82_0.22_145/0.2)]"
                : i === value.length
                  ? "border-[oklch(0.82_0.22_145/0.45)] bg-[oklch(0.82_0.22_145/0.08)] shadow-[0_0_0_3px_oklch(0.82_0.22_145/0.12)]"
                  : "border-white/15 bg-white/[0.04]"
          }`}
        >
          {i < value.length ? "●" : ""}
        </div>
      ))}
    </div>
  );
}

export function ConnectPinInput({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  return (
    <div onClick={() => (document.getElementById(id) as HTMLInputElement | null)?.focus()}>
      <ConnectPinBoxes value={value} error={error} />
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={SECURITY_PIN_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, SECURITY_PIN_LENGTH))}
        autoFocus
        className="sr-only"
      />
    </div>
  );
}

export function ConnectCenterPopup({
  onClose,
  scoped = false,
  zIndex = 160,
  children,
}: {
  onClose?: () => void;
  scoped?: boolean;
  zIndex?: number;
  children: ReactNode;
}) {
  const positionCls = scoped ? "absolute inset-0 rounded-3xl" : "fixed inset-0";

  return (
    <div
      className={`connect-popup-overlay ${positionCls} flex items-center justify-center px-4`}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="connect-popup-panel relative w-[88%] max-w-[300px] overflow-hidden rounded-[22px] px-5 py-5"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-3 top-3 grid size-7 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground active:scale-95"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function ConnectPopupActions({
  onCancel,
  onConfirm,
  cancelLabel = "إلغاء",
  confirmLabel = "تأكيد",
  tone = "green",
  danger,
  confirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  tone?: ConnectPopupTone;
  /** @deprecated use tone="danger" */
  danger?: boolean;
  confirmDisabled?: boolean;
}) {
  const resolvedTone: ConnectPopupTone = danger ? "danger" : tone;
  const confirmCls =
    resolvedTone === "danger"
      ? "connect-popup-btn-danger"
      : resolvedTone === "hide"
        ? "connect-popup-btn-hide"
        : "connect-popup-btn-green";

  return (
    <div className="mt-4 flex gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="connect-popup-btn-cancel h-10 flex-1 rounded-2xl text-[12px] font-semibold active:scale-[0.98]"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`${confirmCls} h-10 flex-1 rounded-2xl text-[12px] font-bold disabled:opacity-35 active:scale-[0.98]`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export function ConnectTopToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),10px)] z-[280] flex justify-center px-4">
      <div className="connect-popup-panel rounded-2xl border border-neon-green/35 px-4 py-2.5 text-center text-[12px] font-semibold text-neon-green shadow-[0_0_22px_oklch(0.82_0.22_145/0.22)]">
        {message}
      </div>
    </div>
  );
}

export function ConnectConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  tone = "danger",
  icon: Icon = Trash2,
  scoped = false,
  zIndex = 160,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConnectPopupTone;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  scoped?: boolean;
  zIndex?: number;
  children?: ReactNode;
}) {
  if (!open) return null;

  const iconRingCls =
    tone === "danger"
      ? "connect-popup-icon-ring--danger"
      : tone === "hide"
        ? "connect-popup-icon-ring--hide"
        : "connect-popup-icon-ring--green";

  return (
    <ConnectCenterPopup onClose={onClose} scoped={scoped} zIndex={zIndex}>
      <div className="pt-1 text-center">
        <div className="mb-2.5 flex justify-center">
          <div className={`connect-popup-icon-ring ${iconRingCls}`}>
            <Icon className="size-[18px]" strokeWidth={2.2} />
          </div>
        </div>
        <p className="mb-1 text-[13px] font-bold text-foreground">{title}</p>
        {description ? (
          <p className="mb-1 text-[10px] leading-relaxed text-muted-foreground/85">{description}</p>
        ) : null}
        {children}
        <ConnectPopupActions
          onCancel={onClose}
          onConfirm={onConfirm}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          tone={tone}
        />
      </div>
    </ConnectCenterPopup>
  );
}

export function ConnectConversationDeleteDialog({
  open,
  onClose,
  onDeleteLocal,
  onDeleteBoth,
  title = "مسح هذه المحادثة؟",
  description = "اختر طريقة المسح.",
  localLabel = "من قائمتي فقط",
  bothLabel = "مسح للطرفين",
  cancelLabel = "إلغاء",
  busy = false,
  scoped = false,
  zIndex = 160,
}: {
  open: boolean;
  onClose: () => void;
  onDeleteLocal: () => void;
  onDeleteBoth: () => void;
  title?: string;
  description?: string;
  localLabel?: string;
  bothLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  scoped?: boolean;
  zIndex?: number;
}) {
  if (!open) return null;

  return (
    <ConnectCenterPopup onClose={busy ? undefined : onClose} scoped={scoped} zIndex={zIndex}>
      <div className="pt-1 text-center">
        <div className="mb-2.5 flex justify-center">
          <div className="connect-popup-icon-ring connect-popup-icon-ring--danger">
            <Trash2 className="size-[18px]" strokeWidth={2.2} />
          </div>
        </div>
        <p className="mb-1 text-[13px] font-bold text-foreground">{title}</p>
        <p className="mb-3 text-[10px] leading-relaxed text-muted-foreground/85">{description}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onDeleteBoth}
            className="connect-popup-btn-danger h-10 w-full rounded-2xl text-[12px] font-bold disabled:opacity-35 active:scale-[0.98]"
          >
            {bothLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDeleteLocal}
            className="connect-popup-btn-hide h-10 w-full rounded-2xl text-[12px] font-semibold disabled:opacity-35 active:scale-[0.98]"
          >
            {localLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="connect-popup-btn-cancel h-10 w-full rounded-2xl text-[12px] font-semibold disabled:opacity-35 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </ConnectCenterPopup>
  );
}
