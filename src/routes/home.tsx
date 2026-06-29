import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Share2, Bookmark, ChevronLeft,
  Play, Pause, X, Calendar, Sparkles,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { AlphaConnectHomeCard } from "@/components/alpha/AlphaConnectHomeCard";
import { ChurchDirectoryHomeCard } from "@/components/home/ChurchDirectoryHomeCard";
import { KholagyHomeCard } from "@/components/home/KholagyHomeCard";
import { HomeVerseHeroStack } from "@/components/home/HomeVerseHeroStack";
import { HomeJourneyDiscover, type JourneyDiscoverItem } from "@/components/home/HomeJourneyDiscover";
import { SmartContextCard } from "@/features/smart-context";
import { ProfileSettingsMenu } from "@/features/profile/ProfileSettingsMenu";
import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";
import { useAlphaAuth } from "@/features/auth";
import { usePlatformModules, type PlatformModuleKey } from "@/lib/platform-modules";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";

// Hero stack art (daily section)
import artReadings from "@/assets/home/art-readings.jpg";

// Primary cards
import cardBible from "@/assets/home/card-bible.jpg";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import cardSynaxarium from "@/assets/home/card-synaxarium.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import cardAudio from "@/assets/home/card-audio.jpg";
import cardChildren from "@/assets/home/card-children.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";

// Daily
import dailyPrayer from "@/assets/home/daily-prayer.jpg";
import dailyMeditation from "@/assets/home/daily-meditation.jpg";
import dailyHymn from "@/assets/home/daily-hymn.jpg";

// Church news
import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";

import { CopticWatermark, CopticCross } from "@/components/coptic";

export const Route = createFileRoute("/home")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الرئيسية" },
      { name: "description", content: "الكتاب المقدس، الأجبية، القطمارس، السنكسار — تجربة قبطية متكاملة." },
    ],
  }),
  component: HomeScreen,
});

function useGreeting() {
  const [h, setH] = useState(() => new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setH(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 18) return "نهارك سعيد";
  if (h >= 18 && h < 23) return "مساء الخير";
  return "تصبح على خير";
}

function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (y < 40) setVisible(true);
      else if (dy > 6) setVisible(false);
      else if (dy < -6) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return visible;
}

// ===== Persistent save (localStorage) =====
function useSavedSet(key: string) {
  const [set, setSet] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setSet(new Set(JSON.parse(raw)));
    } catch {}
  }, [key]);
  const toggle = (id: string) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try {
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
        void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
          scheduleUserDataSync({ delayMs: 1500, extraKey: key }),
        );
      } catch {}
      return next;
    });
  };
  return { set, toggle };
}

// ===== Types =====
type HeroCard = {
  id: string;
  kind: "verse" | "readings" | "saint" | "feast";
  badge: string;
  title: string;
  body: string;
  meta?: string;
  image: string;
  accent: string;
  to: string;
};

// ===== Screen =====

const HOME_CARD_MODULE: Record<string, PlatformModuleKey | undefined> = {
  bible: "bible",
  agpeya: "agpeya",
  kholagy: "kholagy",
  katameros: "katameros",
  synaxarium: "synaxarium",
  church: "community",
  community: "community",
  audio: "audio",
  kids: "kids",
  meditation: "meditations",
  prayer: "agpeya",
  hymn: "kholagy",
  cont: "bible",
  med: "meditations",
};

