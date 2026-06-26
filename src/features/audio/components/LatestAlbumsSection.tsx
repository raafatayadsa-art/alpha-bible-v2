import { Link } from "@tanstack/react-router";
import { Disc3 } from "lucide-react";
import type { DiscoveryContentItem } from "@/features/publisher/publisher-discovery-api";
import cardChurch from "@/assets/home/card-church.jpg";
import { SectionHeader } from "./SectionHeader";

type Props = {
  albums: DiscoveryContentItem[];
};

export function LatestAlbumsSection({ albums }: Props) {
  if (!albums.length) return null;

  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="أحدث الألبومات" />

      <div dir="rtl" className="grid grid-cols-2 gap-3 px-5">
        {albums.map((album) => {
          const cover = album.coverUrl?.trim() || cardChurch;
          return (
            <Link
              key={album.id}
              to="/publisher/$publisherId/album/$contentId"
              params={{ publisherId: album.publisherId, contentId: album.id }}
              className="group text-right"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl ring-1 ring-[var(--gold)]/20 shadow-[0_12px_30px_-12px_rgba(140,100,40,0.35)]">
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition group-active:scale-[0.98]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30">
                  <Disc3 className="h-4 w-4" />
                </span>
                <div className="absolute inset-x-2.5 bottom-2.5 text-white">
                  <p className="line-clamp-2 text-[12px] font-extrabold leading-tight">{album.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/80">{album.publisherName}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
