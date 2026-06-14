import { Play, Headphones } from "lucide-react";
import { audioHero } from "../audio-assets";

export function HeroCard() {
  return (
    <section className="px-5">
      <div className="relative h-[260px] overflow-hidden rounded-[28px] gold-glow">
        <img
          src={audioHero}
          alt="ترنيمة ربي مرافق دربي"
          className="absolute inset-0 h-full w-full object-cover"
          width={1280}
          height={768}
        />
        {/* warm gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/15 via-transparent to-transparent" />

        {/* badge */}
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/20">
          <Headphones className="h-3.5 w-3.5" />
          استمع الآن
        </div>

        {/* category */}
        <div className="absolute right-4 top-[60px] inline-flex items-center rounded-full bg-[var(--gold)]/85 px-2.5 py-1 text-[10px] font-bold text-[var(--ink)] ring-1 ring-white/40">
          ترنيمة
        </div>

        {/* text + controls */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black leading-tight">ربي مرافق دربي</h2>
              <p className="mt-1 text-sm text-white/85">فريق قلب داود</p>

              {/* waveform */}
              <div className="mt-4 flex items-end gap-[3px]">
                {Array.from({ length: 34 }).map((_, i) => {
                  const h = [10, 18, 26, 14, 22, 30, 16, 20, 12, 28][i % 10];
                  const active = i < 14;
                  return (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-[3px] rounded-full ${active ? "bg-[var(--gold-soft)]" : "bg-white/35"}`}
                    />
                  );
                })}
                <span className="ms-2 text-[11px] font-medium tabular-nums text-white/85">04:32</span>
              </div>
            </div>

            <button
              aria-label="تشغيل"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_10px_30px_-6px_rgba(180,130,60,0.6)] ring-1 ring-white/40 transition active:scale-95"
            >
              <Play className="h-6 w-6 translate-x-[1px] fill-current" strokeWidth={0} />
            </button>
          </div>
        </div>
      </div>

      {/* page indicators */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-5 rounded-full bg-[var(--gold-deep)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/40" />
      </div>
    </section>
  );
}
