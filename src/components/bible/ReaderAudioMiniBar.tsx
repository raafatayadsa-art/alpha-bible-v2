import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  visible: boolean;
  playing: boolean;
  label: string;
  progress: number;
  spiritualMode?: boolean;
  onTogglePlay: () => void;
  onOpenControls: () => void;
};

export function ReaderAudioMiniBar({
  visible,
  playing,
  label,
  progress,
  spiritualMode = false,
  onTogglePlay,
  onOpenControls,
}: Props) {
  if (!visible) return null;

  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-[45] mx-auto max-w-[var(--alpha-content-max-width)] px-3",
        "bottom-[calc(88px+env(safe-area-inset-bottom))]",
      )}
      dir="rtl"
    >
      <button
        type="button"
        onClick={onOpenControls}
        className={cn(
          "flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-right shadow-lg backdrop-blur-xl active:scale-[0.99]",
          spiritualMode
            ? "border-white/12 bg-[#0f1a14]/92 text-white"
            : "border-alpha/40 bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_94%,white)]",
        )}
      >
        <button
          type="button"
          aria-label={playing ? "إيقاف" : "تشغيل"}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full",
            spiritualMode ? "bg-white text-[#0f1a14]" : "bg-alpha-heading text-white",
          )}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-extrabold">{label}</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/10" dir="ltr">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E8D5A0] via-[#D4AF37] to-[#B8893A]"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </button>
    </div>
  );
}
