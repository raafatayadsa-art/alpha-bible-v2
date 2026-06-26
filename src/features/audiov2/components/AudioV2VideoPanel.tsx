import { X, Video } from "lucide-react";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import type { AudioV2Video } from "../build-audio-v2-tracks";

type Props = {
  video: AudioV2Video | null;
  onClose: () => void;
};

export function AudioV2VideoPanel({ video, onClose }: Props) {
  if (!video) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(var(--alpha-bottom-nav-height,72px)+env(safe-area-inset-bottom,0px))] z-50 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-3"
      role="region"
      aria-label="مشغّل الفيديو"
    >
      <div className="overflow-hidden rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-white/97 shadow-[0_-10px_36px_rgba(93,50,145,0.18)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(93,50,145,0.08)] px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الفيديو"
            className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(93,50,145,0.12)] bg-white text-[#5D3291] active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[12px] font-extrabold text-[#3a3258]">{video.title}</p>
            <p className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8a84a8]">
              <Video className="h-3 w-3 text-[#f97316]" />
              {video.subtitle}
              {video.durationSeconds ? (
                <span dir="ltr">· {formatDurationSeconds(video.durationSeconds)}</span>
              ) : null}
            </p>
          </div>
        </div>
        <video
          key={video.key}
          controls
          playsInline
          preload="metadata"
          poster={video.coverUrl}
          src={video.mediaUrl}
          className="aspect-video w-full bg-black object-contain"
        />
      </div>
    </div>
  );
}
