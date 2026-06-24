/**
 * Alpha Onboarding — Premium first-run experience.
 * 5 slides · horizontal swipe · Apple-style animations.
 *
 * Uses position:fixed inset:0 to guarantee true fullscreen on all
 * mobile browsers regardless of parent layout constraints.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";
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

type GradientMode = "bottom" | "top" | "both" | "none";

type SlideLayout = {
  justifyContent: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  paddingTop?: string;
  paddingBottom?: string;
  paddingInline?: string;
  textAlign?: CSSProperties["textAlign"];
  gradient?: GradientMode;
};

type SlideAnimation = {
  title: string;
  titleDelay: string;
  titleDuration?: string;
  desc: string;
  descDelay: string;
  descDuration?: string;
  descStyle?: "white" | "gold" | "muted";
};

type SlideConfig = {
  bg: string;
  title: string;
  description: string;
  objectPosition: string;
  layout: SlideLayout;
  animation: SlideAnimation;
  isWelcome?: boolean;
  isFinal?: boolean;
};

const GOLD_GRADIENT =
  "linear-gradient(135deg, #f5e6b8 0%, #e8c96a 28%, #d4af37 55%, #b8893a 100%)";

const SLIDES: SlideConfig[] = [
  {
    bg: ONBOARDING_IMAGES.slide01,
    title: "مرحباً بك في Alpha",
    description: "بيتك القبطي الرقمي للكتاب المقدس والكنيسة والحياة الروحية.",
    objectPosition: "center 42%",
    isWelcome: true,
    layout: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "clamp(42%, 46vh, 52%)",
      paddingInline: "24px",
      textAlign: "center",
      gradient: "bottom",
    },
    animation: {
      title: "alphaFadeUp",
      titleDelay: "160ms",
      desc: "alphaWelcomeGoldIn",
      descDelay: "1080ms",
      descStyle: "gold",
    },
  },
  {
    bg: ONBOARDING_IMAGES.slide02,
    title: "كلمة الله بين يديك",
    description: "الكتاب المقدس، الأجبية، القطمارس، السنكسار والخولاجي في مكان واحد.",
    objectPosition: "center 38%",
    layout: {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: "28px",
      paddingInline: "24px",
      textAlign: "center",
      gradient: "bottom",
    },
    animation: {
      title: "alphaRevealBlur",
      titleDelay: "120ms",
      titleDuration: "680ms",
      desc: "alphaSlideInRTL",
      descDelay: "420ms",
      descDuration: "620ms",
      descStyle: "muted",
    },
  },
  {
    bg: ONBOARDING_IMAGES.slide03,
    title: "كنيستك معاك أينما كنت",
    description: "تواصل مع الكاهن والخدام وشارك حياة كنيستك اليومية.",
    objectPosition: "center 32%",
    layout: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "clamp(10%, 12vh, 16%)",
      paddingInline: "24px",
      textAlign: "center",
      gradient: "top",
    },
    animation: {
      title: "alphaDriftDown",
      titleDelay: "100ms",
      titleDuration: "640ms",
      desc: "alphaFadeScale",
      descDelay: "380ms",
      descDuration: "560ms",
      descStyle: "white",
    },
  },
  {
    bg: ONBOARDING_IMAGES.slide04,
    title: "رحلتك الروحية تنمو معك",
    description: "تابع قراءاتك وصلواتك وتقدمك الروحي يوماً بعد يوم.",
    objectPosition: "center 36%",
    layout: {
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: "clamp(9%, 11vh, 14%)",
      paddingInline: "28px",
      textAlign: "right",
      gradient: "top",
    },
    animation: {
      title: "alphaLightSweep",
      titleDelay: "140ms",
      titleDuration: "720ms",
      desc: "alphaFadeUp",
      descDelay: "460ms",
      descDuration: "580ms",
      descStyle: "muted",
    },
  },
  {
    bg: ONBOARDING_IMAGES.slide05,
    title: "Ⲁ أهلاً بك في Alpha Ⲱ",
    description: "بيتك القبطي الرقمي",
    objectPosition: "center 40%",
    isFinal: true,
    layout: {
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "clamp(14%, 18vh, 22%)",
      paddingBottom: "16px",
      paddingInline: "24px",
      textAlign: "center",
      gradient: "both",
    },
    animation: {
      title: "alphaCrownReveal",
      titleDelay: "180ms",
      titleDuration: "820ms",
      desc: "alphaSoftGlow",
      descDelay: "560ms",
      descDuration: "640ms",
      descStyle: "gold",
    },
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shared text styles                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function descColor(style: SlideAnimation["descStyle"]): CSSProperties {
  if (style === "gold") {
    return {
      background: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      filter: "drop-shadow(0 2px 10px rgba(212,175,55,0.5))",
    };
  }
  if (style === "muted") {
    return { color: "rgba(255,255,255,0.82)" };
  }
  return { color: "rgba(255,255,255,0.9)" };
}

function animStyle(
  name: string,
  delay: string,
  duration = "560ms",
): CSSProperties {
  return { animation: `${name} ${duration} ${delay} cubic-bezier(0.22, 1, 0.36, 1) both` };
}

function SlideGradient({ mode }: { mode: GradientMode }) {
  if (mode === "none") return null;

  return (
    <>
      {(mode === "top" || mode === "both") && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "42%",
            background:
              "linear-gradient(to bottom, rgba(3,1,0,0.88) 0%, rgba(3,1,0,0.45) 55%, transparent 100%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}
      {(mode === "bottom" || mode === "both") && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: mode === "both" ? "48%" : "58%",
            background:
              mode === "both"
                ? "linear-gradient(to top, rgba(3,1,0,0.92) 0%, rgba(3,1,0,0.5) 45%, transparent 100%)"
                : "linear-gradient(to top, rgba(3,1,0,0.94) 0%, rgba(3,1,0,0.62) 40%, rgba(3,1,0,0.12) 72%, transparent 100%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AlphaOnboarding() {
  const navigate = useNavigate();
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

  const finish = useCallback(
    (dest: "/register" | "/login" | "/home") => {
      markOnboardingDone();
      setExiting(true);
      window.setTimeout(() => {
        void navigate({ to: dest });
      }, 400);
    },
    [navigate],
  );

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

  const safeBot = "max(24px, env(safe-area-inset-bottom))";
  const safeBotContent = isLast ? safeBot : `calc(${safeBot} + 72px)`;
  const gradientMode = slide.layout.gradient ?? "bottom";

  return (
    <AlphaScreenFrame
      mode="fixed"
      frameClassName="bg-black"
      className="select-none"
      style={{ WebkitUserSelect: "none", touchAction: "pan-y" }}
      onPointerDown={onPtrDown}
      onPointerUp={onPtrUp}
    >
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

        <SlideGradient mode={gradientMode} />

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
          {slide.isWelcome
            ? <WelcomeSlide key={`w-${animKey}`} slide={slide} />
            : isLast
              ? <FinalSlide key={`f-${animKey}`} slide={slide} onFinish={finish} />
              : <ContentSlide key={`c-${animKey}`} slide={slide} />
          }
        </div>

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
/* Slide 1 — Welcome: original text, staged grow under the church             */
/* ─────────────────────────────────────────────────────────────────────────── */

