import { useState } from "react";
import { createPortal } from "react-dom";
import { EyeOff, Gauge, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  spiritualMode?: boolean;
  onPlayingChange?: (playing: boolean) => void;
};

export function ReaderAudioSheet({
  open,
  onClose,
  bookName,
  chapter,
  spiritualMode = false,
  onPlayingChange,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress] = useState(12);

  if (!open || typeof document === "undefined") return null;

  const speeds = [0.75, 1, 1.25, 1.5];

  return createPortal(
    <div className="fixed inset-0 z-[95] flex flex-col justify-end" dir="rtl">
      <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 overflow-hidden rounded-t-[26px] border-t px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur-xl",
          spiritualMode
            ? "border-white/12 bg-[#0f1a14]/96 text-white"
            : "border-alpha/35 bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_96%,white)]",
        )}
      >
        <div className="flex justify-center pb-2" aria-hidden>
          <div className={cn("h-1 w-10 rounded-full", spiritualMode ? "bg-white/25" : "bg-alpha-gold-deep/35")} />
        </div>

        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border active:scale-95",
              spiritualMode ? "border-white/15 bg-white/8" : "border-alpha/30 bg-white/80",
            )}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className={cn("text-[13px] font-extrabold", spiritualMode ? "text-[#f0d78c]" : "text-alpha-heading")}>
              {bookName} {chapter}
            </p>
            <p className={cn("mt-0.5 text-[11px]", spiritualMode ? "text-white/65" : "text-alpha-muted")}>
              Van Dyck · الاستماع الصوتي قيد التفعيل
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6">
          <button type="button" aria-label="رجوع 10 ثوان" className="grid h-10 w-10 place-items-center rounded-full active:scale-95">
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={playing ? "إيقاف" : "تشغيل"}
            onClick={() => {
              setPlaying((v) => {
                const next = !v;
                onPlayingChange?.(next);
                return next;
              });
            }}
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full shadow-lg active:scale-95",
              spiritualMode ? "bg-white text-[#0f1a14]" : "bg-alpha-heading text-white",
            )}
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
          </button>
          <button type="button" aria-label="تقديم 10 ثوان" className="grid h-10 w-10 place-items-center rounded-full active:scale-95">
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 px-1" dir="ltr">
          <div
            className={cn(
              "relative h-1.5 rounded-full",
              spiritualMode ? "bg-white/15" : "bg-black/10",
            )}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #E8D5A0 0%, #D4AF37 55%, #B8893A 100%)",
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold opacity-70">
            <span>0:01</span>
            <span>3:09</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" aria-label="مؤقت النوم" className="grid h-9 w-9 place-items-center rounded-full active:scale-95">
            <Gauge className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold active:scale-95",
              spiritualMode ? "border-white/15 bg-white/8" : "border-alpha/30 bg-white/70",
            )}
          >
            <EyeOff className="h-3.5 w-3.5" />
            إخفاء أدوات التحكم
          </button>
          <button
            type="button"
            onClick={() => {
              const idx = speeds.indexOf(speed);
              setSpeed(speeds[(idx + 1) % speeds.length] ?? 1);
            }}
            className="min-w-[2.5rem] text-[12px] font-extrabold"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
