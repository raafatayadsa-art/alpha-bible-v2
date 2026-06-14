import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Phone, MessageCircle, MapPin, ShieldCheck, Users,
  HandHeart, Newspaper, Radio, CalendarDays, BookOpen, Library, Heart,
  Play, ChevronLeft, Clock, Sparkles, Bell, Flame, Plus,
  Navigation, Share2, Crown, UserCog, Send, Lock, X, MessageSquareHeart, Check, Church, Pin,
} from "lucide-react";
import type { ChurchContact, ContactRoleType } from "@/data/church-contacts";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import {
  useCanManagePosts,
  isPinned,
  pinForDays,
  pinUntil,
  unpinPost,
  archivePost,
  useComments,
  addCommentAsCurrentUser,
  useReactions,
  toggleReaction,
  recordShare,
  useShareCount,
  prefetchPostInteractions,
} from "@/features/church/post-store";
import { getCurrentUser } from "@/features/church/current-user";
import {
  AttendButton,
  CondolencePopup,
  CongratsPopup,
  ReservePopup,
} from "@/features/church/PostActions";
import { PostBuilder } from "@/features/church/PostBuilder";
import { AlphaDatePicker } from "@/components/controls";
import { useChurchDashboard } from "@/features/church/use-church-dashboard";
import type { ContextualSearchContext } from "@/features/search/contextual-search";
import { ChurchDashboardProvider, useChurchDashboardData } from "@/features/church/church-dashboard-context";
import {
  prayerStatsFromDashboard,
  type ChurchDashboardContact,
  type ChurchDashboardPrayer,
} from "@/features/church/church-dashboard-api";



import cardChurch from "@/assets/home/card-church.jpg";
import heroChurchPremium from "@/assets/home/hero-church-premium.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import cardChildren from "@/assets/home/card-children.jpg";

export const Route = createFileRoute("/church")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — كنيستك معاك" },
      { name: "description", content: "تجربة كنيسة قبطية أرثوذكسية متكاملة على جهازك." },
    ],
  }),
  component: ChurchRoute,
});

function ChurchRoute() {
  const isChurchHome = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === "/church",
  });

  if (isChurchHome) return <ChurchScreen />;
  return <Outlet />;
}

/* ============================================================ */
/* Premium primitives                                            */
/* ============================================================ */

