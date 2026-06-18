import { useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft, CalendarDays, Share2, Pin, Pencil, Trash2, User,
  Clock, MapPin, Users as UsersIcon, Crown, BookOpen, Heart, Ticket,
  HandHeart, MessageCircle, Church, Send, Archive,
} from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import {
  useReplies, useComments, addCommentAsCurrentUser,
  useReactions, toggleReaction, usePrayed, togglePrayed,
  recordShare, useShareCount, isPinned,
  useCanManagePosts, pinForDays, unpinPost, archivePost,
  deleteUserPost, isUserOwnedPost,
} from "@/features/church/post-store";
import { useChurchPost } from "@/features/church/use-church-posts";
import { useChurchDashboard } from "@/features/church/use-church-dashboard";
import {
  AttendButton, CondolencePopup, CongratsPopup, ReservePopup,
} from "@/features/church/PostActions";
import { kindForPostType, usePostRegistrations } from "@/features/church/post-registrations";
import { getCurrentUser } from "@/features/church/current-user";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { PostImage } from "@/features/church/PostImage";

const GLASS =
  "rounded-[24px] border border-white/70 bg-[#fbf3e1]/90 backdrop-blur-xl shadow-[0_20px_44px_-24px_rgba(60,40,16,0.5),inset_0_1px_0_rgba(255,255,255,0.85)]";
const ATTENDEES_HEAD = 3;
const ATTENDEES_SCROLL_MAX = 72;

const TEXT_SAFE =
  "break-words [overflow-wrap:anywhere] max-w-full min-w-0 overflow-hidden";

function typeMeta(type: ChurchPost["type"]) {
  return POST_TYPE_META[type] ?? POST_TYPE_META.news;
}

function showsCommentsSection(type: ChurchPost["type"]) {
  return type !== "wedding" && type !== "condolence";
}

function PostNotFound() {
  return (
    <main dir="rtl" className="min-h-screen w-full bg-[#f4ead8] grid place-items-center px-4 text-[#3a2a18]">
      <div className={GLASS + " max-w-sm w-full p-6 text-center"}>
        <p className="font-arabic-serif text-[17px] font-extrabold text-[#3a2a18]">المنشور غير موجود</p>
        <p className="mt-2 text-[12px] text-[#6a543a] leading-relaxed">ربما أُزيل أو انتهت مدته.</p>
        <Link
          to="/church"
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] px-5 py-2.5 text-[13px] font-extrabold text-white active:scale-95"
        >
          <ChevronLeft className="h-4 w-4 -scale-x-100" />
          العودة لمنشورات الكنيسة
        </Link>
      </div>
    </main>
  );
}

function PostExcerptBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = text.trim();
  const long = trimmed.length > 120;

  return (
    <div className="mt-2 min-w-0 max-w-full overflow-hidden text-right">
      <p
        className={
          "text-[13px] text-[#6a543a] leading-relaxed text-right " +
          TEXT_SAFE +
          " " +
          (expanded ? "whitespace-pre-wrap" : "line-clamp-3 whitespace-pre-wrap")
        }
      >
        {text}
      </p>
      {long && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-[11.5px] font-extrabold text-[#7a5a9a] active:scale-95"
        >
          عرض المزيد
        </button>
      ) : null}
    </div>
  );
}

export const Route = createFileRoute("/church/post/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — منشور الكنيسة" }] }),
  component: ChurchPostScreen,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#f4ead8] text-[#3a2a18] font-bold">
      المنشور غير موجود
    </div>
  ),
});

