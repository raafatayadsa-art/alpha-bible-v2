import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Pause, Play, Repeat2 } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { cn } from "@/lib/utils";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import {
  readProfilePublisherReposts,
  subscribeProfilePublisherReposts,
  type ProfilePublisherRepost,
} from "@/features/publisher/publisher-profile-reposts";

let activeAudio: HTMLAudioElement | null = null;
let activeStop: (() => void) | null = null;

function stopActivePlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  activeStop?.();
  activeStop = null;
}

function RepostRow({ item, dark }: { item: ProfilePublisherRepost; dark?: boolean }) {
  const cover = item.coverUrl ?? undefined;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(item.durationSeconds ?? 0);

  useEffect(() => () => {
    if (audioRef.current === activeAudio) stopActivePlayback();
  }, []);

  const cardClass = dark
    ? "flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-transform"
    : "flex gap-3 rounded-2xl border border-[#efe2c4]/90 bg-white/88 p-2.5 transition-transform";
  const titleClass = dark ? "text-[12px] font-extrabold text-white/90 line-clamp-1" : "text-[12px] font-extrabold text-[#3a2a18] line-clamp-1";
  const subClass = dark ? "mt-0.5 text-[10px] font-bold text-white/50 line-clamp-1" : "mt-0.5 text-[10px] font-bold text-[#6a543a] line-clamp-1";
  const metaClass = dark ? "mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-white/35" : "mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#9a7e5a]";

  const togglePlay = () => {
    if (!mediaUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      if (activeAudio === audio) {
        activeAudio = null;
        activeStop = null;
      }
      return;
    }

    stopActivePlayback();
    activeAudio = audio;
    activeStop = () => setPlaying(false);

    if (audio.src !== mediaUrl) {
      audio.src = mediaUrl;
      audio.load();
    }

    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration);
  };

  const progressPct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className={cardClass}>
      {mediaUrl ? (
        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            if (audioRef.current === activeAudio) {
              activeAudio = null;
              activeStop = null;
            }
          }}
          className="hidden"
        />
      ) : null}

      <div className="relative h-16 w-16 shrink-0">
        <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#ead9b1] bg-[#2a1f45]">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-lg font-black text-[#f0d78c]">Ⲱ</span>
          )}
        </div>
        {mediaUrl ? (
          <button
            type="button"
            aria-label={playing ? "إيقاف" : "تشغيل"}
            onClick={togglePlay}
            className="absolute -bottom-1 -left-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#6a4ab5] to-[#8c6fd1] text-white shadow-lg active:scale-95"
          >
            {playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />}
          </button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 text-right py-0.5">
        <p className={titleClass}>{item.highlightTitle ?? item.publisherName}</p>
        <p className={subClass}>{item.publisherName}</p>
        {mediaUrl ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#f0d78c]/70 transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`shrink-0 text-[8.5px] font-bold ${dark ? "text-white/40" : "text-[#9a7e5a]"}`}>
              {formatDurationSeconds(duration || item.durationSeconds)}
            </span>
          </div>
        ) : (
          <p className={metaClass}>
            <Repeat2 className="h-3 w-3" />
            أُعيد نشره على صفحتك
          </p>
        )}
      </div>

      <Link
        to="/publisher/$publisherId"
        params={{ publisherId: item.publisherId }}
        aria-label={`فتح صفحة ${item.publisherName}`}
        className="grid h-8 w-8 shrink-0 place-items-center self-center rounded-full active:scale-95"
      >
        <ChevronLeft className={`h-4 w-4 ${dark ? "text-[#f0d78c]/50" : "text-[#c79356]/70"}`} />
      </Link>
    </div>
  );
}

export function ProfilePublisherRepostsSection({ dark = false }: { dark?: boolean }) {
  const [items, setItems] = useState<ProfilePublisherRepost[]>(() => readProfilePublisherReposts());

  useEffect(() => subscribeProfilePublisherReposts(() => setItems(readProfilePublisherReposts())), []);

  if (!items.length) return null;

  const titleClass = dark ? "text-white/85" : "text-alpha-heading";

  return (
    <section className="mt-1">
      <HeroLedgerStylesHost />
      <h2 className={`mt-5 mb-2.5 px-0.5 text-[13px] font-extrabold flex items-center gap-2 ${titleClass}`}>
        <span
          aria-hidden
          className={cn(
            "select-none text-[13px] font-black",
            dark ? "hero-ledger-glyph-gold" : "text-alpha-glyph",
          )}
        >
          Ⲱ
        </span>        أُعيد نشره
      </h2>
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => (
          <RepostRow key={`${item.publisherId}-${item.repostedAt}`} item={item} dark={dark} />
        ))}
      </div>
    </section>
  );
}
