import { Loader2, UserPlus } from "lucide-react";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import type { DiscoverMember } from "./discover-members-api";
import { cn } from "@/lib/utils";

type Props = {
  members: DiscoverMember[];
  onOpen: (member: DiscoverMember) => void;
  onAdd: (member: DiscoverMember) => void;
  busyId: string | null;
};

export function DiscoverNewMembersCarousel({ members, onOpen, onAdd, busyId }: Props) {
  if (!members.length) return null;

  return (
    <section className="mb-5">
      <h2 className="mb-3 px-0.5 text-[15px] font-extrabold text-alpha-heading">أعضاء جدد</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {members.map((member) => {
          const connected = member.connectionState === "connected";
          const pending = member.connectionState === "pending_sent";
          const busy = busyId === member.userId;

          return (
            <article
              key={member.userId}
              className="flex w-[148px] shrink-0 flex-col items-center rounded-[18px] border border-alpha bg-alpha-surface px-3 py-4 shadow-[var(--alpha-shadow-mini)]"
            >
              <button type="button" onClick={() => onOpen(member)} className="flex flex-col items-center">
                <PrayerUserAvatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
                <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-center text-[13px] font-extrabold leading-snug text-alpha-heading">
                  {member.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-center text-[11px] font-medium text-alpha-muted">
                  {member.churchName}
                </p>
              </button>

              {connected ? (
                <span className="mt-3 rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 px-3 py-1.5 text-[11px] font-extrabold text-[#1f8a5a]">
                  صديق
                </span>
              ) : pending ? (
                <span className="mt-3 rounded-full border border-alpha-gold-bright/35 bg-alpha-gold-bright/10 px-2.5 py-1.5 text-[10px] font-extrabold text-alpha-gold-deep">
                  تم الإرسال
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onAdd(member)}
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 rounded-full border border-alpha-gold-bright/45 bg-alpha-base px-3 py-1.5 text-[11px] font-extrabold text-alpha-gold-deep active:scale-95 disabled:opacity-50",
                  )}
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  إضافة
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
