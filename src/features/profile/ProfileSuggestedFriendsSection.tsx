import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CommunityMemberQuickSheet } from "@/features/community/CommunityMemberQuickSheet";
import { FriendsHubPills } from "@/features/community/FriendsHubPills";
import { SuggestedFriendCard } from "@/features/community/SuggestedFriendCard";
import { useCommunityFriends } from "@/features/community/community-friends-store";
import { sendFriendRequestFromUserId } from "@/features/community/community-friends-api";
import type { CommunityMemberPreview } from "@/features/community/community-user-trust";
import { resolveCommunityMemberPreview } from "@/features/community/community-user-trust";
import { useCommunityPeopleSuggestions } from "@/features/community/use-community-people-suggestions";
import { useDismissedFriendSuggestions } from "@/features/community/use-dismissed-friend-suggestions";

export function ProfileSuggestedFriendsSection() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<CommunityMemberPreview | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { friends, refresh } = useCommunityFriends();
  const people = useCommunityPeopleSuggestions(16);
  const { dismiss, isDismissed } = useDismissedFriendSuggestions();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const suggested = useMemo(() => {
    const friendIds = new Set(friends.map((f) => f.linkedUserId).filter(Boolean));
    const friendNames = new Set(friends.map((f) => f.name.trim()));
    return people.filter(
      (p) => !friendIds.has(p.id) && !friendNames.has(p.name.trim()) && !isDismissed(p.id),
    );
  }, [friends, people, isDismissed]);

  const openMember = useCallback((member: CommunityMemberPreview) => {
    setPreview(member);
    setSheetOpen(true);
  }, []);

  const sendRequest = useCallback(
    async (userId: string, name: string) => {
      setBusyId(userId);
      try {
        const outcome = await sendFriendRequestFromUserId(userId, "طلب صداقة من الملف الشخصي");
        if (outcome === "sent") {
          toast.success(`تم إرسال طلب إلى ${name}`);
          await refresh();
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
    [refresh],
  );

  return (
    <section className="mb-6">
      <FriendsHubPills friendsCount={friends.length} className="mb-5" />

      <h2 className="mb-3 px-0.5 text-[17px] font-extrabold text-alpha-heading">أشخاص قد تعرفهم</h2>

      <div className="rounded-[20px] border border-alpha bg-alpha-surface p-4 pt-5 shadow-[var(--alpha-shadow-mini)]">
        {suggested.length > 0 ? (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggested.map((person) => (
              <SuggestedFriendCard
                key={person.id}
                name={person.name}
                avatarUrl={person.avatarUrl}
                subtitle={person.role}
                busy={busyId === person.id}
                onOpen={() =>
                  openMember(
                    resolveCommunityMemberPreview({
                      userId: person.id,
                      userName: person.name,
                      userAvatarUrl: person.avatarUrl,
                      churchName: person.role,
                      role: person.role,
                      roleType: person.roleType,
                    }),
                  )
                }
                onAdd={() => void sendRequest(person.id, person.name)}
                onDismiss={() => dismiss(person.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] font-semibold text-alpha-muted">
            لا مقترحات حالياً — جرّب «أضف أصدقاء» للبحث
          </p>
        )}
      </div>

      <CommunityMemberQuickSheet
        member={preview}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdded={() => void refresh()}
      />
    </section>
  );
}
