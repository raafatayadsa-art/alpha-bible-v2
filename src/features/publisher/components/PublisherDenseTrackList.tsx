import { Pause, Play } from "lucide-react";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import type { PublisherPlayableTrack } from "../publisher-playback";

type Props = {
  tracks: PublisherPlayableTrack[];
  currentKey: string | null;
  playing: boolean;
  onPlay: (track: PublisherPlayableTrack) => void;
};

export function PublisherDenseTrackList({ tracks, currentKey, playing, onPlay }: Props) {
  if (!tracks.length) return null;

  return (
    <ul className="divide-y divide-[rgba(93,50,145,0.08)] overflow-hidden rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/95">
      {tracks.map((track, index) => {
        const isCurrent = currentKey === track.key;
        return (
          <li key={track.key}>
            <button
              type="button"
              onClick={() => onPlay(track)}
              className={`flex w-full items-center gap-3 px-3 py-3 text-right transition active:scale-[0.995] ${
                isCurrent ? "bg-[var(--gold)]/8" : "hover:bg-[var(--gold)]/5"
              }`}
            >
              <span className="w-5 shrink-0 text-center text-[11px] font-black tabular-nums text-[#8a84a8]">
                {isCurrent && playing ? (
                  <Pause className="mx-auto h-3.5 w-3.5 text-[var(--gold-deep)]" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--gold)]/20">
                <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[13px] font-extrabold ${
                    isCurrent ? "text-[var(--gold-deep)]" : "text-[#3a3258]"
                  }`}
                >
                  {track.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-bold text-[#8a84a8]">{track.subtitle}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#8a84a8]" dir="ltr">
                {formatDurationSeconds(track.durationSeconds)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
