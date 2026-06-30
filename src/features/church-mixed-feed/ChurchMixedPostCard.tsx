/**
 * ChurchMixedPostCard — church name header + image-left + commenter avatars + engagement bar
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bus, CalendarDays, CheckCircle2, Clock, Cross,
  Flame, Gift, HandHeart, MapPin, MessageCircle, Newspaper,
  Pin, Radio, Ticket, Users,
} from "lucide-react";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { getCurrentUser } from "@/features/church/current-user";
import {
  isPinned, recordShare, toggleReaction,
  useComments, useReactions, useShareCount,
} from "@/features/church/post-store";
import { PostImage } from "@/features/church/PostImage";
import { isLivePost, postCardStyle } from "./post-card-styles";
import { AlphaChurchEngagementBar } from "./AlphaChurchEngagementBar";
import { ChurchPostInlineComments } from "./ChurchPostInlineComments";
import { getPostImages } from "./post-media";
import type { ChurchFeedNavContext } from "./nav-context";
import { MEMBER_NAV } from "./nav-context";

type Props = {
  post: ChurchPost;
  typeCount?: number;
  mode: "hub-preview" | "type-list";
  navContext?: ChurchFeedNavContext;
  churchName?: string;
};

/** Plain solid shell per type */
function cardShellStyle(type: ChurchPost["type"]): React.CSSProperties {
  const map: Partial<Record<ChurchPost["type"], string>> = {
    prayer:       "#1e1530",
    wedding:      "#231408",
    condolence:   "#1a1510",
    trip:         "#0c1e16",
    event:        "#1f0c10",
    meeting:      "#0d1826",
    liturgy:      "#1e1208",
    news:         "#161208",
    announcement: "#1a0e16",
    report:       "#0e1220",
  };
  return { background: map[type] ?? "#1a1510" };
}

const TYPE_ICON = {
  news: Newspaper, announcement: Radio, liturgy: Flame, meeting: Users,
  wedding: Gift, condolence: Cross, prayer: HandHeart, report: Newspaper,
  event: Radio, trip: Bus,
} as const;

function MetaBlock({ post }: { post: ChurchPost }) {
  const style = postCardStyle(post.type);
  const d = post.details;
  if (post.type === "meeting" || post.type === "liturgy") {
    return (
      <div className="space-y-0.5 text-[10.5px] text-white/55">
        {d?.date && <p className="flex items-center justify-end gap-1"><span>{d.date}</span><CalendarDays className="h-2.5 w-2.5 shrink-0" style={{ color: style.tone }} strokeWidth={2.4} /></p>}
        {d?.time && <p className="flex items-center justify-end gap-1"><span>{d.time}</span><Clock className="h-2.5 w-2.5 shrink-0" style={{ color: style.tone }} strokeWidth={2.4} /></p>}
        {d?.place && <p className="flex items-center justify-end gap-1"><span className="line-clamp-1">{d.place}</span><MapPin className="h-2.5 w-2.5 shrink-0" style={{ color: style.tone }} strokeWidth={2.4} /></p>}
      </div>
    );
  }
  if (post.type === "trip" && d) {
    return (
      <div className="space-y-0.5 text-[10.5px] text-white/55">
        {d.date && <p className="flex items-center justify-end gap-1"><span>{d.date}</span><CalendarDays className="h-2.5 w-2.5 shrink-0" style={{ color: style.tone }} strokeWidth={2.4} /></p>}
        {d.price && <p className="flex items-center justify-end gap-1 font-bold" style={{ color: style.tone }}><span>{d.price}</span><Ticket className="h-2.5 w-2.5 shrink-0" strokeWidth={2.4} /></p>}
      </div>
    );
  }
  if (post.type === "wedding" && (d?.groom || d?.bride)) {
    return <p className="text-[10.5px] font-bold text-right" style={{ color: style.tone }}>{[d.groom, d.bride].filter(Boolean).join(" · ")}</p>;
  }
  if (post.type === "condolence" && d?.personName) {
    return <p className="text-[10.5px] text-right text-white/55 line-clamp-1">{d.personName}</p>;
  }
  return post.date ? <p className="text-[10.5px] text-white/40 text-right">{post.date}</p> : null;
}

function TypeBadge({ post }: { post: ChurchPost }) {
  const style = postCardStyle(post.type);
  const Icon = TYPE_ICON[post.type];
  const meta = POST_TYPE_META[post.type];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", color: style.tone, border: `1px solid ${style.tone}55` }}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" strokeWidth={2.4} />
      {meta.label}
    </span>
  );
}

