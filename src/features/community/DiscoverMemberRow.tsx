import { Loader2, UserPlus } from "lucide-react";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import type { DiscoverMember } from "./discover-members-api";
import { cn } from "@/lib/utils";

type Props = {
  member: DiscoverMember;
  onOpen: () => void;
  onAdd: () => void;
  busy?: boolean;
};

export function DiscoverMemberRow({ member, onOpen, onAdd, busy }: Props) {
  const connected = member.connectionState === "connected";
  const pending = member.connectionState === "pending_sent";

  return (
    <div className="flex items-center gap-3 border-b border-alpha/70 px-4 py-4 last:border-b-0">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-right">
        <PrayerUserAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-extrabold text-alpha-heading">{member.name}</p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-alpha-muted">{member.churchName}</p>
          {member.serviceLabel ? (
            <p className="mt-0.5 truncate text-[12px] font-bold text-alpha-gold-deep/80">
              {member.serviceLabel}
            </p>
          ) : null}
          {member.mutualFriends > 0 ? (
            <p className="mt-1 text-[12px] font-bold text-alpha-muted">
              {member.mutualFriends} أصدقاء مشتركون
            </p>
          ) : null}
        </div>
      </button>

      {connected ? (
        <span className="shrink-0 rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 px-4 py-2 text-[13px] font-extrabold text-[#1f8a5a]">
          صديق
        </span>
      ) : pending ? (
        <span className="shrink-0 rounded-full border border-alpha-gold-bright/35 bg-alpha-gold-bright/10 px-3 py-2 text-[12px] font-extrabold text-alpha-gold-deep">
          تم إرسال الطلب
        </span>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onAdd}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-alpha-gold-bright/45 bg-alpha-surface px-4 py-2 text-[13px] font-extrabold text-alpha-gold-deep shadow-[var(--alpha-shadow-mini)] active:scale-95 disabled:opacity-50",
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          إضافة
        </button>
      )}
    </div>
  );
}
