/**
 * Alpha Onboarding — Premium first-run experience.
 * 5 slides · horizontal swipe · Apple-style animations.
 *
 * Uses position:fixed inset:0 to guarantee true fullscreen on all
 * mobile browsers regardless of parent layout constraints.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { cn } from "@/lib/utils";

/* Original HQ images — served from public/ (no Vite build compression) */
const ONBOARDING_IMAGES = {
  slide01: "/onboarding/alpha-onboarding-01-welcome.jpg",
  slide02: "/onboarding/alpha-onboarding-02-bible.jpg",
  slide03: "/onboarding/alpha-onboarding-03-community.jpg",
  slide04: "/onboarding/alpha-onboarding-04-growth.jpg",
  slide05: "/onboarding/alpha-onboarding-05-final.jpg",
} as const;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Persistence helpers                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const ONBOARDING_KEY = "alpha.onboarding.v1";

export function hasSeenOnboarding(): boolean {
  try { return !!localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
}

export function markOnboardingDone(): void {
  try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
}

/** Developer reset — call from console: resetAlphaOnboarding() */
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).resetAlphaOnboarding = () => {
    try { localStorage.removeItem(ONBOARDING_KEY); console.info("[Alpha] Onboarding reset."); } catch {}
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Slide data                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

type SlideConfig = {
  bg: string;
  title: string;
  description: string;
  objectPosition: string;
  isFinal?: boolean;
};

const SLIDES: SlideConfig[] = [
  {
    bg: ONBOARDING_IMAGES.slide01,
    title: "مرحباً بك في Alpha",
    description: "بيتك القبطي الرقمي للكتاب المقدس والكنيسة والحياة الروحية.",
    objectPosition: "center center",
  },
  {
    bg: ONBOARDING_IMAGES.slide02,
    title: "كلمة الله بين يديك",
    description: "الكتاب المقدس، الأجبية، القطمارس، السنكسار والخولاجي في مكان واحد.",
    objectPosition: "center center",
  },
  {
    bg: ONBOARDING_IMAGES.slide03,
    title: "كنيستك معاك أينما كنت",
    description: "تواصل مع الكاهن والخدام وشارك حياة كنيستك اليومية.",
    objectPosition: "center center",
  },
  {
    bg: ONBOARDING_IMAGES.slide04,
    title: "رحلتك الروحية تنمو معك",
    description: "تابع قراءاتك وصلواتك وتقدمك الروحي يوماً بعد يوم.",
    objectPosition: "center center",
  },
  {
    bg: ONBOARDING_IMAGES.slide05,
    title: "Ⲁ أهلاً بك في Alpha Ⲱ",
    description: "بيتك القبطي الرقمي",
    objectPosition: "center center",
    isFinal: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AlphaOnboarding() {
  // const navigate = useNavigate(); // DEV: unused until persistence re-enabled
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [exiting, setExiting] = useState(false);

  const ptrX = useRef<number | null>(null);
  const ptrY = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* ── DEV: loop back instead of navigating away ── */
  const finish = useCallback((_dest: "/register" | "/login" | "/home") => {
    // TODO: Re-enable onboarding completion persistence after final approval.
    //   markOnboardingDone();
    //   setExiting(true);
    //   setTimeout(() => navigate({ to: _dest }), 400);
    goTo(0);
  }, [goTo]);

  /* ── Pointer swipe ── */
  const onPtrDown = (e: React.PointerEvent) => {
    ptrX.current = e.clientX;
    ptrY.current = e.clientY;
  };
  const onPtrUp = (e: React.PointerEvent) => {
    if (ptrX.current === null) return;
    const dx = e.clientX - ptrX.current;
    const dy = Math.abs(e.clientY - (ptrY.current ?? e.clientY));
    if (dy < 30 && Math.abs(dx) > 48) {
      dx < 0 ? goNext() : goPrev();
    }
    ptrX.current = null;
  };

  /* ── Keyboard ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  const slide  = SLIDES[current]!;
  const isLast = !!slide.isFinal;

  /* Safe area inset bottom, used for content padding above bottom controls */
  const safeBot = "max(24px, env(safe-area-inset-bottom))";
  const safeBotContent = isLast ? safeBot : `calc(${safeBot} + 72px)`;

  return (
    <AlphaScreenFrame
      mode="fixed"
      frameClassName="bg-black"
      className="select-none"
      style={{ WebkitUserSelect: "none", touchAction: "pan-y" }}
      onPointerDown={onPtrDown}
      onPointerUp={onPtrUp}
    >
        {/* ── Background — HQ public images, cover, no zoom/filter ── */}
        {SLIDES.map((s, i) => (
          <div
            key={s.bg}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === current ? 1 : 0,
              zIndex: i === current ? 1 : 0,
              transition: "opacity 700ms ease",
              pointerEvents: "none",
            }}
          >
            <img
              src={s.bg}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: s.objectPosition,
                display: "block",
              }}
            />
          </div>
        ))}

        {/* ── Bottom gradient for text readability ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            height: "58%",
            background:
              "linear-gradient(to top, rgba(3,1,0,0.94) 0%, rgba(3,1,0,0.62) 40%, rgba(3,1,0,0.12) 72%, transparent 100%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        {/* ── Slide text content ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            paddingTop: "max(env(safe-area-inset-top), 24px)",
            paddingBottom: safeBotContent,
          }}
        >
          {isLast
            ? <FinalSlide key={`f-${animKey}`} slide={slide} onFinish={finish} />
            : <ContentSlide key={`c-${animKey}`} slide={slide} />
          }
        </div>

        {/* ── Bottom bar (slides 1–4) ── */}
        {!isLast && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "max(24px, env(safe-area-inset-bottom))",
              zIndex: 30,
              height: 44,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`الشريحة ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current
                      ? "bg-[#d4a843]"
                      : "bg-white/35 hover:bg-white/55",
                  )}
                  style={
                    i === current
                      ? { width: 28, height: 9, boxShadow: "0 0 8px 2px rgba(212,168,67,0.6)" }
                      : { width: 7, height: 7 }
                  }
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="التالي"
              onClick={goNext}
              style={{
                position: "absolute",
                right: 24,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 150ms ease",
              }}
              onPointerDown={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(0.88)"; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <ChevronRight style={{ width: 20, height: 20, color: "#fff" }} />
            </button>
          </div>
        )}

        {/* ── Exit fade overlay ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "#000",
            opacity: exiting ? 1 : 0,
            transition: "opacity 400ms ease",
            pointerEvents: "none",
          }}
        />
    </AlphaScreenFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Slides 1–4 — text floating in lower third, no container                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function ContentSlide({ slide }: { slide: SlideConfig }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 24px 20px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: 27,
          fontWeight: 800,
          lineHeight: 1.35,
          color: "#fff",
          margin: "0 0 12px",
          textShadow: "0 2px 14px rgba(0,0,0,0.9)",
          animation: "alphaFadeUp 480ms 80ms ease-out both",
        }}
      >
        {slide.title}
      </h2>
      <p
        style={{
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          animation: "alphaFadeUp 480ms 180ms ease-out both",
        }}
      >
        {slide.description}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Slide 5 — Final, no next arrow, CTAs near bottom                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function FinalSlide({ slide, onFinish }: {
  slide: SlideConfig;
  onFinish: (dest: "/register" | "/login" | "/home") => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 24px 16px",
      }}
    >
      {/* Title + description */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px",
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            animation: "alphaFadeUp 480ms 80ms ease-out both",
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            margin: 0,
            animation: "alphaFadeUp 480ms 160ms ease-out both",
          }}
        >
          {slide.description}
        </p>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={() => onFinish("/register")}
        style={{
          width: "100%",
          height: 52,
          borderRadius: 16,
          border: "none",
          background: "linear-gradient(135deg, #d4a843 0%, #b8893a 100%)",
          color: "#2a1a08",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 10,
          boxShadow: "0 10px 32px -10px rgba(212,168,67,0.75)",
          animation: "alphaFadeUp 480ms 260ms ease-out both",
        }}
      >
        إنشاء حساب
      </button>

      {/* Secondary CTA */}
      <button
        type="button"
        onClick={() => onFinish("/login")}
        style={{
          width: "100%",
          height: 52,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 10,
          animation: "alphaFadeUp 480ms 340ms ease-out both",
        }}
      >
        تسجيل الدخول
      </button>

      {/* Guest */}
      <button
        type="button"
        onClick={() => onFinish("/home")}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.55)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          padding: "6px 0",
          animation: "alphaFadeUp 480ms 420ms ease-out both",
        }}
      >
        الدخول كضيف
      </button>
    </div>
  );
}
