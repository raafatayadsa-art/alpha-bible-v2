import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ProfileAccentIcon } from "./ProfileAccentIcon";
import { cn } from "@/lib/utils";

export type ProfileSectionItem = {
  id: string;
  label: string;
  subtitle?: string;
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  accent: string;
  badge?: string;
};

export function ProfileSectionList({
  title,
  items,
}: {
  title: string;
  items: ProfileSectionItem[];
}) {
  if (!items.length) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 px-0.5 text-right text-[18px] font-extrabold text-alpha-heading">{title}</h2>
      <div className="overflow-hidden rounded-[20px] border border-alpha bg-alpha-surface shadow-[var(--alpha-shadow-mini)]">
        {items.map((item, index) => {
          const inner = (
            <>
              <ProfileAccentIcon icon={item.icon} accent={item.accent} size="sm" />
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[16px] font-extrabold text-alpha-heading">{item.label}</p>
                {item.subtitle ? (
                  <p className="mt-0.5 text-[13px] font-medium text-alpha-muted">{item.subtitle}</p>
                ) : null}
              </div>
              {item.badge ? (
                <span className="shrink-0 rounded-full bg-alpha-gold-bright/15 px-2.5 py-0.5 text-[12px] font-extrabold text-alpha-gold-deep">
                  {item.badge}
                </span>
              ) : null}
              <ChevronLeft className="h-5 w-5 shrink-0 text-alpha-muted/70" />
            </>
          );

          const className = cn(
            "flex w-full items-center gap-3 px-4 py-4 text-right transition active:bg-alpha-base/50",
            index < items.length - 1 && "border-b border-alpha/70",
          );

          if (item.to) {
            return (
              <Link key={item.id} to={item.to} className={className}>
                {inner}
              </Link>
            );
          }

          return (
            <button key={item.id} type="button" onClick={item.onClick} className={className}>
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
