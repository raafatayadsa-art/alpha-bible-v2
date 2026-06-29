import { cn } from "@/lib/utils";
import { MESSAGING_GLASS_SHELL } from "@/components/alpha/messaging-ui";

export const PUBLISHER_GLASS_INPUT =
  "w-full rounded-xl border border-alpha/90 bg-white/70 px-3.5 py-2.5 alpha-type-body font-semibold text-alpha-heading placeholder:text-alpha-gold-deep/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/25 transition";

export const PUBLISHER_GLASS_LABEL = "alpha-type-caption font-extrabold text-alpha-muted";

export const PUBLISHER_GLASS_SHEET_OVERLAY =
  "fixed inset-0 z-[70] flex items-end justify-center px-4 sm:items-center";

export const PUBLISHER_GLASS_SHEET_BACKDROP =
  "absolute inset-0 bg-black/28 backdrop-blur-[3px]";

export function publisherGlassSheetPanel(className?: string) {
  return cn(
    "relative z-[1] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden",
    MESSAGING_GLASS_SHELL,
    className,
  );
}

/** Publisher public page neutral typography — purple accent preserved separately */
export const PUBLISHER_TEXT_TITLE = "alpha-type-body font-extrabold text-[var(--alpha-publisher-ink)]";
export const PUBLISHER_TEXT_SUB = "alpha-type-caption font-bold text-[var(--alpha-publisher-muted)]";
export const PUBLISHER_TEXT_MUTED = "alpha-type-caption font-bold text-[var(--alpha-publisher-subtle)]";
export const PUBLISHER_TEXT_ACCENT = "font-extrabold text-[var(--alpha-publisher-purple)]";
export const PUBLISHER_TEXT_ACCENT_CAPTION = "alpha-type-caption font-extrabold text-[var(--alpha-publisher-purple)]";
export const PUBLISHER_TEXT_FEEDBACK =
  "text-center alpha-type-desc font-bold text-[var(--alpha-publisher-purple)]";
export const PUBLISHER_TEXT_ERROR = "text-center alpha-type-desc font-bold text-[#a8344f]";
export const PUBLISHER_TEXT_REPORT = "alpha-type-caption font-extrabold text-[#a8344f]";
export const PUBLISHER_LEGAL_BODY =
  "alpha-type-desc font-bold leading-relaxed text-[var(--alpha-publisher-ink)]";
export const PUBLISHER_ADD_CONTENT_ICON =
  "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--alpha-publisher-purple)]/10 text-[var(--alpha-publisher-purple)]";

/** Publisher sheet chrome — purple-tinted panel DNA */
export const PUBLISHER_SHEET_OVERLAY =
  "fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center";

export const PUBLISHER_SHEET_OVERLAY_QR =
  "fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center";

export const PUBLISHER_SHEET_PANEL =
  "flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--alpha-radius-card-compact)] border border-[rgba(93,50,145,0.14)] bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_96%,var(--alpha-publisher-surface))]";

export const PUBLISHER_SHEET_PANEL_SM =
  "w-full max-w-sm rounded-[var(--alpha-radius-card-compact)] border border-[rgba(93,50,145,0.14)] bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_96%,var(--alpha-publisher-surface))] p-4";

export const PUBLISHER_SHEET_HEADER_BORDER = "border-b border-[rgba(93,50,145,0.1)]";
export const PUBLISHER_SHEET_FOOTER_BORDER = "border-t border-[rgba(93,50,145,0.1)]";

export const PUBLISHER_INNER_CARD = "rounded-2xl border border-[rgba(93,50,145,0.12)] bg-white/90 p-3";

export const PUBLISHER_ROW_BTN =
  "flex w-full items-center gap-2 rounded-xl border border-[rgba(93,50,145,0.1)] bg-[var(--alpha-publisher-surface)] px-2.5 py-2 text-right active:scale-[0.99]";

export const PUBLISHER_MEMBER_CARD =
  "rounded-2xl border border-[rgba(93,50,145,0.1)] bg-[var(--alpha-publisher-surface)] px-3 py-3";

export const PUBLISHER_PERM_ROW =
  "flex items-center justify-between gap-2 rounded-xl border border-[rgba(93,50,145,0.08)] bg-[var(--alpha-publisher-surface)] px-2.5 py-2";

export const PUBLISHER_ACCENT_ICON_SM =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--alpha-publisher-purple)]/10 text-[var(--alpha-publisher-purple)]";

export const PUBLISHER_ACCENT_ICON_MD =
  "grid h-9 w-9 place-items-center rounded-xl bg-[var(--alpha-publisher-purple)]/10 text-[var(--alpha-publisher-purple)]";

