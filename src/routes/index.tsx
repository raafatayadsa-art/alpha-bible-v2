import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import splashPhase1 from "@/assets/splash-phase1.png";
import alphaLogo from "@/assets/alpha-logo.png";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — البيت الرقمي للأقباط الأرثوذكس" },
      { name: "description", content: "مرحبًا بك في ألفا — ابدأ رحلتك الروحية." },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  // Phase 1: black → cinematic background reveal
  // Phase 2: holy logo reveal from the light above the church
  const [revealed, setRevealed] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const [copticIn, setCopticIn] = useState(false);
  const [sloganIn, setSloganIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 350);
    const t2 = setTimeout(() => setLogoIn(true), 1600);
    const t3 = setTimeout(() => setCopticIn(true), 2900);
    const t4 = setTimeout(() => setSloganIn(true), 3700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);


  return (
    <div
      dir="rtl"
      className="relative h-[100dvh] w-screen overflow-hidden bg-black"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Phase 1 — Background image cinematic reveal */}
      <img
        src={splashPhase1}
        alt=""
        aria-hidden
        draggable={false}
        className={[
          "absolute inset-0 h-full w-full object-cover object-center select-none",
          "transition-opacity ease-out [transition-duration:1800ms]",
          revealed ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Phase 1 — Soft golden bloom synced with background */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 transition-opacity ease-out [transition-duration:2000ms]",
          revealed ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "radial-gradient(60% 40% at 50% 38%, rgba(255, 224, 160, 0.18), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Phase 2 — Holy logo reveal */}
      <div
        aria-hidden={!logoIn}
        className="pointer-events-none absolute inset-x-0 flex justify-center"
        style={{
          // Sits in the upper third, clear of Dynamic Island and the church
          top: "calc(env(safe-area-inset-top) + 7%)",
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Soft divine glow behind the logo — only blooms during reveal, then settles */}
          <div
            className={[
              "pointer-events-none absolute left-1/2 top-[115px] -translate-x-1/2 -translate-y-1/2 rounded-full",
              "transition-opacity ease-out [transition-duration:1400ms]",
              logoIn ? "opacity-100" : "opacity-0",
            ].join(" ")}
            style={{
              width: "230px",
              height: "230px",
              background:
                "radial-gradient(closest-side, rgba(255, 214, 140, 0.45), rgba(255, 200, 120, 0.18) 45%, transparent 75%)",
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
          />

          <img
            src={alphaLogo}
            alt=""
            draggable={false}
            className={[
              "relative block w-[200px] h-auto select-none",
              "transition-all ease-out [transition-duration:1200ms]",
              logoIn
                ? "opacity-100 scale-100 blur-0"
                : "opacity-0 scale-[0.92] blur-[6px]",
            ].join(" ")}
            style={{
              filter: logoIn
                ? "drop-shadow(0 2px 18px rgba(255, 200, 110, 0.35))"
                : "drop-shadow(0 0 0 rgba(0,0,0,0))",
              transitionProperty: "opacity, transform, filter",
            }}
          />

          {/* Coptic name — appears under ALPHA wordmark */}
          <div
            className={[
              "relative mt-3 select-none",
              "transition-all ease-out [transition-duration:1100ms]",
              copticIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2",
            ].join(" ")}
            style={{
              fontFamily: '"Noto Sans Coptic", "Segoe UI Historic", serif',
              fontSize: "30px",
              letterSpacing: "0.12em",
              color: "#d9a85a",
              textShadow:
                "0 1px 10px rgba(255, 200, 110, 0.35), 0 0 22px rgba(217, 168, 90, 0.18)",
              transitionProperty: "opacity, transform",
            }}
          >
            ⲀⲖⲪⲀ
          </div>

          {/* Slogan — quiet luxury */}
          <div
            className={[
              "relative mt-4 text-center select-none",
              "transition-all ease-out [transition-duration:1200ms]",
              sloganIn
                ? "opacity-90 translate-y-0"
                : "opacity-0 translate-y-2",
            ].join(" ")}
            style={{
              fontFamily:
                '"Cormorant Garamond", "Cinzel", "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "11px",
              letterSpacing: "0.42em",
              color: "rgba(220, 184, 120, 0.78)",
              textTransform: "uppercase",
              transitionProperty: "opacity, transform",
            }}
          >
            The Coptic Orthodox Digital Home
          </div>
        </div>

      </div>
    </div>
  );
}
