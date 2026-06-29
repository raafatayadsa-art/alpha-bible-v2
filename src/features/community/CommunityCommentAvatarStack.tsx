import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import type { CommunityComment } from "./community-types";

type Props = {
  comments: CommunityComment[];
  maxVisible?: number;
};

export function CommunityCommentAvatarStack({ comments, maxVisible = 5 }: Props) {
  if (!comments.length) return null;

  const seen = new Set<string>();
  const unique: CommunityComment[] = [];
  for (const c of comments) {
    const key = c.userId || c.userName;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  const visible = unique.slice(0, maxVisible);
  const extra = unique.length - visible.length;

  return (
    <div className="flex items-center justify-end gap-2 px-4 pb-1">
      <span className="text-[10px] font-semibold text-white/45">
        {comments.length} {comments.length === 1 ? "تعليق" : "تعليقات"}
      </span>
      <div className="flex flex-row-reverse items-center">
        {visible.map((c, i) => (
          <PrayerUserAvatar
            key={c.id}
            name={c.userName}
            avatarUrl={c.userAvatarUrl}
            size="xs"
            className={i > 0 ? "-ms-1.5 ring-1 ring-[#2a1f18]/80" : "ring-1 ring-[#2a1f18]/80"}
          />
        ))}
        {extra > 0 ? (
          <span className="-ms-1.5 inline-grid h-5 w-5 place-items-center rounded-full border border-white/25 bg-[#f0d78c]/20 text-[8px] font-extrabold text-[#f0d78c]">
            +{extra}
          </span>
        ) : null}
      </div>
    </div>
  );
}