function HomeScreen() {
  const greeting = useGreeting();
  const { user, isAuthenticated } = useAlphaAuth();
  const userName = user?.displayName?.split(/\s+/)[0] ?? "صديقي";
  const { isModuleEnabled } = usePlatformModules();
  const dockVisible = useHideOnScroll();

  type PrimaryCard = JourneyDiscoverItem;
  const primary: PrimaryCard[] = [
    { key: "bible", title: "الكتاب المقدس", sub: "اقرأ كلمة الله", image: cardBible, to: "/bible", accent: "#8a6ec1" },
    { key: "agpeya", title: "الأجبية", sub: "صلوات السبع ساعات", image: cardAgpeya, to: "/agpeya", accent: "#c98a3c" },
    { key: "kholagy", title: "الخولاجي المقدس", sub: "تسبحة وأوشيات", image: dailyHymn, to: "/kholagy", accent: "#7a5cb0" },
    { key: "katameros", title: "القطمارس", sub: "قراءات اليوم", image: cardKatameros, to: "/katameros", accent: "#4a9e6e" },
    { key: "synaxarium", title: "السنكسار", sub: "سير القديسين", image: cardSynaxarium, to: "/synaxarium", accent: "#a85450" },
    { key: "community", title: "مجتمعي", sub: "نشاط روحي مع أصدقائك", image: cardChurch, to: "/community", accent: "#1f8a5a" },
    { key: "church", title: "كنيستك معاك", sub: "خدمات وفعاليات", image: cardChurch, to: "/church", accent: "#5b8fd1" },
    { key: "audio", title: "الصوتيات", sub: "ترانيم وقراءات", image: cardAudio, to: "/audio", accent: "#c44569" },
    { key: "kids", title: "الأطفال", sub: "قصص وأنشطة", image: cardChildren, to: "/kids", accent: "#e8b84a" },
    { key: "meditation", title: "التأملات", sub: "رحلات روحية", image: cardMeditation, to: "/meditations", accent: "#5b8fd1" },
  ];

  type Daily = { key: string; title: string; sub: string; image: string; to: string; accent: string };
  const daily: Daily[] = [
    { key: "prayer", title: "صلاة اليوم", sub: "ابدأ يومك بالصلاة", image: dailyPrayer, to: "/agpeya", accent: "#c98a3c" },
    { key: "med", title: "تأمل اليوم", sub: "رحلة السلام", image: dailyMeditation, to: "/meditations", accent: "#4a9e6e" },
    { key: "hymn", title: "ترنيمة اليوم", sub: "الخولاجي المقدس", image: dailyHymn, to: "/kholagy", accent: "#7a5cb0" },
    { key: "cont", title: "أكمل القراءة", sub: "إنجيل يوحنا 3 · 35%", image: artReadings, to: "/books", accent: "#8a6ec1" },
  ];
  const filterHomeCards = <T extends { key: string }>(items: T[]) =>
    items.filter((item) => {
      if (!isAuthenticated && (item.key === "community" || item.key === "church")) return false;
      const moduleKey = HOME_CARD_MODULE[item.key];
      return moduleKey ? isModuleEnabled(moduleKey) : true;
    });

  const visiblePrimary = filterHomeCards(primary);
  const visibleDaily = filterHomeCards(daily).filter(
    (item) => isAuthenticated || item.key !== "cont",
  );

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        {/* Top bar */}
        <header className="relative z-50 flex items-center gap-2 pt-[max(env(safe-area-inset-top),12px)] pb-2">
          <ProfileSettingsMenu
            menuAlign="start"
            trigger="avatar"
            avatarSize="lg"
            avatarVariant="home-premium"
          />
          <div className="flex min-w-0 flex-1 flex-col items-center overflow-hidden">
            <h1 className="alpha-home-greeting-title whitespace-nowrap font-extrabold text-alpha-heading [word-break:keep-all]">
              {isAuthenticated ? `${greeting} يا ${userName}` : "مرحبًا بك في ألفا"}
            </h1>
            <p className="alpha-home-greeting-sub mt-0.5 text-alpha-heading-muted">
              {isAuthenticated ? "نعمة الرب معك اليوم" : "اقرأ واستكشف الكتاب المقدس"}
            </p>
          </div>
          {isAuthenticated ? (
            <AlphaNotificationButton className="relative z-[60] shrink-0 border-[var(--alpha-gold-bright)]/45 text-[var(--alpha-gold-deep)] shadow-[0_0_14px_rgba(231,201,122,0.22)]" />
          ) : (
            <span className="h-11 w-11 shrink-0" aria-hidden />
          )}
        </header>

        {/* HERO — fixed verse card + peeking cards behind */}
        <section className="mt-5">
          <HomeVerseHeroStack linkTo="/bible" onBrandedShare={openAlphaShareSheet} />
        </section>

        {/* PRIMARY JOURNEY */}
        {visiblePrimary.length > 0 ? <HomeJourneyDiscover items={visiblePrimary} /> : null}

        {/* Smart Context Card */}
        {isAuthenticated ? (
          <section className="mt-4 px-1">
            <SmartContextCard />
          </section>
        ) : null}

        {/* KHOLAGY */}
        {isModuleEnabled("kholagy") ? (
          <section className="mt-5 px-1">
            <KholagyHomeCard />
          </section>
        ) : null}

        {/* Alpha Connect gateway */}
        {isAuthenticated && isModuleEnabled("messaging") ? (
          <section className="mt-5 px-1">
            <AlphaConnectHomeCard />
          </section>
        ) : null}

        {/* DAILY */}
        {visibleDaily.length > 0 ? (
        <section className="mt-5">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="alpha-home-section-title flex items-center gap-1.5 font-extrabold tracking-tight text-alpha-heading">
              <span className="text-alpha-gold-bright">
                <CopticCross size={16} />
              </span>
              تابع رحلتك الروحية
            </h2>
          </div>
          <Coverflow
            items={visibleDaily}
            direction={-1}
            height={164}
            cardWidthPct={66}
            peekPct={48}
            getKey={(d) => d.key}
            renderCard={(d) => (
              <Link to={d.to as any} aria-label={d.title} className="block">
                <DailyCard {...d} />
              </Link>
            )}
          />
        </section>
        ) : null}

        {/* CHURCH NEWS */}
        {isAuthenticated && isModuleEnabled("community") ? (
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="alpha-home-section-title flex items-center gap-1.5 font-extrabold tracking-tight text-alpha-heading">
              <span className="text-alpha-gold-bright">
                <CopticCross size={16} />
              </span>
              أخبار كنيستك
            </h2>
            <span className="alpha-home-section-meta font-bold text-alpha-heading-muted">عرض الكل</span>
          </div>
          <div className="flex flex-col gap-3.5">
            <FeaturedNewsCard
              title="قداس الأحد الإلهي"
              sub="يبدأ القداس الإلهي الساعة 8:00 صباحًا في الكاتدرائية الكبرى."
              image={newsMass}
              date="الأحد 8 يونيو"
              category="قداس"
              accent="#e7c97a"
            />
            <FeaturedNewsCard
              title="اجتماع الشباب الأسبوعي"
              sub="درس روحي وتسبحة وحوار مفتوح مع الآباء الكهنة."
              image={newsYouth}
              date="الجمعة 7:00 م"
              category="شباب"
              accent="#8a6ec1"
            />
            <FeaturedNewsCard
              title="إعلان جديد من الكنيسة"
              sub="تغيير موعد اجتماع الأسرة هذا الأسبوع — يُرجى الاطلاع على التفاصيل."
              image={newsCandle}
              date="هذا الأسبوع"
              category="إعلان"
              accent="#c98a3c"
            />
          </div>
        </section>
        ) : null}

        {/* CHURCH DIRECTORY */}
        {isAuthenticated && isModuleEnabled("community") ? (
          <section className="mt-5 pb-1">
            <ChurchDirectoryHomeCard />
          </section>
        ) : null}
      </div>

      {/* TEMP_MEDIA_PLAYER_DISABLED */}
      {/* <MiniPlayer dockVisible={dockVisible} /> */}

      <BottomDock />
    </div>
  );
}

