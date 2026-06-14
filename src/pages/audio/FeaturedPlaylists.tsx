import { Headphones } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import p1 from "@/assets/playlist-1.jpg";
import p2 from "@/assets/playlist-2.jpg";
import p3 from "@/assets/playlist-3.jpg";

const playlists = [
  { img: p1, title: "رحلة الصوم الكبير", count: 42 },
  { img: p2, title: "أسبوع الآلام", count: 28 },
  { img: p2, title: "القيامة المجيدة", count: 36 },
  { img: p3, title: "رحلة التوبة", count: 19 },
  { img: p3, title: "استعداد للتناول", count: 14 },
];

export function FeaturedPlaylists() {
  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="قوائم مميزة" />

      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {playlists.map((p, i) => (
          <button
            key={i}
            className="group relative w-[160px] shrink-0 snap-start text-right"
          >
            <div className="relative h-[200px] w-full overflow-hidden rounded-3xl ring-1 ring-[var(--gold)]/20 shadow-[0_12px_30px_-12px_rgba(140,100,40,0.35)]">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={600}
                height={600}
                className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30">
                <Headphones className="h-4 w-4" />
              </span>
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="line-clamp-2 text-[13px] font-bold leading-tight">{p.title}</p>
                <p className="mt-1 text-[10px] text-white/80">{p.count} مادة</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
