import { Link } from "@tanstack/react-router";
import { ArrowRight, Trash2, UserPlus } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { toast } from "sonner";
import { CommunityActionFab } from "./CommunityActionFab";
import { CommunityPendingRequests } from "./CommunityPendingRequests";
import { CommunitySentRequests } from "./CommunitySentRequests";
import { removeCommunityContactRemote } from "./community-friends-api";
import { removeCommunityFriend, useCommunityFriends } from "./community-friends-store";

export function CommunityFriendsScreen() {
  const { friends, refresh } = useCommunityFriends();

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),12px)] pb-4">
          <Link
            to="/community"
            aria-label="رجوع"
            className="alpha-chrome-btn grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <ArrowRight className="h-5 w-5 text-alpha" strokeWidth={2.1} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-[17px] font-extrabold text-alpha-heading">أصدقائي</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-alpha-heading-muted">
              {friends.length} صديق في مجتمعك
            </p>
          </div>
          <Link
            to="/community/add-friend"
            aria-label="إضافة صديق"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 text-[#1f8a5a] active:scale-95"
          >
            <UserPlus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        </header>

        <CommunityPendingRequests onChanged={refresh} />
        <CommunitySentRequests onChanged={refresh} />

        {friends.length === 0 ? (
          <div className="mt-10 rounded-[22px] border border-[#e7c97a]/25 bg-white/75 px-5 py-10 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-[#1f8a5a]/70" strokeWidth={1.8} />
            <p className="mt-3 text-[15px] font-extrabold text-[#3a2a18]">لا يوجد أصدقاء بعد</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#6a543a]">
              أضف أصدقاء من كنيستك لمتابعة نشاطهم الروحي.
            </p>
            <Link
              to="/community/add-friend"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 px-4 py-2 text-[12px] font-extrabold text-[#1f8a5a]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              إضافة صديق
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-[18px] border border-[#e7c97a]/22 bg-white/82 px-3 py-3"
              >
                <PrayerUserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="md" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[14px] font-extrabold text-[#3a2a18]">{friend.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#7a6548]">
                    {friend.role ?? "صديق"}
                    {friend.alphaId ? ` · ${friend.alphaId}` : ""}
                  </p>
                </div>
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
