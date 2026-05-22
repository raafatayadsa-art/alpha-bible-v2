import type { LucideIcon } from "lucide-react";
import { Pressable, IconBadge } from "./primitives";

export function QuickAccessCard({
  icon: Icon,
  title,
  subtitle,
  tone = "gold",
  to,
  params,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: "gold" | "purple" | "ivory";
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
}) {
  return (
    <Pressable to={to} params={params} onClick={onClick} ariaLabel={title} className="rounded-3xl">
      <div className="h-full rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] shadow-[0_10px_24px_-16px_rgba(120,80,30,0.4),inset_0_1px_0_rgba(255,255,255,0.75)] p-3 text-right">
        <IconBadge tone={tone} size={42}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </IconBadge>
        <h3 className="mt-2 text-[12.5px] font-extrabold text-[#3a2a18] leading-tight [word-break:keep-all]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[10.5px] leading-snug text-[#6a543a] [word-break:keep-all]">
            {subtitle}
          </p>
        )}
      </div>
    </Pressable>
  );
}

