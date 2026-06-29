import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMUNITY_SHIELD_SHELL } from "./community-shield-chrome";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  zIndex?: number;
  maxHeight?: string;
  variant?: "solid" | "glass";
};

export function CommunityShieldSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  zIndex = 96,
  maxHeight = "min(72dvh,520px)",
  variant = "solid",
}: Props) {
  if (!open || typeof document === "undefined") return null;

  const isSolid = variant === "solid";

  return createPortal(
    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex }} dir="rtl">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-[1] flex w-full max-w-[var(--alpha-content-narrow-width)] flex-col overflow-hidden rounded-t-3xl",
          isSolid ? COMMUNITY_SHIELD_SHELL : "glass-strong shadow-[0_-16px_52px_rgba(0,0,0,0.48)]",
        )}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
          <div className={cn("h-1 w-10 rounded-full", isSolid ? "bg-[#94A3B8]/45" : "bg-white/20")} />
        </div>

        <div
          className={cn(
            "flex shrink-0 items-start justify-between gap-3 border-b px-4 pb-3",
            isSolid ? "border-[#CBD5E1]/80" : "border-white/10",
          )}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full active:scale-95",
              isSolid
                ? "border border-white/50 bg-white/70 text-[#6B7280] shadow-sm"
                : "glass text-foreground/80",
            )}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h2 className={cn("text-[18px] font-bold leading-tight", isSolid ? "text-[#1F2937]" : "text-foreground")}>
              {title}
            </h2>
            {subtitle ? (
              <p className={cn("mt-1 text-[11px]", isSolid ? "text-[#6B7280]" : "text-muted-foreground")}>{subtitle}</p>
            ) : null}
          </div>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              isSolid ? "border border-[#1f8a5a]/25 bg-[#1f8a5a]/12 text-[#1f8a5a]" : "glass text-neon-green",
            )}
            aria-hidden
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