// ===== Hero Stack — wallet-style layered swipe, infinite loop + autoplay =====
/* =========================================================
   Carousel internals (Apple-like)
   - All visible cards translate together with the drag delta
     so the row feels like a connected chain.
   - Auto-rotation eases via cubic-bezier(0.32,0.72,0,1).
   - Touch pauses autoplay; resumes after 4s of inactivity.
   - Release uses velocity + distance to advance with momentum.
   ========================================================= */

const APPLE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const TRANSITION = `transform 620ms ${APPLE_EASE}, opacity 420ms ease-out, filter 420ms ease-out`;

function useCarouselGesture(onAdvance: (dir: 1 | -1) => void) {
  const startX = useRef<number | null>(null);
  const startT = useRef<number>(0);
  const lastX = useRef<number>(0);
  const lastT = useRef<number>(0);
  const velocity = useRef<number>(0); // px / ms
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    startX.current = x; lastX.current = x;
    startT.current = performance.now(); lastT.current = startT.current;
    velocity.current = 0;
    setDx(0); setDragging(true);
  };
  const onMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX.current == null) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const t = performance.now();
    const dt = Math.max(1, t - lastT.current);
    velocity.current = (x - lastX.current) / dt;
    lastX.current = x; lastT.current = t;
    setDx(x - startX.current);
  };
  const onEnd = () => {
    if (startX.current == null) return;
    const d = lastX.current - startX.current;
    const v = velocity.current; // RTL: left swipe (negative) → next
    // distance OR velocity threshold (Apple-feel)
    if (Math.abs(d) > 55 || Math.abs(v) > 0.55) {
      onAdvance(d + v * 120 < 0 ? 1 : -1);
    }
    startX.current = null;
    setDx(0); setDragging(false);
  };

  return { dx, dragging, onStart, onMove, onEnd };
}

