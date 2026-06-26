import type { ChurchPost } from "@/data/church-posts";
import { readTripLiveSnapshot } from "@/features/smart-context/trip-live-store";
import { getTripMemoryAlbum } from "../trip-memory-album";
import { getTripTimeline } from "../trip-timeline";
import { Image, Clock } from "lucide-react";

const GLASS = "rounded-2xl border border-[#efe2c4] bg-white/60 p-4";

export function TripPostArchiveSection({ post }: { post: ChurchPost }) {
  const live = readTripLiveSnapshot(post.id);
  if (live?.phase !== "completed") return null;

  const album = getTripMemoryAlbum(post.id);
  const timeline = getTripTimeline(post.id);
  if (!album && !timeline.length) return null;

  return (
    <section className={GLASS + " text-right mt-3"} dir="rtl">
      <p className="text-[13px] font-extrabold text-[#3a2a18]">أرشيف الرحلة</p>

      {album ? (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-[#b8893a] inline-flex items-center gap-1 mb-2">
            <Image className="h-3.5 w-3.5" /> ألبوم الذكريات
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {album.photos.map((src, i) => (
              <img key={i} src={src} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover border border-[#efe2c4]" />
            ))}
          </div>
          <ul className="mt-2 space-y-1">
            {album.highlights.slice(0, 4).map((h, i) => (
              <li key={i} className="text-[10px] text-[#6a543a]">• {h}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {timeline.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] font-bold text-[#1f8a5a] inline-flex items-center gap-1 mb-2">
            <Clock className="h-3.5 w-3.5" /> Timeline الرحلة
          </p>
          <ol className="relative border-r-2 border-[#efe2c4] pr-3 space-y-3">
            {timeline.map((ev) => (
              <li key={ev.id} className="text-[10px]">
                <span className="font-extrabold text-[#3a2a18]">{ev.title}</span>
                <span className="block text-[#8a6a3a]">{ev.at}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
