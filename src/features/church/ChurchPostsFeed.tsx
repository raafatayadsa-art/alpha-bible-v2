import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, HandHeart, Send, Pin, Ticket } from "lucide-react";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import { PostImage } from "./PostImage";
import {
  useComments,
  addComment,
  useReactions,
  usePrayed,
  togglePrayed,
  isPinned,
  recordShare,
  useShareCount,
} from "./post-store";
import { AttendButton, ReservePopup } from "./PostActions";
import { kindForPostType, usePostRegistrations } from "./post-registrations";
import { getMemberProfile, saveMemberProfile } from "./post-registrations";

/** Apple-style card width — first full, second ~80%, third peeks. */
const CARD_WIDTH = "min(82vw, 300px)";
const CARD_HEIGHT = 448;

function typeMeta(type: ChurchPost["type"]) {
  return POST_TYPE_META[type];
}

function CategoryPill({ type }: { type: ChurchPost["type"] }) {
  const meta = typeMeta(type);
  return (
    <span
      className="inline-flex items-center rounded-full font-extrabold text-white px-2.5 py-0.5 text-[10px] border border-white/30 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.45)]"
      style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
    >
      {meta.label}
    </span>
  );
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

function PostStatsRow({ post }: { post: ChurchPost }) {
  const r = useReactions(post.id);
  const comments = useComments(post.id);
  const shares = useShareCount(post.id);
  const prayed = usePrayed(post.id);
  const regKind = kindForPostType(post.type);
  const { count: regCount } = usePostRegistrations(post.id, regKind ?? "attendance");
  const capacity = post.type === "trip" ? post.details?.seats : undefined;
  const tone = typeMeta(post.type).tone;

  const stat = (emoji: string, value: number, label: string, onClick?: () => void) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a543a] active:opacity-70"
    >
      <span aria-hidden>{emoji}</span>
      <span className="tabular-nums text-[#3a2a18]">{value.toLocaleString("ar-EG")}</span>
      <span className="text-[9.5px]" style={{ color: tone }}>{label}</span>
    </button>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-end pt-2 border-t"
      style={{ borderColor: `${tone}33` }}
    >
      {stat("❤️", r.love.count, "إعجاب")}
      <Link
        to="/church/post/$id"
        params={{ id: post.id }}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a543a] active:opacity-70"
      >
        <span aria-hidden>💬</span>
        <span className="tabular-nums text-[#3a2a18]">{comments.length.toLocaleString("ar-EG")}</span>
        <span className="text-[9.5px]" style={{ color: tone }}>تعليق</span>
      </Link>
      {stat("↗️", shares, "مشاركة", () => sharePost(post))}
      {post.type === "trip" && capacity != null ? (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a543a]">
          <span aria-hidden>👥</span>
          <span className="tabular-nums text-[#3a2a18]">
            {regCount.toLocaleString("ar-EG")}/{capacity.toLocaleString("ar-EG")}
          </span>
        </span>
      ) : null}
      {post.type === "prayer" ? (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a543a]">
          <span aria-hidden>🙏</span>
          <span className="tabular-nums text-[#3a2a18]">{prayed.count.toLocaleString("ar-EG")}</span>
          <span className="text-[9.5px]" style={{ color: tone }}>صلّوا</span>
        </span>
      ) : null}
      {(post.type === "liturgy" || post.type === "meeting" || post.type === "event") && regKind ? (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a543a]">
          <span aria-hidden>📅</span>
          <span className="tabular-nums text-[#3a2a18]">{regCount.toLocaleString("ar-EG")}</span>
          <span className="text-[9.5px]" style={{ color: tone }}>
            {post.type === "event" ? "مهتم" : "حاضر"}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function LastCommentPreview({ postId }: { postId: string }) {
  const comments = useComments(postId);

  if (!comments[0]) {
    return (
      <p className="text-[10px] font-bold text-[#8a6a3a] text-right py-1">
        كن أول من يعلق
      </p>
    );
  }

  const latest = comments[0];
  return (
    <div className="rounded-xl bg-white/75 border border-[#efe2c4] px-2.5 py-2 text-right min-h-[2.75rem]">
      <p className="text-[9px] font-extrabold text-[#b8893a] leading-none">آخر تعليق</p>
      <p className="mt-1 text-[10.5px] text-[#3a2a18] leading-snug line-clamp-2">
        <span className="font-extrabold">{latest.name}:</span> {latest.text}
      </p>
    </div>
  );
}

function QuickCommentBar({ postId }: { postId: string }) {
  const [text, setText] = useState("");

  const submit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const t = text.trim();
    if (!t) return;
    const profile = getMemberProfile();
    const name = profile.name.trim() || "عضو الكنيسة";
    saveMemberProfile({ name });
    addComment(postId, name, t);
    setText("");
  };

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit(e);
        }}
        placeholder="اكتب تعليقاً..."
        className="flex-1 min-w-0 rounded-full bg-white/90 border border-[#efe2c4] px-3 py-1.5 text-[11px] text-[#3a2a18] outline-none focus:border-[#c79356]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!text.trim()}
        aria-label="إرسال"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-l from-[#1a7a4a] to-[#2f9d6e] text-white disabled:opacity-40 active:scale-95"
      >
        <Send className="h-3.5 w-3.5 -scale-x-100" />
      </button>
    </div>
  );
}

