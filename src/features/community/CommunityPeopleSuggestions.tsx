import { UserPlus } from "lucide-react";
import type { CommunityFriend } from "./community-friends-store";
import type { CommunityPersonSuggestion } from "./use-community-people-suggestions";
import type { CommunityMemberPreview } from "./community-user-trust";
import { resolveCommunityMemberPreview } from "./community-user-trust";
import { CommunityPersonAvatarChip } from "./CommunityPersonAvatarChip";

type Props = {
  friends: CommunityFriend[];
  people: CommunityPersonSuggestion[];
  onAddPress: () => void;
  onMemberPress: (member: CommunityMemberPreview) => void;
  onPersonAdd: (userId: string, name: string) => void;
  onPersonDismiss: (userId: string) => void;
  onFriendRemove: (friend: CommunityFriend) => void;
  busyId?: string | null;
};

function AddFriendTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[88px] shrink-0 flex-col items-center active:scale-[0.98]"
      aria-label="إضافة صديق"
    >
      <div className="grid h-[56px] w-[56px] place-items-center rounded-full border-2 border-dashed border-alpha-gold-bright/55 bg-alpha-base/60">
        <UserPlus className="h-6 w-6 text-alpha-gold-deep" strokeWidth={2.2} />
      </div>
      <p className="mt-1.5 w-full truncate text-center text-[11px] font-extrabold text-alpha-heading">إضافة</p>
    </button>
  );
}

export function CommunityPeopleSuggestions({
  friends,
  people,
  onAddPress,
  onMemberPress,
  onPersonAdd,
  onPersonDismiss,
  onFriendRemove,
  busyId = null,
}: Props) {
  const hasContent = friends.length > 0 || people.length > 0;

  const openPerson = (person: CommunityPersonSuggestion) => {
    onMemberPress(
      resolveCommunityMemberPreview({
        userId: person.id,
        userName: person.name,
        userAvatarUrl: person.avatarUrl,
        churchName: person.role,
        role: person.role,
        roleType: person.roleType,
      }),
    );
  };

  const openFriend = (friend: CommunityFriend) => {
    onMemberPress(
      resolveCommunityMemberPreview({
        userId: friend.linkedUserId ?? friend.id,
        userName: friend.name,
        userAvatarUrl: friend.avatarUrl,
        churchName: friend.role,
        role: friend.role,
      }),
    );
  };

  return (
    <section className="mt-3">
      <div className="mb-2.5 px-0.5">
        <h2 className="text-[15px] font-extrabold text-alpha-heading">
          {friends.length && people.length
            ? "أصدقاؤك · قد تعرفهم"
            : friends.length
              ? "أصدقاؤك"
              : "أشخاص قد تعرفهم"}
        </h2>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-1 no-scrollbar">
        <AddFriendTile onClick={onAddPress} />

        {friends.map((friend) => (
          <CommunityPersonAvatarChip
            key={friend.id}
            name={friend.name}
            avatarUrl={friend.avatarUrl}
            subtitle={friend.role ?? "صديق"}
            showDismiss
            onOpen={() => openFriend(friend)}
            onDismiss={() => onFriendRemove(friend)}
          />
        ))}

        {people.map((person) => (
          <CommunityPersonAvatarChip
            key={person.id}
            name={person.name}
            avatarUrl={person.avatarUrl}
            subtitle={person.role}
            showQuickAdd
            showDismiss
            busy={busyId === person.id}
            onOpen={() => openPerson(person)}
            onQuickAdd={() => onPersonAdd(person.id, person.name)}
            onDismiss={() => onPersonDismiss(person.id)}
          />
        ))}

        {!hasContent ? (
          <div className="flex min-w-[140px] shrink-0 flex-col justify-center px-2">
            <p className="text-[11px] font-semibold leading-snug text-alpha-heading-muted">
              + على الصورة للإضافة · X للإخفاء · اضغط الصورة للكارت
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
