import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Heart, Play } from "lucide-react";
import { HeroSpiritLedgerRow, seedHeroCount } from "@/components/home/hero-card-chrome";
import {
  formatDurationSeconds,
  parseAlbumPayload,
  sumTrackDurations,
  type PublisherAlbumTrackRef,
} from "../publisher-content-payload";
import type { PublisherContentItem, PublisherRecord } from "../types";
import { sharePublisherPage } from "../publisher-social-api";

type Props = {
  publisher: PublisherRecord;
  album: PublisherContentItem;
  hymnItems: PublisherContentItem[];
};

export function PublisherAlbumDetailView({ publisher, album, hymnItems }: Props) {
  const albumPayload = parseAlbumPayload(album.payload);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => (album.likesCount ?? 0) + seedHeroCount(album.id, 7));
  const [shareCount, setShareCount] = useState(() => seedHeroCount(publisher.id, 13));

  const tracks: PublisherAlbumTrackRef[] = useMemo(() => {
    if (albumPayload.tracks?.length) return albumPayload.tracks;
    const ids = albumPayload.trackIds ?? [];
    return ids.flatMap((id) => {
      const hymn = hymnItems.find((h) => h.id === id);
      if (!hymn) return [];
      return [
        {
          id: hymn.id,
          title: hymn.title,
          durationSeconds: hymn.durationSeconds,
          mediaUrl: hymn.mediaUrl,
        },
      ];
    });
  }, [albumPayload, hymnItems]);

  const totalDuration = sumTrackDurations(tracks) || album.durationSeconds;
  const cover = album.coverUrl?.trim() || publisher.coverUrl?.trim() || publisher.logoUrl?.trim();
  const firstPlayable = tracks.find((t) => t.mediaUrl) ?? (album.mediaUrl ? { id: album.id, title: album.title, mediaUrl: album.mediaUrl } : null);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[28px] border border-[rgba(93,50,145,0.14)] bg-white/90">
        {cover ? (
          <img src={cover} alt="" className="aspect-square w-full object-cover" />
        ) : (
          <div className="aspect-square w-full bg-gradient-to-br from-[#7b4cb8] to-[#5D3291]" />
        )}
        <div className="space-y-3 p-4 text-right">
          <p className="text-[10px] font-bold text-[#6b658a]">{publisher.name}</p>
          <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#3a3258]">{album.title}</h1>
          {album.description ? (
            <p className="text-[11px] font-bold leading-relaxed text-[#6b658a]">{album.description}</p>
          ) : null}
          <p className="text-[10px] font-bold text-[#8a84a8]">
            {tracks.length
              ? `${tracks.length} ترنيمة`
              : album.contentKind === "playlist"
                ? "قائمة تشغيل"
                : "ألبوم"}
            {totalDuration ? ` · ${formatDurationSeconds(totalDuration)}` : ""}
            {albumPayload.releaseDate ? ` · ${albumPayload.releaseDate}` : ""}
          </p>
          {firstPlayable?.mediaUrl ? (
            <a
              href={firstPlayable.mediaUrl}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[11px] font-extrabold text-white shadow-lg active:scale-95"
              style={{ background: "linear-gradient(160deg, #e7c97a, #c9a24a)" }}
            >
              <Play className="h-4 w-4 fill-current" />
              استمع الكل
            </a>
          ) : null}
          <HeroSpiritLedgerRow
            accent="#e7c97a"
            meditations={likeCount}
            broadcasts={shareCount}
            meditated={liked}
            meditateLabel="إعجاب"
            meditateSublabel="ادعم الألبوم"
            broadcastLabel="انتشار"
            broadcastSublabel="شارك الألبوم"
            meditateLeadingIcon={Heart}
            meditateLeadingIconColor="#fda4af"
            onMeditate={() => {
              setLiked((v) => !v);
              setLikeCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
            }}
            onBroadcast={() => {
              setShareCount((n) => n + 1);
              void sharePublisherPage(publisher);
            }}
            className="mt-1"
          />
        </div>
      </section>

      <section className="rounded-[22px] border border-[rgba(93,50,145,0.12)] bg-white/90 p-3 space-y-1">
        <h2 className="mb-2 text-right text-[12px] font-extrabold text-[#5D3291]">قائمة الترانيم</h2>
        {tracks.length ? (
          tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-2 rounded-xl border border-[rgba(93,50,145,0.08)] px-2.5 py-2"
            >
              {track.mediaUrl ? (
                <button
                  type="button"
                  onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center text-[11px] font-extrabold text-[#8a84a8]">
                  {index + 1}
                </span>
              )}
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[11px] font-extrabold text-[#3a3258]">{track.title}</p>
                <p className="text-[9px] font-bold text-[#8a84a8]">{formatDurationSeconds(track.durationSeconds)}</p>
              </div>
              {track.mediaUrl && album.allowDownload ? (
                <a href={track.mediaUrl} download className="shrink-0 p-1 text-[#5D3291]">
                  <Download className="h-4 w-4" />
                </a>
              ) : null}
              {playingId === track.id && track.mediaUrl ? (
                <audio controls autoPlay className="w-full mt-1" src={track.mediaUrl} />
              ) : null}
            </div>
          ))
        ) : album.mediaUrl ? (
          <audio controls preload="metadata" className="w-full" src={album.mediaUrl} />
        ) : (
          <p className="py-4 text-center text-[11px] font-bold text-[#6b658a]">لا توجد ترانيم مرتبطة بعد.</p>
        )}
      </section>

      <Link
        to="/publisher/$publisherId"
        params={{ publisherId: publisher.id }}
        className="block text-center text-[11px] font-extrabold text-[#5D3291] underline"
      >
        صفحة {publisher.name}
      </Link>
    </div>
  );
}