function WelcomeSlide({ slide }: { slide: SlideConfig }) {
  const { layout, animation } = slide;
  const welcomePrefix = slide.title.replace(/\s*Alpha\s*$/, "").trim();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: layout.justifyContent,
        alignItems: layout.alignItems ?? "center",
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        paddingLeft: layout.paddingInline,
        paddingRight: layout.paddingInline,
        textAlign: layout.textAlign ?? "center",
      }}
    >
      <p
        style={{
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.4,
          color: "rgba(255,255,255,0.94)",
          margin: 0,
          letterSpacing: "0.03em",
          textShadow: "0 2px 14px rgba(0,0,0,0.88)",
          ...animStyle(animation.title, animation.titleDelay, "520ms"),
        }}
      >
        {welcomePrefix}
      </p>

      <h2
        style={{
          fontSize: "clamp(44px, 12vw, 58px)",
          fontWeight: 800,
          lineHeight: 1.05,
          color: "#fff",
          margin: "8px 0 0",
          letterSpacing: "0.06em",
          textShadow: "0 4px 22px rgba(0,0,0,0.92), 0 0 40px rgba(255,255,255,0.12)",
          animation: "alphaWelcomeGrow 820ms 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
          transformOrigin: "center center",
        }}
      >
        Alpha
      </h2>

      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.65,
          margin: "14px 0 0",
          maxWidth: 320,
          ...descColor(animation.descStyle ?? "gold"),
          ...animStyle(animation.desc, animation.descDelay, animation.descDuration ?? "760ms"),
        }}
      >
        {slide.description}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Slides 2–4 — per-slide layout + unique animation                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function ContentSlide({ slide }: { slide: SlideConfig }) {
  const { layout, animation } = slide;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: layout.justifyContent,
        alignItems: layout.alignItems ?? "center",
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        paddingLeft: layout.paddingInline,
        paddingRight: layout.paddingInline,
        textAlign: layout.textAlign ?? "center",
      }}
    >
      <h2
        style={{
          fontSize: layout.textAlign === "right" ? 26 : 27,
          fontWeight: 800,
          lineHeight: 1.35,
          color: "#fff",
          margin: "0 0 12px",
          maxWidth: layout.textAlign === "right" ? 300 : undefined,
          textShadow: "0 2px 14px rgba(0,0,0,0.9)",
          ...animStyle(
            animation.title,
            animation.titleDelay,
            animation.titleDuration,
          ),
        }}
      >
        {slide.title}
      </h2>
      <p
        style={{
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.7,
          margin: 0,
          maxWidth: layout.textAlign === "right" ? 280 : 340,
          ...descColor(animation.descStyle ?? "muted"),
          ...animStyle(
            animation.desc,
            animation.descDelay,
            animation.descDuration,
          ),
        }}
      >
        {slide.description}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Slide 5 — Final: text in sky, CTAs at bottom                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

function FinalSlide({ slide, onFinish }: {
  slide: SlideConfig;
  onFinish: (dest: "/register" | "/login" | "/home") => void;
}) {
  const { layout, animation } = slide;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: layout.justifyContent,
        alignItems: layout.alignItems ?? "center",
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        paddingLeft: layout.paddingInline,
        paddingRight: layout.paddingInline,
      }}
    >
      <div style={{ textAlign: layout.textAlign ?? "center", width: "100%" }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 10px",
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            ...animStyle(
              animation.title,
              animation.titleDelay,
              animation.titleDuration,
            ),
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
            ...descColor(animation.descStyle ?? "gold"),
            ...animStyle(
              animation.desc,
              animation.descDelay,
              animation.descDuration,
            ),
          }}
        >
          {slide.description}
        </p>
      </div>

      <div style={{ width: "100%", marginTop: "auto" }}>
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
            animation: "alphaFadeUp 520ms 780ms ease-out both",
          }}
        >
          إنشاء حساب
        </button>

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
            animation: "alphaSlideInRTL 560ms 920ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          تسجيل الدخول
        </button>

        <button
          type="button"
          onClick={() => onFinish("/home")}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            padding: "6px 0",
            animation: "alphaFadeScale 480ms 1060ms ease-out both",
          }}
        >
          الدخول كضيف
        </button>
      </div>
    </div>
  );
}
