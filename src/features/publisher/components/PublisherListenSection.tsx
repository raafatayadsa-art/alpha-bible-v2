import { useMemo, useState } from "react";
import { ChevronLeft, Pause, Play } from "lucide-react";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import type { PublisherPlayableTrack } from "../publisher-playback";

const PAGE_SIZE = 5;

type Props = {
  tracks: PublisherPlayableTrack[];
  currentKey: string | null;
  playing: boolean;
  onPlay: (track: PublisherPlayableTrack) => void;
};

export function PublisherListenSection({ tracks, currentKey, playing, onPlay }: Props) {
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const pages = useMemo(() => {
    const out: PublisherPlayableTrack[][] = [];
    for (let i = 0; i < tracks.length; i += PAGE_SIZE) {
      out.push(tracks.slice(i, i + PAGE_SIZE));
    }
    return out;
  }, [tracks]);

  const visibleTracks = expanded ? tracks : (pages[page] ?? tracks.slice(0, PAGE_SIZE));
  const hasMultiplePages = pages.length > 1;

  if (!tracks.length) return null;

  return (
    <div className="space-y-3">
      {!expanded && hasMultiplePages ? (
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          dir="rtl"
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth || 1;
            const idx = Math.round(el.scrollLeft / w);
            setPage(Math.min(pages.length - 1, Math.max(0, idx)));
          }}
        >
          {pages.map((chunk, pageIndex) => (
            <div
              key={pageIndex}
              className="w-full min-w-full shrink-0 snap-center rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/95 p-2"
            >
              <ul className="space-y-1">
                {chunk.map((track, index) => {
                  const globalIndex = pageIndex * PAGE_SIZE + index;
                  const isCurrent = currentKey === track.key;
                  return (
                    <li key={track.key}>
                      <TrackRow
                        track={track}
                        index={globalIndex}
                        isCurrent={isCurrent}
                        playing={playing}
                        onPlay={onPlay}
                        compact
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(93,50,145,0.08)] overflow-hidden rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/95">
          {visibleTracks.map((track, index) => {
            const isCurrent = currentKey === track.key;
            return (
              <li key={track.key}>
                <TrackRow
                  track={track}
                  index={index}
                  isCurrent={isCurrent}
                  playing={playing}
                  onPlay={onPlay}
                />
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2 px-0.5">
        {!expanded && hasMultiplePages ? (
          <div className="flex items-center gap-1">
            {pages.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${
                  i === page ? "h-1.5 w-4 bg-[var(--gold-deep)]" : "h-1.5 w-1.5 bg-[var(--gold)]/35"
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="text-[10px] font-bold text-[#8a84a8]">
            {tracks.length.toLocaleString("ar-EG")} ترنيمة
          </span>
        )}

        {tracks.length > PAGE_SIZE ? (
          <button
            type="button"
            onClick={() => {
              setExpanded((v) => !v);
              setPage(0);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#5a4218] active:scale-[0.98]"
          >
            {expanded ? (
              <>
                عرض أقل
                <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
              </>
            ) : (
              <>
                عرض الكل ({tracks.length.toLocaleString("ar-EG")})
                <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TrackRow({
  track,
  index,
  isCurrent,
  playing,
  onPlay,
  compact,
}: {
  track: PublisherPlayableTrack;
  index: number;
  isCurrent: boolean;
  playing: boolean;
  onPlay: (track: PublisherPlayableTrack) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(track)}
      className={`flex w-full items-center gap-3 text-right transition active:scale-[0.995] ${
        compact ? "rounded-xl px-2 py-2" : "px-3 py-3"
      } ${isCurrent ? "bg-[var(--gold)]/8" : "hover:bg-[var(--gold)]/5"}`}
    >
      <span className="w-5 shrink-0 text-center text-[11px] font-black tabular-nums text-[#8a84a8]">
        {isCurrent && playing ? (
          <Pause className="mx-auto h-3.5 w-3.5 text-[var(--gold-deep)]" strokeWidth={2.5} />
        ) : (
          index + 1
        )}
      </span>
      <div
        className={`shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--gold)]/20 ${
          compact ? "h-10 w-10" : "h-11 w-11"
        }`}
      >
        <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-extrabold ${compact ? "text-[12px]" : "text-[13px]"} ${
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
  );
}