function ChurchPostScreen() {
  const { id } = useParams({ from: "/church/post/$id" });
  const postId = (id ?? "").trim();
  const { post, loading } = useChurchPost(postId);
  const { data } = useChurchDashboard();
  const churchName = data?.church.name ?? "الكنيسة";

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen grid place-items-center bg-[#f4ead8] px-4">
        <p className="text-[13px] font-bold text-[#6a543a]">جاري تحميل المنشور…</p>
      </main>
    );
  }

  if (!postId || !post) {
    return <PostNotFound />;
  }

  const meta = typeMeta(post.type);
  const pinned = isPinned(post);
  const title = post.title?.trim() || "منشور الكنيسة";
  const excerpt = post.excerpt?.trim() || "";
  const body = post.body?.trim() || excerpt || "";

  return (
    <main dir="rtl" className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#f4ead8]">
      <CopticWatermark />

      <PostHero post={post} meta={meta} pinned={pinned} title={title} excerpt={excerpt} />

      <div className="relative mx-auto w-full max-w-[var(--alpha-dock-max-width)] px-4 -mt-5 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] space-y-3">
        <article className={GLASS + " p-4 min-w-0 overflow-hidden"}>
          <p className="text-[10.5px] font-extrabold text-[#6aaf8a] text-right">{churchName}</p>
          <h1
            className={
              "mt-1 font-arabic-serif text-[21px] font-extrabold text-[#3a2a18] leading-snug text-right break-words [overflow-wrap:anywhere] max-w-full min-w-0"
            }
          >
            {title}
          </h1>
          {excerpt ? <PostExcerptBlock text={excerpt} /> : null}
          <PostMetaBar post={post} />
          <TemplateDetails post={post} />
          <GoldDivider />
          <p
            className={
              "text-right text-[14px] leading-[1.85] text-[#3a2a18] whitespace-pre-line break-words [overflow-wrap:anywhere] max-w-full min-w-0 overflow-hidden"
            }
          >
            {body}
          </p>
          {post.details?.verse ? (
            <blockquote className="mt-3 rounded-2xl border-r-[3px] border-[#9b87c4] bg-white/70 p-3 text-right text-[13px] text-[#3a2a18] leading-relaxed">
              ✚ {post.details.verse}
            </blockquote>
          ) : null}
        </article>

        <EngagementStats post={post} />
        <PostActionArea post={post} />
        <ParticipantsSection post={post} />

        {post.type === "condolence" ? <RepliesList postId={post.id} kind="condolence" /> : null}
        {post.type === "wedding" ? <RepliesList postId={post.id} kind="congrats" /> : null}

        {showsCommentsSection(post.type) ? <CommentsSection postId={post.id} /> : null}
        <ChurchInfoCard post={post} />
        <AdminActionsPanel post={post} />
      </div>
    </main>
  );
}

