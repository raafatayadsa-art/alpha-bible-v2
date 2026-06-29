import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Phone, MessageCircle, MapPin, ShieldCheck, Users,
  HandHeart, Newspaper, Radio, CalendarDays, BookOpen, Library, Heart,
  ChevronLeft, Clock, Sparkles, Flame,
  Navigation, Share2, Crown, UserCog, Send, Lock, X, Church,
  Mail, Globe, ExternalLink,
} from "lucide-react";
import type { ChurchContact, ContactRoleType } from "@/data/church-contacts";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import { getCurrentUser } from "@/features/church/current-user";
import { ChurchMixedFeedSection } from "@/features/church-mixed-feed";
import { useChurchDashboard } from "@/features/church/use-church-dashboard";
import type { ContextualSearchContext } from "@/features/search/contextual-search";
import { buildAlphaConnectChatSearch } from "@/features/alpha-connect/alpha-connect-nav";
import { usePlatformModules } from "@/lib/platform-modules";
import { ChurchDashboardProvider, useChurchDashboardData } from "@/features/church/church-dashboard-context";
import {
  prayerStatsFromDashboard,
  type ChurchDashboardContact,
  type ChurchDashboardPrayer,
  type ChurchDashboardRecord,
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
import cardBible from "@/assets/home/card-bible.jpg";

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
        "alpha-glass-interactive relative rounded-[var(--alpha-radius-hero)] border border-white/70 " +
        "shadow-[var(--alpha-shadow-hero)] " +
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
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--alpha-gold-deep)]/60 to-transparent" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[var(--alpha-gold-deep)]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--alpha-gold-deep)]/60 to-transparent" />
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
      <h2 className="alpha-type-h2 text-alpha-heading leading-none">{title}</h2>
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

function priestLabel(church: ChurchDashboardRecord): string {
  const raw = church.priestsFull ?? church.primaryPriestName ?? "";
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines.length > 1 ? "الكهنة المسؤولون" : "الكاهن المسؤول";
}

