import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Menu, Bell, Search, Sparkles, Share2, Bookmark, ChevronLeft,
  Home as HomeIcon, HandHeart, Users, User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
import { CopticWatermark } from "@/components/coptic";

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
async function shareWithImage(opts: {
  title: string;
  body: string;
  meta?: string;
  imageSrc: string;
  accent: string;
}) {
  const { title, body, meta, imageSrc, accent } = opts;
  const shareText = `${title}\n\n${body}${meta ? `\n— ${meta}` : ""}\n\nحمّل تطبيق ألفا القبطي:\nApp Store: https://apps.apple.com/app/alpha-coptic\nGoogle Play: https://play.google.com/store/apps/details?id=app.alpha.coptic`;
  try {
    // Try to compose a branded share image
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

    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    if (blob && (navigator as any).canShare?.({ files: [new File([blob], "alpha.jpg", { type: "image/jpeg" })] })) {
      const file = new File([blob], "alpha.jpg", { type: "image/jpeg" });
      await (navigator as any).share({ title, text: shareText, files: [file] });
      return;
    }
  } catch {}
  try {
    if (navigator.share) {
      await navigator.share({ title, text: shareText });
      return;
    }
  } catch {}
  try {
    await navigator.clipboard.writeText(shareText);
  } catch {}
}

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
  const [heroIndex, setHeroIndex] = useState(0);
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
  ];

  type PrimaryCard = { key: string; title: string; sub: string; image: string; to: string; accent: string; glyph: "Ⲁ" | "Ⲱ" };
  const primary: PrimaryCard[] = [
    { key: "bible", title: "الكتاب المقدس", sub: "اقرأ كلمة الله", image: cardBible, to: "/books", accent: "#8a6ec1", glyph: "Ⲁ" },
    { key: "agpeya", title: "الأجبية", sub: "صلوات السبع ساعات", image: cardAgpeya, to: "/agpeya", accent: "#c98a3c", glyph: "Ⲱ" },
    { key: "katameros", title: "القطمارس", sub: "قراءات اليوم", image: cardKatameros, to: "/katameros", accent: "#4a9e6e", glyph: "Ⲁ" },
    { key: "synaxarium", title: "السنكسار", sub: "سير القديسين", image: cardSynaxarium, to: "/synaxarium", accent: "#a85450", glyph: "Ⲱ" },
    { key: "church", title: "كنيستك معاك", sub: "خدمات وفعاليات", image: cardChurch, to: "/home", accent: "#5b8fd1", glyph: "Ⲁ" },
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

  type News = { key: string; title: string; sub: string; image: string };
  const news: News[] = [
    { key: "ann", title: "إعلان جديد", sub: "تغيير موعد الاجتماع", image: newsCandle },
    { key: "youth", title: "اجتماع الشباب", sub: "الجمعة 7:00 م", image: newsYouth },
    { key: "mass", title: "قداس الأحد", sub: "الأحد 8:00 ص", image: newsMass },
  ];

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      {/* Premium dark cinematic background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(80,40,120,0.55), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 30%, rgba(231,201,138,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(60,30,90,0.45), transparent 65%)," +
            "linear-gradient(180deg,#0e0a1c 0%,#161028 50%,#0c0918 100%)",
        }}
      />
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-2 pt-2">
          <button aria-label="القائمة" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl active:scale-95 transition">
            <Menu className="h-5 w-5 text-[#f0e6d0]" />
          </button>
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 text-[#e7c97a] shrink-0" />
              <h1 className="font-extrabold text-[15px] text-white whitespace-nowrap [word-break:keep-all]">
                {greeting} يا {userName}
              </h1>
              <span className="text-[14px]">☀️</span>
            </div>
            <p className="text-[11px] text-white/55 mt-0.5">نعمة الرب معك اليوم</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button aria-label="الإشعارات" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl active:scale-95 transition">
              <Bell className="h-5 w-5 text-[#f0e6d0]" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#d88a2a] text-[10px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </button>
            <Link to="/search" aria-label="بحث" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl active:scale-95 transition">
              <Search className="h-5 w-5 text-[#f0e6d0]" />
            </Link>
          </div>
        </header>

        {/* HERO STACK CAROUSEL — Apple Wallet style */}
        <HeroStack
          cards={heroCards}
          index={heroIndex}
          onIndex={setHeroIndex}
          savedSet={savedSet}
          onToggleSaved={toggleSaved}
        />

        {/* PRIMARY MODULE CAROUSEL */}
        <section className="mt-6 -mx-4">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <h2 className="text-[14px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#e7c97a]" />
              اكتشف رحلتك اليوم
            </h2>
            <span className="text-[11px] font-bold text-[#e7c97a]/80">اسحب →</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {primary.map((c) => (
              <Link
                key={c.key}
                to={c.to as any}
                aria-label={c.title}
                className="snap-start shrink-0 active:scale-[0.97] transition-transform duration-200"
              >
                <PrimaryArtCard {...c} />
              </Link>
            ))}
          </div>
        </section>

        {/* DAILY CAROUSEL */}
        <section className="mt-3 -mx-4">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <h2 className="text-[14px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#e7c97a]" />
              تابع رحلتك الروحية
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {daily.map((d) => (
              <Link key={d.key} to={d.to as any} className="snap-start shrink-0 active:scale-[0.97] transition-transform">
                <DailyCard {...d} />
              </Link>
            ))}
          </div>
        </section>

        {/* CHURCH NEWS */}
        <section className="mt-3">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#e7c97a]" />
              أخبار كنيستك
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {news.map(({ key, ...n }) => (
              <NewsCard key={key} {...n} />
            ))}
          </div>
        </section>
      </div>

      {/* Bottom dock */}
      <nav
        aria-label="التنقل السفلي"
        className="fixed inset-x-0 bottom-0 z-50 transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
          transform: dockVisible ? "translateY(0)" : "translateY(120%)",
          opacity: dockVisible ? 1 : 0,
          pointerEvents: dockVisible ? "auto" : "none",
        }}
      >
        <div className="mx-auto w-full max-w-[440px] px-3">
          <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1a1230]/85 to-[#0c0918]/90 shadow-[0_-12px_36px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            <div className="grid grid-cols-5 items-end px-2 pt-2.5 pb-2">
              <DockItem icon={HomeIcon} label="الرئيسية" active to="/home" />
              <DockItem icon={HandHeart} label="الصلاة" to="/agpeya" />
              <DockItem label="الكتاب المقدس" raised to="/books" />
              <DockItem icon={Users} label="المجتمع" />
              <DockItem icon={UserIcon} label="المزيد" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

// ===== Hero Stack — wallet-style layered swipe =====
function HeroStack({
  cards, index, onIndex, savedSet, onToggleSaved,
}: {
  cards: HeroCard[];
  index: number;
  onIndex: (i: number) => void;
  savedSet: Set<string>;
  onToggleSaved: (id: string) => void;
}) {
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    startX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDx(0);
  };
  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX.current == null) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDx(x - startX.current);
  };
  const onTouchEnd = () => {
    if (Math.abs(dx) > 60) {
      if (dx < 0 && index < cards.length - 1) onIndex(index + 1);
      else if (dx > 0 && index > 0) onIndex(index - 1);
    }
    startX.current = null;
    setDx(0);
  };

  return (
    <section className="mt-5 select-none">
      <div
        className="relative h-[320px] w-full"
        style={{ perspective: 1200 }}
        onTouchStart={onTouchStart as any}
        onTouchMove={onTouchMove as any}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart as any}
        onMouseMove={(e) => { if (startX.current != null) onTouchMove(e); }}
        onMouseUp={onTouchEnd}
        onMouseLeave={() => { if (startX.current != null) onTouchEnd(); }}
      >
        {cards.map((c, i) => {
          const rel = i - index;
          if (rel < 0 || rel > 3) return null;
          const isFront = rel === 0;
          const scale = 1 - rel * 0.06;
          const translateY = rel * 14;
          const translateX = isFront ? dx : 0;
          const rotate = isFront ? dx * 0.02 : 0;
          const opacity = rel <= 2 ? 1 : 0.4;
          const z = 30 - rel;
          return (
            <div
              key={c.id}
              className="absolute inset-x-0 top-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                zIndex: z,
                opacity,
                transitionDuration: startX.current != null && isFront ? "0ms" : "350ms",
              }}
            >
              <HeroCardView
                card={c}
                index={index}
                total={cards.length}
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
      className="relative h-[300px] w-full overflow-hidden rounded-[32px] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(231,201,122,0.15)]"
      style={{
        background: "#0a0612",
      }}
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
        style={{ fontSize: 72, color: "rgba(255,255,255,0.08)" }}
      >
        Ⲁ
      </span>

      {/* badge */}
      <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1.5">
        <Sparkles className="h-3 w-3" style={{ color: card.accent }} />
        <span className="text-[11px] font-bold text-white">{card.badge}</span>
      </div>

      {/* body */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-5">
        <p
          className="text-right font-extrabold text-white leading-[1.7] text-[15px]"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
        >
          {card.body}
        </p>
        {card.meta && (
          <p className="mt-1.5 text-right text-[12px] font-bold" style={{ color: card.accent }}>
            {card.meta}
          </p>
        )}

        {/* actions */}
        <div className="mt-3 flex items-center justify-between">
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

          <div className="flex items-center gap-1.5">
            <Link
              to={card.to as any}
              aria-label="افتح"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <button
              aria-label="مشاركة"
              onClick={() =>
                shareWithImage({
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
      </div>
    </article>
  );
}

// ===== Primary Art Card =====
function PrimaryArtCard({
  title, sub, image, accent, glyph,
}: {
  title: string;
  sub: string;
  image: string;
  accent: string;
  glyph: "Ⲁ" | "Ⲱ";
}) {
  return (
    <div
      className="relative h-[230px] w-[165px] overflow-hidden rounded-[28px] border border-white/15"
      style={{
        boxShadow: `0 24px 48px -22px rgba(0,0,0,0.85), 0 0 0 1px ${accent}22, inset 0 0 30px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.18)`,
        background: "#0a0612",
      }}
    >
      <img src={image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      {/* gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.70) 85%, rgba(0,0,0,0.95) 100%)",
        }}
      />
      {/* glow ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{ boxShadow: `inset 0 0 24px ${accent}55` }}
      />
      {/* coptic glyph */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-2 left-3 select-none font-black leading-none"
        style={{ fontSize: 52, color: "rgba(255,255,255,0.10)" }}
      >
        {glyph}
      </span>
      <div className="absolute inset-x-3 bottom-3 text-right">
        <h3
          className="text-[15px] font-extrabold leading-tight text-white"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}
        >
          {title}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/85" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {sub}
        </p>
        <div
          className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white border"
          style={{ background: `${accent}30`, borderColor: `${accent}66`, backdropFilter: "blur(6px)" }}
        >
          افتح
          <ChevronLeft className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

function DailyCard({ title, sub, image, accent }: { title: string; sub: string; image: string; accent: string }) {
  return (
    <div
      className="relative h-[110px] w-[230px] overflow-hidden rounded-[22px] border border-white/12"
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

function NewsCard({ title, sub, image }: { title: string; sub: string; image: string }) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-xl">
      <img src={image} alt="" className="h-[64px] w-[80px] rounded-xl object-cover" loading="lazy" />
      <div className="flex-1 text-right">
        <h3 className="text-[13px] font-extrabold text-white">{title}</h3>
        <p className="text-[11px] text-white/65 mt-0.5">{sub}</p>
      </div>
      <ChevronLeft className="h-4 w-4 text-white/45 shrink-0" />
    </div>
  );
}

function DockItem({
  icon: Icon, label, active, raised, to,
}: { icon?: any; label: string; active?: boolean; raised?: boolean; to?: string }) {
  const color = active ? "#f0d78c" : "#e8e2cf";
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
        <span className="h-1 w-1 rounded-full" style={{ background: "#f0d78c", boxShadow: "0 0 6px rgba(240,215,140,0.7)" }} />
      )}
    </div>
  );
  const cls = "flex items-end justify-center py-1 active:scale-[0.96] transition";
  if (to) return <Link to={to as any} className={cls}>{inner}</Link>;
  return <button type="button" className={cls}>{inner}</button>;
}
