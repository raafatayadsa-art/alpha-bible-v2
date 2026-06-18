import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  connectAudioDeviceIcon,
  connectAudioSelectionIcon,
  connectAudioSelectionShortLabel,
  type ConnectAudioOutputDevice,
  type ConnectAudioSelection,
} from "./connect-audio-output";

type ConnectAudioOutputPickerProps = {
  open: boolean;
  onClose: () => void;
  devices: ConnectAudioOutputDevice[];
  selection: ConnectAudioSelection;
  onSelect: (deviceId: string) => void;
  className?: string;
  align?: "center" | "start" | "end";
};

export function ConnectAudioOutputPicker({
  open,
  onClose,
  devices,
  selection,
  onSelect,
  className,
  align = "center",
}: ConnectAudioOutputPickerProps) {
  if (!open) return null;

  const alignClass =
    align === "start" ? "right-0" : align === "end" ? "left-0" : "left-1/2 -translate-x-1/2";

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق قائمة إخراج الصوت"
        className="fixed inset-0 z-[60] cursor-default bg-transparent"
        onClick={onClose}
      />
      <div
        role="menu"
        aria-label="اختر جهاز إخراج الصوت"
        dir="rtl"
        className={cn(
          "connect-audio-output-picker absolute bottom-[calc(100%+8px)] z-[61] min-w-[172px] max-w-[min(240px,calc(100vw-32px))] rounded-2xl border border-white/12 bg-[#0a1430]/96 p-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl",
          alignClass,
          className,
        )}
      >
        <p className="px-2.5 pb-1 pt-1.5 text-[9px] font-bold tracking-wide text-muted-foreground/90">
          إخراج الصوت
        </p>
        <ul className="max-h-[min(220px,42vh)] overflow-y-auto">
          {devices.map((device) => {
            const Icon = connectAudioDeviceIcon(device.kind);
            const active = device.id === selection.id;
            return (
              <li key={device.id}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => onSelect(device.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right transition-colors active:scale-[0.98]",
                    active
                      ? "bg-neon-green/12 text-neon-green"
                      : "text-foreground/92 hover:bg-white/6",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium leading-tight">
                    {device.label}
                  </span>
                  {active ? <Check className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.4} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

type ConnectAudioOutputControlProps = {
  selection: ConnectAudioSelection;
  devices: ConnectAudioOutputDevice[];
  pickerOpen: boolean;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelectDevice: (deviceId: string) => void;
  variant?: "action-bar" | "voice-footer" | "call-grid" | "call-compact";
  className?: string;
  pickerAlign?: "center" | "start" | "end";
};

export function ConnectAudioOutputControl({
  selection,
  devices,
  pickerOpen,
  onOpenPicker,
  onClosePicker,
  onSelectDevice,
  variant = "action-bar",
  className,
  pickerAlign = "center",
}: ConnectAudioOutputControlProps) {
  const Icon = connectAudioSelectionIcon(selection);
  const shortLabel = connectAudioSelectionShortLabel(selection);
  const tone =
    selection.kind === "bluetooth" || selection.kind === "watch"
      ? "bluetooth"
      : "speaker";
  const isActive = selection.id !== "builtin:earpiece";

  const callActiveShell =
    selection.kind === "bluetooth" || selection.kind === "watch"
      ? "bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border-[var(--neon-blue)]/40 shadow-[0_0_18px_oklch(0.72_0.18_235/0.35)]"
      : selection.route === "speaker"
        ? "bg-neon-green text-[#0a1430] border-neon-green shadow-[0_0_18px_oklch(0.82_0.22_145/0.5)]"
        : "glass text-foreground/90 border-white/10";

  if (variant === "call-grid" || variant === "call-compact") {
    const shellSize = variant === "call-grid" ? "h-[58px] w-[58px]" : "h-12 w-12";
    return (
      <div className={cn("relative flex flex-col items-center gap-2", className)}>
        <button
          type="button"
          onClick={onOpenPicker}
          aria-label="اختر جهاز إخراج الصوت"
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          className="flex flex-col items-center gap-2 transition-transform active:scale-95"
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-2xl border transition-colors",
              shellSize,
              isActive ? callActiveShell : "glass border-white/10 text-foreground/90",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.1} />
          </div>
          <span className="max-w-[64px] truncate text-[10px] leading-none text-muted-foreground">{shortLabel}</span>
        </button>
        <ConnectAudioOutputPicker
          open={pickerOpen}
          onClose={onClosePicker}
          devices={devices}
          selection={selection}
          onSelect={onSelectDevice}
          align={pickerAlign}
        />
      </div>
    );
  }

  if (variant === "voice-footer") {
    const accent =
      selection.kind === "bluetooth" || selection.kind === "watch"
        ? "border border-[var(--neon-blue)]/35 bg-[var(--neon-blue)]/10"
        : selection.route === "speaker"
          ? "border border-neon-green/35 bg-neon-green/10"
          : "";
    const iconClass =
      selection.kind === "bluetooth" || selection.kind === "watch"
        ? "text-[var(--neon-blue)]"
        : selection.route === "speaker"
          ? "text-neon-green"
          : "text-foreground/90";

    return (
      <div className={cn("relative", className)}>
        <button
          type="button"
          onClick={onOpenPicker}
          aria-label="اختر جهاز إخراج الصوت"
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          className={cn(
            "glass flex h-[80px] w-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl transition-transform active:scale-95",
            accent,
          )}
        >
          <Icon className={cn("h-5 w-5", iconClass)} strokeWidth={2.1} />
          <span className={cn("max-w-[64px] truncate text-[10px]", iconClass)}>{shortLabel}</span>
        </button>
        <ConnectAudioOutputPicker
          open={pickerOpen}
          onClose={onClosePicker}
          devices={devices}
          selection={selection}
          onSelect={onSelectDevice}
          align={pickerAlign}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={onOpenPicker}
        aria-label="اختر جهاز إخراج الصوت"
        aria-haspopup="menu"
        aria-expanded={pickerOpen}
        className={cn(
          "connect-action-bar-btn relative flex flex-col items-center gap-1.5 rounded-xl px-1 py-1",
          `connect-action-bar-btn--${tone}`,
          isActive && "connect-action-bar-btn--on",
        )}
      >
        <span className="connect-action-bar-btn__ring glass flex h-10 w-10 items-center justify-center rounded-full">
          <Icon className="connect-action-bar-btn__icon h-4 w-4" strokeWidth={2.1} />
        </span>
        <span className="connect-action-bar-btn__label max-w-[56px] truncate text-center text-[9px] leading-tight text-muted-foreground">
          {shortLabel}
        </span>
      </button>
      <ConnectAudioOutputPicker
        open={pickerOpen}
        onClose={onClosePicker}
        devices={devices}
        selection={selection}
        onSelect={onSelectDevice}
        align={pickerAlign}
      />
    </div>
  );
}
