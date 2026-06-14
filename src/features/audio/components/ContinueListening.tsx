import { MoreVertical, Play } from "lucide-react";
import { audioThumb } from "../audio-assets";
import { SectionHeader } from "./SectionHeader";

export function ContinueListening() {
  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="أكمل الاستماع" action="" />

      <div className="px-5">
        <div className="glass-card flex items-center gap-3 rounded-3xl p-3">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-[var(--gold)]/25">
            <img src={audioThumb} alt="" loading="lazy" width={800} height={600} className="h-full w-full object-cover" />
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <Play className="h-6 w-6 fill-white text-white" strokeWidth={0} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-foreground">عشت معك يا رب</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">القمص داود لمعي</p>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--gold)]/15">
                <span className="absolute inset-y-0 right-0 w-[62%] rounded-full bg-gradient-to-l from-[var(--gold-soft)] to-[var(--gold-deep)]" />
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                18:42 / 30:15
              </span>
            </div>
          </div>

          <button aria-label="المزيد" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-[var(--gold)]/10">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