const CLERICAL_TITLES = [
  "القمص", "الأب الكاهن", "الأب", "الأنبا", "القس", "الأرشيدياكون",
  "الأسقف", "البابا", "البطريرك", "الشماس", "المتنيح", "الراهب", "الراهبة",
];
function stripClericalTitle(raw: string): string {
  let s = raw.trim();
  for (const t of CLERICAL_TITLES) {
    if (s.startsWith(t + " ")) { s = s.slice(t.length).trimStart(); break; }
  }
  return s;
}
function stripPriestDates(raw: string): string {
  return raw
    .replace(/\([^)]*\d{4}[^)]*\)/g, "")
    .replace(/\d{4}\s*[-–—]\s*\d{4}/g, "")
    .replace(/سيامته[^·\n|]*/gi, "")
    .replace(/نياحته[^·\n|]*/gi, "")
    .replace(/تنصّره[^·\n|]*/gi, "")
    .replace(/ولد[^·\n|]*\d{4}[^·\n|]*/gi, "")
    .replace(/\s*[-–—·|]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function formatPriestLine(raw: string): string {
  return stripPriestDates(stripClericalTitle(raw));
}
function priestDisplayText(church: ChurchDashboardRecord): string | null {
  const raw = church.priestsFull ?? church.primaryPriestName;
  if (!raw) return null;
  return raw.split(/\n+/).map((l) => formatPriestLine(l.trim())).filter(Boolean).join("\n");
}

function ChurchContactChip({
  href,
  icon: Icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border border-alpha bg-white/80 px-2.5 py-1.5 text-right shadow-[var(--alpha-shadow-mini)] active:scale-[0.98] alpha-motion-spring"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-alpha-gold-deep" strokeWidth={2.4} />
      <span className="min-w-0 truncate text-[10.5px] font-extrabold text-alpha-heading">{value}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}

function ChurchContactRow({ church }: { church: ChurchDashboardRecord }) {
  const hasDirect =
    church.phone || church.whatsapp || church.email || church.websiteUrl || church.facebookUrl || church.youtubeUrl || church.churchUrl;
  if (!hasDirect) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <p className="alpha-type-caption font-bold text-alpha-gold-deep tracking-wide leading-none">التواصل مع الكنيسة</p>
      <div className="flex flex-wrap justify-end gap-1.5">
        {church.phone ? (
          <ChurchContactChip href={`tel:${church.phone}`} icon={Phone} label="اتصال" value={church.phone} />
        ) : null}
        {church.whatsapp ? (
          <ChurchContactChip
            href={`https://wa.me/${church.whatsapp.replace(/\D/g, "")}`}
            icon={MessageCircle}
            label="واتساب"
            value={church.whatsapp}
            external
          />
        ) : null}
        {church.email ? (
          <ChurchContactChip href={`mailto:${church.email}`} icon={Mail} label="بريد" value={church.email} />
        ) : null}
        {church.websiteUrl ? (
          <ChurchContactChip href={church.websiteUrl} icon={Globe} label="الموقع" value="الموقع" external />
        ) : null}
        {church.facebookUrl ? (
          <ChurchContactChip href={church.facebookUrl} icon={ExternalLink} label="فيسبوك" value="Facebook" external />
        ) : null}
        {church.youtubeUrl ? (
          <ChurchContactChip href={church.youtubeUrl} icon={ExternalLink} label="يوتيوب" value="YouTube" external />
        ) : null}
        {church.churchUrl ? (
          <ChurchContactChip href={church.churchUrl} icon={ExternalLink} label="مرجع" value="st-takla.org" external />
        ) : null}
      </div>
    </div>
  );
}

function HeroStatCell({
  glyph,
  value,
  label,
  accent,
}: {
  glyph: string;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2.5"
      style={{
        border: "1px solid rgba(240,215,140,0.14)",
        background: "linear-gradient(180deg,rgba(240,215,140,0.03) 0%,rgba(0,0,0,0.5) 100%)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="select-none font-black leading-none text-[18px] hero-ledger-glyph-gold">
          {glyph}
        </span>
        <span className="font-black tabular-nums leading-none text-white text-[14px]">{value}</span>
      </div>
      <p className="text-[9px] font-extrabold leading-none" style={{ color: accent }}>{label}</p>
    </div>
  );
}

function AlphaLedgerQuickBtn({
  glyph,
  label,
  onClick,
}: {
  glyph: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-2 active:scale-95 transition-transform"
      style={{
        background: "linear-gradient(180deg, rgba(30,20,8,0.88) 0%, rgba(14,8,2,0.92) 100%)",
        border: "1px solid rgba(240,215,140,0.18)",
        boxShadow: "0 8px 20px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
      }}
    >
      <span aria-hidden className="hero-ledger-glyph-gold hero-ledger-glyph-shimmer select-none text-[17px] font-black leading-none">
        {glyph}
      </span>
      <span className="text-[9.5px] font-extrabold text-white/65 leading-none">{label}</span>
    </button>
  );
}

function ChurchQuickActionsBar({
  onCall,
  onMessage,
  onMap,
}: {
  onCall: () => void;
  onMessage: () => void;
  onMap: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5" dir="rtl">
      <AlphaLedgerQuickBtn glyph="Ⲕ" label="اتصال" onClick={onCall} />
      <AlphaLedgerQuickBtn glyph="Ⲱ" label="رسائل" onClick={onMessage} />
      <AlphaLedgerQuickBtn glyph="Ⲁ" label="موقع" onClick={onMap} />
    </div>
  );
}

function HeroChurchCard() {
  const { church, prayers, contacts } = useChurchDashboardData();
  const { isModuleEnabled } = usePlatformModules();
  const messagingOn = isModuleEnabled("messaging");
  const [leaderPopup, setLeaderPopup] = useState<null | "call" | "message">(null);
  const leaders = contacts.filter((c) => c.roleType === "priest" || c.roleType === "servant");
  const prayerStats = prayerStatsFromDashboard(prayers);
  const { posts: allPosts } = useChurchPosts(church.id);
  const locationLine = [church.diocese, church.city].filter(Boolean).join(" · ");
  const priestText = priestDisplayText(church);
  const priestHeading = priestLabel(church);
  const mapsUrl =
    church.locationLat != null && church.locationLng != null
      ? `https://www.google.com/maps/search/?api=1&query=${church.locationLat},${church.locationLng}`
      : church.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.address)}`
        : undefined;
  const handleMap = () => { if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer"); };

  return (
    <>
      {/* Inject hero ledger glyph styles once */}
      <style>{`
        .hero-ledger-glyph-gold {
          background: linear-gradient(180deg,#ffd86a 0%,#c79356 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-ledger-glyph-shimmer {
          animation: heroGlyphShimmer 2.4s ease-in-out infinite;
        }
        @keyframes heroGlyphShimmer {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(240,215,140,0.4)); }
          50% { filter: drop-shadow(0 0 10px rgba(255,216,106,0.85)); }
        }
      `}</style>
      <section className="relative">
        <div
          className="relative overflow-hidden rounded-[var(--alpha-radius-hero)]"
          style={{
            background: "linear-gradient(148deg,#1e1408 0%,#2e1e0a 50%,#180e06 100%)",
            border: "1px solid rgba(240,215,140,0.12)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {/* Top gold stripe */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-px z-10"
            style={{ background: "linear-gradient(90deg,transparent,rgba(240,215,140,0.6),transparent)" }} />

          {/* Cover image */}
          <div className="relative h-[210px] w-full">
            <img
              src={church.coverImageUrl || heroChurchPremium}
              alt={church.name}
              className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
            />
            {/* Gradient to dark */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg,rgba(14,8,2,0.1) 0%,rgba(14,8,2,0.35) 50%,rgba(14,8,2,0.92) 100%)"
            }} />
            {/* Gold ambient glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
              style={{ background: "radial-gradient(70% 55% at 65% 20%,rgba(240,190,80,0.25),transparent 65%)" }} />

            {/* Float actions — left side */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              <FloatAction icon={Phone} label="اتصال" onClick={() => setLeaderPopup("call")} />
              {messagingOn ? (
                <FloatAction icon={MessageCircle} label="الفا كونكت" onClick={() => setLeaderPopup("message")} />
              ) : null}
              <FloatAction icon={MapPin} label="خريطة" onClick={handleMap} />
            </div>

            {/* Verified badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/25 shadow-[0_8px_18px_-8px_rgba(31,138,90,0.7)]">
                <ShieldCheck className="h-3 w-3" strokeWidth={2.6} /> عضوية موثقة
              </span>
            </div>

            {/* Church name on image */}
            <div className="absolute bottom-3 right-4 left-4 text-right text-white" dir="rtl">
              <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {church.name}
              </h2>
              {locationLine && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-white/80">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {locationLine}
                </p>
              )}
            </div>
          </div>

          {/* Dark glass body */}
          <div
            className="relative px-4 pt-3.5 pb-4"
            style={{
              background: "linear-gradient(180deg,rgba(30,20,8,0.0) 0%,rgba(22,14,4,0.95) 18%)",
              backdropFilter: "blur(20px)",
            }}
            dir="rtl"
          >
            {/* Gold divider */}
            <div aria-hidden className="absolute top-0 left-4 right-4 h-px"
              style={{ background: "linear-gradient(90deg,transparent,rgba(240,215,140,0.3),transparent)" }} />

            {/* Priest — avatar beside name */}
            <div className="mb-3" dir="rtl">
              <p className="alpha-type-caption font-bold text-alpha-gold-bright/60 tracking-wide leading-none">{priestHeading}</p>
              <div className="mt-1.5 flex items-center justify-end gap-2.5">
                {priestText ? (
                  <p className="font-arabic-serif text-[14.5px] font-extrabold text-white/90 leading-snug whitespace-pre-line">
                    {priestText}
                  </p>
                ) : (
                  <p className="font-arabic-serif text-[15px] font-extrabold text-white/50">—</p>
                )}
                <MemberAvatar
                  name={church.primaryPriestName ?? priestText ?? "الكاهن"}
                  avatarUrl={church.primaryPriestAvatarUrl ?? undefined}
                  size="md"
                  className="border-[2px] border-[#e7c97a]/55 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)] shrink-0"
                />
              </div>
            </div>

            {/* Contact chips — dark glass style */}
            {(church.phone || church.whatsapp || church.email || church.websiteUrl) ? (
              <div className="mb-3 flex flex-wrap justify-end gap-1.5">
                {church.phone && (
                  <a href={`tel:${church.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white/70 active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Phone className="h-3 w-3 text-alpha-gold-bright/70" strokeWidth={2.4} />
                    {church.phone}
                  </a>
                )}
                {church.whatsapp && (
                  <a href={`https://wa.me/${church.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white/70 active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <MessageCircle className="h-3 w-3 text-alpha-gold-bright/70" strokeWidth={2.4} />
                    واتساب
                  </a>
                )}
                {church.email && (
                  <a href={`mailto:${church.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white/70 active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Mail className="h-3 w-3 text-alpha-gold-bright/70" strokeWidth={2.4} />
                    بريد
                  </a>
                )}
                {church.websiteUrl && (
                  <a href={church.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white/70 active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Globe className="h-3 w-3 text-alpha-gold-bright/70" strokeWidth={2.4} />
                    الموقع
                  </a>
                )}
              </div>
            ) : null}

            {/* Gold divider */}
            <div aria-hidden className="mb-3 h-px w-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(240,215,140,0.25),transparent)" }} />

            {/* Stats — dark ledger cells */}
            <div className="flex items-stretch gap-1.5"
              style={{
                background: "rgba(14,8,2,0.5)",
                border: "1px solid rgba(240,215,140,0.12)",
                borderRadius: "14px",
                padding: "6px",
                backdropFilter: "blur(10px)",
              }}
            >
              <HeroStatCell glyph="Ⲁ" value={church.memberCount.toLocaleString("ar-EG")} label="عضو" accent="#5b9fd8" />
              <div aria-hidden className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent" />
              <HeroStatCell glyph="Ⲱ" value={church.servantCount.toLocaleString("ar-EG")} label="خادم" accent="#1faa6a" />
              <div aria-hidden className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent" />
              <HeroStatCell glyph="Ⲱ" value={allPosts.length.toLocaleString("ar-EG")} label="منشور" accent="#f0c850" />
            </div>
          </div>
        </div>

        {leaderPopup === "call" && (
          <ContactsPopup contacts={leaders} church={church} onClose={() => setLeaderPopup(null)} />
        )}
        {messagingOn && leaderPopup === "message" && (
          <MessagesPopup contacts={leaders} church={church} onClose={() => setLeaderPopup(null)} />
        )}
      </section>
    </>
  );
}


