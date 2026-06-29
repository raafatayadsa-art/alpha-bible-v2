import { useCallback, useState } from "react";
import { Ban, Check, Flag, Pencil, Trash2, X } from "lucide-react";
import { getCurrentUser } from "@/features/church/current-user";
import { toast } from "sonner";
import type { CommunityComment } from "./community-types";
import {
  blockCommunityUser,
  reportCommunityComment,
} from "./community-moderation-store";
import {
  deleteCommunityComment,
  formatCommunityTime,
  updateCommunityComment,
} from "./community-store";
import { CommunityUserIdentity } from "./CommunityUserIdentity";
import { CommunityCardBadges } from "./CommunityCardBadges";
import { CommunityOverflowMenu } from "./CommunityOverflowMenu";
import type { CommunityMemberPreview } from "./community-user-trust";
import { resolveCommunityMemberPreview } from "./community-user-trust";

type Props = {
  comment: CommunityComment;
  momentId: string;
  onMemberPress?: (member: CommunityMemberPreview) => void;
};

export function CommunityCommentItem({ comment, momentId, onMemberPress }: Props) {
  const self = getCurrentUser();
  const isMine = Boolean(self.id && comment.userId === self.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);

  const saveEdit = useCallback(() => {
    if (!draft.trim()) {
      toast.error("التعليق فارغ");
      return;
    }
    const ok = updateCommunityComment(momentId, comment.id, draft);
    if (ok) {
      setEditing(false);
      toast.success("تم تعديل التعليق");
    } else {
      toast.error("تعذّر تعديل التعليق");
    }
  }, [comment.id, draft, momentId]);

  const onDelete = useCallback(() => {
    const ok = deleteCommunityComment(momentId, comment.id);
    if (ok) toast.success("تم حذف التعليق");
    else toast.error("تعذّر حذف التعليق");
  }, [comment.id, momentId]);

  const menuItems = [
    ...(isMine
      ? [
          {
            key: "edit",
            label: "تعديل",
            icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: () => {
              setDraft(comment.text);
              setEditing(true);
            },
          },
          {
            key: "delete",
            label: "مسح",
            icon: <Trash2 className="h-3.5 w-3.5" />,
            onClick: onDelete,
            danger: true,
          },
        ]
      : [
          {
            key: "report",
            label: "تبليغ",
            icon: <Flag className="h-3.5 w-3.5 text-[#f0d78c]" />,
            onClick: () =>
              reportCommunityComment({
                commentId: comment.id,
                momentId,
                userId: comment.userId,
                userName: comment.userName,
                text: comment.text,
              }),
          },
          {
            key: "block",
            label: `حظر ${comment.userName.split(" ")[0]}`,
            icon: <Ban className="h-3.5 w-3.5" />,
            onClick: () => blockCommunityUser(comment.userId, comment.userName),
            danger: true,
          },
        ]),
  ];

  return (
    <li className="rounded-xl border border-white/8 bg-white/[0.06] px-2.5 py-2.5">
      <div className="flex items-start gap-2">
        <CommunityUserIdentity
          userId={comment.userId}
          userName={comment.userName}
          userAvatarUrl={comment.userAvatarUrl}
          avatarSize="sm"
          hideVerified
          className="flex-1"
          nameClassName="text-[12px]"
          onPress={
            onMemberPress
              ? () =>
                  onMemberPress(
                    resolveCommunityMemberPreview({
                      userId: comment.userId,
                      userName: comment.userName,
                      userAvatarUrl: comment.userAvatarUrl,
                    }),
                  )
              : undefined
          }
          meta={
            <p className="text-[10px] font-semibold text-white/40">
              {formatCommunityTime(comment.updatedAt ?? comment.createdAt)}
              {comment.updatedAt ? " · معدّل" : ""}
            </p>
          }
        />

        <CommunityCardBadges />

        <CommunityOverflowMenu items={menuItems} />
      </div>

      {editing ? (
        <div className="mt-2 space-y-2 pr-10">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-[#e7c97a]/35 bg-black/30 px-3 py-2 text-[12px] font-medium leading-snug text-white outline-none focus:border-[#e7c97a]/55"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(comment.text);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-2.5 py-1.5 text-[10px] font-extrabold text-white/55"
            >
              <X className="h-3 w-3" />
              إلغاء
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="inline-flex items-center gap-1 rounded-lg border border-[#e7c97a]/40 bg-[#e7c97a]/15 px-2.5 py-1.5 text-[10px] font-extrabold text-[#f0d78c]"
            >
              <Check className="h-3 w-3" />
              حفظ
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 pr-10 text-[12px] font-medium leading-snug text-white/88">{comment.text}</p>
      )}
    </li>
  );
}
