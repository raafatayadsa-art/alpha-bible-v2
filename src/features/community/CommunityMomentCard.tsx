import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Church, HandHeart, Pin, Send, Trash2 } from "lucide-react";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { getCurrentUser, isAuthenticated } from "@/features/church/current-user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CommunityMoment } from "./community-types";
import { COMMUNITY_KIND_META } from "./community-types";
import {
  addCommunityComment,
  deleteCommunityMoment,
  formatCommunityTime,
  toggleCommunityReaction,
  useCommunityComments,
  useCommunityReactions,
} from "./community-store";
import {
  togglePinCommunityMoment,
} from "./community-moment-actions";
import { CommunityOverflowMenu } from "./CommunityOverflowMenu";
import { CommunityCommentItem } from "./CommunityCommentItem";
import { CommunityEngagementBar } from "./CommunityEngagementBar";
import { CommunityCommentAvatarStack } from "./CommunityCommentAvatarStack";
import { CommunityMomentCardArt } from "./CommunityMomentCardArt";
import { CommunityUserIdentity } from "./CommunityUserIdentity";
import { CommunityCardBadges } from "./CommunityCardBadges";
import { COMMUNITY_GLASS_MOMENT } from "./community-glass-chrome";
import type { CommunityMemberPreview } from "./community-user-trust";
import { resolveCommunityMemberPreview } from "./community-user-trust";
import { resolveCommunityMomentSourceRoute } from "./community-moment-source";

function momentBody(moment: CommunityMoment): { title: string; body: string; meta?: string } {
  if (moment.kind === "reading" && moment.payload.reading) {
    const r = moment.payload.reading;
    return { title: "شارك قراءة", body: r.text, meta: r.reference };
  }
  if (moment.kind === "prayer" && moment.payload.prayer) {
    const p = moment.payload.prayer;
    return { title: p.title, body: p.body, meta: p.category };
  }
  if (moment.kind === "agpeya" && moment.payload.agpeya) {
    const a = moment.payload.agpeya;
    return {
      title: a.title,
      body: a.excerpt ?? "صلّى من الأجبية المقدسة",
      meta: "الأجبية",
    };
  }
  return { title: "مشاركة روحية", body: "" };
}

const KIND_ICON = {
  reading: BookOpen,
  prayer: HandHeart,
  agpeya: Church,
} as const;

type Props = {
  moment: CommunityMoment;
  className?: string;
  isPinned?: boolean;
  onMemberPress?: (member: CommunityMemberPreview) => void;
};

