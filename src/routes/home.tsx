import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Menu, Bell, Search, Sparkles, Share2, Bookmark, ChevronLeft,
  Home as HomeIcon, HandHeart, Users, User as UserIcon,
  Play, Pause, X, Link2, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomDock } from "@/components/bible/BottomDock";

// Hero stack art
import artVerse from "@/assets/home/art-verse.jpg";
import artReadings from "@/assets/home/art-readings.jpg";
import artSaint from "@/assets/home/art-saint.jpg";
import artFeast from "@/assets/home/art-feast.jpg";

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

import logoBible from "@/assets/home/logo-bible.png";
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
      try { localStorage.setItem(key, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };
  return { set, toggle };
}

// ===== Premium share with auto-generated branded image =====
// Cache generated share images by content key so repeat shares are instant.
const shareImageCache = new Map<string, Blob>();
const shareImageInflight = new Map<string, Promise<Blob | null>>();

async function buildShareImage(opts: {
  title: string;
  body: string;
  meta?: string;
  imageSrc: string;
  accent: string;
}): Promise<Blob | null> {
  const { title, body, meta, imageSrc, accent } = opts;
  const img = await loadImage(imageSrc);
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no ctx");
  // cover-fit background
  const ratio = Math.max(W / img.width, H / img.height);
  const dw = img.width * ratio, dh = img.height * ratio;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  // dark gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0.15)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  // accent glow
  const halo = ctx.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H * 0.4, W * 0.7);
  halo.addColorStop(0, `${accent}55`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
  // RTL text
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#f0d78c";
  ctx.font = "bold 38px system-ui, -apple-system, 'SF Arabic'";
  ctx.fillText(title, W - 70, H - 480);
  // body
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 54px system-ui, -apple-system, 'SF Arabic'";
  const lines = wrapText(ctx, body, W - 140);
  let y = H - 400;
  for (const line of lines.slice(0, 5)) {
    ctx.fillText(line, W - 70, y);
    y += 78;
  }
  if (meta) {
    ctx.fillStyle = "#e7c97a";
    ctx.font = "bold 32px system-ui, -apple-system, 'SF Arabic'";
    ctx.fillText(meta, W - 70, y + 20);
  }
  // brand strip
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, H - 130, W, 130);
  ctx.fillStyle = "#f0d78c";
  ctx.font = "bold 36px system-ui";
  ctx.textAlign = "right";
  ctx.fillText("ألفا — التطبيق القبطي", W - 70, H - 75);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "26px system-ui";
  ctx.fillText("حمّل من App Store و Google Play", W - 70, H - 35);
  // Ⲁ Ⲱ
  ctx.fillStyle = `${accent}33`;
  ctx.font = "bold 220px serif";
  ctx.textAlign = "left";
  ctx.fillText("Ⲁ", 40, 220);
  ctx.textAlign = "right";
  ctx.fillText("Ⲱ", W - 40, H - 200);
  return await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
}

type ShareRequest = {
  title: string;
  body: string;
  meta?: string;
  imageSrc: string;
  accent: string;
};

// Open a global share sheet; rendered by HomeScreen.
function openShareSheet(req: ShareRequest) {
  window.dispatchEvent(new CustomEvent<ShareRequest>("alpha-share-open", { detail: req }));
}

async function getShareBlob(req: ShareRequest): Promise<Blob | null> {
  const cacheKey = `${req.imageSrc}|${req.accent}|${req.title}|${req.body}|${req.meta ?? ""}`;
  const cached = shareImageCache.get(cacheKey);
  if (cached) return cached;
  let pending = shareImageInflight.get(cacheKey);
  if (!pending) {
    pending = buildShareImage(req).then((b) => {
      if (b) shareImageCache.set(cacheKey, b);
      shareImageInflight.delete(cacheKey);
      return b;
    }).catch((e) => { shareImageInflight.delete(cacheKey); throw e; });
    shareImageInflight.set(cacheKey, pending);
  }
  return pending;
}

function shareText(req: ShareRequest) {
  return `${req.title}\n\n${req.body}${req.meta ? `\n— ${req.meta}` : ""}\n\nحمّل تطبيق ألفا القبطي:\nApp Store: https://apps.apple.com/app/alpha-coptic\nGoogle Play: https://play.google.com/store/apps/details?id=app.alpha.coptic`;
}