function useAutoplay(active: boolean, intervalMs: number, tick: () => void) {
  const [paused, setPaused] = useState(false);
  const pauseTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!active || paused) return;
    const id = window.setInterval(tick, intervalMs);
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [active, paused, intervalMs, tick]);
  const pauseTemporarily = (ms = 4000) => {
    setPaused(true);
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => setPaused(false), ms);
  };
  useEffect(() => () => { if (pauseTimer.current) window.clearTimeout(pauseTimer.current); }, []);
  return { paused, pauseTemporarily };
}

function HeroStack({
  cards, savedSet, onToggleSaved,
}: {
  cards: HeroCard[];
  savedSet: Set<string>;
  onToggleSaved: (id: string) => void;
}) {
  const total = cards.length;
  const [index, setIndex] = useState(0);

  const advance = (dir: 1 | -1) => { setIndex((i) => i + dir); pauseTemporarily(); };
  const { paused, pauseTemporarily } = useAutoplay(total > 1, 6000, () => setIndex((i) => i + 1));
  const { dx, dragging, onStart, onMove, onEnd } = useCarouselGesture((dir) => advance(dir));

  // when user touches, pause immediately
  const handleStart = (e: any) => { if (!paused) pauseTemporarily(); onStart(e); };

  const currentMod = ((index % total) + total) % total;
  const slots = [-2, -1, 0, 1, 2];
  const peekPct = 62; // base offset between cards — keeps side cards visibly peeking

  return (
    <section className="mt-5 select-none">
      <div
        className="relative h-[268px] w-full overflow-hidden"
        style={{ perspective: 1200 }}
        onTouchStart={handleStart}
        onTouchMove={onMove as any}
        onTouchEnd={onEnd}
        onMouseDown={handleStart}
        onMouseMove={(e) => { if (dragging) onMove(e); }}
        onMouseUp={onEnd}
        onMouseLeave={() => { if (dragging) onEnd(); }}
      >
        {slots.map((s) => {
          const cardIdx = ((index + s) % total + total) % total;
          const c = cards[cardIdx];
          const isFront = s === 0;
          const distance = Math.abs(s);
          // All cards translate together with dx for a "connected chain" feel
          const baseXPct = s * peekPct;
          // Soft parallax: outer cards drift slightly less than inner
          const tx = dx * (1 - distance * 0.12);
          const scale = isFront ? 1 : distance === 1 ? 0.86 : 0.74;
          const opacity = isFront ? 1 : distance === 1 ? 0.55 : 0.18;
          const z = 30 - distance;
          const rotate = isFront ? dx * 0.015 : 0;
          return (
            <div
              key={`${c.id}-${s}`}
              className="absolute top-0 left-1/2 w-[86%]"
              style={{
                transform: `translate3d(calc(-50% + ${baseXPct}% + ${tx}px), 0, 0) scale(${scale}) rotate(${rotate}deg)`,
                zIndex: z,
                opacity,
                transition: dragging ? "none" : TRANSITION,
                filter: distance >= 2 ? "blur(1px)" : "none",
                willChange: "transform, opacity",
                pointerEvents: distance >= 2 ? "none" : "auto",
              }}
            >
              <HeroCardView
                card={c}
                index={currentMod}
                total={total}
                saved={savedSet.has(c.id)}
                onToggleSaved={() => onToggleSaved(c.id)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ===== Premium Infinite Wheel Carousel — single shared progress drives all cards =====
function Coverflow<T>({
  items, direction, height, cardWidthPct, peekPct, renderCard, getKey,
}: {
  items: T[];
  direction: 1 | -1;
  height: number;
  cardWidthPct: number;
  peekPct: number;
  renderCard: (item: T, isActive: boolean) => React.ReactNode;
  getKey: (item: T) => string;
  intervalMs?: number;
}) {
  const total = items.length;
  // Shared continuous progress in "slot units" — every card derives its position from this.
  const progressRef = useRef(0);
  const velocityRef = useRef(0); // slots per second (from drag release)
  const draggingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const lastTsRef = useRef(0);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => (n + 1) % 1_000_000), []);

  // Drag state
  const dragStartXRef = useRef(0);
  const dragStartProgRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const lastMoveTRef = useRef(0);
  const containerWRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pixels per slot — derived from peek spacing
  const pxPerSlot = useCallback(() => Math.max(80, (containerWRef.current * peekPct) / 100), [peekPct]);

  // Continuous RAF loop — auto-rotation + momentum decay
  useEffect(() => {
    if (total < 2) return;
    let raf = 0;
    const autoSpeed = 0.18; // slots / second (slow continuous drift)
    const tick = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      lastTsRef.current = ts;
      const now = performance.now();
      const autoActive = !draggingRef.current && now >= pauseUntilRef.current;
      // Momentum decay (always while not dragging)
      if (!draggingRef.current && velocityRef.current !== 0) {
        progressRef.current += velocityRef.current * dt;
        // Exponential decay toward zero (no snap)
        const decay = Math.exp(-dt * 2.6);
        velocityRef.current *= decay;
        if (Math.abs(velocityRef.current) < 0.02) velocityRef.current = 0;
      }
      if (autoActive) {
        progressRef.current += direction * autoSpeed * dt;
      }
      rerender();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, direction, rerender]);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { containerWRef.current = el.clientWidth || 1; });
    ro.observe(el);
    containerWRef.current = el.clientWidth || 1;
    return () => ro.disconnect();
  }, []);

  // Gesture handlers — convert px delta into progress delta directly (connected rail)
  const onStart = (clientX: number) => {
    draggingRef.current = true;
    dragStartXRef.current = clientX;
    dragStartProgRef.current = progressRef.current;
    lastMoveXRef.current = clientX;
    lastMoveTRef.current = performance.now();
    velocityRef.current = 0;
  };
  const onMove = (clientX: number) => {
    if (!draggingRef.current) return;
    const dx = clientX - dragStartXRef.current;
    // RTL feel: dragging left (negative dx) advances forward
    progressRef.current = dragStartProgRef.current - dx / pxPerSlot();
    // Track instantaneous velocity for release
    const t = performance.now();
    const dt = Math.max(1, t - lastMoveTRef.current);
    const vSlotsPerSec = -((clientX - lastMoveXRef.current) / pxPerSlot()) * (1000 / dt);
    velocityRef.current = vSlotsPerSec;
    lastMoveXRef.current = clientX;
    lastMoveTRef.current = t;
  };
  const onEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Clamp momentum to a sane range
    velocityRef.current = Math.max(-8, Math.min(8, velocityRef.current));
    // Tiny pause so momentum reads naturally, then auto-drift resumes immediately
    pauseUntilRef.current = performance.now() + 220;
  };

  // Event adapters
  const handleTouchStart = (e: React.TouchEvent) => onStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => onMove(e.touches[0].clientX);
  const handleMouseDown = (e: React.MouseEvent) => onStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => { if (draggingRef.current) onMove(e.clientX); };

  // Render slots — enough to fill both sides; positions derived from shared progress
  const visible = 5; // -2..+2
  const half = Math.floor(visible / 2);
  const progress = progressRef.current;
  const centerIdx = Math.round(progress);
  const frac = progress - centerIdx; // -0.5..0.5
  const currentMod = ((centerIdx % total) + total) % total;

  const slotOffsets: number[] = [];
  for (let i = -half; i <= half; i++) slotOffsets.push(i);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden touch-pan-y"
      style={{ height, perspective: 1400, perspectiveOrigin: "50% 50%" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={onEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
    >
      {slotOffsets.map((s) => {
        // Position of this slot relative to the visual center, derived from shared progress
        const effective = s - frac;
        const cardIdx = ((centerIdx + s) % total + total) % total;
        const item = items[cardIdx];
        const absEff = Math.abs(effective);
        const isFront = absEff < 0.5;
        const baseXPct = effective * peekPct;
        const rotateY = Math.max(-60, Math.min(60, -effective * 36));
        const translateZ = -Math.min(absEff, 2.2) * 90;
        const scale = Math.max(0.66, 1 - absEff * 0.14);
        const opacity = Math.max(0.1, 1 - absEff * 0.38);
        const z = 100 - Math.round(absEff * 20);
        return (
          <div
            key={`${getKey(item)}-${s}`}
            className="absolute top-0 left-1/2"
            style={{
              width: `${cardWidthPct}%`,
              transform: `translate3d(calc(-50% + ${baseXPct}%), 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
              transformOrigin: "50% 50%",
              zIndex: z,
              opacity,
              filter: absEff >= 1.6 ? "blur(1.5px)" : "none",
              willChange: "transform, opacity",
              pointerEvents: isFront ? "auto" : "none",
              borderRadius: "var(--alpha-radius-featured)",
            }}
          >
            <div className="relative" style={{ filter: isFront ? "none" : "brightness(0.82) saturate(0.9)" }}>
              {renderCard(item, isFront)}
              {!isFront && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[var(--alpha-radius-featured)]"
                  style={{
                    background:
                      effective > 0
                        ? "linear-gradient(270deg, rgba(20,12,4,0.35), rgba(20,12,4,0) 65%)"
                        : "linear-gradient(90deg, rgba(20,12,4,0.35), rgba(20,12,4,0) 65%)",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
      {/* indicators */}
      <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1.5 pointer-events-none">
        {items.map((it, i) => (
          <span
            key={getKey(it)}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === currentMod ? 18 : 5,
              background: i === currentMod ? "#b8893a" : "rgba(120,80,30,0.25)",
              boxShadow: i === currentMod ? "0 0 6px rgba(184,137,58,0.55)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}



function HeroCardView({
  card, index, total, saved, onToggleSaved,
}: {
  card: HeroCard;
  index: number;
  total: number;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <article
      className="alpha-home-hero-card relative h-[252px] w-full overflow-hidden border border-white/15"
      style={{
        background: "#0a0612",
      }}
    >
      <Link
        to={card.to as any}
        aria-label={card.title}
        className="absolute inset-0 z-0"
      >
        <img
          src={card.image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
          style={{ filter: undefined }}
        />
        {/* dark gradient for legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.92) 100%)",
          }}
        />
        {/* accent glow border */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[var(--alpha-radius-hero)]"
          style={{
            boxShadow: `inset 0 0 40px ${card.accent}33, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        />
        {/* coptic glyph */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-4 select-none font-black leading-none"
          style={{ fontSize: 64, color: "rgba(255,255,255,0.08)" }}
        >
          Ⲁ
        </span>
      </Link>

      {/* badge */}
      <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1.5">
        <Sparkles className="h-3 w-3" style={{ color: card.accent }} />
        <span className="alpha-type-caption font-bold text-white">{card.badge}</span>
      </div>

      {/* body */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-3.5 pt-4 pointer-events-none">
        <p
          className="alpha-type-h2 text-right !text-white leading-[1.55] line-clamp-3"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          {card.body}
        </p>
        {card.meta && (
          <p className="alpha-type-desc mt-1 text-right font-bold" style={{ color: card.accent }}>
            {card.meta}
          </p>
        )}

        {/* actions */}
        <div className="mt-2.5 flex items-center justify-between pointer-events-auto">
          <button
            aria-label={saved ? "إزالة الحفظ" : "حفظ"}
            onClick={onToggleSaved}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition"
            style={saved ? { background: `${card.accent}`, borderColor: card.accent } : {}}
          >
            <Bookmark className={"h-4 w-4 " + (saved ? "fill-white" : "")} />
          </button>

          {/* indicators */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 20 : 6,
                  background: i === index ? card.accent : "rgba(255,255,255,0.3)",
                  boxShadow: i === index ? `0 0 8px ${card.accent}99` : "none",
                }}
              />
            ))}
          </div>

          <button
            aria-label="مشاركة"
            onClick={() =>
              openAlphaShareSheet({
                title: card.title,
                body: card.body,
                meta: card.meta,
                imageSrc: card.image,
                accent: card.accent,
              })
            }
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}


function DailyCard({ title, sub, image, accent }: { title: string; sub: string; image: string; accent: string }) {
  return (
    <div
      className="alpha-home-daily-card relative h-[130px] w-full overflow-hidden border border-white/12"
      style={{
        boxShadow: `0 14px 28px -16px rgba(0,0,0,0.75), inset 0 0 20px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover alpha-media-polish" loading="lazy" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.10) 100%)" }}
      />
      <div className="absolute inset-y-0 right-0 flex flex-col justify-center px-3.5 text-right max-w-[60%]">
        <h3 className="text-[17px] font-extrabold text-white leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {title}
        </h3>
        <p className="mt-0.5 text-[13px] font-medium !text-white/80">{sub}</p>
        <div
          className="alpha-tag mt-1.5 inline-flex w-fit items-center gap-1 !text-white border"
          style={{ background: `${accent}30`, borderColor: `${accent}66` }}
        >
          افتح
          <ChevronLeft className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

// ===== Featured News Card =====
function FeaturedNewsCard({
  title, sub, image, date, category, accent,
}: {
  title: string; sub: string; image: string; date: string; category: string; accent: string;
}) {
  return (
    <article
      className="alpha-home-featured-card relative h-[150px] w-full overflow-hidden border border-white/12"
      style={{
        boxShadow: `0 18px 36px -20px rgba(0,0,0,0.8), 0 0 0 1px ${accent}22, inset 0 0 24px ${accent}1a, inset 0 1px 0 rgba(255,255,255,0.12)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover alpha-media-polish" loading="lazy" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      {/* category badge */}
      <div
        className="absolute top-3 right-3 alpha-tag inline-flex items-center gap-1 !text-white backdrop-blur-md"
        style={{ background: `${accent}33`, borderColor: `${accent}80` }}
      >
        <Sparkles className="h-2.5 w-2.5" />
        {category}
      </div>
      {/* date badge */}
      <div className="absolute top-3 left-3 alpha-tag inline-flex items-center gap-1 !text-white/90 border-white/20 bg-black/40 backdrop-blur-md">
        <Calendar className="h-2.5 w-2.5" />
        {date}
      </div>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-4 text-right">
        <h3
          className="text-[17px] font-extrabold leading-tight text-white"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
        >
          {title}
        </h3>
        <p className="mt-1 text-[13px] font-medium leading-snug !text-white/85 line-clamp-2">{sub}</p>
      </div>
    </article>
  );
}


// ===== Floating Mini Player =====
function MiniPlayer({ dockVisible }: { dockVisible: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(28);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.4)), 200);
    return () => clearInterval(id);
  }, [playing]);

  // Player is always available; no dismiss.

  const title = "ترنيمة بي إيك أفنوتي — لحن سنوي";

  return (
    <div
      aria-label="مشغل الوسائط"
      className="fixed inset-x-0 z-40 alpha-motion-standard"
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${dockVisible ? 92 : 16}px)`,
        opacity: 1,
      }}
    >
      <div className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4">
        <div
          className="alpha-home-mini-player alpha-glass-interactive relative flex items-center gap-3 overflow-hidden px-2.5 py-2"
        >
          {/* artwork */}
          <div className="alpha-home-mini-player__art relative h-11 w-11 shrink-0 overflow-hidden">
            <img src={dailyHymn} alt="" className="h-full w-full object-cover alpha-media-polish" />
            <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 18px color-mix(in srgb, var(--alpha-gold) 35%, transparent)" }} />
          </div>
          {/* title + progress */}
          <div className="flex-1 min-w-0">
            <div className="overflow-hidden">
              <div
                className="alpha-type-body whitespace-nowrap font-bold text-alpha-heading"
                style={{
                  display: "inline-block",
                  paddingInlineStart: "100%",
                  animation: "alphaMarquee 12s linear infinite",
                }}
              >
                {title} · {title}
              </div>
            </div>
            <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-alpha-progress-track">
              <div
                className="alpha-progress-gold h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* play/pause */}
          <button
            aria-label={playing ? "إيقاف" : "تشغيل"}
            onClick={() => setPlaying((p) => !p)}
            className="alpha-play-btn-gold grid h-10 w-10 shrink-0 place-items-center rounded-full active:scale-95 alpha-motion-standard"
          >
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          {/* dismiss button removed — player is always available */}
        </div>
      </div>
      <style>{`@keyframes alphaMarquee { 0%{transform:translateX(0)} 100%{transform:translateX(-100%)} }`}</style>
    </div>
  );
}