function Glass({
  children,
  className = "",
  padded = true,
}: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div
      className={
        "relative rounded-[28px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl " +
        "shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] " +
        (padded ? "p-4 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-2 justify-center my-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/60 to-transparent" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#c79356]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/60 to-transparent" />
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
      <h2 className="text-[15px] font-extrabold text-[#3a2a18] leading-none">{title}</h2>
      {action}
    </div>
  );
}

/* ============================================================ */
/* Header                                                        */
/* ============================================================ */

function Header({ searchContext }: { searchContext?: ContextualSearchContext }) {
  return (
    <AlphaHeaderShell
      sticky
      style={{
        background:
          "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <AlphaHeader
        variant="main"
        title="كنيستك معاك"
        searchScope="church"
        searchContext={searchContext}
      />
    </AlphaHeaderShell>
  );
}

/* ============================================================ */
/* Hero Church Card                                              */
/* ============================================================ */

function HeroChurchCard() {
  const { church, contacts, prayers } = useChurchDashboardData();
  const prayerStats = prayerStatsFromDashboard(prayers);
  const [popup, setPopup] = useState<null | "contacts" | "messages">(null);
  const locationLine = [church.diocese, church.city].filter(Boolean).join(" · ");
  const mapsUrl =
    church.locationLat != null && church.locationLng != null
      ? `https://www.google.com/maps/search/?api=1&query=${church.locationLat},${church.locationLng}`
      : church.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.address)}`
        : undefined;
  const handleMap = () => {
    if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-[32px] border border-[#e7c97a]/50 shadow-[0_30px_60px_-20px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.7)]">
        {/* Church image background */}
        <div className="relative h-[210px] w-full">
          <img
            src={church.coverImageUrl || heroChurchPremium}
            alt={church.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,10,4,0.1) 0%, rgba(15,10,4,0.3) 50%, rgba(15,10,4,0.85) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 mix-blend-screen"
            style={{
              background:
                "radial-gradient(70% 60% at 70% 25%, rgba(255,210,120,0.3), transparent 60%)",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c79356]/70 to-transparent" />

          {/* Floating glass actions over image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <FloatAction icon={Phone} label="اتصال" onClick={() => setPopup("contacts")} />
            <FloatAction icon={MessageCircle} label="رسالة" onClick={() => setPopup("messages")} />
            <FloatAction icon={MapPin} label="خريطة" onClick={handleMap} />
          </div>

          {/* Verified premium green badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/30 shadow-[0_8px_18px_-8px_rgba(31,138,90,0.7)]">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.6} />
              عضوية موثقة
            </span>
          </div>

          {/* Bottom: Church Name & Location */}
          <div className="absolute bottom-3 right-4 left-4 text-right text-white">
            <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              {church.name}
            </h2>
            {locationLine ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-white/90">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
                {locationLine}
              </p>
            ) : null}
          </div>
        </div>

        {/* Glass body — compact, two dedicated rows */}
        <div
          className="relative px-4 pt-3 pb-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,243,225,0.94) 0%, rgba(246,232,200,0.97) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#c79356]/40 to-transparent" />

          {/* Row 1: Priest information (dedicated row, full name) */}
          <div className="flex items-center gap-3">
            <MemberAvatar
              name={church.primaryPriestName ?? "الكاهن"}
              avatarUrl={church.primaryPriestAvatarUrl ?? undefined}
              size="lg"
              className="border-[2.5px] border-[#e7c97a] shadow-[0_8px_20px_-8px_rgba(60,40,16,0.6)]"
            />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[9.5px] font-bold text-[#b8893a] tracking-wide leading-none">الكاهن المسؤول</p>
              <p className="mt-1 font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-tight whitespace-normal break-words">
                {church.primaryPriestName ?? "—"}
              </p>
              {church.diocese && (
                <p className="mt-0.5 text-[10px] text-[#6a543a] font-medium leading-none">
                  {church.diocese}
                </p>
              )}
            </div>
          </div>

          {/* Coptic gold separator */}
          <div className="my-2.5 flex items-center gap-2" aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/50 to-transparent" />
            <span className="inline-block h-1 w-1 rotate-45 rounded-[1px] bg-[#c79356]" />
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/50 to-transparent" />
          </div>

          {/* Row 2: Statistics (dedicated row) */}
          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Users} value={church.memberCount.toLocaleString("ar-EG")} label="عضو" tone="#5b8fd1" />
            <StatTile icon={HandHeart} value={String(church.servantCount)} label="خادم" tone="#1f8a5a" />
            <StatTile icon={Flame} value={String(prayerStats.active)} label="طلبات صلاة" tone="#c98a3c" />
          </div>
        </div>
      </div>

      {popup === "contacts" ? (
        <ContactsPopup contacts={contacts} onClose={() => setPopup(null)} />
      ) : popup === "messages" ? (
        <MessagesPopup contacts={contacts} onClose={() => setPopup(null)} />
      ) : null}
    </section>
  );
}


function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/75 border border-white/80 px-2 py-1.5 text-center min-w-[46px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_-8px_rgba(120,80,30,0.4)]">
      <Icon className="mx-auto h-3.5 w-3.5 text-[#b8893a]" strokeWidth={2} />
      <p className="mt-0.5 text-[11.5px] font-extrabold text-[#3a2a18] leading-none">{value}</p>
      <p className="mt-0.5 text-[8.5px] text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

function FloatAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur-xl border border-white/40 text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] active:scale-90 transition-transform"
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}


function StatTile({ icon: Icon, value, label, tone }: { icon: any; value: string; label: string; tone: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-white/80 px-2 py-3 text-center shadow-[0_12px_24px_-12px_rgba(120,80,30,0.3),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 100%)",
      }}
    >
      <div
        className="mx-auto grid h-10 w-10 place-items-center rounded-2xl border border-white/90 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.2)]"
        style={{ background: `linear-gradient(135deg, ${tone}15, ${tone}45)`, color: tone }}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <p className="mt-2.5 text-[15px] font-extrabold text-[#3a2a18] leading-none tracking-tight drop-shadow-sm">{value}</p>
      <p className="mt-1.5 text-[10px] font-bold text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

/* ============================================================ */
/* Quick Access Grid                                             */
/* ============================================================ */

const QUICK = [
  { key: "prayers", label: "طلبات الصلاة", icon: Heart, tone: "#8a6ec1", img: cardAgpeya, to: "/prayer-requests" },
  { key: "service", label: "الخدمة", icon: HandHeart, tone: "#1f8a5a", img: cardChildren, to: "/church/service" },
  { key: "directory", label: "دليل الكنائس", icon: Church, tone: "#5b8fd1", img: cardChurch, to: "/church/directory" },
] as const;

/* Shared horizontal auto-marquee for premium rails (RTL-aware). */
function useAutoMarquee(
  ref: React.RefObject<HTMLDivElement | null>,
  opts: { speed?: number; direction?: 1 | -1; resumeMs?: number } = {}
) {
  const { speed = 22, direction = 1, resumeMs = 2200 } = opts;

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && track.scrollWidth > track.clientWidth + 4) {
        // RTL: scrollLeft is 0 at start, becomes negative scrolling toward end.
        track.scrollLeft -= direction * speed * dt;
        const max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft <= -max + 1) track.scrollLeft = 0;
        else if (track.scrollLeft >= 1) track.scrollLeft = -max;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const scheduleResume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        last = performance.now();
      }, resumeMs);
    };

    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("pointerup", scheduleResume);
    track.addEventListener("pointercancel", scheduleResume);
    track.addEventListener("touchend", scheduleResume);
    track.addEventListener("mouseleave", scheduleResume);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("pointerup", scheduleResume);
      track.removeEventListener("pointercancel", scheduleResume);
      track.removeEventListener("touchend", scheduleResume);
      track.removeEventListener("mouseleave", scheduleResume);
    };
  }, [ref, speed, direction, resumeMs]);
}

function QuickGrid() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  useAutoMarquee(trackRef, { speed: 22, direction: 1 });

  return (
    <section>
      <SectionTitle title="وصول سريع" />
      <div
        ref={trackRef}
        className="-mx-4 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {QUICK.map((q) => {
            const inner = (
              <>
                <img
                  src={q.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${q.tone}10 0%, rgba(15,10,4,0.15) 40%, rgba(15,10,4,0.85) 100%)`,
                  }}
                />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e7c97a]/80 to-transparent" />

                <div
                  className="absolute top-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-2xl border border-white/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_18px_-10px_rgba(0,0,0,0.45)]"
                  style={{
                    background: `linear-gradient(160deg, ${q.tone}cc, ${q.tone}88)`,
                    color: "#fff",
                  }}
                >
                  <q.icon className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" strokeWidth={2.3} />
                </div>

                <div className="absolute bottom-2.5 right-2.5 left-2.5">
                  <p className="font-arabic-serif text-[12.5px] font-extrabold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] [word-break:keep-all]">
                    {q.label}
                  </p>
                </div>
              </>
            );
            const cls =
              "group shrink-0 w-[124px] h-[150px] relative rounded-3xl overflow-hidden border border-white/70 text-right active:scale-[0.96] transition-transform shadow-[0_18px_36px_-22px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.85)]";
            return (
              <Link key={q.key} to={q.to} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Church Posts — Premium horizontal cards (Apple-style)       */
/* ============================================================ */

function CategoryPill({ type, size = "sm" }: { type: ChurchPost["type"]; size?: "sm" | "md" }) {
  const meta = POST_TYPE_META[type];
  const px = size === "md" ? "px-3 py-1 text-[11px]" : "px-2.5 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold text-white border border-white/30 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.45)] ${px}`}
      style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
    >
      {meta.label}
    </span>
  );
}

function FeaturedPostCard({ post }: { post: ChurchPost }) {
  return (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="block active:scale-[0.99] transition-transform"
    >
      <Glass className="overflow-hidden" padded={false}>
        <div className="relative">
          <img src={post.image} alt={post.title} className="h-44 w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/85 via-[#1a0f04]/15 to-transparent" />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b8893a] px-2 py-0.5 text-[9.5px] font-extrabold text-white border border-white/40">
                <Pin className="h-3 w-3" strokeWidth={2.6} /> مثبت
              </span>
            )}
            <CategoryPill type={post.type} size="md" />
          </div>

          <div className="absolute bottom-3 right-3 left-3 text-right text-white">
            <h3 className="font-arabic-serif text-[17px] font-extrabold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
              {post.title}
            </h3>
            <p className="mt-1 inline-flex items-center gap-2 text-[11px] text-white/90">
              <CalendarDays className="h-3.5 w-3.5" />
              {post.date}
              <span className="text-[#e7c97a]">•</span>
              {post.author}
            </p>
          </div>
        </div>
        <div className="p-4 text-right">
          <p className="text-[12.5px] text-[#6a543a] leading-relaxed line-clamp-2">{post.excerpt}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[12px] font-bold px-4 py-2 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.7)]">
            عرض التفاصيل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </span>
        </div>
      </Glass>
    </Link>
  );
}

