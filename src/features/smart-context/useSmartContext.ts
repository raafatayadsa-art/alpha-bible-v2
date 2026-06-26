import { useMemo } from "react";
import { CHURCH_POSTS } from "@/data/church-posts";
import { PRAYER_REQUESTS } from "@/data/prayer-requests";
import { useAlphaConnectHomeActivity } from "@/features/alpha-connect/useAlphaConnectHomeActivity";
import { useBibleJourney } from "@/features/bible-journey/useBibleJourney";
import { hasContinueReadingTarget, resolveContinueReadingView } from "@/lib/continue-reading-nav";
import { useCurrentSession } from "@/lib/reading-state";
import { pickSmartContextCard, buildSmartContextCandidates } from "./smart-context-engine";
import type { SmartContextCard } from "./types";

export function useSmartContext(): {
  card: SmartContextCard | null;
  candidates: SmartContextCard[];
  isLoading: boolean;
} {
  const session = useCurrentSession();
  const continueView = resolveContinueReadingView(session);
  const connect = useAlphaConnectHomeActivity();
  const { snapshot: journey, isLoading: journeyLoading } = useBibleJourney();

  const urgentPrayers = useMemo(
    () => PRAYER_REQUESTS.filter((p) => p.status === "urgent"),
    [],
  );

  const card = useMemo(() => {
    const input = {
      posts: CHURCH_POSTS,
      prayerUrgentCount: urgentPrayers.length,
      topPrayerTitle: urgentPrayers[0]?.title,
      continueReference: hasContinueReadingTarget(continueView) ? continueView.reference : undefined,
      continueProgress: continueView.progressPercent,
      continueBook: continueView.bookParam,
      continueChapter: continueView.chapter,
      connectActivityLine: connect.activityLine,
      connectHasActivity: connect.hasAnyActivity,
      unreadMessages: connect.unreadMessages,
      bibleJourneyPercent: journey?.biblePercent,
    };

    return pickSmartContextCard(input);
  }, [
    urgentPrayers,
    continueView,
    connect.activityLine,
    connect.hasAnyActivity,
    connect.unreadMessages,
    journey?.biblePercent,
  ]);

  const candidates = useMemo(() => {
    return buildSmartContextCandidates({
      posts: CHURCH_POSTS,
      prayerUrgentCount: urgentPrayers.length,
      topPrayerTitle: urgentPrayers[0]?.title,
      continueReference: hasContinueReadingTarget(continueView) ? continueView.reference : undefined,
      continueProgress: continueView.progressPercent,
      continueBook: continueView.bookParam,
      continueChapter: continueView.chapter,
      connectActivityLine: connect.activityLine,
      connectHasActivity: connect.hasAnyActivity,
      unreadMessages: connect.unreadMessages,
      bibleJourneyPercent: journey?.biblePercent,
    });
  }, [
    urgentPrayers,
    continueView,
    connect.activityLine,
    connect.hasAnyActivity,
    connect.unreadMessages,
    journey?.biblePercent,
  ]);

  return {
    card,
    candidates,
    isLoading: connect.loading || journeyLoading,
  };
}
