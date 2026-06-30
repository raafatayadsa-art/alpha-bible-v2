import type { LucideIcon } from "lucide-react";
import { BadgeCheck } from "lucide-react";

type Props = {
  kindLabel?: string;
  kindAccent?: string;
  KindIcon?: LucideIcon;
};

/** موثّق + نوع المنشور في صف واحد. */
export function CommunityCardBadges({ kindLabel, kindAccent = "#c98a3c", KindIcon }: Props) {
  return (
    <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-1.5 self-start">
      <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#1f8a5a]/30 bg-[#1f8a5a]/14 px-2 py-1 text-[9px] font-extrabold text-[#9fd4a8]">
        <BadgeCheck className="h-3 w-3" strokeWidth={2.4} />
        موثّق
      </span>
      {kindLabel && KindIcon ? (
        <span
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-extrabold"
          style={{
            borderColor: `${kindAccent}55`,
            color: kindAccent,
            background: `${kindAccent}18`,
          }}
        >
          <KindIcon className="h-3 w-3" strokeWidth={2.2} />
          {kindLabel}
        </span>
      ) : null}
    </div>
  );
}
