import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import type { AudioV2Track } from "../build-audio-v2-tracks";

type Props = {
  track: AudioV2Track | null;
  playing: boolean;
  playheadSec: number;
  durationSec: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (sec: number) => void;
};

export function AudioV2MiniPlayer({
  track,
  playing,
  playheadSec,
  durationSec,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
}: Props) {
  if (!track) return null;

  const safeDuration = durationSec > 0 ? durationSec : track.durationSeconds ?? 0;
  const safeCurrent = safeDuration > 0 ? Math.min(playheadSec, safeDuration) : playheadSec;
  const progressPct =
    safeDuration > 0 ? Math.min(100, Math.max(0, (safeCurrent / safeDuration) * 100)) : 0;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(var(--alpha-bottom-nav-height,72px)+env(safe-area-inset-bottom,0px))] z-40 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-3"
      role="region"
      aria-label="مشغّل AudioV2"
    >
      <div className="glass-card overflow-hidden rounded-[22px] border border-[rgba(93,50,145,0.12)] bg-white/96 shadow-[0_-8px_28px_rgba(93,50,145,0.14)] backdrop-blur-xl">
        <input
          type="range"
          min={0}
          max={Math.max(safeDuration, 1)}
          step={1}
          value={Math.floor(safeCurrent)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="موضع التشغيل"
          className="audiov2-mini-range h-1.5 w-full cursor-pointer appearance-none"
          dir="ltr"
          style={{
            background: `linear-gradient(to left, var(--gold-deep) 0%, var(--gold-soft) ${progressPct}%, rgba(231,201,122,0.18) ${progressPct}%, rgba(231,201,122,0.18) 100%)`,
          }}
        />

        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-2 ring-[var(--gold)]/25">
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[12px] font-extrabold leading-tight text-[#3a3258]">{track.title}</p>
            <p className="truncate text-[10px] font-bold text-[#8a84a8]">{track.subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onPrevious}
              aria-label="السابق"
              className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(93,50,145,0.12)] bg-white/90 text-[#5D3291] active:scale-95"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? "إيقاف" : "تشغيل"}
              className="grid h-10 w-10 place-items-center rounded-full text-white shadow-[0_8px_22px_-8px_rgba(180,130,60,0.55)] ring-1 ring-white/45 active:scale-95"
              style={{
                background: "linear-gradient(180deg, var(--gold-soft) 0%, var(--gold-deep) 100%)",
              }}
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-current" strokeWidth={0} />
              ) : (
                <Play className="h-4 w-4 translate-x-[1px] fill-current" strokeWidth={0} />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="التالي"
              className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(93,50,145,0.12)] bg-white/90 text-[#5D3291] active:scale-95"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <span className="hidden min-w-[42px] text-[9px] font-bold tabular-nums text-[#8a84a8] sm:block" dir="ltr">
            {formatDurationSeconds(safeCurrent)}
          </span>
        </div>
      </div>
    </div>
  );
}