function PostHero({
  post,
  meta,
  pinned,
  title,
  excerpt,
}: {
  post: ChurchPost;
  meta: (typeof POST_TYPE_META)[ChurchPost["type"]];
  pinned: boolean;
  title: string;
  excerpt: string;
}) {
  const onShare = async () => {
    const url = `${window.location.origin}/church/post/${post.id}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text: excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      recordShare(post.id);
    } catch { /* cancelled */ }
  };

  return (
    <div className="relative">
      <div className="relative h-[min(42vw,280px)] min-h-[200px] w-full overflow-hidden bg-[#3a2a18]">
        <PostImage post={post} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0603]/55 via-transparent to-[#f4ead8]" />
      </div>
      <header className="absolute top-0 left-0 right-0 px-4 pt-[max(env(safe-area-inset-top),14px)]">
        <div className="flex items-center justify-between">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <button
            type="button"
            aria-label="مشاركة"
            onClick={onShare}
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
          >
            <Share2 className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </header>
      <div className="absolute bottom-6 right-4 left-4 flex items-center gap-1.5 flex-wrap justify-end">
        <span
          className="inline-flex items-center rounded-full font-extrabold text-white px-3 py-1 text-[11px] border border-white/30 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
          style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
        >
          {meta.label}{post.details?.eventType ? ` · ${post.details.eventType}` : ""}
        </span>
        {pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#9b87c4] px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/40 shadow">
            <Pin className="h-3 w-3" strokeWidth={2.8} /> مثبت
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EngagementStats({ post }: { post: ChurchPost }) {
  const r = useReactions(post.id);
  const comments = useComments(post.id);
  const shares = useShareCount(post.id);
  const prayed = usePrayed(post.id);
  const regKind = kindForPostType(post.type);
  const { count: regCount } = usePostRegistrations(post.id, regKind ?? "attendance");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/75 border border-white/80 px-3 py-2.5 text-[11.5px] font-extrabold text-[#3a2a18]">
      <button
        type="button"
        aria-pressed={r.love.mine}
        aria-label={r.love.mine ? "إلغاء الإعجاب" : "إعجاب"}
        onClick={() => toggleReaction(post.id, "love")}
        className="inline-flex items-center gap-1.5 active:scale-95"
      >
        <Heart
          className={"h-4 w-4 " + (r.love.mine ? "text-[#e0464d] fill-current" : "text-[#c44569]")}
          strokeWidth={2.4}
        />
        {r.love.count.toLocaleString("ar-EG")}
      </button>
      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 text-[#5b8fd1]" strokeWidth={2.4} />
        {comments.length.toLocaleString("ar-EG")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Share2 className="h-4 w-4 text-[#7a4a26]" strokeWidth={2.4} />
        {shares.toLocaleString("ar-EG")}
      </span>
      {post.type === "prayer" ? (
        <span className="inline-flex items-center gap-1.5">
          <HandHeart className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2.4} />
          {prayed.count.toLocaleString("ar-EG")}
        </span>
      ) : null}
      {regKind ? (
        <span className="inline-flex items-center gap-1.5">
          <UsersIcon className="h-4 w-4 text-[#1f8a5a]" strokeWidth={2.4} />
          {regCount.toLocaleString("ar-EG")}
        </span>
      ) : null}
    </div>
  );
}

function ParticipantsSection({ post }: { post: ChurchPost }) {
  const regKind = kindForPostType(post.type);
  const { rows = [], count = 0 } = usePostRegistrations(post.id, regKind ?? undefined);
  const capacity = post.type === "trip" ? post.details?.seats : undefined;
  const user = getCurrentUser();

  if (!regKind) return null;

  const safeRows = Array.isArray(rows) ? rows : [];
  const title =
    post.type === "trip" ? "المحجوزون" : post.type === "event" ? "المهتمون" : "الحاضرون";
  const head = safeRows.slice(0, ATTENDEES_HEAD);
  const tail = safeRows.slice(ATTENDEES_HEAD);

  const attendeeRow = (r: (typeof safeRows)[number]) => (
    <li
      key={r.id}
      className="flex items-center gap-2 rounded-lg bg-white/75 border border-[#efe2c4] px-2 py-1.5"
    >
      <MemberAvatar
        name={r.userName || "مشارك"}
        avatarUrl={r.userId === user.id ? user.avatarUrl : undefined}
        size="xs"
      />
      <div className="min-w-0 flex-1 text-right">
        <span className="font-arabic-serif text-[11.5px] font-extrabold text-[#3a2a18] truncate block">
          {r.userName || "مشارك"}
        </span>
        {post.type === "trip" && (r.seats ?? 0) > 1 ? (
          <span className="text-[9.5px] font-bold text-[#7a5a30]">
            {(r.seats ?? 0).toLocaleString("ar-EG")} مقعد
          </span>
        ) : null}
      </div>
    </li>
  );

  return (
    <section className={GLASS + " p-3 text-right"}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[10.5px] font-extrabold text-[#7a5a9a] inline-flex items-center gap-1.5">
          <UsersIcon className="h-3 w-3" />
          {title}
        </p>
        <span className="text-[10.5px] font-extrabold text-[#3a2a18] tabular-nums">
          {count.toLocaleString("ar-EG")}
          {capacity != null ? ` / ${capacity.toLocaleString("ar-EG")}` : ""}
        </span>
      </div>
      {post.type === "trip" && capacity != null ? (
        <div className="mb-1.5 flex items-center justify-between rounded-lg bg-white/70 border border-[#efe2c4] px-2 py-1 text-[10px]">
          <span className="text-[#6a543a]">المطلوب</span>
          <span className="font-extrabold text-[#3a2a18]">{capacity.toLocaleString("ar-EG")} مقعد</span>
        </div>
      ) : null}
      {safeRows.length === 0 ? (
        <p className="text-[10.5px] text-[#6a543a] py-1">لا يوجد مشاركون بعد.</p>
      ) : (
        <div className="max-h-[120px] flex flex-col">
          <ul className="space-y-1">{head.map(attendeeRow)}</ul>
          {tail.length > 0 ? (
            <ul
              className="mt-1 space-y-1 overflow-y-auto overscroll-contain"
              style={{ maxHeight: ATTENDEES_SCROLL_MAX }}
            >
              {tail.map(attendeeRow)}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-2 justify-center my-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#9b87c4]/50 to-transparent" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#9b87c4]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9b87c4]/50 to-transparent" />
    </div>
  );
}

function PostMetaBar({ post }: { post: ChurchPost }) {
  const eventWhen = [post.details?.date, post.details?.time].filter(Boolean).join(" · ");
  return (
    <div className="mt-3 rounded-2xl bg-white/65 border border-[#efe2c4] px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-end text-[11px] text-[#6a543a]">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-[#7a5a9a] shrink-0" />
          <span className="font-extrabold text-[#3a2a18]">{post.author || "الكنيسة"}</span>
        </span>
        {post.date ? (
          <>
            <span className="text-[#9b87c4]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#7a5a9a] shrink-0" />
              {post.date}
            </span>
          </>
        ) : null}
        {eventWhen ? (
          <>
            <span className="text-[#9b87c4]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#7a5a9a] shrink-0" />
              {eventWhen}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value?: string | number }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-right">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/85 border border-[#efe2c4] text-[#7a5a9a] shrink-0">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-[#6aaf8a] leading-none">{label}</p>
        <p className="mt-0.5 text-[12.5px] font-extrabold text-[#3a2a18] leading-tight break-words">{String(value)}</p>
      </div>
    </div>
  );
}

function TemplateDetails({ post }: { post: ChurchPost }) {
  const d = post.details;
  if (!d) return null;
  const rows: React.ReactNode[] = [];
  if (post.type === "wedding") {
    rows.push(<DetailRow key="g" icon={Heart} label="العريس" value={d.groom} />);
    rows.push(<DetailRow key="b" icon={Heart} label="العروسة" value={d.bride} />);
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
  } else if (post.type === "condolence") {
    rows.push(<DetailRow key="n" icon={User} label="المنتقل" value={d.personName} />);
    rows.push(<DetailRow key="dd" icon={CalendarDays} label="تاريخ الوفاة" value={d.deathDate} />);
  } else if (post.type === "liturgy") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="t" icon={Clock} label="الوقت" value={d.time} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
    rows.push(<DetailRow key="pr" icon={Crown} label="الكاهن" value={d.priest} />);
  } else if (post.type === "meeting" || post.type === "event") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="t" icon={Clock} label="الوقت" value={d.time} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
    rows.push(<DetailRow key="a" icon={UsersIcon} label="الفئة" value={d.audience} />);
  } else if (post.type === "trip") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="الذهاب" value={d.date} />);
    rows.push(<DetailRow key="r" icon={CalendarDays} label="العودة" value={d.returnDate} />);
    rows.push(<DetailRow key="pl" icon={MapPin} label="أماكن الزيارة" value={d.places} />);
    rows.push(<DetailRow key="s" icon={Ticket} label="الأماكن المتاحة" value={d.seats} />);
  }
  const visible = rows.filter(Boolean);
  if (!visible.length) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-2xl bg-white/60 border border-[#efe2c4] p-3">
      {visible}
    </div>
  );
}

function PostActionArea({ post }: { post: ChurchPost }) {
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve">(null);
  const regKind = kindForPostType(post.type);
  const { count, mine } = usePostRegistrations(post.id, regKind ?? "attendance");
  const remaining = post.details?.seats != null ? Math.max(0, post.details.seats - count) : undefined;
  const prayed = usePrayed(post.id);

  const wrap = (children: React.ReactNode) => (
    <div className={GLASS + " p-4"}>{children}</div>
  );

  if (post.type === "liturgy" || post.type === "meeting") {
    return wrap(
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold text-[#6a543a] text-right">هل ستحضر؟</p>
        <AttendButton postId={post.id} kind="attendance" label="سجل حضوري" activeLabel="✓ سجلت حضوري" />
      </div>
    );
  }
  if (post.type === "event") {
    return wrap(
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold text-[#6a543a] text-right">سجّل اهتمامك</p>
        <AttendButton postId={post.id} kind="event" label="سجل في الفعالية" activeLabel="✓ سجلت" />
      </div>
    );
  }
  if (post.type === "trip") {
    return (
      <>
        {wrap(
          <div className="space-y-2.5">
            <div className="flex justify-between text-[12px] font-bold text-[#6a543a]">
              <span>حجوزاتك: {(mine?.seats ?? 0).toLocaleString("ar-EG")}</span>
              <span>المحجوز: {count.toLocaleString("ar-EG")}{remaining != null ? ` · متاح ${remaining.toLocaleString("ar-EG")}` : ""}</span>
            </div>
            <button
              type="button"
              onClick={() => setPopup("reserve")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1f8a5a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(31,138,90,0.7)] active:scale-[0.98]"
            >
              <Ticket className="h-4 w-4" /> احجز الآن
            </button>
          </div>
        )}
        {popup === "reserve" ? (
          <ReservePopup postId={post.id} postTitle={post.title} totalSeats={post.details?.seats} onClose={() => setPopup(null)} />
        ) : null}
      </>
    );
  }
  if (post.type === "wedding") {
    return (
      <>
        {wrap(
          <button type="button" onClick={() => setPopup("congrats")} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#d97a8a] text-white text-[13px] font-extrabold py-2.5 active:scale-[0.98]">
            <Heart className="h-4 w-4 fill-current" strokeWidth={0} /> شارك التهنئة
          </button>
        )}
        {popup === "congrats" ? <CongratsPopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }
  if (post.type === "condolence") {
    return (
      <>
        {wrap(
          <button type="button" onClick={() => setPopup("condolence")} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#6a543a] text-white text-[13px] font-extrabold py-2.5 active:scale-[0.98]">
            <BookOpen className="h-4 w-4" /> أرسل تعزية
          </button>
        )}
        {popup === "condolence" ? <CondolencePopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }
  if (post.type === "prayer") {
    return wrap(
      <div className="space-y-2">
        <p className="text-[12px] font-bold text-[#6a543a] text-right">{prayed.count.toLocaleString("ar-EG")} صلّوا</p>
        <button
          type="button"
          onClick={() => togglePrayed(post.id)}
          className={"w-full inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-extrabold py-2.5 active:scale-[0.98] " + (prayed.mine ? "bg-[#8a6ec1] text-white" : "bg-gradient-to-l from-[#6a4ab5] to-[#8a6ec1] text-white")}
        >
          <HandHeart className="h-4 w-4" />
          {prayed.mine ? "صلّيت ✓" : "أنا صلّيت"}
        </button>
      </div>
    );
  }
  return null;
}

function CommentsSection({ postId }: { postId: string }) {
  const comments = useComments(postId) ?? [];
  const [text, setText] = useState("");
  const user = getCurrentUser();

  const submit = () => {
    addCommentAsCurrentUser(postId, text);
    setText("");
  };

  return (
    <div className={GLASS + " p-4 text-right"}>
      <p className="text-[11px] font-extrabold text-[#7a5a9a] mb-2 inline-flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" />
        التعليقات ({comments.length.toLocaleString("ar-EG")})
      </p>
      {comments.length > 0 ? (
        <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-2xl bg-white/80 border border-[#efe2c4] p-2.5">
              <MemberAvatar name={c.name || "مستخدم"} avatarUrl={c.name === user.name ? user.avatarUrl : undefined} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-arabic-serif text-[12px] font-extrabold text-[#3a2a18]">{c.name || "مستخدم"}</p>
                <p className="mt-0.5 text-[12px] text-[#3a2a18] leading-snug">{c.text || ""}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-[#6a543a] mb-3">لا توجد تعليقات بعد</p>
      )}
      <div className="flex items-center gap-2 rounded-full bg-white/85 border border-[#efe2c4] pl-1 pr-3 py-1">
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          aria-label="إرسال"
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white disabled:opacity-40 active:scale-90"
        >
          <Send className="h-3.5 w-3.5 -scale-x-100" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="اكتب تعليقاً..."
          className="flex-1 bg-transparent text-right text-[12.5px] text-[#3a2a18] placeholder:text-[#a99060] outline-none py-1"
          dir="rtl"
        />
      </div>
    </div>
  );
}

function ChurchInfoCard({ post }: { post: ChurchPost }) {
  const { data } = useChurchDashboard();
  const churchName = data?.church.name ?? "الكنيسة";
  const meta = typeMeta(post.type);
  return (
    <div className={GLASS + " p-4 text-right"}>
      <p className="text-[10.5px] font-bold text-[#6aaf8a] mb-2">معلومات الكنيسة</p>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white border border-white/40" style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}>
          <Church className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18]">{churchName}</p>
          <p className="mt-1 text-[11px] text-[#6a543a] leading-relaxed">
            نشر بواسطة {post.author || "الكنيسة"} · {meta.label}
          </p>
          <Link to="/church" className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1f8a5a]">
            العودة لمنشورات الكنيسة
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RepliesList({ postId, kind }: { postId: string; kind: "condolence" | "congrats" }) {
  const replies = useReplies(kind, postId) ?? [];
  const user = getCurrentUser();
  const title = kind === "condolence" ? "التعازي" : "التهاني";
  const empty =
    kind === "condolence" ? "كن أول من يرسل تعزية." : "كن أول من يشارك تهنئة.";

  return (
    <div className={GLASS + " p-4 text-right"}>
      <p className="text-[11px] font-extrabold text-[#7a5a9a] mb-2 inline-flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" />
        {title} ({replies.length.toLocaleString("ar-EG")})
      </p>
      {replies.length === 0 ? (
        <p className="text-[11px] text-[#6a543a]">{empty}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {replies.map((r) => (
            <div key={r.id} className="flex items-start gap-2 rounded-2xl bg-white/80 border border-[#efe2c4] p-2.5">
              <MemberAvatar
                name={r.name || "مستخدم"}
                avatarUrl={r.name === user.name ? user.avatarUrl : undefined}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="font-arabic-serif text-[12px] font-extrabold text-[#3a2a18]">{r.name || "مستخدم"}</p>
                <p className="mt-0.5 text-[12px] text-[#3a2a18] leading-snug whitespace-pre-line">{r.text || ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminActionsPanel({ post }: { post: ChurchPost }) {
  const canManage = useCanManagePosts();
  const navigate = useNavigate();
  const pinned = isPinned(post);
  const [pinOpen, setPinOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!canManage) return null;

  const handleArchive = () => {
    archivePost(post.id);
    navigate({ to: "/church/archive" });
  };

  const handleDelete = () => {
    if (isUserOwnedPost(post.id)) deleteUserPost(post.id);
    else archivePost(post.id);
    setDeleteOpen(false);
    navigate({ to: "/church" });
  };

  return (
    <>
      <div className={GLASS + " p-3.5"}>
        <p className="text-[10.5px] font-bold text-[#7a5a9a] mb-2 text-right">إجراءات الكهنة والخدام</p>
        <div className="flex flex-wrap gap-2 justify-end">
          <AdminBtn icon={Pin} label={pinned ? "إلغاء التثبيت" : "تثبيت"} tone="#9b87c4" onClick={() => (pinned ? unpinPost(post.id) : setPinOpen(true))} />
          <AdminBtn icon={Archive} label="أرشفة" tone="#6a543a" onClick={handleArchive} />
          <AdminBtn icon={Pencil} label="تعديل" tone="#5b8fd1" onClick={() => window.alert("تعديل المنشور — قريباً")} />
          <AdminBtn icon={Trash2} label="حذف" tone="#a85450" onClick={() => setDeleteOpen(true)} />
        </div>
      </div>
      {pinOpen ? <PinDurationSheet postId={post.id} onClose={() => setPinOpen(false)} /> : null}
      {deleteOpen ? (
        <ConfirmSheet
          title="تأكيد الحذف"
          message={isUserOwnedPost(post.id) ? "هل تريد حذف هذا المنشور نهائياً؟" : "منشورات النظام تُؤرشف. هل تريد المتابعة؟"}
          confirmLabel="حذف"
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
        />
      ) : null}
    </>
  );
}

function AdminBtn({ icon: Icon, label, tone, onClick }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; tone: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-extrabold shadow active:scale-95" style={{ color: tone }}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
    </button>
  );
}

function PinDurationSheet({ postId, onClose }: { postId: string; onClose: () => void }) {
  const days = [1, 3, 7, 14];
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#1a0f04]/22" />
      <div className="relative w-full max-w-[var(--alpha-dock-max-width)] rounded-t-[24px] border border-white/75 bg-[#fbf3e1]/96 backdrop-blur-md p-4 text-right shadow-xl">
        <p className="font-extrabold text-[#3a2a18] mb-3">مدة التثبيت</p>
        <div className="grid grid-cols-2 gap-2">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { pinForDays(postId, d); onClose(); }}
              className="rounded-2xl bg-white/85 border border-[#efe2c4] py-2.5 text-[13px] font-extrabold text-[#3a2a18] active:scale-95"
            >
              {d.toLocaleString("ar-EG")} {d === 1 ? "يوم" : "أيام"}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }: { title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#1a0f04]/22" />
      <div className="relative w-full max-w-[380px] rounded-[24px] border border-white/75 bg-[#fbf3e1]/96 backdrop-blur-md p-4 text-right shadow-xl">
        <p className="font-extrabold text-[#3a2a18]">{title}</p>
        <p className="mt-2 text-[12px] text-[#6a543a] leading-relaxed">{message}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-[#efe2c4] bg-white/90 py-2 text-[12px] font-extrabold text-[#6a543a]">إلغاء</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-full bg-[#a85450] py-2 text-[12px] font-extrabold text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
