import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { useMemberChurch } from "@/features/church/use-member-church";
import { CommunityActionFab } from "./CommunityActionFab";
import { CommunityAddFriendSheet } from "./CommunityAddFriendSheet";
import { CommunityMemberQuickSheet } from "./CommunityMemberQuickSheet";
import type { CommunityMemberPreview } from "./community-user-trust";
import { CommunityFabCoachMark } from "./CommunityFabCoachMark";
import { CommunityHubLinks } from "./CommunityHubLinks";
import { CommunityChurchPostCard } from "./CommunityChurchPostCard";
import { CommunityDailyVerseCard } from "./CommunityDailyVerseCard";
import { CommunityMomentCard } from "./CommunityMomentCard";
import { CommunityFeedInterstitial } from "./CommunityFeedInterstitial";
import { buildCommunityFeedItems } from "./community-feed-layout";
import { orderMomentsWithPins, usePinnedCommunityMomentIds } from "./community-moment-actions";
import {
  COMMUNITY_GLASS_BTN_ACCENT,
  COMMUNITY_GLASS_CARD,
  COMMUNITY_GLASS_ICON_BTN,
} from "./community-glass-chrome";
import { CommunityHomeHeader } from "./CommunityHomeHeader";
import { CommunityPendingRequests } from "./CommunityPendingRequests";
import { CommunityPeopleSuggestions } from "./CommunityPeopleSuggestions";
import { CommunityPrayerPreview } from "./CommunityPrayerPreview";
import { removeCommunityContactRemote } from "./community-friends-api";
import { removeCommunityFriend, useCommunityFriends } from "./community-friends-store";
import { syncCommunityFeed, useCommunityFriendFeed, bootstrapCommunityFeed } from "./community-store";
import { useCommunityPeopleSuggestions } from "./use-community-people-suggestions";
import { useDismissedFriendSuggestions } from "./use-dismissed-friend-suggestions";
import { sendFriendRequestFromUserId } from "./community-friends-api";
import { usePullToRefresh } from "./use-pull-to-refresh";