function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/75 border border-white/80 px-2 py-1.5 text-center min-w-[46px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_-8px_rgba(120,80,30,0.4)]">
      <Icon className="mx-auto h-3.5 w-3.5 text-alpha-gold-deep" strokeWidth={2} />
      <p className="mt-0.5 text-[11.5px] font-extrabold text-alpha-heading leading-none">{value}</p>
      <p className="mt-0.5 text-[8.5px] text-alpha-muted leading-none">{label}</p>
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
      className="relative overflow-hidden rounded-[var(--alpha-radius-mini)] border border-white/80 px-2 py-3 text-center shadow-[var(--alpha-shadow-featured)] backdrop-blur-2xl"
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
      <p className="mt-2.5 text-[15px] font-extrabold text-alpha-heading leading-none tracking-tight drop-shadow-sm">{value}</p>
      <p className="mt-1.5 text-[10px] font-bold text-alpha-muted leading-none">{label}</p>
    </div>
  );
}

/* ============================================================ */
/* Quick Access Grid                                             */
/* ============================================================ */

const QUICK = [
  { key: "news", label: "الأخبار", icon: Newspaper, tone: "#8a6ec1", img: newsCandle, to: "/church/archive" },
  { key: "live", label: "البث المباشر", icon: Radio, tone: "#c44569", img: heavenlyChurch, comingSoon: true },
  { key: "meetings", label: "الاجتماعات", icon: CalendarDays, tone: "#1f8a5a", img: newsMass, anchor: "church-meetings" },
  { key: "service", label: "الخدمة", icon: HandHeart, tone: "#1f8a5a", img: cardChildren, to: "/church/service" },
  { key: "prayers", label: "طلبات الصلاة", icon: Heart, tone: "#8a6ec1", img: cardAgpeya, to: "/prayer-requests" },
  { key: "library", label: "المكتبة", icon: Library, tone: "#7a4a26", img: cardBible, to: "/books" },
  { key: "liturgy", label: "جدول القداسات", icon: BookOpen, tone: "#b8893a", img: cardKatameros, to: "/katameros" },
] as const;

