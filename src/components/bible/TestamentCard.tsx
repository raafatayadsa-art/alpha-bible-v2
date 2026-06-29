import { useState } from "react";
import { ChevronLeft, Scroll, Cross } from "lucide-react";
import { Pressable, GlassSurface } from "./primitives";
import { cn } from "@/lib/utils";

export function TestamentCard({
  title,
  subtitle,
  count,
  tone = "gold",
  to,
  search,
  heroImage,
  compact = false,
}: {
  title: string;
  subtitle: string;
  count: number;
  tone?: "gold" | "purple";
  to?: string;
  search?: Record<string, unknown>;
  heroImage?: string;
  compact?: boolean;
}) {
  const isPurple = tone === "purple";
  const [imgOk, setImgOk] = useState(true);
  const showImg = heroImage && imgOk;

  return (
    <Pressable to={to} search={search} ariaLabel={title} className={cn("rounded-[var(--alpha-radius-hero)]", compact && "h-full")}>
      <GlassSurface tone={isPurple ? "purple" : "warm"} className="overflow-hidden p-0 h-full flex flex-col">
        <div className="relative flex-1 min-h-[132px] overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: isPurple
                ? "linear-gradient(165deg, #f3ecfb 0%, #dccdf3 40%, #b8a0e0 75%, #8c6fd1 100%)"
                : "linear-gradient(165deg, #fff8e9 0%, #f5e0a8 35%, #e7c07a 70%, #c79356 100%)",
            }}
          />
          {showImg && (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
              onError={() => setImgOk(false)}
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: isPurple
                ? "linear-gradient(180deg, rgba(243,236,251,0.15) 0%, rgba(60,40,90,0.55) 100%)"
                : "linear-gradient(180deg, rgba(255,248,233,0.1) 0%, rgba(120,80,30,0.45) 100%)",
            }}
          />
          <div className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-[var(--alpha-radius-dock-tab)] bg-white/50 border border-white/70 shadow-[var(--alpha-shadow-featured)] backdrop-blur-sm">
            {isPurple ? (
              <Scroll className="h-5 w-5 text-[var(--alpha-purple)]" strokeWidth={2.2} />
            ) : (
              <Cross className="h-5 w-5 text-alpha-gold-deep" strokeWidth={2.2} />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[color-mix(in_srgb,var(--alpha-bg-elevated)_95%,transparent)] to-transparent" />
        </div>
        <div className="flex items-end justify-between gap-2 px-3.5 pb-3.5 pt-1">
          <div className="min-w-0 flex-1 text-right">
            <h3 className="alpha-type-h2 font-arabic-serif text-alpha-heading leading-tight">
              {title}
            </h3>
            <span
              className={cn(
                "alpha-tag mt-1.5 inline-flex font-extrabold",
                isPurple
                  ? "bg-[color-mix(in_srgb,var(--alpha-purple)_12%,transparent)] text-[var(--alpha-purple)] border border-[color-mix(in_srgb,var(--alpha-purple)_30%,transparent)]"
                  : "bg-alpha-gold/15 text-alpha-gold-deep border border-alpha-gold/40",
              )}
            >
              {count} سفر
            </span>
            <p className="alpha-type-caption mt-1.5 leading-snug text-alpha-description line-clamp-2">
              {subtitle}
            </p>
          </div>
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/85 border border-alpha text-alpha-gold-deep shadow-[var(--alpha-shadow-normal)]"
            aria-hidden
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </div>
        </div>
      </GlassSurface>
    </Pressable>
  );
}
