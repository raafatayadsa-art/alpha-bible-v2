import { useMemo } from "react";
import { buildBibleJourneySnapshot } from "@/features/bible-journey/journey-engine";
import { useSpiritualRecord } from "@/features/community/spiritual-record-store";
import { useMyProfileContributions } from "./profile-contributions-api";

export type ProfileActivitySummary = {
  badges: number;
  streakDays: number;
  completedReadingPlans: number;
  achievementPoints: number;
};

export function useProfileActivitySummary(): ProfileActivitySummary {
  const spiritual = useSpiritualRecord();
  const { data: contributions } = useMyProfileContributions();

  return useMemo(() => {
    let completedReadingPlans = 0;
    try {
      const journey = buildBibleJourneySnapshot();
      completedReadingPlans = journey.completedBooks;
    } catch {
      completedReadingPlans = 0;
    }

    const badges = Math.max(1, Math.min(12, (contributions?.saintImages?.length ?? 0) + 2));
    const streakDays = Math.max(spiritual.overallStreak, spiritual.readingStreak);
    const achievementPoints =
      (contributions?.total ?? 0) * 15 + streakDays * 10 + completedReadingPlans * 25;

    return {
      badges,
      streakDays,
      completedReadingPlans,
      achievementPoints,
    };
  }, [contributions, spiritual]);
}