type QuickItem = (typeof QUICK)[number];

function QuickAccessCard({ q, onAnchor }: { q: QuickItem; onAnchor?: (id: string) => void }) {
  const inner = (
    <>
      <img src={q.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${q.tone}10 0%, rgba(15,10,4,0.15) 40%, rgba(15,10,4,0.85) 100%)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e7c97a]/80 to-transparent" />
      {"comingSoon" in q && q.comingSoon ? (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-[#3a2a18]/85 px-2 py-0.5 text-[8.5px] font-extrabold text-white">
          قريباً
        </span>
      ) : null}
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
    "group shrink-0 w-[124px] h-[142px] relative rounded-3xl overflow-hidden border border-white/70 text-right active:scale-[0.96] transition-transform shadow-[0_18px_36px_-22px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.85)]";

  if ("comingSoon" in q && q.comingSoon) {
    return <div className={cls + " opacity-90"}>{inner}</div>;
  }
  if ("anchor" in q && q.anchor) {
    return (
      <button type="button" className={cls} onClick={() => onAnchor?.(q.anchor)}>
        {inner}
      </button>
    );
  }
  if ("to" in q && q.to) {
    return (
      <Link to={q.to} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

/* Shared horizontal auto-marquee for premium rails (RTL-aware, optional infinite loop). */
function useAutoMarquee(
  ref: React.RefObject<HTMLDivElement | null>,
  opts: { speed?: number; direction?: 1 | -1; resumeMs?: number; loop?: boolean } = {},
) {
  const { speed = 22, direction = 1, resumeMs = 2200, loop = false } = opts;

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
        track.scrollLeft -= direction * speed * dt;
        const max = track.scrollWidth - track.clientWidth;
        if (loop && max > 0) {
          const half = max / 2;
          if (track.scrollLeft <= -half - 1) track.scrollLeft += half;
          else if (track.scrollLeft >= 1) track.scrollLeft -= half;
        } else {
          if (track.scrollLeft <= -max + 1) track.scrollLeft = 0;
          else if (track.scrollLeft >= 1) track.scrollLeft = -max;
        }
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
  }, [ref, speed, direction, resumeMs, loop]);
}

function QuickGrid() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const items = [...QUICK, ...QUICK];
  useAutoMarquee(trackRef, { speed: 18, direction: 1, loop: true });

  const scrollToAnchor = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <section>
      <SectionTitle title="وصول سريع" />
      <div
        ref={trackRef}
        className="-mx-4 overflow-x-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 px-4 pb-1">
          {items.map((q, i) => (
            <QuickAccessCard key={`${q.key}-${i}`} q={q} onAnchor={scrollToAnchor} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChurchPostsFeed() {
  const { church } = useChurchDashboardData();
  const { posts: sorted, loading: loadingPosts, refresh } = useChurchPosts(church.id);

  return (
    <ChurchMixedFeedSection
      posts={sorted}
      loading={loadingPosts}
      onRefresh={refresh}
    />
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
              <div className="h-10 w-10 rounded-[var(--alpha-radius-dock-tab)] grid place-items-center bg-white/85 border border-alpha text-[var(--alpha-purple)] shadow-[var(--alpha-shadow-normal)]">
                <Library className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="alpha-tag !text-white bg-alpha">
                جديد
              </span>
            </div>
            <div>
              <p className="alpha-type-h2 font-arabic-serif text-alpha leading-tight">
                دليل الكنائس والأديرة
              </p>
              <p className="alpha-type-desc mt-1 text-alpha-muted leading-snug">
                كنائس، أديرة، ومعالم مسيحية قريبة منك
              </p>
              <span className="alpha-type-desc mt-2 inline-flex items-center gap-1 font-extrabold text-[var(--alpha-purple)]">
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
              <Navigation className="h-4 w-4 text-alpha-gold-deep" strokeWidth={2.4} />
            </div>
            <div>
              <p className="alpha-type-h2 font-arabic-serif text-alpha leading-tight">
                موقع كنيستي
              </p>
              <p className="alpha-type-desc mt-1 text-alpha-muted leading-snug truncate">
                {addressLabel || "—"}
              </p>
              <span className="alpha-type-desc mt-2 inline-flex items-center gap-1 font-extrabold text-[#c44569]">
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

function CallLeaderRow({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const navigate = useNavigate();
  const tone = ROLE_TONE[contact.roleType];
  const RoleIcon = tone.icon;

  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        void navigate({
          to: "/personal-call",
          search: { name: contact.name, contactId: contact.id, from: "/church" },
        });
      }}
      className="w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] active:scale-[0.98] transition-transform"
    >
      <div
        className="relative h-11 w-11 shrink-0 rounded-full grid place-items-center text-[var(--alpha-reader-text-soft)] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[var(--alpha-shadow-normal)]"
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
      <div className="flex-1 min-w-0">
        <p className="font-arabic-serif text-[13.5px] font-extrabold text-alpha-heading leading-tight truncate">
          {contact.name}
        </p>
        <p className="mt-0.5 text-[10.5px] text-alpha-muted leading-none">{contact.role}</p>
      </div>
      <Phone className="h-4 w-4 text-[#5b8fd1] shrink-0" strokeWidth={2.4} />
    </button>
  );
}

function MessageRow({ contact, unread, onClose }: { contact: Contact; unread?: number; onClose?: () => void }) {
  const { isModuleEnabled } = usePlatformModules();
  if (!isModuleEnabled("messaging")) return null;

  const tone = ROLE_TONE[contact.roleType];
  const allowed = contact.messagingAllowed;
  const className =
    "w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] " +
    (allowed ? "active:scale-[0.98]" : "opacity-70 cursor-not-allowed");

  const inner = (
    <>
      <div
        className="h-11 w-11 shrink-0 rounded-full grid place-items-center text-[var(--alpha-reader-text-soft)] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[var(--alpha-shadow-normal)]"
        style={{ background: tone.bg }}
      >
        {contact.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-arabic-serif text-[13.5px] font-extrabold text-alpha-heading leading-tight truncate">
            {contact.name}
          </p>
          {allowed && unread ? (
            <span className="inline-grid h-5 min-w-5 px-1.5 place-items-center rounded-full bg-[#c44569] text-white text-[10px] font-extrabold">
              {unread}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-alpha-muted truncate">
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
        <Send className="h-4 w-4 text-alpha-gold-deep -scale-x-100 shrink-0" strokeWidth={2.4} />
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
      to="/alpha-connect"
      search={buildAlphaConnectChatSearch({
        contactId: contact.id,
        name: contact.name,
        role: contact.roleType,
        phone: contact.phone,
      })}
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
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[color-mix(in_srgb,var(--alpha-text)_55%,transparent)] backdrop-blur-sm" />
      <div className="alpha-glass-interactive relative w-full max-w-[var(--alpha-dock-max-width)] rounded-[var(--alpha-radius-hero)] border border-white/75 shadow-[var(--alpha-shadow-hero)] p-3.5 text-right max-h-[80vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-arabic-serif text-[15.5px] font-extrabold text-alpha-heading leading-tight">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-[10.5px] text-alpha-muted inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-alpha text-alpha-muted active:scale-90"
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
      <p className="px-1 mb-1 alpha-type-desc font-extrabold tracking-wide text-alpha-gold-deep">{label}</p>
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

function ChurchDirectCallRow({
  label,
  value,
  href,
  onClose,
}: {
  label: string;
  value: string;
  href: string;
  onClose: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClose}
      className="w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] active:scale-[0.98] transition-transform"
    >
      <div className="relative h-11 w-11 shrink-0 rounded-full grid place-items-center text-[var(--alpha-reader-text-soft)] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)] bg-gradient-to-br from-[#7a4a26] to-[#3a2a18]">
        <Church className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-arabic-serif text-[13.5px] font-extrabold text-alpha-heading leading-tight truncate">{label}</p>
        <p className="alpha-type-desc mt-0.5 text-alpha-muted leading-none truncate">{value}</p>
      </div>
      <Phone className="h-4 w-4 text-[#5b8fd1] shrink-0" strokeWidth={2.4} />
    </a>
  );
}

function ChurchDirectMessageRow({
  label,
  value,
  href,
  onClose,
}: {
  label: string;
  value: string;
  href: string;
  onClose: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClose}
      className="w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] active:scale-[0.98] transition-transform"
    >
      <div className="h-11 w-11 shrink-0 rounded-full grid place-items-center text-[var(--alpha-reader-text-soft)] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)] bg-gradient-to-br from-[#1f8a5a] to-[#136a44]">
        <Church className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-arabic-serif text-[13.5px] font-extrabold text-alpha-heading leading-tight truncate">{label}</p>
        <p className="alpha-type-desc mt-0.5 text-alpha-muted leading-none truncate">{value}</p>
      </div>
      <Send className="h-4 w-4 text-alpha-gold-deep -scale-x-100 shrink-0" strokeWidth={2.4} />
    </a>
  );
}

function ContactsPopup({
  contacts,
  church,
  onClose,
}: {
  contacts: ChurchDashboardContact[];
  church: ChurchDashboardRecord;
  onClose: () => void;
}) {
  const { priests, servants } = groupedContacts(contacts);
  const hasChurchPhone = Boolean(church.phone || church.whatsapp);
  return (
    <PopupShell title="اختر للاتصال" subtitle="Alpha Connect — اضغط على الاسم للاتصال" onClose={onClose}>
      {priests.length > 0 && (
        <PopupGroup label="الكاهن">
          {priests.map((c) => (
            <CallLeaderRow key={c.id} contact={c} onClose={onClose} />
          ))}
        </PopupGroup>
      )}
      {servants.length > 0 && (
        <PopupGroup label="الخدام">
          {servants.map((c) => (
            <CallLeaderRow key={c.id} contact={c} onClose={onClose} />
          ))}
        </PopupGroup>
      )}
      {contacts.length === 0 && hasChurchPhone ? (
        <PopupGroup label="الكنيسة">
          {church.phone ? (
            <ChurchDirectCallRow
              label="هاتف الكنيسة"
              value={church.phone}
              href={`tel:${church.phone}`}
              onClose={onClose}
            />
          ) : null}
          {church.whatsapp ? (
            <ChurchDirectCallRow
              label="واتساب الكنيسة"
              value={church.whatsapp}
              href={`https://wa.me/${church.whatsapp.replace(/\D/g, "")}`}
              onClose={onClose}
            />
          ) : null}
        </PopupGroup>
      ) : null}
      {contacts.length === 0 && !hasChurchPhone ? (
        <p className="px-1 py-4 text-center text-[12px] font-bold text-alpha-muted">لا توجد جهات اتصال متاحة</p>
      ) : null}
    </PopupShell>
  );
}

function MessagesPopup({
  contacts,
  church,
  onClose,
}: {
  contacts: ChurchDashboardContact[];
  church: ChurchDashboardRecord;
  onClose: () => void;
}) {
  const { priests, servants } = groupedContacts(contacts);
  const hasChurchMessage = Boolean(church.whatsapp || church.email);
  return (
    <PopupShell title="مراسلة قادة الكنيسة" subtitle="اضغط على الاسم لبدء محادثة خاصة" onClose={onClose}>
      {priests.length > 0 && (
        <PopupGroup label="الكاهن">
          {priests.map((c) => (
            <MessageRow key={c.id} contact={c} onClose={onClose} />
          ))}
        </PopupGroup>
      )}
      {servants.length > 0 && (
        <PopupGroup label="الخدام">
          {servants.map((c) => (
            <MessageRow key={c.id} contact={c} onClose={onClose} />
          ))}
        </PopupGroup>
      )}
      {contacts.length === 0 && hasChurchMessage ? (
        <PopupGroup label="الكنيسة">
          {church.whatsapp ? (
            <ChurchDirectMessageRow
              label="واتساب الكنيسة"
              value={church.whatsapp}
              href={`https://wa.me/${church.whatsapp.replace(/\D/g, "")}`}
              onClose={onClose}
            />
          ) : null}
          {church.email ? (
            <ChurchDirectMessageRow
              label="بريد الكنيسة"
              value={church.email}
              href={`mailto:${church.email}`}
              onClose={onClose}
            />
          ) : null}
        </PopupGroup>
      ) : null}
      {contacts.length === 0 && !hasChurchMessage ? (
        <p className="px-1 py-4 text-center text-[12px] font-bold text-alpha-muted">لا توجد جهات مراسلة متاحة</p>
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
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[var(--alpha-radius-card-compact)] border border-alpha bg-gradient-to-br from-[color-mix(in_srgb,var(--alpha-bg-elevated)_95%,white)] to-[color-mix(in_srgb,var(--alpha-gold)_40%,transparent)] shadow-[var(--alpha-shadow-normal)]">
        <Church className="h-9 w-9 text-alpha-gold-deep" strokeWidth={1.8} />
      </div>
      <h2 className="mt-5 font-arabic-serif text-[18px] font-bold text-alpha-heading">
        لا توجد كنيسة مرتبطة بحسابك
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-alpha-muted">
        اختر كنيستك من الدليل واضغط «انضم للكنيسة» لفتح لوحة كنيستك وخدماتها.
      </p>
      <div className="mt-5 space-y-2.5">
        <Link
          to="/church/directory"
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] px-6 text-[14px] font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(31,138,90,0.55)] active:scale-[0.98] transition-transform"
        >
          اختيار كنيسة والانضمام
        </Link>
        <Link
          to="/profile/church"
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-alpha bg-white/75 px-6 text-[14px] font-extrabold text-alpha-heading shadow-[0_8px_18px_-14px_rgba(120,80,30,0.35)] active:scale-[0.98] transition-transform"
        >
          طلب تأسيس كنيسة
        </Link>
      </div>
    </Glass>
  );
}

function ChurchScreen() {
  const { data, loading, hasChurch } = useChurchDashboard();
  const showBootLoading = loading && !data;
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
      className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base text-alpha"
    >
      <CopticWatermark />

      <Header searchContext={searchContext} />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        {showBootLoading ? (
          <Glass className="text-center py-12">
            <p className="text-[13px] font-bold text-alpha-muted">جاري تحميل بيانات الكنيسة…</p>
          </Glass>
        ) : !hasChurch || !data ? (
          <ChurchEmptyState />
        ) : (
          <ChurchDashboardProvider data={data}>
            <HeroChurchCard />
            <ChurchPostsFeed />
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
