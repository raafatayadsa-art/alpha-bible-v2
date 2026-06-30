import { SuggestedFriendCard } from "./SuggestedFriendCard";
import type { DiscoverMember } from "./discover-members-api";

type Props = {
  members: DiscoverMember[];
  onOpen: (member: DiscoverMember) => void;
  onAdd: (member: DiscoverMember) => void;
  onDismiss: (member: DiscoverMember) => void;
  busyId: string | null;
};

export function DiscoverNewMembersCarousel({ members, onOpen, onAdd, onDismiss, busyId }: Props) {
  if (!members.length) return null;

  return (
    <section className="mb-5">
      <h2 className="mb-3 px-0.5 text-[15px] font-extrabold text-alpha-heading">أعضاء جدد</h2>
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {members.map((member) => {
          const connected = member.connectionState === "connected";
          const pending = member.connectionState === "pending_sent";
          const busy = busyId === member.userId;

          return (
            <SuggestedFriendCard
              key={member.userId}
              name={member.name}
              avatarUrl={member.avatarUrl}
              subtitle={member.churchName}
              busy={busy}
              connected={connected}
              pending={pending}
              onOpen={() => onOpen(member)}
              onAdd={() => onAdd(member)}
              onDismiss={() => onDismiss(member)}
            />
          );
        })}
      </div>
    </section>
  );
}
