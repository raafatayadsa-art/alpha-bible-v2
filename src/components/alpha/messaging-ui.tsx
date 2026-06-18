import { type ElementType, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticSelection, hapticWarning } from "./messaging-haptics";

/** Alpha Connect dark glass constants (embedded settings inside alpha-connect) */
export const ALPHA_SETTINGS_CARD =
  "relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5 shadow-[0_2px_18px_rgba(0,0,0,0.35)] backdrop-blur-xl";

export const ALPHA_SETTINGS_INNER =
  "rounded-[14px] border border-white/10 bg-white/5 backdrop-blur-sm";

export const ALPHA_SETTINGS_ROW =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-white/10 bg-white/5 px-3 py-3 text-right backdrop-blur-sm transition-all";

export const ALPHA_SETTINGS_ROW_DANGER =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-destructive/25 bg-destructive/10 px-3 py-3 text-right backdrop-blur-sm transition-all";

export const ALPHA_SETTINGS_ICON_BOX =
  "grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/12 bg-white/8";

/** Shared frosted glass shell — chat settings, message settings, pickers */
export const MESSAGING_GLASS_SHELL =
  "overflow-hidden rounded-[20px] border border-white/28 bg-white/62 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-3xl";

/** Inner glass card row (separated items inside a shell) */
export const MESSAGING_GLASS_INNER =
  "rounded-[14px] border border-white/32 bg-white/42 shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm";

/** Menu-style glass row — matches in-chat conversation settings items */
export const MESSAGING_GLASS_ROW =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-white/32 bg-white/42 px-3 py-3 text-right shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm transition-all";

