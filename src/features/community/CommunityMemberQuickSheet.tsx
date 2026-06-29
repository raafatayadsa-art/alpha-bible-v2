import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { AlphaShield } from "@/components/alpha/AlphaShield";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { getCurrentUser } from "@/features/church/current-user";
import { toast } from "sonner";
import { getCommunityFriends } from "./community-friends-store";
import { requestCommunityFriendConnection } from "./community-friends-api";
import type { CommunityMemberPreview } from "./community-user-trust";
import { CommunityShieldSheet } from "./CommunityShieldSheet";
import { COMMUNITY_SHIELD_INNER } from "./community-shield-chrome";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = {
  member: CommunityMemberPreview | null;
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  onOpenAddMethods?: () => void;
};

export function CommunityMemberQuickSheet({ member, open, onClose, onAdded, onOpenAddMethods }: Props) {
  const [busy, setBusy] = useState(false);

  if (!member) return null;

  const self = getCurrentUser();
  const isSelf = member.userId === self.id;
  const isFriend = getCommunityFriends().some(
    (f) => f.linkedUserId === member.userId || f.name.trim() === member.userName.trim(),
  );
  const hasRealUserId = Boolean(member.userId && UUID_RE.test(member.userId));

  const addFriend = async () => {
    if (isSelf || busy) return;

    if (hasRealUserId) {
      setBusy(true);
      try {
        const ok = await requestCommunityFriendConnection(member.userId!, "طلب صداقة من المجتمع");
        if (ok) {
          toast.success(`تم إرسال طلب صداقة إلى ${member.userName}`);
          onAdded?.();
          onClose();
        } else {
          toast.error("تعذّر إرسال الطلب");
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    onClose();
    onOpenAddMethods?.();
  };

  return (
    <CommunityShieldSheet
      open={open}
      onClose={onClose}
      title={member.userName}
      subtitle="عضو موثّق · Alpha"
      maxHeight="min(42dvh,340px)"
      variant="solid"
    >
      <div className="space-y-3">
        <div className={`flex items-center gap-3 px-3 py-3 ${COMMUNITY_SHIELD_INNER}`}>
          <div className="relative shrink-0">
            <PrayerUserAvatar name={member.userName} avatarUrl={member.userAvatarUrl} size="md" />
            <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border border-white/60 bg-white/90 shadow-sm">
              <AlphaShield
                role={member.shieldRole}
                size="sm"
                userName={member.userName}
                userAvatar={member.userAvatarUrl}
              />
            </span>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[14px] font-extrabold text-[#1F2937]">{member.userName}</p>
            {member.churchName ? (
              <p className="mt-0.5 text-[10px] font-semibold text-[#6B7280]">{member.churchName}</p>
            ) : null}
            {member.alphaId ? (
              <p className="mt-1 font-mono text-[10px] font-bold text-[#94A3B8]" dir="ltr">
                {member.alphaId}
              </p>
            ) : null}
          </div>
        </div>

        {!isSelf && !isFriend ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void addFriend()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 py-3.5 text-[13px] font-extrabold text-[#166534] active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            إضافة صديق
          </button>
        ) : isFriend ? (
          <p className="py-2 text-center text-[12px] font-bold text-[#6B7280]">صديقك بالفعل ✓</p>
        ) : null}
      </div>
    </CommunityShieldSheet>
  );
}
