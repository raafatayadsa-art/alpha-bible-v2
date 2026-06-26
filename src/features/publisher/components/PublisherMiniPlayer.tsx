import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import type { PublisherPlayableTrack } from "../publisher-playback";

type Props = {
  track: PublisherPlayableTrack | null;
  playing: boolean;
  playheadSec: number;
  durationSec: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (sec: number) => void;
};

export function PublisherMiniPlayer({
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
      aria-label="مشغّل الاستماع"
    >
      <div className="overflow-hidden rounded-[24px] border border-[var(--gold)]/25 bg-gradient-to-b from-[#2a2238]/96 to-[#1a1528]/98 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <style>{`
          .publisher-mini-range {
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.12);
          }
          .publisher-mini-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 9999px;
            background: linear-gradient(180deg, var(--gold-soft), var(--gold-deep));
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          }
          .publisher-mini-range::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 9999px;
            background: linear-gradient(180deg, var(--gold-soft), var(--gold-deep));
            border: 2px solid #fff;
          }
        `}</style>

        <div className="flex items-center justify-between gap-2 px-4 pt-2.5">
          <span className="text-[9px] font-bold tabular-nums text-white/55" dir="ltr">
            {formatDurationSeconds(safeCurrent)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--gold-soft)]/80">
            يُشغَّل الآن
          </span>
          <span className="text-[9px] font-bold tabular-nums text-white/55" dir="ltr">
            {formatDurationSeconds(safeDuration)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(safeDuration, 1)}
          step={1}
          value={Math.floor(safeCurrent)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="موضع التشغيل"
          className="publisher-mini-range mx-4 mt-1 w-[calc(100%-2rem)] cursor-pointer"
          dir="ltr"
          style={{
            background: `linear-gradient(to left, var(--gold-deep) 0%, var(--gold-soft) ${progressPct}%, rgba(255,255,255,0.12) ${progressPct}%, rgba(255,255,255,0.12) 100%)`,
          }}
        />

        <div className="flex items-center gap-3 px-3 py-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-[var(--gold)]/40 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
            {playing ? (
              <span className="absolute inset-0 bg-black/20" aria-hidden />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[13px] font-extrabold leading-tight text-white">{track.title}</p>
            <p className="truncate text-[10px] font-bold text-white/55">{track.subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevious}
              aria-label="السابق"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white/90 active:scale-95"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? "إيقاف" : "تشغيل"}
              className="grid h-11 w-11 place-items-center rounded-full text-[#2a1a08] shadow-[0_8px_24px_-6px_rgba(212,168,87,0.65)] ring-2 ring-[var(--gold-soft)]/50 active:scale-95"
              style={{
                background: "linear-gradient(180deg, var(--gold-soft) 0%, var(--gold-deep) 100%)",
              }}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" strokeWidth={0} />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px] fill-current" strokeWidth={0} />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="التالي"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white/90 active:scale-95"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
