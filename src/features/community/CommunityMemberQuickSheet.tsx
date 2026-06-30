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
import {
  COMMUNITY_SHIELD_INNER,
  COMMUNITY_SHIELD_SHEET_MAX_HEIGHT,
} from "./community-shield-chrome";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = {
  member: CommunityMemberPreview | null;
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  onOpenAddMethods?: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${COMMUNITY_SHIELD_INNER}`}>
      <p className="text-[10px] font-bold text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 text-[13px] font-extrabold text-[#1F2937]">{value}</p>
    </div>
  );
}

export function CommunityMemberQuickSheet({ member, open, onClose, onAdded, onOpenAddMethods }: Props) {
  const [busy, setBusy] = useState(false);

  if (!open || !member) return null;

  const self = getCurrentUser();
  const isSelf = member.userId === self.id;
  const isFriend = getCommunityFriends().some(
    (f) => f.linkedUserId === member.userId || f.name.trim() === member.userName.trim(),
  );
  const hasRealUserId = Boolean(member.userId && UUID_RE.test(member.userId));
  const hasShield = Boolean(member.shieldRole);

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
      subtitle={hasShield ? "عضو موثّق · Alpha" : "عضو Alpha"}
      maxHeight={COMMUNITY_SHIELD_SHEET_MAX_HEIGHT}
      variant="solid"
    >
      <div className="space-y-3 pb-1">
        <div className={`flex flex-col items-center px-4 py-5 ${COMMUNITY_SHIELD_INNER}`}>
          {hasShield ? (
            <AlphaShield
              role={member.shieldRole!}
              size="lg"
              userName={member.userName}
              userAvatar={member.userAvatarUrl}
            />
          ) : (
            <div className="relative">
              <PrayerUserAvatar name={member.userName} avatarUrl={member.userAvatarUrl} size="lg" />
            </div>
          )}
          <p className="mt-3 text-center text-[16px] font-extrabold text-[#1F2937]">{member.userName}</p>
          {member.churchName ? (
            <p className="mt-1 text-center text-[12px] font-semibold text-[#6B7280]">{member.churchName}</p>
          ) : null}
          {member.alphaId ? (
            <p className="mt-1.5 font-mono text-[11px] font-bold text-[#94A3B8]" dir="ltr">
              {member.alphaId}
            </p>
          ) : null}
        </div>

        {member.role ? <DetailRow label="الدور / الخدمة" value={member.role} /> : null}
        {member.churchName ? <DetailRow label="الكنيسة" value={member.churchName} /> : null}
        <DetailRow
          label="التوثيق"
          value={hasShield ? "عضو كنسي موثّق · يظهر درع Alpha" : "بدون درع — غير منتسب لكنيسة"}
        />

        {!isSelf && !isFriend ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void addFriend()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 py-4 text-[14px] font-extrabold text-[#166534] active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            إضافة صديق
          </button>
        ) : isFriend ? (
          <p className="py-3 text-center text-[13px] font-bold text-[#6B7280]">صديقك بالفعل ✓</p>
        ) : null}
      </div>
    </CommunityShieldSheet>
  );
}
