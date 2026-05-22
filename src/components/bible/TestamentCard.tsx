import { ChevronLeft } from "lucide-react";
import { Pressable, GlassSurface, PlaceholderArt } from "./primitives";

export function TestamentCard({
  title,
  subtitle,
  count,
  tone = "gold",
  to,
  testament,
}: {
  title: string;
  subtitle: string;
  count: number;
  tone?: "gold" | "purple";
  to?: string;
  /** Optional filter passed to /books via search params */
  testament?: "ot" | "nt";
}) {
  return (
    <Pressable
      to={to}
      search={testament ? { t: testament } : undefined}
      ariaLabel={title}
      className="rounded-[28px]"
    >
      <GlassSurface tone={tone === "purple" ? "purple" : "warm"} className="overflow-hidden p-0">
        <div className="relative">
          <PlaceholderArt
            tone={tone}
            label={title}
            rounded="rounded-none"
            className="h-32 w-full"
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fbf3e1] to-transparent" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-2">
          <div className="min-w-0 text-right">
            <h3 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18] leading-tight">
              {title}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">
              {subtitle} · <span className="font-bold text-[#7a4a26]">{count} سفر</span>
            </p>
          </div>
          <div
            className="grid h-9 w-9 place-items-center rounded-full bg-white/85 border border-[#efe2c4] text-[#7a4a26] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.45)]"
            aria-hidden
          >
            <ChevronLeft className="h-4 w-4" />
          </div>
        </div>
      </GlassSurface>
    </Pressable>
  );
}

