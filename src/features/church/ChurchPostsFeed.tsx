import { useState } from "react";
import { HandHeart, Send, Ticket, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import {  useComments,
  addCommentAsCurrentUser,
  useReactions,
  toggleReaction,
  usePrayed,
  togglePrayed,
  isPinned,
  recordShare,
  useShareCount,
  useReplies,
} from "./post-store";
import { AttendButton, ReservePopup, CondolencePopup, CongratsPopup } from "./PostActions";
import { kindForPostType, usePostRegistrations } from "./post-registrations";
import { getCurrentUser } from "./current-user";
import { MemberAvatar } from "./MemberAvatar";

const TEXT_SAFE =
  "break-words [overflow-wrap:anywhere] whitespace-normal max-w-full min-w-0 overflow-hidden";

function typeMeta(type: ChurchPost["type"]) {
  return POST_TYPE_META[type];
}

async function sharePost(post: ChurchPost) {
  const url = `${window.location.origin}/church/post/${post.id}`;
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ title: post.title, text: post.excerpt, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
    recordShare(post.id);
  } catch {
    /* cancelled */
  }
}

type CtaConfig = {
  kind: "reserve" | "congrats" | "condolence" | "attend" | "prayer" | "details";
  label: string;
  bg: string;
  shadow: string;
  accent: string;
};

function ctaFor(post: ChurchPost): CtaConfig {
  const meta = typeMeta(post.type);
  const tone = meta.tone;
  const styled = {
    bg: `linear-gradient(180deg, ${tone}, ${tone}cc)`,
    shadow: `${tone}88`,
    accent: tone,
  };
  switch (post.type) {
    case "trip":
      return { kind: "reserve", label: "احجز الآن", bg: "linear-gradient(180deg, #1f8a5a, #167a4c)", shadow: "#1f8a5a88", accent: "#1f8a5a" };
    case "prayer":
      return { kind: "prayer", label: "صلِّ", bg: "linear-gradient(180deg, #8a6ec1, #6a4ea8)", shadow: "#8a6ec188", accent: "#8a6ec1" };
    case "wedding":
      return { kind: "congrats", label: "شارك التهنئة", ...styled };
    case "condolence":
      return { kind: "condolence", label: "أرسل تعزية", ...styled };
    case "liturgy":
    case "meeting":
    case "event":
      return { kind: "attend", label: "سجل حضوري", ...styled };
    default:
      return { kind: "details", label: "عرض التفاصيل", bg: "linear-gradient(180deg, #1f8a5a, #167a4c)", shadow: "#1f8a5a88", accent: "#1f8a5a" };
  }
}
function statLabelFor(
  post: ChurchPost,
  regCount: number,
  prayedCount: number,
  replyCount: number,
  capacity?: number,
): string {
  const fmt = (n: number) => n.toLocaleString("ar-EG");
  if (post.type === "trip" && capacity != null) return `${fmt(regCount)}/${fmt(capacity)} محجوز`;
  if (post.type === "prayer") return `${fmt(prayedCount)} صلّوا`;
  if (post.type === "event") return `${fmt(regCount)} مهتم`;
  if (post.type === "meeting" || post.type === "liturgy") return `${fmt(regCount)} حاضر`;
  if (post.type === "wedding") return `${fmt(replyCount)} تهنئة`;
  if (post.type === "condolence") return `${fmt(replyCount)} تعزية`;
  return `${fmt(regCount)} تفاعل`;
}

