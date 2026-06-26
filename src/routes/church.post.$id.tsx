import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft, CalendarDays, Share2, Pin, Pencil, Trash2, User,
  Clock, MapPin, Users as UsersIcon, Crown, BookOpen, Heart, Ticket,
  HandHeart, MessageCircle, Church, Send, Archive, CheckCircle2,
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
import { isTripPostPublished } from "@/features/church/trip-organizer";
import { WaitlistOfferBanner } from "@/features/church/trip-reservations/components/WaitlistOfferBanner";
import { TripPrayerPanel } from "@/features/church/trip-reservations/components/TripPrayerPanel";
import { TripGeoCheckInButton } from "@/features/church/trip-reservations/components/TripGeoCheckInButton";
import { TripPostArchiveSection } from "@/features/church/trip-reservations/components/TripPostArchiveSection";
import { TripWalletStrip } from "@/features/church/trip-reservations/components/TripWalletStrip";
import { getCurrentUser } from "@/features/church/current-user";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { PostImage } from "@/features/church/PostImage";
import { postCardStyle } from "@/features/church-mixed-feed/post-card-styles";
import { PostImageGallery } from "@/features/church-mixed-feed/PostImageGallery";
import { getPostImages } from "@/features/church-mixed-feed/post-media";

/* ────────────────────────────────────────────────────────────────────── */
/* Palette helpers                                                         */
/* ────────────────────────────────────────────────────────────────────── */

function darkShell(type: ChurchPost["type"]): React.CSSProperties {
  const map: Partial<Record<ChurchPost["type"], string>> = {
    prayer:      "linear-gradient(180deg,#1e1530 0%,#18102c 100%)",
    wedding:     "linear-gradient(180deg,#231408 0%,#1e1008 100%)",
    condolence:  "linear-gradient(180deg,#1a1510 0%,#141009 100%)",
    trip:        "linear-gradient(180deg,#0c1e16 0%,#091410 100%)",
    event:       "linear-gradient(180deg,#1f0c10 0%,#160a0c 100%)",
    meeting:     "linear-gradient(180deg,#0d1826 0%,#091420 100%)",
    liturgy:     "linear-gradient(180deg,#1e1208 0%,#160e06 100%)",
    news:        "linear-gradient(180deg,#161208 0%,#100e06 100%)",
    announcement:"linear-gradient(180deg,#1a0e16 0%,#14080f 100%)",
    report:      "linear-gradient(180deg,#0e1220 0%,#0a0e18 100%)",
  };
  return { background: map[type] ?? "linear-gradient(180deg,#1a1510 0%,#140f0a 100%)" };
}

function darkBase(type: ChurchPost["type"]): string {
  const map: Partial<Record<ChurchPost["type"], string>> = {
    prayer: "#241637", wedding: "#3a2414", condolence: "#231a12",
    trip: "#0e1b14", event: "#28101a", meeting: "#0e1b2c",
    liturgy: "#261a0c", news: "#1e1408", announcement: "#221018", report: "#0e1228",
  };
  return map[type] ?? "#1a1510";
}

/* Shared dark-glass card wrapper */
function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={"rounded-[20px] " + className}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(12px)",
      }}
    >
      {children}
    </div>
  );
}

function DarkGoldDivider() {
  return (
    <div className="flex items-center gap-2 justify-center my-0.5" aria-hidden>
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,rgba(240,215,140,0.2),transparent)" }} />
      <span className="inline-block h-1 w-1 rotate-45 rounded-[1px]" style={{ background: "rgba(240,215,140,0.45)" }} />
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg,rgba(240,215,140,0.2),transparent)" }} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Route                                                                   */
/* ────────────────────────────────────────────────────────────────────── */

const TEXT_SAFE = "break-words [overflow-wrap:anywhere] max-w-full min-w-0 overflow-hidden";

function typeMeta(type: ChurchPost["type"]) {
  return POST_TYPE_META[type] ?? POST_TYPE_META.news;
}

function showsCommentsSection(type: ChurchPost["type"]) {
  return type !== "wedding" && type !== "condolence";
}

