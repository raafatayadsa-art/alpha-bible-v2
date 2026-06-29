import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { CommunityMemberQuickSheet } from "@/features/community/CommunityMemberQuickSheet";
import { useCommunityFriends } from "@/features/community/community-friends-store";
import { sendFriendRequestFromUserId } from "@/features/community/community-friends-api";
import { COMMUNITY_ROUTES } from "@/features/community/community-routes";
import type { CommunityMemberPreview } from "@/features/community/community-user-trust";
import { resolveCommunityMemberPreview } from "@/features/community/community-user-trust";
import { useCommunityPeopleSuggestions } from "@/features/community/use-community-people-suggestions";
import { cn } from "@/lib/utils";

type Tab = "friends" | "suggested";

const TABS: { key: Tab; label: string }[] = [
  { key: "friends", label: "أصدقائي" },
  { key: "suggested", label: "مقترحون" },
];

export function ProfileSuggestedFriendsSection() {
  const [tab, setTab] = useState<Tab>("suggested");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<CommunityMemberPreview | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { friends, refresh } = useCommunityFriends();
  const people = useCommunityPeopleSuggestions(16);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const suggested = useMemo(() => {
    const friendIds = new Set(friends.map((f) => f.linkedUserId).filter(Boolean));
    const friendNames = new Set(friends.map((f) => f.name.trim()));
    return people.filter((p) => !friendIds.has(p.id) && !friendNames.has(p.name.trim()));
  }, [friends, people]);

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

  const showSuggested = tab === "suggested";
  const listEmpty = showSuggested ? suggested.length === 0 : friends.length === 0;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <h2 className="text-[19px] font-extrabold text-alpha-heading">الأصدقاء</h2>
        <Link to={COMMUNITY_ROUTES.discover} className="text-[13px] font-extrabold text-alpha-gold-deep">
          اكتشف المزيد
        </Link>
      </div>

      <div className="mb-3 flex gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 rounded-full border px-3 py-2.5 text-[14px] font-extrabold transition active:scale-[0.98]",
                active
                  ? "border-alpha-gold-bright/45 bg-alpha-gold-bright/14 text-alpha-gold-deep"
                  : "border-alpha bg-alpha-surface text-alpha-muted",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-alpha bg-alpha-surface p-4 shadow-[var(--alpha-shadow-mini)]">
        <div className="-mx-1 flex gap-3.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showSuggested ? (
            <>
              <Link
                to={COMMUNITY_ROUTES.discover}
                className="flex w-[84px] shrink-0 flex-col items-center active:scale-[0.98]"
              >
                <div className="grid h-[62px] w-[62px] place-items-center rounded-full border-2 border-dashed border-alpha-gold-bright/50 bg-alpha-base/60">
                  <UserPlus className="h-7 w-7 text-alpha-gold-deep" strokeWidth={2.2} />
                </div>
                <p className="mt-2 w-full truncate text-center text-[13px] font-extrabold text-alpha-heading">
                  اكتشف
                </p>
              </Link>

              {suggested.map((person) => (
                <div key={person.id} className="flex w-[84px] shrink-0 flex-col items-center">
                  <button
                    type="button"
                    onClick={() =>
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
                    className="active:scale-95"
                  >
                    <PrayerUserAvatar name={person.name} avatarUrl={person.avatarUrl} size="lg" />
                  </button>
                  <p className="mt-2 w-full truncate text-center text-[13px] font-extrabold text-alpha-heading">
                    {person.name.split(" ")[0]}
                  </p>
                  <p className="mt-0.5 line-clamp-2 min-h-[2rem] w-full text-center text-[11px] font-semibold leading-snug text-alpha-muted">
                    {person.role}
                  </p>
                  <button
                    type="button"
                    disabled={busyId === person.id}
                    onClick={() => void sendRequest(person.id, person.name)}
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-alpha-gold-bright/40 bg-alpha-base px-2.5 py-1 text-[11px] font-extrabold text-alpha-gold-deep active:scale-95 disabled:opacity-50"
                  >
                    {busyId === person.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                    إضافة
                  </button>
                </div>
              ))}
            </>
          ) : (
            friends.map((friend) => (
              <Link
                key={friend.id}
                to="/community/friends"
                className="flex w-[84px] shrink-0 flex-col items-center active:scale-[0.98]"
              >
                <PrayerUserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="lg" />
                <p className="mt-2 w-full truncate text-center text-[13px] font-extrabold text-alpha-heading">
                  {friend.name.split(" ")[0]}
                </p>
                <p className="mt-0.5 w-full truncate text-center text-[11px] font-semibold text-alpha-muted">
                  {friend.role ?? "صديق"}
                </p>
              </Link>
            ))
          )}
        </div>

        {listEmpty ? (
          <p className="pt-2 text-center text-[13px] font-semibold text-alpha-muted">
            {showSuggested ? "لا مقترحات حالياً — جرّب اكتشف أعضاء" : "لا أصدقاء بعد — أضف من المقترحين"}
          </p>
        ) : null}
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
