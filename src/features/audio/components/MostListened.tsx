import { Play } from "lucide-react";
import { audioTrackImages } from "../audio-assets";
import { SectionHeader } from "./SectionHeader";

const items = [
  { rank: 1, img: audioTrackImages[0], title: "حياة الصلاة الحقيقية", speaker: "البابا شنودة الثالث" },
  { rank: 2, img: audioTrackImages[1], title: "كيف نسمع صوت الله", speaker: "أبونا داود لمعي" },
  { rank: 3, img: audioTrackImages[2], title: "سر التوبة والاعتراف", speaker: "أبونا بيشوي كامل" },
  { rank: 4, img: audioTrackImages[3], title: "رحلة الصوم الأربعيني", speaker: "أبونا تادرس يعقوب" },
  { rank: 5, img: audioTrackImages[4], title: "الخدمة الروحية", speaker: "أبونا متى المسكين" },
];

export function MostListened() {
  return (
    <section className="mt-8 space-y-3 pb-4">
      <SectionHeader title="الأكثر استماعًا" />

      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {items.map((it) => (
          <article
            key={it.rank}
            className="glass-card flex w-[260px] shrink-0 snap-start items-center gap-3 rounded-3xl p-3"
          >
            <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-[var(--gold)]/20">
              <img src={it.img} alt="" loading="lazy" width={400} height={400} className="h-full w-full object-cover" />
              <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-[10px] font-black text-white ring-2 ring-[var(--ivory)]">
                {it.rank}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-foreground">{it.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{it.speaker}</p>
            </div>

            <button
              type="button"
              aria-label="تشغيل"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_6px_16px_-6px_rgba(180,130,60,0.55)] active:scale-95"
            >
              <Play className="h-4 w-4 translate-x-[0.5px] fill-current" strokeWidth={0} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
