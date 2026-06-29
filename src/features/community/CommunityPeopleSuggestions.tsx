import { Link } from "@tanstack/react-router";
import { Plus, UserPlus } from "lucide-react";
import type { CommunityFriend } from "./community-friends-store";
import type { CommunityPersonSuggestion } from "./use-community-people-suggestions";
import type { CommunityMemberPreview } from "./community-user-trust";
import { resolveCommunityMemberPreview } from "./community-user-trust";

const ROLE_TONES = ["#1f8a5a", "#8a6ec1", "#c98a3c", "#5b8fd1", "#c44569"];

function CircleAvatar({
  name,
  avatarUrl,
  initials,
  tone,
  dashed,
  onClick,
}: {
  name: string;
  avatarUrl?: string;
  initials: string;
  tone: string;
  dashed?: boolean;
  onClick?: () => void;
}) {
  const className = dashed
    ? "grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[#c98a3c]/55 bg-white/50"
    : avatarUrl
      ? "h-14 w-14 rounded-full border-2 border-white object-cover shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
      : "grid h-14 w-14 place-items-center rounded-full border-2 border-white font-arabic-serif text-[15px] font-extrabold text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]";

  const style = !dashed && !avatarUrl ? { background: `linear-gradient(145deg, ${tone}, #2a1f45)` } : undefined;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block shrink-0 active:scale-95" aria-label={name}>
        {dashed ? (
          <div className={className}>
            <UserPlus className="h-6 w-6 text-[#c98a3c]" strokeWidth={2.2} />
          </div>
        ) : avatarUrl ? (
          <img src={avatarUrl} alt={name} className={className} />
        ) : (
          <div className={className} style={style}>
            {initials}
          </div>
        )}
      </button>
    );
  }

  if (dashed) {
    return (
      <div className={className}>
        <UserPlus className="h-6 w-6 text-[#c98a3c]" strokeWidth={2.2} />
      </div>
    );
  }

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={className} />;
  }

  return (
    <div className={className} style={style}>
      {initials}
    </div>
  );
}

function RectAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex min-w-[56px] items-center justify-center gap-1 rounded-lg border border-[#e7c97a]/45 bg-gradient-to-b from-[#f0d78c]/95 to-[#c79356]/88 px-2.5 py-1 text-[10px] font-extrabold text-[#3a2a18] shadow-[0_4px_12px_-6px_rgba(184,137,58,0.45)] active:scale-95"
    >
      <Plus className="h-3 w-3" strokeWidth={2.8} />
      إضافة
    </button>
  );
}

type Props = {
  friends: CommunityFriend[];
  people: CommunityPersonSuggestion[];
  onAddPress: () => void;
  onMemberPress: (member: CommunityMemberPreview) => void;
};

export function CommunityPeopleSuggestions({ friends, people, onAddPress, onMemberPress }: Props) {
  const hasContent = friends.length > 0 || people.length > 0;

  return (
    <section className="mt-3">
      <div className="mb-2.5 px-0.5">
        <h2 className="text-[15px] font-extrabold text-alpha-heading">
          {friends.length && people.length
            ? "أصدقاؤك · الكنيسة"
            : friends.length
              ? "أصدقاؤك"
              : "قد تعرفهم من الكنيسة"}
        </h2>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 no-scrollbar">
        <div className="flex w-[78px] shrink-0 flex-col items-center">
          <CircleAvatar name="إضافة صديق" initials="+" tone="#c98a3c" dashed onClick={onAddPress} />
          <RectAddButton onClick={onAddPress} />
        </div>

        {friends.map((friend, index) => {
          const tone = ROLE_TONES[index % ROLE_TONES.length];
          const initials =
            friend.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0] ?? "")
              .join("") || "Ⲁ";
          return (
            <Link
              key={friend.id}
              to="/community/friends"
              className="flex w-[78px] shrink-0 flex-col items-center active:scale-[0.98]"
            >
              <CircleAvatar
                name={friend.name}
                avatarUrl={friend.avatarUrl}
                initials={initials}
                tone={tone}
              />
              <p className="mt-2 w-full truncate text-center text-[11px] font-extrabold text-alpha-heading">
                {friend.name.split(" ")[0]}
              </p>
              <p className="mt-0.5 w-full truncate text-center text-[9px] font-semibold text-alpha-heading-muted">
                {friend.role ?? "صديق"}
              </p>
            </Link>
          );
        })}

        {people.map((person, index) => {
          const tone = ROLE_TONES[(index + friends.length) % ROLE_TONES.length];
          return (
            <div key={person.id} className="flex w-[78px] shrink-0 flex-col items-center">
              <CircleAvatar
                name={person.name}
                avatarUrl={person.avatarUrl}
                initials={person.initials}
                tone={tone}
                onClick={() =>
                  onMemberPress(
                    resolveCommunityMemberPreview({
                      userId: person.id,
                      userName: person.name,
                      userAvatarUrl: person.avatarUrl,
                      churchName: person.role,
                    }),
                  )
                }
              />
              <p className="mt-2 w-full truncate text-center text-[11px] font-extrabold text-alpha-heading">
                {person.name.split(" ")[0]}
              </p>
              <p className="mt-0.5 w-full truncate text-center text-[9px] font-semibold text-alpha-heading-muted">
                {person.role}
              </p>
            </div>
          );
        })}

        {!hasContent ? (
          <div className="flex min-w-[140px] shrink-0 flex-col justify-center px-2">
            <p className="text-[11px] font-semibold leading-snug text-alpha-heading-muted">
              اضغط إضافة أو صورة العضو
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