function PostNotFound() {
  return (
    <main dir="rtl" className="min-h-screen w-full grid place-items-center px-4"
      style={{ background: "linear-gradient(180deg,#1a1510 0%,#140f0a 100%)" }}>
      <DarkCard className="max-w-sm w-full p-6 text-center">
        <p className="font-arabic-serif text-[17px] font-extrabold text-white/90">المنشور غير موجود</p>
        <p className="mt-2 text-[12px] text-white/45 leading-relaxed">ربما أُزيل أو انتهت مدته.</p>
        <Link
          to="/church"
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] px-5 py-2.5 text-[13px] font-extrabold text-white active:scale-95"
        >
          <ChevronLeft className="h-4 w-4 -scale-x-100" />
          العودة لمنشورات الكنيسة
        </Link>
      </DarkCard>
    </main>
  );
}

export const Route = createFileRoute("/church/post/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — منشور الكنيسة" }] }),
  component: ChurchPostScreen,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center font-bold text-white"
      style={{ background: "linear-gradient(180deg,#1a1510 0%,#140f0a 100%)" }}>
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
      <main dir="rtl" className="min-h-screen grid place-items-center px-4"
        style={{ background: "linear-gradient(180deg,#1a1510 0%,#140f0a 100%)" }}>
        <p className="text-[13px] font-bold text-white/50">جاري تحميل المنشور…</p>
      </main>
    );
  }

  if (!postId || !post) return <PostNotFound />;

  const meta = typeMeta(post.type);
  const style = postCardStyle(post.type);
  const pinned = isPinned(post);
  const title = post.title?.trim() || "منشور الكنيسة";
  const excerpt = post.excerpt?.trim() || "";
  const body = post.body?.trim() || excerpt || "";
  const base = darkBase(post.type);
  const postImages = getPostImages(post);
  const multiImage = postImages.length > 1;

  return (
    <main
      dir="rtl"
      className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto"
      style={darkShell(post.type)}
    >
      <CopticWatermark />

      {/* ── Full-bleed hero image (single image only) ── */}
      {!multiImage && postImages.length > 0 && (
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "min(56vw, 320px)", minHeight: "210px" }}
      >
        <PostImage post={post} loading="eager" className="absolute inset-0 h-full w-full object-cover object-center" />

        {/* Gradient — top dark overlay + bottom blends into page bg */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 40%, ${base}cc 75%, ${base} 100%)`
        }} />
        {/* Left + right edge subtle fades */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8"
          style={{ background: `linear-gradient(to right,${base},transparent)` }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{ background: `linear-gradient(to left,${base},transparent)` }} />

        {/* Header: back + share */}
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top,0px),14px)]">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white active:scale-90 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.6)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <ShareButton post={post} title={title} excerpt={excerpt} />
        </header>

        {/* Type badge + pinned at bottom */}
        <div className="absolute bottom-3 right-4 left-4 flex items-center gap-1.5 flex-wrap justify-end">
          <span
            className="inline-flex items-center rounded-full font-extrabold text-white px-3 py-1 text-[11px] border border-white/30 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
            style={{ background: `linear-gradient(180deg,${meta.tone},${meta.tone}cc)` }}
          >
            {meta.label}{post.details?.eventType ? ` · ${post.details.eventType}` : ""}
          </span>
          {pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9b87c4]/90 px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/30">
              <Pin className="h-3 w-3" strokeWidth={2.8} /> مثبت
            </span>
          )}
        </div>
      </div>
      )}

      {(multiImage || postImages.length === 0) && (
        <header className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top,0px),14px)] pb-2">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white active:scale-90"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <ShareButton post={post} title={title} excerpt={excerpt} />
        </header>
      )}

      {/* ── Content ── */}
      <div
        className="relative mx-auto w-full max-w-[var(--alpha-dock-max-width)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] space-y-3"
        style={{ marginTop: multiImage || postImages.length === 0 ? "0" : "-12px" }}
      >
        {/* Top gold stripe */}
        <div aria-hidden className="h-px w-full"
          style={{ background: `linear-gradient(90deg,transparent,${style.tone}55,transparent)` }} />

        {/* Church name + title + excerpt */}
        <div dir="rtl" className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
            <p className="text-[12px] font-extrabold text-white/90">{churchName}</p>
            <CheckCircle2 className="h-3 w-3 text-[#5b9fd8]" strokeWidth={2.5} />
          </div>
          <h1
            className={"font-arabic-serif text-[22px] font-extrabold text-white leading-snug text-right " + TEXT_SAFE}
          >
            {title}
          </h1>
          {excerpt ? <PostExcerptBlock text={excerpt} /> : null}
        </div>

        {multiImage ? (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <PostImageGallery post={post} maxVisible={10} />
          </div>
        ) : null}

        {/* ── Comments section — immediately after image, same card style ── */}
        <DarkCommentsSection postId={post.id} show={showsCommentsSection(post.type)} tone={style.tone} />

        {/* Meta bar */}
        <DarkPostMetaBar post={post} />

        {/* Template details */}
        <DarkTemplateDetails post={post} style={style} />

        {/* Body text */}
        {body && body !== excerpt ? (
          <DarkGoldDivider />
        ) : null}
        {body ? (
          <p
            dir="rtl"
            className={"text-right text-[14px] leading-[1.85] text-white/80 whitespace-pre-line " + TEXT_SAFE}
          >
            {body}
          </p>
        ) : null}

        {/* Verse */}
        {post.details?.verse ? (
          <blockquote
            dir="rtl"
            className="rounded-2xl p-3 text-right text-[13px] text-white/75 leading-relaxed"
            style={{ borderRight: `3px solid ${style.tone}88`, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)` }}
          >
            ✚ {post.details.verse}
          </blockquote>
        ) : null}

        <DarkGoldDivider />

        {/* Engagement stats */}
        <DarkEngagementStats post={post} />

        {/* Action area */}
        <DarkPostActionArea post={post} tone={style.tone} />

        {/* Participants */}
        <DarkParticipantsSection post={post} />

        {/* Replies (condolence / wedding) */}
        {post.type === "condolence" ? <DarkRepliesList postId={post.id} kind="condolence" tone={style.tone} /> : null}
        {post.type === "wedding" ? <DarkRepliesList postId={post.id} kind="congrats" tone={style.tone} /> : null}

        {/* Church info footer */}
        <DarkChurchInfoCard post={post} churchName={churchName} />

        {/* Admin actions — always visible (testing mode) */}
        <DarkAdminActionsPanel post={post} />
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Share button                                                            */
/* ────────────────────────────────────────────────────────────────────── */
function ShareButton({ post, title, excerpt }: { post: ChurchPost; title: string; excerpt: string }) {
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
    <button
      type="button"
      aria-label="مشاركة"
      onClick={onShare}
      className="inline-grid h-10 w-10 place-items-center rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white active:scale-90 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.6)]"
    >
      <Share2 className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* PostExcerptBlock                                                        */
/* ────────────────────────────────────────────────────────────────────── */
function PostExcerptBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = text.trim();
  const long = trimmed.length > 120;
  return (
    <div className="mt-2 min-w-0 max-w-full overflow-hidden text-right">
      <p
        dir="rtl"
        className={"text-[13px] text-white/60 leading-relaxed text-right " + TEXT_SAFE + (expanded ? " whitespace-pre-wrap" : " line-clamp-3 whitespace-pre-wrap")}
      >
        {text}
      </p>
      {long && !expanded ? (
        <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-[11.5px] font-extrabold text-[#9b87c4] active:scale-95">
          عرض المزيد
        </button>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark meta bar                                                           */
/* ────────────────────────────────────────────────────────────────────── */
function DarkPostMetaBar({ post }: { post: ChurchPost }) {
  const eventWhen = [post.details?.date, post.details?.time].filter(Boolean).join(" · ");
  return (
    <DarkCard className="px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-end text-[11px] text-white/50" dir="rtl">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-white/30 shrink-0" />
          <span className="font-extrabold text-white/80">{post.author || "الكنيسة"}</span>
        </span>
        {post.date ? (
          <>
            <span className="text-white/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-white/30 shrink-0" />
              {post.date}
            </span>
          </>
        ) : null}
        {eventWhen ? (
          <>
            <span className="text-white/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white/30 shrink-0" />
              {eventWhen}
            </span>
          </>
        ) : null}
      </div>
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark detail row                                                         */
/* ────────────────────────────────────────────────────────────────────── */
function DarkDetailRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value?: string | number;
  tone: string;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-right" dir="rtl">
      <span
        className="grid h-7 w-7 place-items-center rounded-lg shrink-0"
        style={{ background: `${tone}18`, border: `1px solid ${tone}33` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: tone }} strokeWidth={2.4} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] font-extrabold leading-none" style={{ color: `${tone}90` }}>{label}</p>
        <p className="mt-0.5 text-[12.5px] font-extrabold text-white/85 leading-tight break-words">{String(value)}</p>
      </div>
    </div>
  );
}

function DarkTemplateDetails({ post, style }: { post: ChurchPost; style: { tone: string } }) {
  const d = post.details;
  if (!d) return null;
  const rows: React.ReactNode[] = [];
  const t = style.tone;
  if (post.type === "wedding") {
    rows.push(<DarkDetailRow key="g" icon={Heart} label="العريس" value={d.groom} tone={t} />);
    rows.push(<DarkDetailRow key="b" icon={Heart} label="العروسة" value={d.bride} tone={t} />);
    rows.push(<DarkDetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} tone={t} />);
    rows.push(<DarkDetailRow key="p" icon={MapPin} label="المكان" value={d.place} tone={t} />);
  } else if (post.type === "condolence") {
    rows.push(<DarkDetailRow key="n" icon={User} label="المنتقل" value={d.personName} tone={t} />);
    rows.push(<DarkDetailRow key="dd" icon={CalendarDays} label="تاريخ الوفاة" value={d.deathDate} tone={t} />);
  } else if (post.type === "liturgy") {
    rows.push(<DarkDetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} tone={t} />);
    rows.push(<DarkDetailRow key="ti" icon={Clock} label="الوقت" value={d.time} tone={t} />);
    rows.push(<DarkDetailRow key="p" icon={MapPin} label="المكان" value={d.place} tone={t} />);
    rows.push(<DarkDetailRow key="pr" icon={Crown} label="الكاهن" value={d.priest} tone={t} />);
  } else if (post.type === "meeting" || post.type === "event") {
    rows.push(<DarkDetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} tone={t} />);
    rows.push(<DarkDetailRow key="ti" icon={Clock} label="الوقت" value={d.time} tone={t} />);
    rows.push(<DarkDetailRow key="p" icon={MapPin} label="المكان" value={d.place} tone={t} />);
    rows.push(<DarkDetailRow key="a" icon={UsersIcon} label="الفئة" value={d.audience} tone={t} />);
  } else if (post.type === "trip") {
    rows.push(<DarkDetailRow key="d" icon={CalendarDays} label="الذهاب" value={d.date} tone={t} />);
    rows.push(<DarkDetailRow key="r" icon={CalendarDays} label="العودة" value={d.returnDate} tone={t} />);
    rows.push(<DarkDetailRow key="pl" icon={MapPin} label="أماكن الزيارة" value={d.places} tone={t} />);
    rows.push(<DarkDetailRow key="s" icon={Ticket} label="الأماكن المتاحة" value={d.seats} tone={t} />);
    rows.push(<DarkDetailRow key="pr" icon={Ticket} label="السعر" value={d.price} tone={t} />);
    if (d.organizerName) rows.push(<DarkDetailRow key="org" icon={User} label="المنظم" value={d.organizerName} tone={t} />);
    if (d.approvedByName) rows.push(<DarkDetailRow key="ap" icon={Crown} label="اعتمدها" value={d.approvedByName} tone={t} />);
  }
  const visible = rows.filter(Boolean);
  if (!visible.length) return null;
  return (
    <DarkCard className="grid grid-cols-2 gap-x-3 gap-y-2.5 p-3">
      {visible}
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark engagement stats                                                   */
/* ────────────────────────────────────────────────────────────────────── */
function DarkEngagementStats({ post }: { post: ChurchPost }) {
  const r = useReactions(post.id);
  const comments = useComments(post.id);
  const shares = useShareCount(post.id);
  const prayed = usePrayed(post.id);
  const regKind = kindForPostType(post.type);
  const { count: regCount } = usePostRegistrations(post.id, regKind ?? "attendance");

  return (
    <DarkCard className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11.5px] font-extrabold text-white/70">
      <button
        type="button"
        aria-pressed={r.love.mine}
        aria-label={r.love.mine ? "إلغاء الإعجاب" : "إعجاب"}
        onClick={() => toggleReaction(post.id, "love")}
        className="inline-flex items-center gap-1.5 active:scale-95"
      >
        <Heart className={"h-4 w-4 " + (r.love.mine ? "text-[#e0464d] fill-current" : "text-[#c44569]")} strokeWidth={2.4} />
        {r.love.count.toLocaleString("ar-EG")}
      </button>
      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 text-[#5b8fd1]" strokeWidth={2.4} />
        {comments.length.toLocaleString("ar-EG")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Share2 className="h-4 w-4 text-white/40" strokeWidth={2.4} />
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
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark action area                                                        */
/* ────────────────────────────────────────────────────────────────────── */
function DarkPostActionArea({ post, tone }: { post: ChurchPost; tone: string }) {
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve">(null);
  const regKind = kindForPostType(post.type);
  const { count, mine } = usePostRegistrations(post.id, regKind ?? "attendance");
  const remaining = post.details?.seats != null ? Math.max(0, post.details.seats - count) : undefined;
  const prayed = usePrayed(post.id);

  if (post.type === "liturgy" || post.type === "meeting") {
    return (
      <DarkCard className="p-4">
        <div className="flex items-center justify-between gap-3" dir="rtl">
          <p className="text-[12px] font-bold text-white/60">هل ستحضر؟</p>
          <AttendButton postId={post.id} kind="attendance" label="سجل حضوري" activeLabel="✓ سجلت حضوري" />
        </div>
      </DarkCard>
    );
  }
  if (post.type === "event") {
    return (
      <DarkCard className="p-4">
        <div className="flex items-center justify-between gap-3" dir="rtl">
          <p className="text-[12px] font-bold text-white/60">سجّل اهتمامك</p>
          <AttendButton postId={post.id} kind="event" label="سجل في الفعالية" activeLabel="✓ سجلت" />
        </div>
      </DarkCard>
    );
  }
  if (post.type === "trip") {
    const tripPublished = isTripPostPublished(post);
    const pendingLabel =
      post.details?.approvalStatus === "changes_requested"
        ? "طُلب تعديل على الرحلة"
        : post.details?.approvalStatus === "rejected"
          ? "تم رفض الرحلة"
          : "الرحلة بانتظار اعتماد الكاهن";
    return (
      <>
        <WaitlistOfferBanner postId={post.id} />
        {!tripPublished ? (
          <DarkCard className="p-4 mb-3">
            <p className="text-[12px] font-extrabold text-[#f0c850]/80 text-right">{pendingLabel}</p>
            {post.details?.approvalNote ? (
              <p className="mt-1 text-[11px] text-white/50 text-right">{post.details.approvalNote}</p>
            ) : null}
          </DarkCard>
        ) : null}
        {tripPublished ? (
          <DarkCard className="p-4">
            <div className="space-y-2.5">
              <div className="flex justify-between text-[12px] font-bold text-white/60" dir="rtl">
                <span>حجوزاتك: {(mine?.seats ?? 0).toLocaleString("ar-EG")}</span>
                <span>المحجوز: {count.toLocaleString("ar-EG")}{remaining != null ? ` · متاح ${remaining.toLocaleString("ar-EG")}` : ""}</span>
              </div>
              {mine ? <TripWalletStrip registrationId={mine.id} /> : null}
              <button
                type="button"
                onClick={() => setPopup("reserve")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1f8a5a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(31,138,90,0.7)] active:scale-[0.98]"
              >
                <Ticket className="h-4 w-4" /> احجز الآن
              </button>
              <TripGeoCheckInButton postId={post.id} />
            </div>
          </DarkCard>
        ) : null}
        <TripPrayerPanel postId={post.id} />
        <TripPostArchiveSection post={post} />
        {popup === "reserve" ? (
          <ReservePopup postId={post.id} postTitle={post.title} totalSeats={post.details?.seats} onClose={() => setPopup(null)} />
        ) : null}
      </>
    );
  }
  if (post.type === "wedding") {
    return (
      <>
        <DarkCard className="p-4">
          <button
            type="button"
            onClick={() => setPopup("congrats")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-extrabold text-white active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${tone}cc,${tone}88)` }}
          >
            <Heart className="h-4 w-4 fill-current" strokeWidth={0} /> شارك التهنئة
          </button>
        </DarkCard>
        {popup === "congrats" ? <CongratsPopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }
  if (post.type === "condolence") {
    return (
      <>
        <DarkCard className="p-4">
          <button
            type="button"
            onClick={() => setPopup("condolence")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-extrabold text-white active:scale-[0.98]"
            style={{ background: "rgba(106,84,58,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <BookOpen className="h-4 w-4" /> أرسل تعزية
          </button>
        </DarkCard>
        {popup === "condolence" ? <CondolencePopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }
  if (post.type === "prayer") {
    return (
      <DarkCard className="p-4">
        <div className="space-y-2" dir="rtl">
          <p className="text-[12px] font-bold text-white/60">{prayed.count.toLocaleString("ar-EG")} صلّوا</p>
          <button
            type="button"
            onClick={() => togglePrayed(post.id)}
            className={"w-full inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-extrabold py-2.5 active:scale-[0.98] " + (prayed.mine ? "bg-[#8a6ec1] text-white" : "bg-gradient-to-l from-[#6a4ab5] to-[#8a6ec1] text-white")}
          >
            <HandHeart className="h-4 w-4" />
            {prayed.mine ? "صلّيت ✓" : "أنا صلّيت"}
          </button>
        </div>
      </DarkCard>
    );
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark participants section                                               */
/* ────────────────────────────────────────────────────────────────────── */
function DarkParticipantsSection({ post }: { post: ChurchPost }) {
  const regKind = kindForPostType(post.type);
  const { rows = [], count = 0 } = usePostRegistrations(post.id, regKind ?? undefined);
  const capacity = post.type === "trip" ? post.details?.seats : undefined;
  const user = getCurrentUser();

  if (!regKind) return null;
  const safeRows = Array.isArray(rows) ? rows : [];
  const title = post.type === "trip" ? "المحجوزون" : post.type === "event" ? "المهتمون" : "الحاضرون";
  const head = safeRows.slice(0, 3);
  const tail = safeRows.slice(3);

  const row = (r: (typeof safeRows)[number]) => (
    <li key={r.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <MemberAvatar name={r.userName || "مشارك"} avatarUrl={r.userId === user.id ? user.avatarUrl : undefined} size="xs" />
      <div className="min-w-0 flex-1 text-right">
        <span className="font-arabic-serif text-[11.5px] font-extrabold text-white/85 truncate block">{r.userName || "مشارك"}</span>
        {post.type === "trip" && (r.seats ?? 0) > 1 ? (
          <span className="text-[9.5px] font-bold text-white/40">{(r.seats ?? 0).toLocaleString("ar-EG")} مقعد</span>
        ) : null}
      </div>
    </li>
  );

  return (
    <DarkCard className="p-3 text-right">
      <div className="flex items-center justify-between gap-2 mb-1.5" dir="rtl">
        <p className="text-[10.5px] font-extrabold text-white/45 inline-flex items-center gap-1.5">
          <UsersIcon className="h-3 w-3" />{title}
        </p>
        <span className="text-[10.5px] font-extrabold text-white/70 tabular-nums">
          {count.toLocaleString("ar-EG")}{capacity != null ? ` / ${capacity.toLocaleString("ar-EG")}` : ""}
        </span>
      </div>
      {safeRows.length === 0 ? (
        <p className="text-[10.5px] text-white/35 py-1">لا يوجد مشاركون بعد.</p>
      ) : (
        <div className="max-h-[120px] flex flex-col">
          <ul className="space-y-1">{head.map(row)}</ul>
          {tail.length > 0 ? (
            <ul className="mt-1 space-y-1 overflow-y-auto overscroll-contain" style={{ maxHeight: 72 }}>
              {tail.map(row)}
            </ul>
          ) : null}
        </div>
      )}
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark replies list (congrats / condolence)                              */
/* ────────────────────────────────────────────────────────────────────── */
function DarkRepliesList({ postId, kind, tone }: { postId: string; kind: "condolence" | "congrats"; tone: string }) {
  const replies = useReplies(kind, postId) ?? [];
  const user = getCurrentUser();
  const title = kind === "condolence" ? "التعازي" : "التهاني";
  const empty = kind === "condolence" ? "كن أول من يرسل تعزية." : "كن أول من يشارك تهنئة.";

  return (
    <DarkCard className="p-4 text-right">
      <p className="text-[11px] font-extrabold text-white/45 mb-2 inline-flex items-center gap-1.5" dir="rtl">
        <MessageCircle className="h-3.5 w-3.5" style={{ color: tone }} />
        {title} ({replies.length.toLocaleString("ar-EG")})
      </p>
      {replies.length === 0 ? (
        <p className="text-[11px] text-white/30">{empty}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {replies.map((r) => (
            <div key={r.id} className="flex items-start gap-2 rounded-2xl p-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <MemberAvatar name={r.name || "مستخدم"} avatarUrl={r.name === user.name ? user.avatarUrl : undefined} size="sm" />
              <div className="min-w-0 flex-1 text-right">
                <p className="font-arabic-serif text-[12px] font-extrabold text-white/85">{r.name || "مستخدم"}</p>
                <p className="mt-0.5 text-[12px] text-white/65 leading-snug whitespace-pre-line">{r.text || ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark comments section — 2 visible + expand + inline input              */
/* ────────────────────────────────────────────────────────────────────── */
function DarkCommentsSection({ postId, show, tone }: { postId: string; show: boolean; tone: string }) {
  const comments = useComments(postId) ?? [];
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);
  const user = getCurrentUser();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll + focus when navigated via #comments hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#comments") return;
    const t = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => inputRef.current?.focus(), 300);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const submit = () => {
    if (!text.trim()) return;
    addCommentAsCurrentUser(postId, text);
    setText("");
    setShowAll(true);
  };

  const displayed = showAll ? comments : comments.slice(-5);
  const hiddenCount = comments.length - 5;

  return (
    <div id="comments" ref={sectionRef}>
      <div
        className="overflow-hidden rounded-[20px]"
        style={{
          border: `1px solid ${tone}22`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header row with comment count */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          dir="rtl"
          style={{
            background: `linear-gradient(180deg, ${tone}18 0%, rgba(0,0,0,0.2) 100%)`,
            borderBottom: `1px solid ${tone}22`,
          }}
        >
          <MessageCircle className="h-4 w-4 shrink-0" style={{ color: tone }} strokeWidth={2.2} />
          <p className="text-[12px] font-extrabold text-white/70">
            التعليقات {comments.length > 0 ? `(${comments.length.toLocaleString("ar-EG")})` : ""}
          </p>
        </div>

        {/* Comment input — prominently below header */}
        <div
          className="flex items-center gap-2.5 px-3 py-3"
          style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
          dir="rtl"
        >
          <MemberAvatar name={user.name || "أنت"} avatarUrl={user.avatarUrl} size="sm" className="shrink-0" />
          <div
            className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              ref={inputRef}
              placeholder="اكتب تعليقاً..."
              dir="rtl"
              className="flex-1 bg-transparent text-right text-[13px] text-white/80 placeholder:text-white/30 outline-none"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim()}
              aria-label="إرسال"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white disabled:opacity-25 active:scale-90 transition-transform"
              style={{ background: `linear-gradient(135deg,${tone},${tone}77)` }}
            >
              <Send className="h-3.5 w-3.5 -scale-x-100" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        {show && comments.length > 0 ? (
          <div className="space-y-0" style={{ background: "rgba(0,0,0,0.18)" }}>
            {!showAll && hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full text-center text-[11.5px] font-extrabold py-2 active:scale-95"
                style={{ color: `${tone}cc`, background: `${tone}0a`, borderBottom: `1px solid ${tone}18` }}
              >
                عرض كل التعليقات ({comments.length}) ↑
              </button>
            ) : null}
            {displayed.map((c, i) => (
              <div
                key={c.id}
                className="flex items-start gap-3 px-4 py-3"
                dir="rtl"
                style={{
                  borderBottom: i < displayed.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <MemberAvatar
                  name={c.name || "مستخدم"}
                  avatarUrl={c.name === user.name ? user.avatarUrl : undefined}
                  size="md"
                  className="shrink-0 border border-white/15"
                />
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-arabic-serif text-[13px] font-extrabold text-white/90 leading-none">{c.name || "مستخدم"}</p>
                  <p className="mt-1 text-[12.5px] text-white/65 leading-relaxed">{c.text || ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : show && comments.length === 0 ? (
          <p className="px-4 py-3 text-[12px] text-white/30 text-right" dir="rtl">كن أول من يعلّق ✨</p>
        ) : null}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark church info footer                                                 */
/* ────────────────────────────────────────────────────────────────────── */
function DarkChurchInfoCard({ post, churchName }: { post: ChurchPost; churchName: string }) {
  const meta = typeMeta(post.type);
  return (
    <DarkCard className="p-4 text-right">
      <p className="text-[10.5px] font-bold text-white/35 mb-2">معلومات الكنيسة</p>
      <div className="flex items-start gap-3" dir="rtl">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white border border-white/20"
          style={{ background: `linear-gradient(180deg,${meta.tone},${meta.tone}cc)` }}
        >
          <Church className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-arabic-serif text-[13.5px] font-extrabold text-white/85">{churchName}</p>
          <p className="mt-1 text-[11px] text-white/45 leading-relaxed">
            نشر بواسطة {post.author || "الكنيسة"} · {meta.label}
          </p>
          <Link to="/church" className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1f8a5a]">
            العودة لمنشورات الكنيسة
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </DarkCard>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Dark admin actions panel — always visible                              */
/* ────────────────────────────────────────────────────────────────────── */
function DarkAdminActionsPanel({ post }: { post: ChurchPost }) {
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
      <DarkCard className="p-3.5">
        <p className="text-[10.5px] font-bold text-white/35 mb-2 text-right">إجراءات الكهنة والخدام</p>
        <div className="flex flex-wrap gap-2 justify-end">
          <DarkAdminBtn icon={Pin} label={pinned ? "إلغاء التثبيت" : "تثبيت"} tone="#9b87c4" onClick={() => (pinned ? unpinPost(post.id) : setPinOpen(true))} />
          <DarkAdminBtn icon={Archive} label="أرشفة" tone="#a08060" onClick={handleArchive} />
          <DarkAdminBtn icon={Pencil} label="تعديل" tone="#5b8fd1" onClick={() => window.alert("تعديل المنشور — قريباً")} />
          <DarkAdminBtn icon={Trash2} label="حذف" tone="#e07070" onClick={() => setDeleteOpen(true)} />
        </div>
      </DarkCard>
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

function DarkAdminBtn({ icon: Icon, label, tone, onClick }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; tone: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold active:scale-95"
      style={{ background: `${tone}15`, border: `1px solid ${tone}30`, color: tone }}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Sheets                                                                  */
/* ────────────────────────────────────────────────────────────────────── */
function PinDurationSheet({ postId, onClose }: { postId: string; onClose: () => void }) {
  const days = [1, 3, 7, 14];
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-[var(--alpha-dock-max-width)] rounded-t-[24px] p-4 text-right shadow-xl"
        style={{ background: "linear-gradient(180deg,#1e1408,#160e06)", border: "1px solid rgba(240,215,140,0.15)" }}>
        <p className="font-extrabold text-white/90 mb-3">مدة التثبيت</p>
        <div className="grid grid-cols-2 gap-2">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { pinForDays(postId, d); onClose(); }}
              className="rounded-2xl py-2.5 text-[13px] font-extrabold text-white/80 active:scale-95"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
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

function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-[380px] rounded-[24px] p-4 text-right shadow-xl"
        style={{ background: "linear-gradient(180deg,#1e1408,#160e06)", border: "1px solid rgba(240,215,140,0.15)" }}>
        <p className="font-extrabold text-white/90">{title}</p>
        <p className="mt-2 text-[12px] text-white/50 leading-relaxed">{message}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full py-2 text-[12px] font-extrabold text-white/60 active:scale-95"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>إلغاء</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-full bg-[#a85450] py-2 text-[12px] font-extrabold text-white active:scale-95">{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