function PrayButton({ postId, tone }: { postId: string; tone: string }) {
  const prayed = usePrayed(postId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        togglePrayed(postId);
      }}
      className="w-full inline-flex items-center justify-center gap-1.5 rounded-full text-white text-[11.5px] font-extrabold py-2 active:scale-[0.98] shadow-[0_10px_20px_-12px_rgba(0,0,0,0.35)]"
      style={{
        background: prayed.mine
          ? `linear-gradient(180deg, ${tone}, ${tone}cc)`
          : "linear-gradient(180deg, #8a6ec1, #6a4ea8)",
      }}
    >
      <HandHeart className="h-3.5 w-3.5" />
      {prayed.mine ? "صلّيت ✓" : "أنا صلّيت"}
    </button>
  );
}

function TripReserveButton({
  post,
  tone,
  onOpen,
}: {
  post: ChurchPost;
  tone: string;
  onOpen: () => void;
}) {
  const { count } = usePostRegistrations(post.id, "trip");
  const capacity = post.details?.seats;
  const full = capacity != null && count >= capacity;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      disabled={full}
      className="w-full inline-flex items-center justify-center gap-1.5 rounded-full text-white text-[11.5px] font-extrabold py-2 active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_20px_-12px_rgba(0,0,0,0.35)]"
      style={{ background: `linear-gradient(180deg, ${tone}, ${tone}cc)` }}
    >
      <Ticket className="h-3.5 w-3.5" />
      احجز الآن
    </button>
  );
}

function PostTypeActionBar({
  post,
  tone,
  onReserve,
}: {
  post: ChurchPost;
  tone: string;
  onReserve: () => void;
}) {
  if (post.type === "trip") {
    return <TripReserveButton post={post} tone={tone} onOpen={onReserve} />;
  }

  if (post.type === "prayer") {
    return <PrayButton postId={post.id} tone={tone} />;
  }

  if (post.type === "liturgy" || post.type === "meeting") {
    return (
      <AttendButton
        postId={post.id}
        kind="attendance"
        label="سجل حضوري"
        activeLabel="✓ سجلت حضوري"
        className="w-full"
      />
    );
  }

  if (post.type === "event") {
    return (
      <AttendButton
        postId={post.id}
        kind="event"
        label="سجل في الفعالية"
        activeLabel="✓ سجلت في الفعالية"
        className="w-full"
      />
    );
  }

  return null;
}

export function PremiumHorizontalPostCard({ post }: { post: ChurchPost }) {
  const [reserveOpen, setReserveOpen] = useState(false);
  const pinned = isPinned(post);
  const meta = typeMeta(post.type);
  const hasAction =
    post.type === "trip" ||
    post.type === "prayer" ||
    post.type === "liturgy" ||
    post.type === "meeting" ||
    post.type === "event";

  return (
    <>
      <article
        className="relative flex shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border bg-[#fbf3e1]/90 backdrop-blur-xl shadow-[0_22px_48px_-24px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.88)]"
        style={{
          ["--card-w" as string]: CARD_WIDTH,
          width: "var(--card-w)",
          height: CARD_HEIGHT,
          borderColor: `${meta.tone}55`,
          boxShadow: `0 22px 48px -24px ${meta.tone}44, inset 0 1px 0 rgba(255,255,255,0.88)`,
        }}
      >
        <Link
          to="/church/post/$id"
          params={{ id: post.id }}
          className="flex min-h-0 flex-1 flex-col text-right active:opacity-95"
        >
          <div className="relative h-[168px] w-full shrink-0 bg-[#3a2a18]">
            <PostImage post={post} className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/65 via-transparent to-transparent"
              style={{
                background: `linear-gradient(to top, ${meta.tone}99 0%, transparent 55%)`,
              }}
            />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {pinned ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white border border-white/40"
                  style={{ background: meta.tone }}
                >
                  <Pin className="h-2.5 w-2.5" strokeWidth={2.6} /> مثبت
                </span>
              ) : null}
              <CategoryPill type={post.type} />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-3.5 pt-2.5 pb-2">
            <h3 className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-snug line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-1 text-[11.5px] text-[#6a543a] leading-relaxed line-clamp-2 min-h-[2.5rem]">
              {post.excerpt}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#8a6a3a]">
              <CalendarDays className="h-3 w-3" style={{ color: meta.tone }} />
              {post.date}
            </p>

            <div className="mt-auto space-y-2 pt-2">
              <PostStatsRow post={post} />
              <LastCommentPreview postId={post.id} />
            </div>
          </div>
        </Link>

        <div
          className="shrink-0 space-y-2 border-t px-3.5 py-2.5"
          style={{ borderColor: `${meta.tone}33` }}
        >
          <QuickCommentBar postId={post.id} />
          {hasAction ? (
            <PostTypeActionBar
              post={post}
              tone={meta.tone}
              onReserve={() => setReserveOpen(true)}
            />
          ) : null}
        </div>
      </article>

      {reserveOpen ? (
        <ReservePopup
          postId={post.id}
          postTitle={post.title}
          tripDate={post.details?.date}
          totalSeats={post.details?.seats}
          onClose={() => setReserveOpen(false)}
        />
      ) : null}
    </>
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
    <div
      className="-mx-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3 px-4 pb-1" style={{ width: "max-content" }}>
        {posts.map((p) => (
          <PremiumHorizontalPostCard key={p.id} post={p} />
        ))}
        <div className="w-3 shrink-0" aria-hidden />
      </div>
    </div>
  );
}

/** @deprecated Use PremiumHorizontalPostCard */
export const ChurchFeedPostCard = PremiumHorizontalPostCard;
