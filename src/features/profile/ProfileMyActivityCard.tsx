import { BookOpen, Crown, Flame, Star } from "lucide-react";
import { ProfileAccentIcon } from "./ProfileAccentIcon";
import type { ProfileActivitySummary } from "./useProfileActivitySummary";

const CELLS = [
  { key: "badges" as const, label: "الشارات", icon: Crown, accent: "#8a6ec1" },
  { key: "streakDays" as const, label: "أيام الاستمرار", icon: Flame, accent: "#c98a3c" },
  { key: "completedReadingPlans" as const, label: "خطط مكتملة", icon: BookOpen, accent: "#1f8a5a" },
  { key: "achievementPoints" as const, label: "نقاط الإنجاز", icon: Star, accent: "#5b8fd1" },
];

export function ProfileMyActivityCard({ summary }: { summary: ProfileActivitySummary }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 px-0.5 text-right text-[19px] font-extrabold text-alpha-heading">نشاطي</h2>
      <article className="overflow-hidden rounded-[20px] border border-alpha bg-alpha-surface p-4 shadow-[var(--alpha-shadow-mini)]">
        <div className="grid grid-cols-2 gap-3">
          {CELLS.map((cell) => {
            const value = summary[cell.key];
            const Icon = cell.icon;
            return (
              <div
                key={cell.key}
                className="flex items-center gap-3 rounded-[16px] border border-alpha/80 bg-alpha-base/40 px-3 py-3.5"
              >
                <ProfileAccentIcon icon={Icon} accent={cell.accent} size="md" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-mono text-[24px] font-extrabold tabular-nums leading-none text-alpha-heading">
                    {value}
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-alpha-muted">{cell.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
