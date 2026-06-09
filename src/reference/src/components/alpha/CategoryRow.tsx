import {
  Bell,
  Users,
  UsersRound,
  Bus,
  HandHeart,
  Gift,
  Flame,
  BookOpen,
} from "lucide-react";
import type { CategoryKey } from "./types";

type Item = {
  key: CategoryKey;
  label: string;
  icon: typeof Bell;
  tone: string; // semantic accent token
};

const items: Item[] = [
  { key: "urgent", label: "عاجل", icon: Bell, tone: "urgent" },
  { key: "meeting", label: "اجتماعات", icon: Users, tone: "meeting" },
  { key: "trip", label: "اجتماعات", icon: UsersRound, tone: "primary" },
  { key: "trip", label: "رحلات", icon: Bus, tone: "trip" },
  { key: "prayer", label: "طلبات صلاة", icon: HandHeart, tone: "prayer" },
  { key: "celebration", label: "تعزية", icon: Flame, tone: "condolence" },
  { key: "celebration", label: "تهنئة", icon: Gift, tone: "celebration" },
  { key: "reflection", label: "تأملات", icon: BookOpen, tone: "reflection" },
];

const toneStyles: Record<string, { bg: string; fg: string; ring: string }> = {
  urgent: {
    bg: "bg-urgent-soft",
    fg: "text-urgent",
    ring: "ring-urgent/30",
  },
  meeting: {
    bg: "bg-meeting-soft",
    fg: "text-meeting",
    ring: "ring-meeting/30",
  },
  trip: { bg: "bg-trip-soft", fg: "text-trip", ring: "ring-trip/30" },
  prayer: { bg: "bg-prayer-soft", fg: "text-prayer", ring: "ring-prayer/30" },
  celebration: {
    bg: "bg-celebration-soft",
    fg: "text-celebration",
    ring: "ring-celebration/30",
  },
  condolence: {
    bg: "bg-condolence-soft",
    fg: "text-condolence",
    ring: "ring-condolence/30",
  },
  reflection: {
    bg: "bg-reflection-soft",
    fg: "text-reflection",
    ring: "ring-reflection/30",
  },
  primary: {
    bg: "bg-secondary",
    fg: "text-primary",
    ring: "ring-primary/20",
  },
};

export function CategoryRow({ active = "urgent" }: { active?: CategoryKey }) {
  return (
    <div className="mt-4">
      <div
        className="flex gap-2.5 overflow-x-auto no-scrollbar px-3 pb-2"
        dir="rtl"
      >
        {items.map((it, idx) => {
          const tone = toneStyles[it.tone];
          const isActive = it.key === active && idx === 0;
          return (
            <button
              key={`${it.key}-${idx}`}
              type="button"
              className={
                "shrink-0 w-[72px] h-[78px] rounded-2xl flex flex-col items-center justify-center gap-1 glass border border-border/60 shadow-soft transition " +
                (isActive ? "ring-2 " + tone.ring : "")
              }
            >
              <span
                className={
                  "w-9 h-9 rounded-xl flex items-center justify-center " +
                  tone.bg +
                  " " +
                  tone.fg
                }
              >
                <it.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </span>
              <span
                className={
                  "font-display font-bold text-[11px] " +
                  (isActive ? tone.fg : "text-foreground/80")
                }
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