function SmallPostCard({ post }: { post: ChurchPost }) {
  return (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="block active:scale-[0.98] transition-transform"
    >
      <Glass padded={false} className="overflow-hidden">
        <div className="flex gap-3 p-2.5">
          <div className="relative h-[78px] w-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/70">
            <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            {post.pinned && (
              <span className="absolute top-1 right-1 grid place-items-center h-5 w-5 rounded-full bg-[#b8893a] text-white border border-white/50 shadow">
                <Pin className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <CategoryPill type={post.type} />
            </div>
            <h4 className="mt-1 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-2">
              {post.title}
            </h4>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] text-[#6a543a]">
              <CalendarDays className="h-3 w-3 text-[#b8893a]" />
              {post.date}
            </p>
          </div>
          <ChevronLeft className="self-center h-4 w-4 text-[#b8893a] shrink-0" />
        </div>
      </Glass>
    </Link>
  );
}

function PostCardActions({ post }: { post: ChurchPost }) {
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve">(null);

  const openCondolence = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); setPopup("condolence");
  };
  const openCongrats = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); setPopup("congrats");
  };
  const openReserve = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); setPopup("reserve");
  };

  let primary: React.ReactNode = (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[11.5px] font-extrabold bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white shadow-[0_8px_18px_-10px_rgba(122,74,38,0.7)] active:scale-[0.97]"
    >
      عرض التفاصيل
      <ArrowRight className="h-3 w-3 -scale-x-100" />
    </Link>
  );

  let secondary: React.ReactNode = null;

  if (post.type === "liturgy" || post.type === "meeting") {
    secondary = <AttendButton postId={post.id} />;
  } else if (post.type === "trip") {
    secondary = (
      <button
        type="button"
        onClick={openReserve}
        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[11.5px] font-extrabold bg-[#1f8a5a] text-white shadow-[0_8px_18px_-10px_rgba(31,138,90,0.7)] active:scale-[0.97]"
      >
        حجز
      </button>
    );
  } else if (post.type === "wedding") {
    secondary = (
      <button
        type="button"
        onClick={openCongrats}
        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[11.5px] font-extrabold bg-[#d97a8a] text-white shadow-[0_8px_18px_-10px_rgba(217,122,138,0.7)] active:scale-[0.97]"
      >
        شارك التهنئة
      </button>
    );
  } else if (post.type === "condolence") {
    secondary = (
      <button
        type="button"
        onClick={openCondolence}
        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-[11.5px] font-extrabold bg-[#6a543a] text-white shadow-[0_8px_18px_-10px_rgba(106,84,58,0.7)] active:scale-[0.97]"
      >
        أرسل تعزية
      </button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {secondary ? <div className="flex-1">{secondary}</div> : null}
        <div className={secondary ? "" : "flex-1"}>{primary}</div>
      </div>
      {popup === "condolence" ? (
        <CondolencePopup postId={post.id} onClose={() => setPopup(null)} />
      ) : popup === "congrats" ? (
        <CongratsPopup postId={post.id} onClose={() => setPopup(null)} />
      ) : popup === "reserve" ? (
        <ReservePopup postId={post.id} totalSeats={post.details?.seats} onClose={() => setPopup(null)} />
      ) : null}
    </>
  );
}

function PinMenu({ post, onClose }: { post: ChurchPost; onClose: () => void }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const pinned = isPinned(post);

  const apply = (days: number) => {
    pinForDays(post.id, days);
    onClose();
  };
  const applyCustom = () => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(customDate.trim());
    if (!m) return;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const ms = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
    if (Number.isFinite(ms) && ms > Date.now()) {
      pinUntil(post.id, ms);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-[#1a0f04]/55 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[380px] rounded-[24px] border border-white/75 bg-[#fbf3e1]/95 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] p-4 text-right">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="font-arabic-serif text-[14.5px] font-extrabold text-[#3a2a18]">تثبيت المنشور</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 7].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => apply(d)}
              className="rounded-2xl bg-white/90 border border-[#efe2c4] py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-95"
            >
              {d.toLocaleString("ar-EG")} يوم
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="mt-2.5 w-full rounded-2xl bg-white/90 border border-[#efe2c4] py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-95"
        >
          حتى تاريخ مخصص
        </button>
        {customOpen ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <AlphaDatePicker
                value={customDate}
                onChange={setCustomDate}
                title="تثبيت حتى"
                placeholder="اختر التاريخ"
                minYear={new Date().getFullYear()}
                maxYear={new Date().getFullYear() + 5}
              />
            </div>
            <button
              type="button"
              onClick={applyCustom}
              className="rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[11.5px] font-extrabold px-3 py-2 active:scale-95"
            >
              تثبيت
            </button>
          </div>
        ) : null}
        {pinned ? (
          <button
            type="button"
            onClick={() => { unpinPost(post.id); onClose(); }}
            className="mt-3 w-full rounded-2xl bg-[#fff0f2] border border-[#f1c8cf] py-2.5 text-[12px] font-extrabold text-[#a8344f] active:scale-95"
          >
            إلغاء التثبيت
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => { archivePost(post.id); onClose(); }}
          className="mt-2 w-full rounded-2xl bg-white/70 border border-[#efe2c4] py-2.5 text-[11.5px] font-extrabold text-[#6a543a] active:scale-95"
        >
          أرشفة المنشور
        </button>
      </div>
    </div>
  );
}

function ManageButton({ post }: { post: ChurchPost }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="إدارة المنشور"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-white/85 border border-white/60 text-[#7a5a30] backdrop-blur active:scale-90 shadow"
      >
        <Pin className={"h-3.5 w-3.5 " + (isPinned(post) ? "text-[#b8893a] fill-current" : "")} strokeWidth={2.4} />
      </button>
      {open ? <PinMenu post={post} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/* --------- Premium Post Card (swipeable horizontal feed) --------- */

type CTASpec = {
  label: string;
  bg: string;
  shadow: string;
  kind: "link" | "reserve" | "attend" | "prayer" | "live" | "details" | "congrats" | "condolence";
};

function ctaFor(post: ChurchPost): CTASpec {
  switch (post.type) {
    case "trip":
      return { label: "احجز الآن", bg: "linear-gradient(180deg,#1f9d63,#157a4a)", shadow: "rgba(31,138,90,0.55)", kind: "reserve" };
    case "meeting":
    case "liturgy":
      return { label: "سجّل حضورك", bg: "linear-gradient(180deg,#7c5ad1,#5a3eb0)", shadow: "rgba(124,90,209,0.55)", kind: "attend" };
    case "prayer":
      return { label: "صلّيت", bg: "linear-gradient(180deg,#3f7ed6,#2a5fb0)", shadow: "rgba(63,126,214,0.55)", kind: "prayer" };
    case "announcement":
      return { label: "عرض التفاصيل", bg: "linear-gradient(180deg,#f59042,#d96f1f)", shadow: "rgba(217,111,31,0.55)", kind: "details" };
    case "event":
      return { label: "شاهد البث", bg: "linear-gradient(180deg,#e0464d,#b8232b)", shadow: "rgba(184,35,43,0.55)", kind: "live" };
    case "wedding":
      return { label: "أرسل تهنئة", bg: "linear-gradient(180deg,#e58aa0,#c44569)", shadow: "rgba(196,69,105,0.5)", kind: "congrats" };
    case "condolence":
      return { label: "أرسل تعزية", bg: "linear-gradient(180deg,#8a7257,#6a543a)", shadow: "rgba(106,84,58,0.55)", kind: "condolence" };
    default:
      return { label: "عرض التفاصيل", bg: "linear-gradient(180deg,#b8893a,#7a4a26)", shadow: "rgba(122,74,38,0.55)", kind: "details" };
  }
}

function PostHeader({ post, canManage, onManage }: { post: ChurchPost; canManage: boolean; onManage: () => void }) {
  const { church } = useChurchDashboardData();
  const meta = POST_TYPE_META[post.type];
  return (
    <div className="flex items-center gap-2.5 px-3.5 pt-3.5">
      <button
        type="button"
        aria-label="خيارات"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canManage) onManage(); }}
        className="grid h-8 w-8 place-items-center rounded-full bg-white/85 border border-[#efe2c4] text-[#7a5a30] active:scale-90"
      >
        <span className="flex flex-col gap-[2px]">
          <span className="h-[3px] w-[3px] rounded-full bg-[#7a5a30]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#7a5a30]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#7a5a30]" />
        </span>
      </button>
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-extrabold text-white border border-white/40"
            style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}d0)` }}
          >
            {meta.label}
          </span>
          {isPinned(post) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3d6] border border-[#e7c97a] px-1.5 py-[2px] text-[9.5px] font-extrabold text-[#8a6a1e]">
              <Pin className="h-2.5 w-2.5" strokeWidth={3} /> مثبت
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
          {church.name}
        </div>
        <div className="text-[10px] text-[#8a6a3a] font-medium">{post.date}</div>
      </div>
      <MemberAvatar
        name={church.primaryPriestName ?? church.name}
        avatarUrl={church.primaryPriestAvatarUrl ?? undefined}
        size="md"
        className="ring-2 ring-[#f5e6c2]"
      />
    </div>
  );
}

function PremiumPostCard({ post }: { post: ChurchPost }) {
  const canManage = useCanManagePosts();
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve" | "manage">(null);

  const comments = useComments(post.id);
  const r = useReactions(post.id);
  const shares = useShareCount(post.id);
  const latest = comments[0];
  const user = getCurrentUser();
  const cta = ctaFor(post);

  const sendComment = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = draft.trim();
    if (!text) return;
    addCommentAsCurrentUser(post.id, text);
    setDraft("");
  };

  const onLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleReaction(post.id, "love");
  };

  const onShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const onCta = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cta.kind === "reserve") setPopup("reserve");
    else if (cta.kind === "congrats") setPopup("congrats");
    else if (cta.kind === "condolence") setPopup("condolence");
    else if (cta.kind === "prayer") toggleReaction(post.id, "love");
    else if (cta.kind === "live" || cta.kind === "link") {
      window.location.assign(`/church/post/${post.id}`);
    }
  };

  const actionButtonClass =
    "w-full inline-flex items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-extrabold text-white active:scale-[0.98] transition-transform";

  return (
    <article
      className="shrink-0 snap-center w-[88vw] max-w-[420px] relative rounded-[28px] border border-white/75 bg-[#fbf3e1]/92 backdrop-blur-xl shadow-[0_24px_50px_-26px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden"
    >
      <PostHeader post={post} canManage={canManage} onManage={() => setPopup("manage")} />

      <div className="px-3.5 pt-3">
        <div className="relative overflow-hidden rounded-[22px] border border-white/70 shadow-[0_14px_28px_-18px_rgba(60,40,16,0.55)]">
          <img src={post.image} alt={post.title} className="block h-[150px] w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/45 via-transparent to-transparent" />
        </div>
      </div>

      <div className="px-4 pt-2.5 text-right">
        <h3 className="font-arabic-serif text-[16.5px] font-extrabold text-[#2a1d10] leading-snug">{post.title}</h3>
        <p className={"mt-1 text-[12.5px] text-[#4a3a26] leading-relaxed " + (expanded ? "" : "line-clamp-2")}>
          {post.excerpt}
        </p>
        {post.excerpt.length > 60 && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-0.5 text-[11.5px] font-extrabold text-[#b8893a] active:scale-95"
          >
            عرض المزيد
          </button>
        ) : null}
      </div>

      <div className="mx-4 mt-2.5 flex items-center justify-between rounded-2xl bg-white/70 border border-white/80 px-3.5 py-2 text-[13px] font-extrabold text-[#3a2a18]">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={r.love.mine}
          className="inline-flex items-center gap-2 active:scale-95"
          aria-label={r.love.mine ? "إلغاء الإعجاب" : "إعجاب"}
        >
          <Heart className={"h-[20px] w-[20px] " + (r.love.mine ? "text-[#e0464d] fill-current" : "text-[#c44569]")} strokeWidth={2.2} />
          <span className="tabular-nums">{r.love.count.toLocaleString("ar-EG")}</span>
        </button>
        <Link
          to="/church/post/$id"
          params={{ id: post.id }}
          className="inline-flex items-center gap-2 active:scale-95"
          aria-label="التعليقات"
        >
          <MessageCircle className="h-[20px] w-[20px] text-[#5b8fd1]" strokeWidth={2.2} />
          <span className="tabular-nums">{comments.length.toLocaleString("ar-EG")}</span>
        </Link>
        <button type="button" onClick={onShare} className="inline-flex items-center gap-2 active:scale-95" aria-label="مشاركة">
          <Share2 className="h-[20px] w-[20px] text-[#7a4a26]" strokeWidth={2.2} />
          <span className="tabular-nums">{shares.toLocaleString("ar-EG")}</span>
        </button>
      </div>

      <div className="mx-4 mt-2 space-y-2">
        <div className="h-[52px] shrink-0 flex items-start gap-2 rounded-2xl bg-white/60 border border-white/70 px-3 py-2 text-right overflow-hidden">
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
            <p className="flex-1 text-[11px] font-bold text-[#8a6a3a]/75 text-right leading-snug py-0.5">
              لا توجد تعليقات بعد
            </p>
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
            placeholder="اكتب تعليق..."
            className="flex-1 min-w-0 bg-transparent text-right text-[12.5px] text-[#3a2a18] placeholder:text-[#a99060] outline-none py-1"
            dir="rtl"
          />
        </div>
      </div>

      <div className="px-4 pt-2 pb-4 space-y-2">
        {cta.kind === "attend" ? (
          <AttendButton
            postId={post.id}
            label="سجّل حضورك"
            activeLabel="✓ سجّلت حضورك"
            className={actionButtonClass + " bg-gradient-to-l from-[#7c5ad1] to-[#5a3eb0] shadow-[0_14px_26px_-14px_rgba(124,90,209,0.55)]"}
          />
        ) : cta.kind !== "details" ? (
          <button
            type="button"
            onClick={onCta}
            className={actionButtonClass}
            style={{ background: cta.bg, boxShadow: `0 14px 26px -14px ${cta.shadow}` }}
          >
            {cta.label}
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </button>
        ) : null}
        <Link
          to="/church/post/$id"
          params={{ id: post.id }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#efe2c4] bg-white/85 py-2.5 text-[12.5px] font-extrabold text-[#7a4a26] active:scale-[0.98] transition-transform"
        >
          عرض التفاصيل
          <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
        </Link>
      </div>

      {popup === "condolence" ? (
        <CondolencePopup postId={post.id} onClose={() => setPopup(null)} />
      ) : popup === "congrats" ? (
        <CongratsPopup postId={post.id} onClose={() => setPopup(null)} />
      ) : popup === "reserve" ? (
        <ReservePopup postId={post.id} totalSeats={post.details?.seats} onClose={() => setPopup(null)} />
      ) : popup === "manage" ? (
        <PinMenu post={post} onClose={() => setPopup(null)} />
      ) : null}
    </article>
  );
}

function ChurchPostsFeed() {
  const { church } = useChurchDashboardData();
  const { posts: sorted, loading: loadingPosts, refresh } = useChurchPosts(church.id);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (sorted.length) void prefetchPostInteractions(sorted.map((p) => p.id));
  }, [sorted]);

  return (
    <section>
      <SectionTitle
        title="منشورات الكنيسة"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/church/archive"
              className="text-[11px] font-bold text-[#b8893a]"
            >
              الأرشيف
            </Link>
            <button
              type="button"
              aria-label="منشور جديد"
              title="إنشاء منشور (للكهنة والخدام)"
              onClick={() => setBuilderOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[11px] font-extrabold px-3 py-1.5 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.6)] active:scale-95 transition-transform"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
              منشور
            </button>
          </div>
        }
      />
      {loadingPosts ? (
        <Glass className="text-center py-6">
          <p className="text-[13px] font-bold text-[#6a543a]">جاري تحميل المنشورات…</p>
        </Glass>
      ) : sorted.length === 0 ? (
        <Glass className="text-center py-8">
          <Newspaper className="mx-auto mb-2.5 h-8 w-8 text-[#b8893a]/75" strokeWidth={2.2} />
          <p className="text-[13px] font-bold text-[#6a543a]">لا توجد منشورات بعد</p>
        </Glass>
      ) : (
        <div
          className="-mx-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch", scrollPaddingInline: "16px" }}
        >
          <div className="flex gap-3 px-4 pb-3">
            {sorted.map((p) => (
              <PremiumPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
      {builderOpen ? (
        <PostBuilder
          churchId={church.id}
          onClose={() => setBuilderOpen(false)}
          onCreated={() => void refresh()}
        />
      ) : null}
    </section>
  );
}

/* ============================================================ */
/* Upcoming Meetings                                             */
/* ============================================================ */

const MEETINGS = [
  { day: "12", month: "سبتمبر", title: "اجتماع الخدام", time: "5:00 مساءً", location: "قاعة القديس أغسطينوس", tone: "#1f8a5a" },
  { day: "11", month: "سبتمبر", title: "اجتماع الشباب", time: "7:30 مساءً", location: "قاعة المجمع", tone: "#5b8fd1" },
  { day: "9", month: "سبتمبر", title: "درس الكتاب المقدس", time: "6:00 مساءً", location: "الكنيسة الرئيسية", tone: "#8a6ec1" },
];

function MeetingCard({ m }: { m: typeof MEETINGS[number] }) {
  return (
    <div
      className={[
        "relative flex h-full w-full items-stretch gap-0 overflow-hidden rounded-[24px]",
        "border border-white/75 bg-[#fbf3e1]/82 backdrop-blur-xl",
        "shadow-[0_3px_10px_-3px_rgba(120,80,30,0.22),0_12px_28px_-16px_rgba(120,80,30,0.32),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(120,80,30,0.05)]",
        "ring-1 ring-[#c79356]/[0.07] ring-inset",
        "active:scale-[0.98] transition-transform",
      ].join(" ")}
    >
      {/* Glass reflection + top highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white/26 via-white/7 to-transparent"
      />

      {/* Date block */}
      <div
        className="relative flex h-full w-[74px] shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/55"
        style={{
          background: `linear-gradient(165deg, ${m.tone}40 0%, ${m.tone}28 42%, ${m.tone}16 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.42), inset 0 -10px 18px -10px ${m.tone}30`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-1 top-1 h-[38%] rounded-lg bg-gradient-to-b from-white/22 to-transparent"
        />
        <span className="relative text-[22px] font-extrabold text-[#3a2a18] leading-none">{m.day}</span>
        <span className="relative text-[10px] font-bold text-[#b8893a] leading-none">{m.month}</span>
      </div>

      {/* Content */}
      <div className="relative flex min-w-0 flex-1 flex-col p-3.5 text-right">
        <h4 className="line-clamp-2 min-h-[2.5rem] text-[14px] font-extrabold leading-tight text-[#3a2a18]">
          {m.title}
        </h4>
        <div className="mt-auto flex shrink-0 flex-col gap-1 pt-1.5">
          <p className="flex h-4 items-center justify-end gap-1.5 truncate text-[11px] text-[#6a543a]">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#b8893a]" strokeWidth={2} />
            <span className="truncate">{m.time}</span>
          </p>
          <p className="flex h-4 items-center justify-end gap-1.5 truncate text-[11px] text-[#6a543a]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b8893a]" strokeWidth={2} />
            <span className="truncate">{m.location}</span>
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="relative flex w-9 shrink-0 items-center justify-center">
        <ChevronLeft className="h-4 w-4 text-[#c79356]" />
      </div>
    </div>
  );
}

function UpcomingMeetings() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  useAutoMarquee(trackRef, { speed: 20, direction: 1 });

  return (
    <section>
      <SectionTitle
        title="الاجتماعات القادمة"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b8893a] active:opacity-60 transition-opacity"
          >
            عرض الكل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </button>
        }
      />
      <div
        ref={trackRef}
        className="-mx-4 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {MEETINGS.map((m, i) => (
            <div key={i} className="h-[108px] w-[230px] shrink-0">
              <MeetingCard m={m} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Prayer Requests Preview Card (links to /prayer-requests)      */
/* ============================================================ */

function PrayerCardCompact({ p }: { p: ChurchDashboardPrayer }) {
  return (
    <Link
      to="/prayer-requests"
      className="block shrink-0 w-[240px] active:scale-[0.98] transition-transform"
    >
      <div className="rounded-2xl bg-white/85 border border-white/80 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_-20px_rgba(120,80,30,0.45)] h-[150px] flex flex-col">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#8a6ec1]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#6a4ab5] border border-[#8a6ec1]/25">
            <HandHeart className="h-2.5 w-2.5" strokeWidth={2.8} />
            {p.category}
          </span>
          {p.status === "urgent" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c44569]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#a8344f] border border-[#c44569]/25">
              <Flame className="h-2.5 w-2.5" strokeWidth={2.8} />
              عاجلة
            </span>
          ) : p.status === "answered" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#136a44] border border-[#1f8a5a]/25">
              <Check className="h-2.5 w-2.5" strokeWidth={2.8} />
              تمّت
            </span>
          ) : null}
        </div>
        <p className="font-arabic-serif text-[12.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
          {p.title}
        </p>
        <p className="mt-1 text-[11px] text-[#6a543a] leading-snug line-clamp-3 flex-1">
          {p.request}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-[#8a6325]">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
            {p.prayers.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 text-[#7a5a30]">
            <Clock className="h-2.5 w-2.5" />
            {p.time}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PrayerRequestsCard() {
  const { prayers } = useChurchDashboardData();
  const stats = prayerStatsFromDashboard(prayers);
  const trackRef = useRef<HTMLDivElement | null>(null);
  useAutoMarquee(trackRef, { speed: 20, direction: -1 });

  return (
    <section>
      <SectionTitle
        title="طلبات الصلاة"
        action={
          <Link
            to="/prayer-requests"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b8893a] active:opacity-60 transition-opacity"
          >
            عرض الكل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </Link>
        }
      />

      {/* Compact stats row */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <StatPill icon={<Sparkles className="h-3 w-3" strokeWidth={2.6} />} label="نشط" value={stats.active} tone="purple" />
        <StatPill icon={<HandHeart className="h-3 w-3" strokeWidth={2.6} />} label="صلّوا" value={stats.peoplePrayed} tone="green" />
        <StatPill icon={<MessageSquareHeart className="h-3 w-3" strokeWidth={2.6} />} label="طلب" value={prayers.length} tone="rose" />
      </div>

      {prayers.length === 0 ? (
        <Glass className="text-center py-6">
          <p className="text-[13px] font-bold text-[#6a543a]">لا توجد طلبات صلاة عامة حالياً</p>
        </Glass>
      ) : (
        <div
          ref={trackRef}
          className="-mx-4 overflow-x-auto no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-3 px-4 pb-2">
            {prayers.map((p) => (
              <PrayerCardCompact key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatPill({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "purple" | "rose" | "green";
}) {
  const toneClass = {
    purple: "text-[#6a4ab5]",
    rose: "text-[#a8344f]",
    green: "text-[#136a44]",
  }[tone];
  return (
    <div className="rounded-2xl bg-white/80 border border-white/80 px-2.5 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <p className={"inline-flex items-center gap-1 text-[10px] font-bold " + toneClass}>
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-extrabold text-[#3a2a18] leading-none">
        {value.toLocaleString("ar-EG")}
      </p>
    </div>
  );
}



/* ============================================================ */
/* Live Broadcast                                                */
/* ============================================================ */

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, done: diff === 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18] tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9.5px] font-bold text-[#8a6a3a] tracking-wide">{label}</span>
    </div>
  );
}

function UpcomingStreamCard() {
  const [reminded, setReminded] = useState(false);
  // Next Sunday 9:00 AM local
  const target = useRef<number>(
    (() => {
      const d = new Date();
      const day = d.getDay();
      const add = ((7 - day) % 7) || 7;
      d.setDate(d.getDate() + add);
      d.setHours(9, 0, 0, 0);
      return d.getTime();
    })()
  ).current;
  const { days, hours, mins, secs } = useCountdown(target);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="flex gap-3 p-3">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[18px] border border-white/70">
          <img src={cardChurch} alt="بث قادم" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-extrabold text-[#3a2a18]">
            <CalendarDays className="h-2.5 w-2.5" /> قريباً
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight">
            قداس الأحد القادم
          </h4>
          <p className="mt-0.5 text-[11px] text-[#7a5a30]">من الكاتدرائية المرقسية</p>
          <div className="mt-2 flex items-center gap-1.5" dir="ltr">
            <CountdownUnit value={days} label="يوم" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={hours} label="ساعة" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={mins} label="دقيقة" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={secs} label="ثانية" />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setReminded((v) => !v)}
          className={
            "w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-extrabold transition-all active:scale-[0.98] " +
            (reminded
              ? "bg-[#e9d9b8] text-[#3a2a18] border border-[#c79356]/40"
              : "bg-gradient-to-l from-[#c79356] to-[#d6a862] text-white shadow-[0_10px_24px_-12px_rgba(199,147,86,0.7)]")
          }
        >
          <Bell className={"h-4 w-4 " + (reminded ? "fill-current" : "")} />
          {reminded ? "تم تفعيل التذكير" : "ذكّرني قبل البث"}
        </button>
      </div>
    </div>
  );
}

function LiveBroadcast() {
  return (
    <section>
      <SectionTitle title="البث المباشر" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_50px_-26px_rgba(60,40,16,0.6),inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="relative h-[200px]">
          <img src={heavenlyChurch} alt="البث المباشر" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0603]/90 via-[#0a0603]/35 to-transparent" />

          {/* LIVE pill */}
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#c44569] px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-white border border-white/20">
            <Users className="h-3 w-3" />
            1,284 يشاهدون
          </div>

          {/* Play button */}
          <button
            type="button"
            aria-label="مشاهدة البث المباشر"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#3a2a18] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] active:scale-95 transition-transform">
              <Play className="h-7 w-7 fill-current" strokeWidth={0} />
            </span>
          </button>

          {/* Bottom title */}
          <div className="absolute bottom-3 right-3 left-3 text-right text-white">
            <h3 className="font-arabic-serif text-[16px] font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              قداس الأحد الإلهي
            </h3>
            <p className="mt-0.5 text-[11px] text-white/85">بث مباشر من الكاتدرائية</p>
          </div>
        </div>
        {/* Watch button bar */}
        <div className="bg-[#1a0f06] px-3 py-2.5 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#c44569] to-[#e0577f] px-4 py-2.5 text-[12.5px] font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(196,69,105,0.8)] active:scale-[0.98] transition-transform"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            شاهد الآن
          </button>
          <button
            type="button"
            aria-label="مشاركة"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white border border-white/15 active:scale-95 transition-transform"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <UpcomingStreamCard />
      </div>
    </section>
  );
}

/* ============================================================ */
/* Church Utilities — Map, Contacts, Messages                   */
/* ============================================================ */

function LocationRow() {
  const { church } = useChurchDashboardData();
  const addressLabel = church.address ?? [church.name, church.city].filter(Boolean).join("، ");
  const mapsUrl =
    church.locationLat != null && church.locationLng != null
      ? `https://www.google.com/maps/search/?api=1&query=${church.locationLat},${church.locationLng}`
      : addressLabel
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel)}`
        : "#";

  return (
    <section>
      <SectionTitle title="المواقع والأماكن" />
      <div className="grid grid-cols-2 gap-3">
        {/* Directory card */}
        <Link
          to="/churches-directory"
          className="relative block rounded-2xl overflow-hidden border border-white/70 shadow-[0_14px_30px_-18px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.75)] active:scale-[0.98] transition-transform"
          style={{
            background:
              "linear-gradient(160deg, rgba(168,109,194,0.18), rgba(199,147,86,0.18)), linear-gradient(180deg, #fbf3e1, #f6e7c5)",
          }}
        >
          <div className="p-3.5 h-[148px] flex flex-col justify-between text-right">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-2xl grid place-items-center bg-white/85 border border-[#efe2c4] text-[#6b3a8a] shadow-[0_8px_18px_-10px_rgba(107,58,138,0.6)]">
                <Library className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="inline-flex items-center px-2 h-[18px] rounded-full bg-[#3a2a18] text-white text-[9px] font-extrabold">
                جديد
              </span>
            </div>
            <div>
              <p className="font-arabic-serif text-[14px] font-extrabold text-[#2a1d10] leading-tight">
                دليل الكنائس والأديرة
              </p>
              <p className="mt-1 text-[10.5px] text-[#6b5436] leading-snug">
                كنائس، أديرة، ومعالم مسيحية قريبة منك
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#6b3a8a]">
                استكشاف ←
              </span>
            </div>
          </div>
        </Link>

        {/* Quick map card */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block rounded-2xl overflow-hidden border border-white/70 shadow-[0_14px_30px_-18px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.75)] active:scale-[0.98] transition-transform"
          style={{
            background:
              "linear-gradient(160deg, rgba(196,69,105,0.16), rgba(199,147,86,0.18)), linear-gradient(180deg, #fbf3e1, #f6e7c5)",
          }}
        >
          <div className="p-3.5 h-[148px] flex flex-col justify-between text-right">
            <div className="flex items-start justify-between">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-[#c44569]/25 animate-ping" />
                <div className="relative h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-[#e0577f] to-[#c44569] text-white border border-white/70 shadow-[0_8px_18px_-8px_rgba(196,69,105,0.7)]">
                  <MapPin className="h-5 w-5" strokeWidth={2.4} />
                </div>
              </div>
              <Navigation className="h-4 w-4 text-[#8a5a1f]" strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-arabic-serif text-[14px] font-extrabold text-[#2a1d10] leading-tight">
                موقع كنيستي
              </p>
              <p className="mt-1 text-[10.5px] text-[#6b5436] leading-snug truncate">
                {addressLabel || "—"}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#c44569]">
                فتح الخرائط ←
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

type Contact = ChurchContact | ChurchDashboardContact;

const ROLE_TONE: Record<ContactRoleType, { bg: string; icon: typeof Crown; tag: string }> = {
  priest: { bg: "linear-gradient(160deg, #7a4a26, #3a2a18)", icon: Crown, tag: "#c79356" },
  servant: { bg: "linear-gradient(160deg, #6a4ab5, #4a2e8e)", icon: HandHeart, tag: "#8a6ec1" },
  admin: { bg: "linear-gradient(160deg, #1f8a5a, #136a44)", icon: UserCog, tag: "#1f8a5a" },
};

function ContactRow({ contact }: { contact: Contact }) {
  const tone = ROLE_TONE[contact.roleType];
  const RoleIcon = tone.icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)]">
      <div
        className="relative h-11 w-11 shrink-0 rounded-full grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)]"
        style={{ background: tone.bg }}
      >
        {contact.initials}
        <span
          className="absolute -bottom-0.5 -left-0.5 grid h-4 w-4 place-items-center rounded-full bg-white border border-white"
          style={{ color: tone.tag }}
        >
          <RoleIcon className="h-2.5 w-2.5" strokeWidth={2.8} />
        </span>
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
          {contact.name}
        </p>
        <p className="mt-0.5 text-[10.5px] text-[#7a5a30] leading-none">{contact.role}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <a
          href={`tel:${contact.phone}`}
          aria-label={`اتصال بـ ${contact.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#5b8fd1] to-[#3a6db0] text-white shadow-[0_8px_18px_-10px_rgba(91,143,209,0.7)] active:scale-90 transition-transform"
        >
          <Phone className="h-4 w-4" strokeWidth={2.4} />
        </a>
        <a
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`واتساب ${contact.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#25d366] to-[#128c44] text-white shadow-[0_8px_18px_-10px_rgba(37,211,102,0.7)] active:scale-90 transition-transform"
        >
          <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
        </a>
      </div>
    </div>
  );
}

function MessageRow({ contact, unread, onClose }: { contact: Contact; unread?: number; onClose?: () => void }) {
  const tone = ROLE_TONE[contact.roleType];
  const allowed = contact.messagingAllowed;
  const className =
    "w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] " +
    (allowed ? "active:scale-[0.98]" : "opacity-70 cursor-not-allowed");

  const inner = (
    <>
      <div
        className="h-11 w-11 shrink-0 rounded-full grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)]"
        style={{ background: tone.bg }}
      >
        {contact.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
            {contact.name}
          </p>
          {allowed && unread ? (
            <span className="inline-grid h-5 min-w-5 px-1.5 place-items-center rounded-full bg-[#c44569] text-white text-[10px] font-extrabold">
              {unread}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-[#7a5a30] truncate">
          {allowed ? (
            "اضغط لبدء محادثة خاصة"
          ) : (
            <>
              <Lock className="h-2.5 w-2.5" /> المحادثة معطّلة بإذن الكاهن
            </>
          )}
        </p>
      </div>
      {allowed ? (
        <Send className="h-4 w-4 text-[#c79356] -scale-x-100 shrink-0" strokeWidth={2.4} />
      ) : (
        <Lock className="h-4 w-4 text-[#a08862] shrink-0" strokeWidth={2.2} />
      )}
    </>
  );

  if (!allowed) {
    return (
      <div className={className} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/church/chat/$contactId"
      params={{ contactId: contact.id }}
      onClick={onClose}
      className={className}
    >
      {inner}
    </Link>
  );
}

/* ============================================================ */
/* Hero Card Popups: Contacts & Messages                         */
/* ============================================================ */

function PopupShell({
  title, subtitle, onClose, children,
}: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#1a0f04]/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-[420px] rounded-[28px] border border-white/75 bg-[#fbf3e1]/95 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] p-3.5 text-right max-h-[80vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-tight">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-[10.5px] text-[#7a5a30] inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PopupGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="px-1 mb-1 text-[10.5px] font-extrabold tracking-wide text-[#b8893a]">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function groupedContacts(contacts: ChurchDashboardContact[]) {
  return {
    priests: contacts.filter((c) => c.roleType === "priest"),
    servants: contacts.filter((c) => c.roleType === "servant"),
    admins: contacts.filter((c) => c.roleType === "admin"),
  };
}

function ContactsPopup({ contacts, onClose }: { contacts: ChurchDashboardContact[]; onClose: () => void }) {
  const { priests, servants, admins } = groupedContacts(contacts);
  return (
    <PopupShell title="تواصل مع الكنيسة" subtitle="اتصال مباشر أو واتساب" onClose={onClose}>
      {priests.length > 0 && <PopupGroup label="الكاهن">{priests.map((c) => <ContactRow key={c.id} contact={c} />)}</PopupGroup>}
      {servants.length > 0 && <PopupGroup label="الخدام">{servants.map((c) => <ContactRow key={c.id} contact={c} />)}</PopupGroup>}
      {admins.length > 0 && <PopupGroup label="المسؤولون">{admins.map((c) => <ContactRow key={c.id} contact={c} />)}</PopupGroup>}
      {contacts.length === 0 ? (
        <p className="px-1 py-4 text-center text-[12px] font-bold text-[#6a543a]">لا توجد جهات اتصال متاحة</p>
      ) : null}
    </PopupShell>
  );
}

function MessagesPopup({ contacts, onClose }: { contacts: ChurchDashboardContact[]; onClose: () => void }) {
  const { priests, servants, admins } = groupedContacts(contacts);
  return (
    <PopupShell title="مراسلة قادة الكنيسة" subtitle="بإذن الكاهن" onClose={onClose}>
      {priests.length > 0 && <PopupGroup label="الكاهن">{priests.map((c) => <MessageRow key={c.id} contact={c} onClose={onClose} />)}</PopupGroup>}
      {servants.length > 0 && <PopupGroup label="الخدام">{servants.map((c) => <MessageRow key={c.id} contact={c} onClose={onClose} />)}</PopupGroup>}
      {admins.length > 0 && <PopupGroup label="المسؤولون">{admins.map((c) => <MessageRow key={c.id} contact={c} onClose={onClose} />)}</PopupGroup>}
      {contacts.length === 0 ? (
        <p className="px-1 py-4 text-center text-[12px] font-bold text-[#6a543a]">لا توجد جهات مراسلة متاحة</p>
      ) : null}
    </PopupShell>
  );
}


/* ============================================================ */
/* Screen                                                        */
/* ============================================================ */

function ChurchEmptyState() {
  return (
    <Glass className="text-center py-10 px-5">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[22px] border border-[#efe2c4] bg-gradient-to-br from-[#fff8e9] to-[#e7c07a]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_-12px_rgba(120,80,30,0.45)]">
        <Church className="h-9 w-9 text-[#7a4a26]" strokeWidth={1.8} />
      </div>
      <h2 className="mt-5 font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
        لا توجد كنيسة معتمدة بعد
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">
        بعد اعتماد طلب تأسيس الكنيسة ستظهر هنا بيانات كنيستك وخدماتها.
      </p>
      <Link
        to="/profile/church"
        className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-l from-[#7a4a26] to-[#b8893a] px-6 text-[14px] font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(122,74,38,0.6)] active:scale-[0.98] transition-transform"
      >
        طلب تأسيس كنيسة
      </Link>
    </Glass>
  );
}

function ChurchScreen() {
  const { data, loading, hasChurch } = useChurchDashboard();
  const churchId = data?.church.id ?? "";
  const { posts } = useChurchPosts(churchId);
  const searchContext: ContextualSearchContext | undefined = data
    ? {
        churchContacts: data.contacts,
        churchPrayers: data.prayers,
        churchPosts: posts.map((p) => ({ id: p.id, title: p.title, excerpt: p.excerpt })),
      }
    : undefined;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />
      <CopticWatermark />

      <Header searchContext={searchContext} />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        {loading ? (
          <Glass className="text-center py-12">
            <p className="text-[13px] font-bold text-[#6a543a]">جاري تحميل بيانات الكنيسة…</p>
          </Glass>
        ) : !hasChurch || !data ? (
          <ChurchEmptyState />
        ) : (
          <ChurchDashboardProvider data={data}>
            <HeroChurchCard />
            <QuickGrid />
            <ChurchPostsFeed />
            <PrayerRequestsCard />
            <LocationRow />
          </ChurchDashboardProvider>
        )}
      </div>

      <BottomDock />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </main>
  );
}