export function CommunityScreen() {
  const { friends, refresh: refreshFriends } = useCommunityFriends();
  const friendUserIds = useMemo(
    () => friends.map((f) => f.linkedUserId).filter(Boolean) as string[],
    [friends],
  );
  const moments = useCommunityFriendFeed(friendUserIds);
  const pinnedIds = usePinnedCommunityMomentIds();
  const feedMoments = useMemo(
    () => orderMomentsWithPins(moments).slice(0, 20),
    [moments, pinnedIds],
  );
  const feedItems = useMemo(() => buildCommunityFeedItems(feedMoments), [feedMoments]);
  const people = useCommunityPeopleSuggestions(12);
  const { dismiss, isDismissed } = useDismissedFriendSuggestions();
  const peopleFiltered = useMemo(() => {
    const friendNames = new Set(friends.map((f) => f.name.trim()));
    const friendIds = new Set(friends.map((f) => f.linkedUserId).filter(Boolean));
    return people.filter(
      (p) => !friendNames.has(p.name.trim()) && !friendIds.has(p.id) && !isDismissed(p.id),
    );
  }, [friends, people, isDismissed]);
  const { church } = useMemberChurch();
  const { posts } = useChurchPosts(church?.id ?? "");

  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [memberPreview, setMemberPreview] = useState<CommunityMemberPreview | null>(null);
  const [memberOpen, setMemberOpen] = useState(false);

  const openMember = useCallback((member: CommunityMemberPreview) => {
    setMemberPreview(member);
    setMemberOpen(true);
  }, []);

  const sendPersonRequest = useCallback(
    async (userId: string, name: string) => {
      setBusyId(userId);
      try {
        const outcome = await sendFriendRequestFromUserId(userId, "طلب صداقة من مجتمعي");
        if (outcome === "sent") {
          toast.success(`تم إرسال طلب إلى ${name}`);
          refreshFriends();
          return;
        }
        if (outcome === "invalid") {
          toast.error("معرّف العضو غير صالح");
          return;
        }
        toast.error("تعذّر إرسال الطلب");
      } finally {
        setBusyId(null);
      }
    },
    [refreshFriends],
  );

  const removeFriend = useCallback(
    (friend: { id: string; linkedUserId?: string; name: string }) => {
      void (async () => {
        if (friend.linkedUserId) {
          const ok = await removeCommunityContactRemote(friend.linkedUserId);
          if (!ok) {
            toast.error("تعذّرت إزالة الصديق");
            return;
          }
        } else {
          removeCommunityFriend(friend.id);
        }
        refreshFriends();
        toast.success(`تمت إزالة ${friend.name.split(" ")[0]} من القائمة`);
      })();
    },
    [refreshFriends],
  );

  const refreshFeed = useCallback(async () => {
    setRefreshing(true);
    try {
      refreshFriends();
      await syncCommunityFeed(church?.id);
    } finally {
      setRefreshing(false);
    }
  }, [church?.id, refreshFriends]);

  const { pulling, offset } = usePullToRefresh({ onRefresh: refreshFeed });

  useEffect(() => {
    bootstrapCommunityFeed();
    void syncCommunityFeed(church?.id);
  }, [church?.id, friendUserIds.join(",")]);

  const churchHighlights = useMemo(
    () => [...posts].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 4),
    [posts],
  );

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      {(pulling || refreshing) && offset > 0 ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center pt-[max(env(safe-area-inset-top),8px)]"
          style={{ transform: `translateY(${Math.min(offset, 48)}px)` }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7c97a]/35 bg-white/90 px-3 py-1 text-[10px] font-extrabold text-[#7a6548] shadow-sm">
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "جاري التحديث…" : "اسحب للتحديث"}
          </span>
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <CommunityHomeHeader />

        <CommunityPendingRequests compact onChanged={refreshFriends} />

        <section className="mt-2">
          <CommunityDailyVerseCard />
        </section>

        <CommunityPeopleSuggestions
          friends={friends}
          people={peopleFiltered}
          onAddPress={() => setAddFriendOpen(true)}
          onMemberPress={openMember}
          onPersonAdd={(id, name) => void sendPersonRequest(id, name)}
          onPersonDismiss={dismiss}
          onFriendRemove={removeFriend}
          busyId={busyId}
        />

        <CommunityHubLinks />

        <section className="mt-5">
          <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
            <h2 className="flex min-w-0 items-center gap-1.5 text-[15px] font-extrabold text-alpha-heading">
              <Sparkles className="h-4 w-4 shrink-0 text-[#c98a3c]" />
              النشاط الروحي لأصدقائك
            </h2>
            <div className="flex shrink-0 items-center gap-1.5">
              {friends.length > 0 ? (
                <Link to="/community/friends" className="text-[10px] font-bold text-alpha-heading-muted">
                  {friends.length} صديق
                </Link>
              ) : null}
              <button
                type="button"
                aria-label="تحديث النشاط"
                disabled={refreshing}
                onClick={() => void refreshFeed()}
                className={`grid h-8 w-8 ${COMMUNITY_GLASS_ICON_BTN} text-[#7a6548] disabled:opacity-50`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {feedMoments.length === 0 ? (
            <div className={`${COMMUNITY_GLASS_CARD} px-5 py-8 text-center`}>
              <Sparkles className="mx-auto h-10 w-10 text-[#c98a3c]/75" strokeWidth={1.8} />
              <p className="mt-3 text-[15px] font-extrabold text-[#3a2a18]">لا يوجد نشاط بعد</p>
              <p className="mt-2 text-[13px] leading-relaxed font-medium text-[#6a543a]">
                {friends.length === 0
                  ? "أضف أصدقاء من كنيستك لمتابعة نشاطهم الروحي."
                  : "شارك آية أو صلاة — سيظهر نشاطك هنا."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  to="/bible"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-extrabold text-[#5a3d92] ${COMMUNITY_GLASS_BTN_ACCENT("#8a6ec1")}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  الكتاب المقدس
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {feedItems.map((item) =>
                item.type === "moment" ? (
                  <CommunityMomentCard
                    key={item.moment.id}
                    moment={item.moment}
                    isPinned={pinnedIds.includes(item.moment.id)}
                    onMemberPress={openMember}
                  />
                ) : (
                  <CommunityFeedInterstitial key={item.id} variant={item.variant} />
                ),
              )}
            </div>
          )}
        </section>

        <CommunityPrayerPreview />

        {churchHighlights.length > 0 ? (
          <section className="mt-5">
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <h2 className="text-[15px] font-extrabold text-alpha-heading">من الكنيسة</h2>
              <Link to="/church" className="text-[11px] font-bold text-alpha-heading-muted">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-2.5">
              {churchHighlights.map((post) => (
                <CommunityChurchPostCard key={post.id} post={post} churchName={church?.name} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <CommunityFabCoachMark />
      <CommunityActionFab />
      <CommunityAddFriendSheet
        open={addFriendOpen}
        onClose={() => setAddFriendOpen(false)}
        onAdded={refreshFriends}
      />
      <CommunityMemberQuickSheet
        member={memberPreview}
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        onAdded={refreshFriends}
        onOpenAddMethods={() => {
          setMemberOpen(false);
          setAddFriendOpen(true);
        }}
      />
      <BottomDock />
    </div>
  );
}