export const MESSAGING_GLASS_ROW_DANGER =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-[#FECACA]/70 bg-[#FFF5F5]/55 px-3 py-3 text-right shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm transition-all";

export const MESSAGING_GLASS_ICON_BOX =
  "grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/35 bg-white/50";

/** Apple frosted glass — conversation list cards (matches in-chat settings shell) */
export const MESSAGING_CONV_CARD =
  "group relative flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-[20px] border border-white/28 bg-white/62 p-2.5 text-right shadow-[0_16px_40px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-3xl transition-all duration-200 hover:border-white/38 hover:bg-white/70 hover:shadow-[0_16px_40px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.65)] active:scale-[0.985]";

export const MESSAGING_CONV_CARD_RADIUS = "rounded-[20px]";

/** Conversation-list cream card DNA (screenshot style) */
export const MESSAGING_CREAM_CARD =
  "relative overflow-hidden rounded-[18px] border border-gold/12 bg-[rgba(247,240,224,0.62)] shadow-[0_2px_12px_-4px_rgba(200,149,42,0.18),0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl";

export const MESSAGING_CREAM_INNER =
  "rounded-[14px] border border-gold/10 bg-[rgba(255,255,255,0.28)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm";

export const MESSAGING_CREAM_ROW =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-gold/10 bg-[rgba(255,255,255,0.32)] px-3 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm transition-all";

export const MESSAGING_CREAM_ROW_DANGER =
  "flex w-full items-center gap-2.5 rounded-[14px] border border-[#FECACA]/55 bg-[rgba(254,242,242,0.45)] px-3 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm transition-all";

export const MESSAGING_CREAM_ICON_BOX =
  "grid size-8 shrink-0 place-items-center rounded-[10px] border border-gold/15 bg-[rgba(255,255,255,0.42)]";

export function MessagingCreamSettingsCard({
  title,
  desc,
  children,
  className = "",
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${MESSAGING_CREAM_CARD} ${className}`}>
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <img
          src="/shields/official-shield.png?v=14"
          alt=""
          className="size-[118px] object-contain opacity-[0.065]"
        />
      </div>
      <div className="relative z-[1] p-2.5">
        <div className="mb-2 px-1 text-center">
          <p className="text-[13px] font-bold text-[#1F2937]">{title}</p>
          {desc && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground/75">{desc}</p>
          )}
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

function GlassSwitch({
  checked,
  onChange,
  alpha = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  alpha?: boolean;
}) {
  const onColor = alpha ? "bg-[#2d6a4f] border border-[#1b4332]" : "bg-[#166534]";
  const offColor = alpha ? "bg-[#dce9e0] border border-[#a8bdb0]" : "bg-[#D1D5DB]";
  const thumbClass = alpha && checked ? "bg-[#edf3ef]" : "bg-white";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        hapticSelection();
        onChange(!checked);
      }}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? onColor : offColor
      }`}
    >
      <span
        className={`absolute top-[3px] size-5 rounded-full shadow transition-transform duration-200 ${thumbClass} ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export function SettingsGlassToggle({
  icon: Icon,
  iconClass,
  checked,
  onChange,
  label,
  desc,
  tone = "glass",
}: {
  icon: ElementType;
  iconClass?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
  tone?: "glass" | "cream" | "alpha";
}) {
  const row =
    tone === "cream" ? MESSAGING_CREAM_ROW :
    tone === "alpha" ? ALPHA_SETTINGS_ROW :
    MESSAGING_GLASS_ROW;
  const iconBox =
    tone === "cream" ? MESSAGING_CREAM_ICON_BOX :
    tone === "alpha" ? ALPHA_SETTINGS_ICON_BOX :
    MESSAGING_GLASS_ICON_BOX;
  const labelCls = tone === "alpha" ? "text-foreground" : "text-[#1F2937]";
  return (
    <div className={row}>
      <span className={iconBox}>
        <Icon className={`size-4 ${iconClass ?? "text-gold"}`} />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <p className={`text-[12px] font-semibold leading-snug ${labelCls}`}>{label}</p>
        {desc && <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/75">{desc}</p>}
      </div>
      <GlassSwitch checked={checked} onChange={onChange} alpha={tone === "alpha"} />
    </div>
  );
}

export function SettingsGlassActionRow({
  icon: Icon,
  iconClass,
  label,
  desc,
  danger,
  success,
  onClick,
  trailing,
  tone = "glass",
}: {
  icon: ElementType;
  iconClass?: string;
  label: string;
  desc?: string;
  danger?: boolean;
  success?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
  tone?: "glass" | "cream" | "alpha";
}) {
  const isAlpha = tone === "alpha";
  const labelColor = danger
    ? (isAlpha ? "text-destructive" : "text-[#B91C1C]")
    : success
      ? (isAlpha ? "text-neon-green" : "text-[#14532D]")
      : (isAlpha ? "text-foreground" : "text-[#1F2937]");
  const row = danger
    ? (tone === "cream" ? MESSAGING_CREAM_ROW_DANGER : isAlpha ? ALPHA_SETTINGS_ROW_DANGER : MESSAGING_GLASS_ROW_DANGER)
    : (tone === "cream" ? MESSAGING_CREAM_ROW : isAlpha ? ALPHA_SETTINGS_ROW : MESSAGING_GLASS_ROW);
  const iconBox = tone === "cream" ? MESSAGING_CREAM_ICON_BOX : isAlpha ? ALPHA_SETTINGS_ICON_BOX : MESSAGING_GLASS_ICON_BOX;
  const hover = tone === "cream" ? "hover:bg-[rgba(255,255,255,0.48)]" : isAlpha ? "hover:bg-white/8" : "hover:bg-white/58";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${row} ${hover} active:scale-[0.98]`}
    >
      <span className={`${iconBox} ${danger ? (isAlpha ? "border-destructive/30 bg-destructive/10" : "border-[#FECACA]/60 bg-[#FEE2E2]/45") : ""}`}>
        <Icon className={`size-4 ${iconClass ?? (danger ? (isAlpha ? "text-destructive" : "text-[#B91C1C]") : success ? (isAlpha ? "text-neon-green" : "text-[#14532D]") : "text-gold")}`} />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <p className={`text-[12px] font-semibold leading-snug ${labelColor}`}>{label}</p>
        {desc && <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/75">{desc}</p>}
      </div>
      {trailing}
    </button>
  );
}

export function MessagingGlassCard({
  children,
  className = "",
  danger,
}: {
  children: ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] border shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm ${
        danger ? "border-[#FECACA]/70 bg-[#FFF5F5]/55" : "border-white/32 bg-white/42"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Compact glass panel shell — matches in-chat conversation settings */
export function MessagingGlassPanelShell({
  title,
  desc,
  onDone,
  doneLabel = "تم",
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  desc?: string;
  onDone: () => void;
  doneLabel?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div dir="rtl" className={`${MESSAGING_GLASS_SHELL} ${className}`}>
      <div className="relative flex h-11 shrink-0 items-center justify-center px-4 pt-2">
        <p className="text-[13px] font-bold text-[#1F2937]">{title}</p>
        <button
          type="button"
          onClick={onDone}
          className="absolute inset-y-0 right-4 flex items-center pt-0.5 text-[15px] font-bold text-[#166534] transition-colors hover:text-[#14532D] active:text-[#0F3D22]"
        >
          {doneLabel}
        </button>
      </div>
      {desc && (
        <p className="px-4 pb-2 text-center text-[10px] leading-relaxed text-[#6B7280]">{desc}</p>
      )}
      <div className={`px-2.5 pb-3 pt-0.5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

// ─── 6-digit PIN boxes ────────────────────────────────────────
export function PinBoxes({ value, len = 6, error = false }: { value: string; len?: number; error?: boolean }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: len }).map((_, i) => (
        <div
          key={i}
          className={`flex h-11 w-9 items-center justify-center rounded-xl border-2 text-[15px] font-bold transition-all duration-150 ${
            error
              ? "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C]"
              : i < value.length
              ? "border-gold bg-gold/10 text-[#1F2937] shadow-[inset_0_1px_4px_rgba(200,149,42,0.12)]"
              : i === value.length
              ? "border-gold/50 bg-[#FEFCE8] shadow-[0_0_0_3px_rgba(200,149,42,0.08)]"
              : "border-[#D1D5DB] bg-white/60"
          }`}
        >
          {i < value.length ? "●" : ""}
        </div>
      ))}
    </div>
  );
}

// ─── Small center glass popup (iOS-style) ─────────────────────
export function CenterGlassPopup({
  onClose,
  children,
  className = "",
}: {
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/48 backdrop-blur-[5px]"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className={`relative w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-3 top-3 grid size-7 place-items-center rounded-full bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          >
            <X className="size-3.5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Settings glass card row ──────────────────────────────────
export function SettingsRow({
  label,
  desc,
  onClick,
  trailing,
  danger,
  success,
}: {
  label: string;
  desc?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
  success?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  const labelColor = danger ? "text-[#B91C1C]" : success ? "text-[#14532D]" : "text-[#1F2937]";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors ${
        onClick ? "hover:bg-white/30 active:scale-[0.99]" : ""
      } ${danger ? "text-[#B91C1C]" : success ? "text-[#14532D]" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-semibold ${labelColor}`}>{label}</p>
        {desc && <p className="mt-0.5 text-[10px] text-[#6B7280]">{desc}</p>}
      </div>
      {trailing}
    </Tag>
  );
}

export function SettingsToggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <SettingsRow
      label={label}
      desc={desc}
      trailing={
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => {
            hapticSelection();
            onChange(!checked);
          }}
          className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200 ${
            checked ? "bg-[#166534]" : "bg-[#D1D5DB]"
          }`}
        >
          <span
            className={`absolute top-[3px] size-5 rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? "translate-x-[22px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      }
    />
  );
}

export function PinInput({
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
    <div onClick={() => (document.getElementById(id) as HTMLInputElement)?.focus()}>
      <PinBoxes value={value} error={error} />
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        autoFocus
        className="sr-only"
      />
    </div>
  );
}

export function PopupActions({
  onCancel,
  onConfirm,
  cancelLabel = "إلغاء",
  confirmLabel = "تأكيد",
  danger,
  confirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  danger?: boolean;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="mt-4 flex gap-2.5">
      <Button onClick={onCancel} variant="ghost" className="h-10 flex-1 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151]">
        {cancelLabel}
      </Button>
      <Button
        onClick={() => {
          if (danger) hapticWarning();
          onConfirm();
        }}
        disabled={confirmDisabled}
        variant="ghost"
        className={`h-10 flex-1 rounded-2xl text-[12px] font-bold disabled:opacity-35 ${
          danger
            ? "bg-[#FEE2E2] text-[#B91C1C]"
            : "bg-gradient-to-br from-gold to-gold-deep text-navy-deep"
        }`}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
