import { Link, useRouter } from "@tanstack/react-router";
import { Trash2, UserPlus, X } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { toast } from "sonner";
import { CommunityActionFab } from "./CommunityActionFab";
import { CommunityPendingRequests } from "./CommunityPendingRequests";
import { CommunitySentRequests } from "./CommunitySentRequests";
import { removeCommunityContactRemote } from "./community-friends-api";
import { removeCommunityFriend, useCommunityFriends } from "./community-friends-store";
import { COMMUNITY_ROUTES } from "./community-routes";

export function CommunityFriendsScreen() {
  const router = useRouter();
  const { friends, refresh } = useCommunityFriends();

  const closeScreen = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    void router.navigate({ to: "/profile" });
  };

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),12px)] pb-4">
          <button
            type="button"
            onClick={closeScreen}
            aria-label="إغلاق"
            className="alpha-chrome-btn grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <X className="h-5 w-5 text-alpha" strokeWidth={2.2} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-[18px] font-extrabold text-alpha-heading">أصدقائي</h1>
            <p className="mt-0.5 text-[12px] font-semibold text-alpha-heading-muted">
              {friends.length} {friends.length === 1 ? "صديق" : "أصدقاء"}
            </p>
          </div>
          <Link
            to={COMMUNITY_ROUTES.addFriend}
            aria-label="إضافة صديق"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 text-[#1f8a5a] active:scale-95"
          >
            <UserPlus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        </header>

        <CommunityPendingRequests onChanged={refresh} />
        <CommunitySentRequests onChanged={refresh} />

        {friends.length === 0 ? (
          <div className="mt-6 rounded-[22px] border border-alpha bg-alpha-surface px-5 py-10 text-center shadow-[var(--alpha-shadow-mini)]">
            <UserPlus className="mx-auto h-10 w-10 text-[#1f8a5a]/70" strokeWidth={1.8} />
            <p className="mt-3 text-[16px] font-extrabold text-alpha-heading">لا يوجد أصدقاء بعد</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-alpha-muted">
              أضف أصدقاء من كنيستك لمتابعة نشاطهم الروحي.
            </p>
            <Link
              to={COMMUNITY_ROUTES.addFriend}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 px-5 py-2.5 text-[13px] font-extrabold text-[#1f8a5a] active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              أضف أصدقاء
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-[16px] border border-transparent px-1 py-2.5 active:bg-alpha-base/40"
              >
                <button
                  type="button"
                  aria-label={`إزالة ${friend.name}`}
                  onClick={() => {
                    void (async () => {
                      if (friend.linkedUserId) {
                        const ok = await removeCommunityContactRemote(friend.linkedUserId);
                        if (!ok) {
                          toast.error("تعذّرت إزالة الصديق من الخادم");
                          return;
                        }
                      } else {
                        removeCommunityFriend(friend.id);
                      }
                      refresh();
                      toast.success("تمت إزالة الصديق");
                    })();
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-red-200/60 bg-red-50/80 text-red-600 active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.1} />
                </button>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[15px] font-extrabold text-alpha-heading">{friend.name}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-alpha-muted">
                    {friend.role ?? "صديق"}
                    {friend.alphaId ? ` · ${friend.alphaId}` : ""}
                  </p>
                </div>
                <PrayerUserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="md" />
              </div>
            ))}
          </div>
        )}
      </div>

      <CommunityActionFab />
      <BottomDock />
    </div>
  );
}