export const PUBLISHER_MOVE_BTN =
  "grid h-7 w-7 place-items-center rounded-lg border border-[var(--alpha-publisher-purple)]/15 bg-white disabled:opacity-30";

export const PUBLISHER_PURPLE_BTN_OUTLINE =
  "inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--alpha-publisher-purple)]/25 py-2 alpha-type-desc font-extrabold text-[var(--alpha-publisher-purple)] active:scale-[0.98]";

export const PUBLISHER_PURPLE_BTN_SOLID =
  "inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 alpha-type-body font-extrabold text-white disabled:opacity-60";

export const PUBLISHER_PURPLE_BTN_BACK =
  "inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[var(--alpha-publisher-purple)]/25 py-2.5 alpha-type-body font-extrabold text-[var(--alpha-publisher-purple)]";

export const PUBLISHER_PURPLE_GRADIENT = "linear-gradient(160deg, #7b4cb8, var(--alpha-publisher-purple))";

export const PUBLISHER_CONSENT_CARD =
  "rounded-[var(--alpha-radius-button)] border border-[rgba(93,50,145,0.14)] bg-[color-mix(in_srgb,var(--alpha-bg-base)_94%,#faf8f5)] p-3 space-y-2.5";

export const PUBLISHER_TERMS_CHIP =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--alpha-publisher-purple)]/25 px-2.5 py-1 alpha-type-caption font-extrabold text-[var(--alpha-publisher-purple)]";

export const PUBLISHER_QR_FRAME =
  "mx-auto flex w-fit flex-col items-center rounded-[var(--alpha-radius-dock-tab)] border border-[var(--alpha-gold)]/35 bg-white p-3";

export const PUBLISHER_DIVIDER = "h-px flex-1 bg-[rgba(93,50,145,0.12)]";

export const PUBLISHER_EMAIL_INPUT =
  "w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-2.5 alpha-type-body font-bold text-[var(--alpha-publisher-ink)]";

/** Gold wizard / album chrome */
export const PUBLISHER_WIZARD_SECONDARY_BTN =
  "inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-alpha/90 bg-white/65 py-2.5 alpha-type-body font-extrabold text-alpha-heading backdrop-blur-sm";

export const PUBLISHER_GOLD_BTN =
  "inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-alpha/80 bg-gradient-to-b from-[color-mix(in_srgb,var(--alpha-gold-bright)_85%,white)] to-[var(--alpha-gold)] py-2.5 alpha-type-body font-extrabold text-alpha-heading shadow-[0_4px_14px_rgba(184,137,58,0.22)] disabled:opacity-50";

export const PUBLISHER_GOLD_BTN_FULL =
  "w-full rounded-full border border-alpha/80 bg-gradient-to-b from-[color-mix(in_srgb,var(--alpha-gold-bright)_85%,white)] to-[var(--alpha-gold)] py-2.5 alpha-type-body font-extrabold text-alpha-heading";

/** Copyright report bottom sheet */
export const PUBLISHER_REPORT_SHEET =
  "flex w-full max-w-sm max-h-[min(82dvh,520px)] flex-col overflow-hidden rounded-t-[var(--alpha-radius-card-compact)] border border-b-0 border-[rgba(93,50,145,0.14)] bg-white shadow-[0_-16px_48px_rgba(0,0,0,0.22)]";

export const PUBLISHER_REPORT_FIELD =
  "w-full rounded-xl border border-alpha/80 px-3 py-2 alpha-type-body font-bold text-alpha-heading";

/** Workspace chrome */
export const PUBLISHER_INNER_TAB_BAR =
  "no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-[rgba(93,50,145,0.12)] bg-[var(--alpha-publisher-surface)] p-1";

export const PUBLISHER_CONTENT_ROW =
  "flex items-center gap-2 rounded-2xl border border-[rgba(93,50,145,0.1)] bg-[var(--alpha-publisher-surface)] px-3 py-2.5";

export const PUBLISHER_OUTLINE_BTN =
  "inline-flex items-center justify-center gap-1 rounded-2xl border border-[rgba(93,50,145,0.18)] bg-white/95 py-2.5 alpha-type-desc font-extrabold text-[var(--alpha-publisher-purple)] shadow-sm active:scale-[0.99]";

export const PUBLISHER_CHIP_BTN =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--alpha-publisher-purple)]/20 bg-white px-3 py-1.5 alpha-type-caption font-extrabold text-[var(--alpha-publisher-purple)] active:scale-[0.98]";