const APP_URL = "https://alpha-bible.lovable.app";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line); line = w;
    } else { line = t; }
  }
  if (line) lines.push(line);
  return lines;
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
function HomeScreen() {
  const greeting = useGreeting();
  const userName = "رافت";
  const [notifCount] = useState(1);
  const dockVisible = useHideOnScroll();
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);
  const { set: savedSet, toggle: toggleSaved } = useSavedSet("alpha.saved");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: dc } = await supabase.from("daily_content").select("*").limit(1).maybeSingle();
        if (!cancelled && dc) {
          const text = (dc as any).verse_text ?? (dc as any).text ?? (dc as any).content ?? (dc as any).body;
          const reference = (dc as any).verse_reference ?? (dc as any).reference ?? (dc as any).title ?? "";
          if (text) { setVerse({ text: String(text), reference: String(reference || "") }); return; }
        }
      } catch {}
      try {
        const { data: bv } = await supabase
          .from("bible_verses")
          .select("book_name,chapter_number,verse_number,verse_text")
          .limit(1).maybeSingle();
        if (!cancelled && bv) {
          setVerse({
            text: (bv as any).verse_text,
            reference: `${(bv as any).book_name} ${(bv as any).chapter_number}:${(bv as any).verse_number}`,
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const heroCards: HeroCard[] = [
    {
      id: "verse",
      kind: "verse",
      badge: "آية اليوم",
      title: "آية اليوم",
      body: verse?.text ?? "رَبَّنَا هُوَ مَلْجَأنَا وَقُوَّتَنَا، عَوْنًا فِي الضِّيقَاتِ جِدًّا.",
      meta: verse?.reference || "مزامير 46:1",
      image: artVerse,
      accent: "#e7c97a",
      to: "/books",
    },
    {
      id: "readings",
      kind: "readings",
      badge: "قراءات اليوم",
      title: "قطمارس اليوم",
      body: "قراءات اليوم من القطمارس القبطي — رسائل البولس والكاثوليكون والإنجيل.",
      meta: "اضغط للقراءة",
      image: artReadings,
      accent: "#d8a64f",
      to: "/katameros",
    },
    {
      id: "saint",
      kind: "saint",
      badge: "قديس اليوم",
      title: "قديس اليوم",
      body: "تعرّف على سيرة قديس اليوم من السنكسار القبطي وتأمّل في حياته.",
      meta: "السنكسار",
      image: artSaint,
      accent: "#c98a3c",
      to: "/synaxarium",
    },
    {
      id: "feast",
      kind: "feast",
      badge: "مناسبة اليوم",
      title: "مناسبة اليوم",
      body: "اكتشف الأعياد والمناسبات القبطية لهذا اليوم، طقوسها وقراءاتها.",
      meta: "المناسبات",
      image: artFeast,
      accent: "#d4a574",
      to: "/feasts",
    },
    {
      id: "prayer-requests",
      kind: "saint",
      badge: "طلبات الصلاة",
      title: "طلبات الصلاة",
      body: "شارك إخوتك في الصلاة، وأرسل طلبتك ليصلي عنك المؤمنون.",
      meta: "اضغط للمشاركة",
      image: dailyPrayer,
      accent: "#a82747",
      to: "/prayer-requests",
    },
  ];




  type PrimaryCard = { key: string; title: string; sub: string; image: string; to: string; accent: string; glyph: "Ⲁ" | "Ⲱ" };
  const primary: PrimaryCard[] = [
    { key: "bible", title: "الكتاب المقدس", sub: "اقرأ كلمة الله", image: cardBible, to: "/books", accent: "#8a6ec1", glyph: "Ⲁ" },
    { key: "agpeya", title: "الأجبية", sub: "صلوات السبع ساعات", image: cardAgpeya, to: "/agpeya", accent: "#c98a3c", glyph: "Ⲱ" },
    { key: "katameros", title: "القطمارس", sub: "قراءات اليوم", image: cardKatameros, to: "/katameros", accent: "#4a9e6e", glyph: "Ⲁ" },
    { key: "synaxarium", title: "السنكسار", sub: "سير القديسين", image: cardSynaxarium, to: "/synaxarium", accent: "#a85450", glyph: "Ⲱ" },
    { key: "church", title: "كنيستك معاك", sub: "خدمات وفعاليات", image: cardChurch, to: "/church", accent: "#5b8fd1", glyph: "Ⲁ" },
    { key: "audio", title: "الصوتيات", sub: "ترانيم وقراءات", image: cardAudio, to: "/home", accent: "#c44569", glyph: "Ⲱ" },
    { key: "kids", title: "الأطفال", sub: "قصص وأنشطة", image: cardChildren, to: "/home", accent: "#e8b84a", glyph: "Ⲁ" },
    { key: "meditation", title: "التأملات", sub: "رحلات روحية", image: cardMeditation, to: "/home", accent: "#5b8fd1", glyph: "Ⲱ" },
  ];

  type Daily = { key: string; title: string; sub: string; image: string; to: string; accent: string };
  const daily: Daily[] = [
    { key: "prayer", title: "صلاة اليوم", sub: "ابدأ يومك بالصلاة", image: dailyPrayer, to: "/agpeya", accent: "#c98a3c" },
    { key: "med", title: "تأمل اليوم", sub: "رحلة السلام", image: dailyMeditation, to: "/home", accent: "#4a9e6e" },
    { key: "hymn", title: "ترنيمة اليوم", sub: "ترنيمة مختارة", image: dailyHymn, to: "/home", accent: "#c44569" },
    { key: "cont", title: "أكمل القراءة", sub: "إنجيل يوحنا 3 · 35%", image: artReadings, to: "/books", accent: "#8a6ec1" },
  ];


  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      {/* Premium dark cinematic background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 0%, rgba(231,201,122,0.35), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 30%, rgba(216,138,42,0.16), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(190,150,90,0.22), transparent 65%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#ecdcb6 100%)",
        }}
      />
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-2 pt-2">
          <button aria-label="القائمة" className="grid h-11 w-11 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition">
            <Menu className="h-5 w-5 text-[#3a2a18]" />
          </button>
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 text-[#b8893a] shrink-0" />
              <h1 className="font-extrabold text-[15px] text-[#3a2a18] whitespace-nowrap [word-break:keep-all]">
                {greeting} يا {userName}
              </h1>
              <span className="text-[14px]">☀️</span>
            </div>
            <p className="text-[11px] text-[#6a543a] mt-0.5">نعمة الرب معك اليوم</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button aria-label="الإشعارات" className="relative grid h-11 w-11 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition">
              <Bell className="h-5 w-5 text-[#3a2a18]" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#d88a2a] text-[10px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </button>
            <Link to="/search" aria-label="بحث" className="grid h-11 w-11 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition">
              <Search className="h-5 w-5 text-[#3a2a18]" />
            </Link>
          </div>
        </header>

        {/* HERO STACK CAROUSEL — Apple Wallet style, autoplay + infinite */}
        <HeroStack
          cards={heroCards}
          savedSet={savedSet}
          onToggleSaved={toggleSaved}
        />

        {/* PRIMARY STACKED CAROUSEL — auto-rotating cover flow, infinite */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-[#3a2a18] tracking-tight flex items-center gap-1.5">
              <CopticCross className="text-[#b8893a]" size={14} />
              اكتشف رحلتك اليوم
            </h2>
          </div>
          <Coverflow
            items={primary}
            direction={1}
            height={244}
            cardWidthPct={62}
            peekPct={46}
            getKey={(c) => c.key}
            renderCard={(c) => (
              <Link to={c.to as any} aria-label={c.title} className="block">
                <PrimaryArtCardFull {...c} />
              </Link>
            )}
          />
        </section>

        {/* DAILY — opposite-direction auto cover flow */}
        <section className="mt-5">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-[#3a2a18] tracking-tight flex items-center gap-1.5">
              <CopticCross className="text-[#b8893a]" size={14} />
              تابع رحلتك الروحية
            </h2>
          </div>
          <Coverflow
            items={daily}
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


        {/* CHURCH NEWS — featured */}
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-[#3a2a18] tracking-tight flex items-center gap-1.5">
              <CopticCross className="text-[#b8893a]" size={14} />
              أخبار كنيستك
            </h2>
            <span className="text-[11px] font-bold text-[#7a4a26]">عرض الكل</span>
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
      </div>

      {/* TEMP_MEDIA_PLAYER_DISABLED — hide floating mini player during design reviews */}
      {/* <MiniPlayer dockVisible={dockVisible} /> */}

      {/* Share Sheet host */}
      <ShareSheetHost />

      {/* Unified Bottom Navigation */}
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

// ===== Premium Cover Flow — connected motion, momentum, Apple ease =====
function Coverflow<T>({
  items, direction, height, cardWidthPct, peekPct, renderCard, getKey, intervalMs = 6000,
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
  const [index, setIndex] = useState(0);

  const { paused, pauseTemporarily } = useAutoplay(total > 1, intervalMs, () =>
    setIndex((i) => i + direction),
  );
  const { dx, dragging, onStart, onMove, onEnd } = useCarouselGesture((dir) => {
    setIndex((i) => i + dir);
    pauseTemporarily();
  });
  const handleStart = (e: any) => { if (!paused) pauseTemporarily(); onStart(e); };

  const currentMod = ((index % total) + total) % total;
  const slots = [-2, -1, 0, 1, 2];

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{ height, perspective: 1400, perspectiveOrigin: "50% 50%" }}
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
        const item = items[cardIdx];
        const isFront = s === 0;
        const distance = Math.abs(s);
        // Connected-rail drift: convert drag into fractional slot offset
        const dragFrac = dx / 220;
        const effective = s - dragFrac;
        const absEff = Math.abs(effective);
        const baseXPct = effective * peekPct;
        // Apple Cover Flow: side cards rotate inward in 3D
        const rotateY = Math.max(-55, Math.min(55, -effective * 38));
        const translateZ = isFront ? 0 : -Math.min(absEff, 2) * 80;
        const scale = isFront
          ? 1 + Math.max(0, 0.04 - Math.abs(dragFrac) * 0.04)
          : Math.max(0.7, 1 - absEff * 0.13);
        const opacity = Math.max(0.12, 1 - absEff * 0.42);
        const z = 30 - Math.round(absEff * 10);
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
              transition: dragging ? "none" : TRANSITION,
              filter: distance >= 2 ? "blur(1.5px)" : "none",
              willChange: "transform, opacity",
              pointerEvents: distance >= 2 ? "none" : "auto",
              borderRadius: 24,
            }}
          >
            <div className="relative" style={{ filter: isFront ? "none" : "brightness(0.82) saturate(0.9)" }}>
              {renderCard(item, isFront)}
              {!isFront && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[24px]"
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
      className="relative h-[252px] w-full overflow-hidden rounded-[32px] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(231,201,122,0.15)]"
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
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "saturate(1.05)" }}
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
          className="pointer-events-none absolute inset-0 rounded-[32px]"
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
        <span className="text-[11px] font-bold text-white">{card.badge}</span>
      </div>

      {/* body */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-3.5 pt-4 pointer-events-none">
        <p
          className="text-right font-extrabold text-white leading-[1.55] text-[14px] line-clamp-3"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          {card.body}
        </p>
        {card.meta && (
          <p className="mt-1 text-right text-[11.5px] font-bold" style={{ color: card.accent }}>
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
              openShareSheet({
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
      className="relative h-[130px] w-full overflow-hidden rounded-[22px] border border-white/12"
      style={{
        boxShadow: `0 14px 28px -16px rgba(0,0,0,0.75), inset 0 0 20px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.10) 100%)" }}
      />
      <div className="absolute inset-y-0 right-0 flex flex-col justify-center px-3.5 text-right max-w-[60%]">
        <h3 className="text-[14px] font-extrabold text-white leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {title}
        </h3>
        <p className="text-[11px] text-white/80 mt-0.5">{sub}</p>
        <div
          className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white border"
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
      className="relative h-[150px] w-full overflow-hidden rounded-[24px] border border-white/12"
      style={{
        boxShadow: `0 18px 36px -20px rgba(0,0,0,0.8), 0 0 0 1px ${accent}22, inset 0 0 24px ${accent}1a, inset 0 1px 0 rgba(255,255,255,0.12)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
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
        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md"
        style={{ background: `${accent}33`, borderColor: `${accent}80` }}
      >
        <Sparkles className="h-2.5 w-2.5" />
        {category}
      </div>
      {/* date badge */}
      <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white/90">
        <Calendar className="h-2.5 w-2.5" />
        {date}
      </div>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-4 text-right">
        <h3
          className="text-[15px] font-extrabold leading-tight text-white"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
        >
          {title}
        </h3>
        <p className="mt-1 text-[11.5px] leading-snug text-white/85 line-clamp-2">{sub}</p>
      </div>
    </article>
  );
}


function PrimaryArtCardFull({ title, sub, image, accent, glyph }: { title: string; sub: string; image: string; accent: string; glyph: "Ⲁ" | "Ⲱ" }) {
  return (
    <div
      className="relative h-[212px] w-full overflow-hidden rounded-[26px] border border-white/15"
      style={{
        boxShadow: `0 28px 56px -22px rgba(0,0,0,0.85), 0 0 0 1px ${accent}33, inset 0 0 36px ${accent}26, inset 0 1px 0 rgba(255,255,255,0.18)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.95) 100%)" }}
      />
      <span aria-hidden className="pointer-events-none absolute top-3 left-4 select-none font-black leading-none" style={{ fontSize: 80, color: "rgba(255,255,255,0.10)" }}>{glyph}</span>
      <div className="absolute inset-x-5 bottom-4 text-right">
        <h3 className="text-[20px] font-extrabold leading-tight text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>{title}</h3>
        <p className="mt-1 text-[12.5px] font-medium text-white/85" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>{sub}</p>
        <div
          className="mt-2.5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-white border"
          style={{ background: `${accent}33`, borderColor: `${accent}80`, backdropFilter: "blur(6px)" }}
        >
          افتح
          <ChevronLeft className="h-3 w-3" />
        </div>
      </div>
    </div>
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
      className="fixed inset-x-0 z-40 transition-all duration-300 ease-out"
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${dockVisible ? 92 : 16}px)`,
        opacity: 1,
      }}
    >
      <div className="mx-auto w-full max-w-[440px] px-4">
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-[20px] border border-[#efe2c4] bg-gradient-to-r from-[#fbf3e1]/95 to-[#f4ead8]/95 px-2.5 py-2 backdrop-blur-2xl"
          style={{ boxShadow: "0 18px 36px -16px rgba(120,80,30,0.35), inset 0 1px 0 rgba(255,255,255,0.8)" }}
        >
          {/* artwork */}
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[12px] border border-[#efe2c4]">
            <img src={dailyHymn} alt="" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 18px rgba(231,201,122,0.35)" }} />
          </div>
          {/* title + progress */}
          <div className="flex-1 min-w-0">
            <div className="overflow-hidden">
              <div
                className="whitespace-nowrap text-[12.5px] font-bold text-[#3a2a18]"
                style={{
                  display: "inline-block",
                  paddingInlineStart: "100%",
                  animation: "alphaMarquee 12s linear infinite",
                }}
              >
                {title} · {title}
              </div>
            </div>
            <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[#ecdcb6]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#e7c97a,#d88a2a)",
                  boxShadow: "0 0 8px rgba(231,201,122,0.5)",
                }}
              />
            </div>
          </div>
          {/* play/pause */}
          <button
            aria-label={playing ? "إيقاف" : "تشغيل"}
            onClick={() => setPlaying((p) => !p)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#1a1230] active:scale-95 transition"
            style={{ background: "linear-gradient(180deg,#f0d78c,#d88a2a)", boxShadow: "0 6px 14px -4px rgba(231,201,122,0.6)" }}
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

// ===== Share Sheet Host =====
function ShareSheetHost() {
  const [req, setReq] = useState<ShareRequest | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => setReq((e as CustomEvent<ShareRequest>).detail);
    window.addEventListener("alpha-share-open", onOpen as EventListener);
    return () => window.removeEventListener("alpha-share-open", onOpen as EventListener);
  }, []);

  const close = useCallback(() => setReq(null), []);

  if (!req) return null;

  const text = shareText(req);
  const encoded = encodeURIComponent(text);
  const url = encodeURIComponent(APP_URL);

  const doNative = async () => {
    setBusy(true);
    try {
      const blob = await getShareBlob(req);
      if (blob && (navigator as any).canShare?.({ files: [new File([blob], "alpha.jpg", { type: "image/jpeg" })] })) {
        const file = new File([blob], "alpha.jpg", { type: "image/jpeg" });
        await (navigator as any).share({ title: req.title, text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: req.title, text });
      } else {
        await navigator.clipboard?.writeText(text);
      }
    } catch {}
    setBusy(false);
    close();
  };

  const openExternal = (href: string) => { window.open(href, "_blank", "noopener,noreferrer"); close(); };

  const doCopy = async () => {
    try { await navigator.clipboard?.writeText(text); } catch {}
    close();
  };

  const doSaveImage = async () => {
    setBusy(true);
    try {
      const blob = await getShareBlob(req);
      if (blob) {
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u; a.download = "alpha-coptic.jpg";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
      }
    } catch {}
    setBusy(false);
    close();
  };

  // Save image silently (no auto-download UX prompt) — used by external flows.
  const ensureImage = async (download: boolean) => {
    try {
      const blob = await getShareBlob(req);
      if (!blob) return;
      if (download) {
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u; a.download = "alpha-coptic.jpg";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
      }
    } catch {}
  };

  const shareToExternal = async (href: string) => {
    setBusy(true);
    await ensureImage(true); // auto-download branded image so user can attach
    setBusy(false);
    openExternal(href);
  };

  const options: { key: string; label: string; color: string; emoji: string; onClick: () => void }[] = [
    { key: "wa", label: "واتساب", color: "#25D366", emoji: "💬", onClick: () => shareToExternal(`https://wa.me/?text=${encoded}`) },
    { key: "tg", label: "تيليجرام", color: "#229ED9", emoji: "✈️", onClick: () => shareToExternal(`https://t.me/share/url?url=${url}&text=${encoded}`) },
    { key: "fb", label: "فيسبوك", color: "#1877F2", emoji: "📘", onClick: () => shareToExternal(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`) },
    { key: "ig", label: "إنستجرام", color: "#E1306C", emoji: "📷", onClick: async () => { await doSaveImage(); } },
    { key: "native", label: "مشاركة", color: "#d88a2a", emoji: "🔗", onClick: doNative },
    { key: "copy", label: "نسخ النص", color: "#8a6ec1", emoji: "📋", onClick: doCopy },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={close}
    >
      <div className="absolute inset-0 bg-[#3a2a18]/45 backdrop-blur-sm animate-in fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-t-[24px] border-t border-x border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1] to-[#f4ead8] px-4 pt-2.5 pb-[max(env(safe-area-inset-bottom),14px)]"
        style={{ boxShadow: "0 -16px 32px -10px rgba(120,80,30,0.35), inset 0 1px 0 rgba(255,255,255,0.9)" }}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#d8c190]" />
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-extrabold text-[#3a2a18] flex items-center gap-1.5">
            <CopticCross className="text-[#b8893a]" size={12} />
            مشاركة
          </h3>
          <button aria-label="إغلاق" onClick={close} className="grid h-7 w-7 place-items-center rounded-full bg-[#ecdcb6] text-[#7a4a26]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 px-1 text-[11px] text-[#6a543a] line-clamp-1 text-right">{req.title} — {req.body.slice(0, 70)}…</p>

        <div className="mt-3 grid grid-cols-6 gap-2">
          {options.map((o) => (
            <button
              key={o.key}
              disabled={busy}
              onClick={o.onClick}
              className="flex flex-col items-center gap-1 rounded-xl p-1.5 active:scale-[0.94] transition disabled:opacity-50"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-full text-[18px]"
                style={{ background: `${o.color}22`, border: `1px solid ${o.color}66` }}
              >
                {o.emoji}
              </span>
              <span className="text-[9.5px] font-bold text-[#3a2a18] leading-tight text-center">{o.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={doSaveImage}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#efe2c4] bg-white/60 py-2.5 text-[12px] font-bold text-[#3a2a18] active:scale-[0.99] transition disabled:opacity-50"
        >
          <Link2 className="h-3.5 w-3.5 text-[#b8893a]" />
          حفظ صورة المشاركة
        </button>
      </div>
    </div>
  );
}

function DockItem({
  icon: Icon, label, active, raised, to,
}: { icon?: any; label: string; active?: boolean; raised?: boolean; to?: string }) {
  const color = active ? "#7a4a26" : "#6a543a";
  const inner = (
    <div className="flex w-full flex-col items-center justify-end gap-1.5">
      {raised ? (
        <div
          className="-mt-8 grid h-16 w-16 place-items-center"
          style={{
            filter: "drop-shadow(0 0 14px rgba(231,201,122,0.55)) drop-shadow(0 6px 10px rgba(0,0,0,0.55))",
          }}
        >
          <img src={logoBible} alt="" className="h-full w-full object-contain" draggable={false} />
        </div>
      ) : Icon ? (
        <Icon className="h-[20px] w-[20px]" strokeWidth={1.8} style={{ color, opacity: active ? 1 : 0.88 }} />
      ) : null}
      <span className="text-[10.5px] font-bold leading-none whitespace-nowrap [word-break:keep-all]" style={{ color }}>
        {label}
      </span>
      {active && !raised && (
        <span className="h-1 w-1 rounded-full" style={{ background: "#b8893a", boxShadow: "0 0 6px rgba(184,137,58,0.7)" }} />
      )}
    </div>
  );
  const cls = "flex items-end justify-center py-1 active:scale-[0.96] transition";
  if (to) return <Link to={to as any} className={cls}>{inner}</Link>;
  return <button type="button" className={cls}>{inner}</button>;
}
