import type { LucideIcon } from "lucide-react";
import type { BibleBookId } from "@/lib/bible-icons";
import { Pressable, GlassSurface, IconBadge } from "./primitives";
import { BookIcon } from "./BookIcon";

export function QuickAccessCard({
  icon: Icon,
  bookId,
  title,
  subtitle,
  tone = "gold",
  to,
  params,
  onClick,
}: {
  icon?: LucideIcon;
  bookId?: BibleBookId | string;
  title: string;
  subtitle?: string;
  tone?: "gold" | "purple" | "ivory";
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
}) {
  return (
    <Pressable to={to} params={params} onClick={onClick} ariaLabel={title} className="rounded-[var(--alpha-radius-card-compact)]">
      <GlassSurface tone={tone === "purple" ? "purple" : "warm"} className="h-full p-3 text-right">
        {bookId ? (
          <div className="h-[38px] w-[38px]">
            <BookIcon bookId={bookId} className="h-full w-full" />
          </div>
        ) : Icon ? (
          <IconBadge tone={tone} size={38}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </IconBadge>
        ) : (
          <div className="h-[38px] w-[38px]">
            <BookIcon className="h-full w-full" />
          </div>
        )}
        <h3 className="alpha-type-body mt-2 font-extrabold text-alpha-heading leading-tight [word-break:keep-all]">
          {title}
        </h3>
        {subtitle && (
          <p className="alpha-type-caption mt-0.5 leading-snug text-alpha-description line-clamp-2">
            {subtitle}
          </p>
        )}
      </GlassSurface>
    </Pressable>
  );
}
