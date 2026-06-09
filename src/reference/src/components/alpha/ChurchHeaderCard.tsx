import { Phone, MessageCircle, Heart } from "lucide-react";
import type { Church } from "./types";

export function ChurchHeaderCard({ church }: { church: Church }) {
  return (
    <div className="relative mx-3 mt-1">
      <div className="relative rounded-[28px] overflow-hidden shadow-luxe border border-border/60">
        <img
          src={church.coverImageUrl}
          alt={church.name}
          className="w-full h-[200px] object-cover"
          width={1024}
          height={640}
        />
        {/* warm wash for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0.05) 0%, oklch(0.98 0.02 80 / 0.55) 60%, oklch(0.98 0.02 80 / 0.92) 100%)",
          }}
        />

        {/* Floating glass action buttons */}
        <button
          type="button"
          aria-label="اتصال"
          className="absolute top-3 right-3 w-12 h-12 rounded-2xl glass shadow-luxe border border-white/60 flex flex-col items-center justify-center"
        >
          <Phone className="w-4 h-4 text-foreground" />
          <span className="font-display text-[9px] mt-0.5 text-foreground/80">
            اتصال
          </span>
        </button>
        <button
          type="button"
          aria-label="رسائل"
          className="absolute top-3 left-3 w-12 h-12 rounded-2xl glass shadow-luxe border border-white/60 flex flex-col items-center justify-center"
        >
          <MessageCircle className="w-4 h-4 text-foreground" />
          <span className="font-display text-[9px] mt-0.5 text-foreground/80">
            رسائل
          </span>
        </button>

        {/* Church identity */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 text-center">
          <h1 className="font-display font-black text-[22px] leading-tight text-foreground">
            {church.name}
          </h1>
          <p className="font-display text-[12px] text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            <span className="text-primary/60">✦</span>
            {church.diocese}
            <span className="text-primary/60">✦</span>
          </p>

          <div className="mt-2 inline-flex items-center gap-2 bg-card/80 backdrop-blur rounded-full pr-1 pl-3 py-1 shadow-soft border border-border/70">
            <img
              src={church.priest.imageUrl}
              alt={church.priest.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-card"
              width={56}
              height={56}
              loading="lazy"
            />
            <span className="font-display font-bold text-[12px] text-foreground">
              {church.priest.name}
            </span>
          </div>

          <p className="font-display text-[11px] text-foreground/70 mt-1 inline-flex items-center gap-1 justify-center">
            <Heart className="w-3 h-3 text-prayer fill-prayer/40" />
            {church.greeting}
          </p>
        </div>
      </div>
    </div>
  );
}