export function PremiumHorizontalPostCard({ post }: { post: ChurchPost }) {
  const [draft, setDraft] = useState("");
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve">(null);

  const cta = ctaFor(post);
  const comments = useComments(post.id);
  const r = useReactions(post.id);
  const shares = useShareCount(post.id);
  const prayed = usePrayed(post.id);
  const regKind = kindForPostType(post.type);
  const { count: regCount } = usePostRegistrations(post.id, regKind ?? "attendance");
  const condolences = useReplies("condolence", post.id);
  const congrats = useReplies("congrats", post.id);
  const replyCount = post.type === "condolence" ? condolences.length : post.type === "wedding" ? congrats.length : 0;
  const capacity = post.type === "trip" ? post.details?.seats : undefined;
  const latest = comments[0];
  const user = getCurrentUser();
  const pinned = isPinned(post);
  const statText = statLabelFor(post, regCount, prayed.count, replyCount, capacity);
  const excerptLong = post.excerpt.trim().length > 60;

  const sendComment = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = draft.trim();
    if (!text) return;
    addCommentAsCurrentUser(post.id, text);
    setDraft("");
  };

  const stopCardNav = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openPostDirect = () => {
    window.location.assign(`/church/post/${post.id}`);
  };

  const onCta = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cta.kind === "reserve") setPopup("reserve");    else if (cta.kind === "congrats") setPopup("congrats");
    else if (cta.kind === "condolence") setPopup("condolence");
    else if (cta.kind === "prayer") togglePrayed(post.id);
    else window.location.assign(`/church/post/${post.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openPostDirect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPostDirect();
        }
      }}
      className="shrink-0 snap-center w-[88vw] max-w-[400px] h-[480px] flex flex-col relative rounded-[28px] border border-white/75 bg-[#fbf3e1]/95 backdrop-blur-xl shadow-[0_24px_50px_-26px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden cursor-pointer"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="block shrink-0 min-w-0 text-right">
          <div className="px-3.5 pt-3.5">
            <div className="relative overflow-hidden rounded-[22px] border border-white/70 shadow-[0_14px_28px_-18px_rgba(60,40,16,0.55)]">
              <img src={post.image} alt={post.title} className="block h-[168px] w-full object-cover" loading="lazy" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/45 via-transparent to-transparent" />
              {pinned ? (
                <span className="absolute top-2 right-2 rounded-full bg-[#9b87c4]/90 px-2 py-0.5 text-[9px] font-extrabold text-white border border-white/40">مثبت</span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 min-w-0 max-w-full overflow-hidden px-4 pt-3 text-right">
            <h3
              className={
                "font-arabic-serif text-[16.5px] font-extrabold text-[#2a1d10] leading-snug line-clamp-1 " +
                TEXT_SAFE
              }
            >
              {post.title}
            </h3>
            <div className="mt-1.5 h-[2.75rem] max-w-full overflow-hidden">
              <p
                className={
                  "text-[12.5px] text-[#4a3a26] leading-snug line-clamp-2 " + TEXT_SAFE
                }
              >
                {post.excerpt}
              </p>
            </div>
            {excerptLong ? (
              <span className="mt-0.5 inline-block text-[11.5px] font-extrabold text-[#7a5a9a]">
                عرض المزيد
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        dir="rtl"
        className="mx-4 mt-3 shrink-0 grid grid-cols-3 h-[44px] items-center rounded-2xl bg-white/75 border border-white/80 px-3 text-[12px] font-extrabold text-[#3a2a18]"
        onClick={stopCardNav}
      >
        <button
          type="button"
          aria-pressed={r.love.mine}
          aria-label={r.love.mine ? "إلغاء الإعجاب" : "إعجاب"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReaction(post.id, "love");
          }}
          className="flex items-center justify-center gap-[6px]"
        >
          <Heart className={"h-[18px] w-[18px] " + (r.love.mine ? "text-[#e0464d] fill-current" : "text-[#c44569]")} strokeWidth={2.4} />
          <span className="tabular-nums leading-none">{r.love.count.toLocaleString("ar-EG")}</span>
        </button>
        <button
          type="button"
          aria-label="عدد التعليقات"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex items-center justify-center gap-[6px]"
        >
          <MessageCircle className="h-[18px] w-[18px] text-[#5b8fd1]" strokeWidth={2.4} />
          <span className="tabular-nums leading-none">{comments.length.toLocaleString("ar-EG")}</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sharePost(post);
          }}
          aria-label="مشاركة"
          className="flex items-center justify-center gap-[6px]"
        >
          <Share2 className="h-[18px] w-[18px] text-[#7a4a26]" strokeWidth={2.4} />
          <span className="tabular-nums leading-none">{shares.toLocaleString("ar-EG")}</span>
        </button>
      </div>

      <div className="shrink-0 mx-4 mt-2 space-y-2" onClick={stopCardNav}>        <div className="h-[52px] shrink-0 flex items-start gap-2 rounded-2xl bg-white/60 border border-white/70 px-3 py-2 text-right overflow-hidden">
          {latest ? (
            <>
              <MemberAvatar name={latest.name} avatarUrl={user.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-snug text-[#2a1d10] line-clamp-2">
                  <span className="font-extrabold text-[#7a4a26]">{latest.name}: </span>
                  {latest.text}
                </p>
              </div>
            </>
          ) : (
            <p className="flex-1 text-[11px] font-bold text-[#8a6a3a]/75 text-right leading-snug py-0.5">كن أول من يعلق</p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2 rounded-full bg-white/85 border border-[#efe2c4] pl-1 pr-3 py-1">
          <button
            type="button"
            onClick={sendComment}
            disabled={!draft.trim()}
            aria-label="إرسال"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#1f8a5a] px-3 text-white active:scale-90 shadow-[0_8px_16px_-10px_rgba(31,138,90,0.55)] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5 -scale-x-100" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendComment(e); }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            placeholder="اكتب تعليق..."
            className="flex-1 min-w-0 bg-transparent text-right text-[12.5px] text-[#3a2a18] placeholder:text-[#a99060] outline-none py-1"
            dir="rtl"
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4 mt-2 border-t border-[#efe2c4]/50">
        <div className="grid grid-cols-[0.3fr_0.7fr] items-center gap-2">
          <div
            className="h-10 inline-flex items-center justify-center rounded-2xl bg-white/75 border border-white/80 px-2 text-[10px] font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] text-center leading-tight"
            style={{ color: cta.accent }}
          >
            {statText}
          </div>          {cta.kind === "attend" ? (
            <AttendButton postId={post.id} kind={post.type === "event" ? "event" : "attendance"} label={cta.label} activeLabel="✓ سجلت" className="h-10 rounded-2xl text-[13px] shadow-[0_14px_26px_-14px_rgba(31,138,90,0.45)]" />
          ) : (
            <button type="button" onClick={onCta} className="h-10 inline-flex items-center justify-center gap-2 rounded-2xl text-[13px] font-extrabold text-white active:scale-[0.98] transition-transform" style={{ background: cta.bg, boxShadow: `0 14px 26px -14px ${cta.shadow}` }}>
              {cta.kind === "prayer" ? (prayed.mine ? "صلّيت ✓" : "صليت من أجله") : cta.label}
              {cta.kind !== "prayer" ? <ArrowRight className="h-[14px] w-[14px] -scale-x-100" /> : null}
              {cta.kind === "prayer" ? <HandHeart className="h-3.5 w-3.5" /> : null}
              {cta.kind === "reserve" ? <Ticket className="h-3.5 w-3.5" /> : null}
            </button>
          )}
        </div>
      </div>

      {popup === "condolence" ? <CondolencePopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      {popup === "congrats" ? <CongratsPopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      {popup === "reserve" ? <ReservePopup postId={post.id} totalSeats={post.details?.seats} onClose={() => setPopup(null)} /> : null}
    </article>
  );
}

export function ChurchPostsHorizontalRail({ posts }: { posts: ChurchPost[] }) {
  if (!posts.length) {
    return (
      <p className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/80 px-4 py-8 text-center text-[12px] text-[#6a543a]">
        لا توجد منشورات نشطة حالياً.
      </p>
    );
  }
  return (
    <div className="-mx-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth snap-x snap-mandatory" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="flex gap-3 px-4 pb-1" style={{ width: "max-content" }}>
        {posts.map((p) => (
          <PremiumHorizontalPostCard key={p.id} post={p} />
        ))}
        <div className="w-3 shrink-0" aria-hidden />
      </div>
    </div>
  );
}

export const ChurchFeedPostCard = PremiumHorizontalPostCard;