export function CommunityMomentCard({ moment, className, isPinned = false, onMemberPress }: Props) {
  const navigate = useNavigate();
  const meta = COMMUNITY_KIND_META[moment.kind];
  const content = momentBody(moment);
  const reactions = useCommunityReactions(moment.id, moment.kind);
  const comments = useCommunityComments(moment.id);
  const reactionKind = meta.reaction;
  const primary = reactions[reactionKind];
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const Icon = KIND_ICON[moment.kind];
  const self = getCurrentUser();
  const isMine = Boolean(self.id && moment.userId === self.id);

  const postMenuItems = useMemo(() => {
    const items = [
      {
        key: "pin",
        label: isPinned ? "إلغاء التثبيت" : "تثبيت في أعلى الصفحة",
        icon: <Pin className="h-3.5 w-3.5" />,
        onClick: () => {
          const next = togglePinCommunityMoment(moment.id);
          toast.success(next ? "تم التثبيت في الأعلى" : "تم إلغاء التثبيت");
        },
      },
    ];
    if (isMine) {
      items.push({
        key: "delete",
        label: "مسح البوست",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        onClick: () => {
          const ok = deleteCommunityMoment(moment.id);
          if (ok) toast.success("تم حذف المنشور");
          else toast.error("تعذّر الحذف");
        },
        danger: true,
      });
    }
    return items;
  }, [moment.id, isPinned, isMine]);

  const onPrimary = useCallback(() => {
    if (!isAuthenticated()) return;
    toggleCommunityReaction(moment.id, moment.kind);
  }, [moment.id, moment.kind]);

  const onComment = useCallback(() => {
    setCommentsOpen((v) => !v);
  }, []);

  const submitComment = useCallback(() => {
    if (!draft.trim()) return;
    addCommunityComment(moment.id, draft);
    setDraft("");
    setCommentsOpen(true);
  }, [draft, moment.id]);

  const openAuthor = useCallback(() => {
    onMemberPress?.(
      resolveCommunityMemberPreview({
        userId: moment.userId,
        userName: moment.userName,
        userAvatarUrl: moment.userAvatarUrl,
        churchName: moment.churchName,
      }),
    );
  }, [moment, onMemberPress]);

  const openSource = useCallback(() => {
    const route = resolveCommunityMomentSourceRoute(moment);
    if (!route) return;
    void navigate({ to: route.to, params: route.params as Record<string, string> });
  }, [moment, navigate]);

  return (
    <article className={cn(COMMUNITY_GLASS_MOMENT, "relative", className)}>
      <CommunityMomentCardArt kind={moment.kind} seed={moment.id} />

      <div className="relative z-[1] px-4 pt-4">
        <div className="flex items-start gap-2">
          <CommunityUserIdentity
            userId={moment.userId}
            userName={moment.userName}
            userAvatarUrl={moment.userAvatarUrl}
            avatarSize="md"
            className="flex-1"
            onPress={onMemberPress ? openAuthor : undefined}
            meta={
              <p className="text-[11px] font-semibold text-white/45">
                {isPinned ? (
                  <span className="ml-1 inline-flex items-center gap-0.5 text-[#f0d78c]">
                    <Pin className="h-3 w-3" />
                    مثبّت
                    {" · "}
                  </span>
                ) : null}
                {moment.churchName ? `${moment.churchName} · ` : ""}
                {formatCommunityTime(moment.createdAt)}
              </p>
            }
          />
          <CommunityCardBadges kindLabel={meta.badge} kindAccent={meta.accent} KindIcon={Icon} />
          <CommunityOverflowMenu items={postMenuItems} />
        </div>
      </div>

      <button
        type="button"
        onClick={openSource}
        className="relative z-[1] w-full px-4 pb-3 pt-3 text-right active:bg-white/5"
        aria-label="فتح مصدر المشاركة في الكنيسة"
      >
        <p className="text-[13px] font-extrabold text-white/90">{content.title}</p>
        <p className="mt-2 font-arabic-serif text-[15px] font-bold leading-[1.75] text-white line-clamp-5">
          {content.body}
        </p>
        {content.meta ? (
          <p className="mt-2 text-[12px] font-extrabold" style={{ color: meta.accent }}>
            {content.meta}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] font-bold text-[#9fd4ff]/80">اضغط لفتح المصدر في الكنيسة ←</p>
      </button>

      <div className="relative z-[1]">
        <CommunityCommentAvatarStack comments={comments} />
      </div>

      <div className="relative z-[1] px-3 pb-3">
        <CommunityEngagementBar
          kind={moment.kind}
          primaryCount={primary.count}
          primaryActive={primary.mine}
          commentCount={comments.length}
          onPrimary={onPrimary}
          onComment={onComment}
        />
      </div>

      {commentsOpen ? (
        <div className="relative z-[1] border-t border-white/8 bg-black/20 px-4 py-3">
          {comments.length === 0 ? (
            <p className="mb-2 text-center text-[11px] font-semibold text-white/40">كن أول من يعلّق</p>
          ) : (
            <ul className="mb-3 space-y-2">
              {comments.map((c) => (
                <CommunityCommentItem
                  key={c.id}
                  comment={c}
                  momentId={moment.id}
                  onMemberPress={onMemberPress}
                />
              ))}
            </ul>
          )}
          {isAuthenticated() ? (
            <div className="flex items-center gap-2">
              <PrayerUserAvatar
                name={self.name || "أنت"}
                avatarUrl={self.avatarUrl}
                size="sm"
                className="shrink-0 ring-1 ring-white/15"
              />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب تعليقاً مشجّعاً…"
                className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-[13px] font-medium text-white placeholder:text-white/35 outline-none focus:border-[#e7c97a]/45"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitComment();
                }}
              />
              <button
                type="button"
                aria-label="إرسال"
                onClick={submitComment}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#e7c97a]/35 bg-[#e7c97a]/15 text-[#f0d78c] active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="block text-center text-[12px] font-bold text-[#9fd4ff]">
              سجّل الدخول للتعليق
            </Link>
          )}
        </div>
      ) : null}
    </article>
  );
}
