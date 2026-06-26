import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const ALPHA_V2_PURPLE_GRADIENT = "linear-gradient(160deg, #7b4cb8, #5D3291)";
export const ALPHA_V2_GOLD_GRADIENT =
  "linear-gradient(180deg, var(--gold-soft) 0%, var(--gold-deep) 100%)";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function AlphaV2PrimaryButton({ className, children, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-extrabold text-white shadow-[0_8px_20px_-10px_rgba(93,50,145,0.55)] active:scale-[0.98] disabled:opacity-45",
        className,
      )}
      style={{ background: ALPHA_V2_PURPLE_GRADIENT }}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlphaV2GoldButton({ className, children, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-extrabold text-white shadow-[0_8px_22px_-8px_rgba(180,130,60,0.55)] ring-1 ring-white/45 active:scale-[0.98] disabled:opacity-45",
        className,
      )}
      style={{ background: ALPHA_V2_GOLD_GRADIENT }}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlphaV2SecondaryButton({ className, children, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[rgba(93,50,145,0.18)] bg-white/92 px-3 py-2 text-[11px] font-extrabold text-[#5D3291] shadow-sm active:scale-[0.99] disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlphaV2FollowChip({
  following,
  followCount,
  followBusy,
  onFollow,
}: {
  following: boolean;
  followCount: number;
  followBusy?: boolean;
  onFollow?: () => void;
}) {
  const blue = "#5b9fd8";
  return (
    <button
      type="button"
      disabled={followBusy}
      onClick={onFollow}
      className="inline-flex min-w-[72px] flex-col items-center justify-center rounded-xl border px-3 py-1.5 backdrop-blur-md transition active:scale-95 disabled:opacity-60"
      style={{
        borderColor: following ? `${blue}cc` : `${blue}55`,
        background: following
          ? `linear-gradient(180deg, ${blue} 0%, #4a8fd4 100%)`
          : "rgba(0,0,0,0.26)",
        boxShadow: following
          ? `0 0 16px ${blue}55, inset 0 1px 0 rgba(255,255,255,0.2)`
          : `0 0 12px ${blue}33, inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      <span className="text-[12px] font-black tabular-nums leading-none text-white">
        {followCount.toLocaleString("ar-EG")}
      </span>
      <span className="mt-0.5 text-[7px] font-extrabold text-white/85">
        {following ? "متابَع" : "متابعة"}
      </span>
    </button>
  );
}
