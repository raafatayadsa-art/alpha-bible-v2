import { Eye, Play } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import c1 from "@/assets/church-1.jpg";
import c2 from "@/assets/church-2.jpg";
import c3 from "@/assets/church-3.jpg";

const streams = [
  { img: c1, name: "كنيسة مارمرقس بالعباسية", title: "قداس الأحد الإلهي", viewers: "2.4K" },
  { img: c2, name: "كنيسة العذراء بشبرا", title: "اجتماع الترانيم الأسبوعي", viewers: "1.1K" },
  { img: c3, name: "كنيسة الأنبا أنطونيوس", title: "تسبحة نصف الليل", viewers: "832" },
];

export function LiveStreamSection() {
  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="بث مباشر الآن" />

      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {streams.map((s) => (
          <article
            key={s.name}
            className="glass-card relative w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl"
          >
            <div className="relative h-[140px]">
              <img
                src={s.img}
                alt={s.name}
                loading="lazy"
                width={800}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--live)] px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/30 shadow-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>

              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
                <Eye className="h-3 w-3" />
                {s.viewers}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-foreground">{s.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.title}</p>
              </div>
              <button className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(180,130,60,0.55)]">
                <Play className="h-3 w-3 fill-current" strokeWidth={0} />
                مشاهدة الآن
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="px-5 text-[11px] leading-relaxed text-muted-foreground">
        البث المباشر يظهر حسب كنيستك والصلاحيات
      </p>
    </section>
  );
}