/** Overlapping commenter avatar circles inspired by the reference screenshots */
function CommenterAvatarRow({ postId, tone }: { postId: string; tone: string }) {
  const comments = useComments(postId);
  const user = getCurrentUser();
  if (!comments.length) return null;

  const shown = comments.slice(-4);
  return (
    <div
      dir="rtl"
      className="flex items-center gap-2 px-3 py-1.5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Overlapping circles */}
      <div className="flex items-center" style={{ direction: "ltr" }}>
        {shown.map((c, i) => (
          <div
            key={c.id}
            className="rounded-full border-[1.5px]"
            style={{
              marginLeft: i === 0 ? 0 : "-8px",
              zIndex: shown.length - i,
              borderColor: tone,
            }}
          >
            <MemberAvatar
              name={c.name || "مستخدم"}
              avatarUrl={c.name === user.name ? user.avatarUrl : undefined}
              size="xs"
              className="block"
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/45 font-bold">
        {comments.length > 4
          ? `${comments.length} تعليق`
          : comments.length === 1
          ? "تعليق واحد"
          : `${comments.length} تعليقات`}
      </p>
      <MessageCircle className="h-3 w-3 ms-auto shrink-0" style={{ color: tone }} strokeWidth={2.2} />
    </div>
  );
}

export function ChurchMixedPostCard({ post, typeCount, mode, navContext = MEMBER_NAV, churchName }: Props) {
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const style = postCardStyle(post.type);
  const comments = useComments(post.id);
  const r = useReactions(post.id);
  const shares = useShareCount(post.id);
  const pinned = isPinned(post);
  const extraCount = typeCount != null && typeCount > 1 ? typeCount - 1 : 0;
  const images = getPostImages(post);
  const hasImage = images.length > 0;
  const meta = POST_TYPE_META[post.type];
  const Icon = TYPE_ICON[post.type];

  const openCard = () => {
    if (mode === "hub-preview") {
      if (navContext.scope === "public") {
        void navigate({ to: "/church/directory/$placeId/posts/$type", params: { placeId: navContext.placeId, type: post.type } });
      } else {
        void navigate({ to: "/church/posts/$type", params: { type: post.type } });
      }
    } else {
      void navigate({ to: "/church/post/$id", params: { id: post.id } });
    }
  };

  const handleComment = () => {
    if (mode === "hub-preview") {
      setCommentsOpen((v) => !v);
      return;
    }
    void navigate({ to: "/church/post/$id", params: { id: post.id }, hash: "comments" });
  };

  const handleShare = () => {
    recordShare(post.id);
    void navigate({ to: "/church/post/$id", params: { id: post.id } });
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openCard}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCard(); } }}
      className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)] overflow-hidden rounded-[22px] cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        ...cardShellStyle(post.type),
        border: "1px solid rgba(240,215,140,0.09)",
        boxShadow: "0 18px 38px -16px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* ── Church name header — top of card ── */}
      <div
        className="flex items-center justify-end gap-1.5 px-3 pt-2.5 pb-2"
        dir="rtl"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1">
          {pinned && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-[#e7c97a]/40 bg-black/40 px-1.5 py-0.5 text-[8px] font-extrabold text-[#f0d78c] backdrop-blur-md">
              <Pin className="h-1.5 w-1.5" strokeWidth={3} /> مثبت
            </span>
          )}
          {isLivePost(post) && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-[#e0464d]/90 px-1.5 py-0.5 text-[8px] font-extrabold text-white">
              <Radio className="h-2 w-2" /> مباشر
            </span>
          )}
        </div>
        <p className="text-[12px] font-extrabold leading-none text-white/85">{churchName ?? "الكنيسة"}</p>
        <CheckCircle2 className="h-3 w-3 shrink-0 text-[#5b9fd8]" strokeWidth={2.5} />
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${style.tone}22`, border: `1px solid ${style.tone}44` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: style.tone }} strokeWidth={2.2} />
        </span>
      </div>

      {/* ── Body: image left + content right ── */}
      <div className="flex items-stretch min-h-[128px]" dir="rtl">

        {/* Content — right side */}
        <div className="flex flex-1 flex-col justify-between px-3 pt-2.5 pb-2 min-w-0">
          <div>
            {/* Type badge + extra count */}
            <div className="flex flex-wrap items-center justify-end gap-1 mb-1.5">
              <TypeBadge post={post} />
              {extraCount > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold backdrop-blur-md"
                  style={{ background: "rgba(0,0,0,0.35)", color: style.tone, border: `1px solid ${style.tone}44` }}>
                  +{extraCount}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="line-clamp-2 text-right text-[15px] font-extrabold leading-snug text-white">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mt-0.5 line-clamp-2 text-right text-[10.5px] leading-relaxed text-white/55">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-1.5"><MetaBlock post={post} /></div>
          </div>

          {/* Bottom hint */}
          {mode === "hub-preview" && extraCount > 0 && (
            <p className="mt-1 text-right text-[9px] font-bold" style={{ color: `${style.tone}cc` }}>
              اضغط لعرض كل {meta.label} ←
            </p>
          )}
        </div>

        {/* Image — left side */}
        {hasImage ? (
          <div className="relative w-[42%] shrink-0 overflow-hidden">
            <PostImage
              post={post}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Fade toward card body (right edge in RTL = left in layout) */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to left, ${cardShellStyle(post.type).background} 0%, transparent 36%)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)" }}
            />
          </div>
        ) : (
          <div
            className="relative w-[36%] shrink-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${style.tone}18 0%, transparent 60%)` }}
          >
            <Icon className="h-12 w-12 opacity-10" style={{ color: style.tone }} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* ── Commenter avatars row ── */}
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <CommenterAvatarRow postId={post.id} tone={style.tone} />
        {mode === "hub-preview" ? (
          <ChurchPostInlineComments postId={post.id} open={commentsOpen} tone={style.tone} />
        ) : null}
      </div>

      {/* ── Engagement bar — full width at very bottom ── */}
      <div
        className="px-3 pt-1 pb-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <AlphaChurchEngagementBar
          postType={post.type}
          tone={style.tone}
          state={{ primaryCount: r.love.count, primaryActive: r.love.mine, commentCount: comments.length, shareCount: shares }}
          callbacks={{ onPrimary: () => toggleReaction(post.id, "love"), onComment: handleComment, onShare: handleShare }}
        />
      </div>
    </article>
  );
}
