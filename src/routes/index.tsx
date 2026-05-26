import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import splashPhase1 from "@/assets/splash-phase1.png";
import alphaLockup from "@/assets/alpha-lockup.png";

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
  // Phase 2: holy logo lockup reveal (single unified element)
  const [revealed, setRevealed] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 350);
    const t2 = setTimeout(() => setLogoIn(true), 1600);
    const t3 = setTimeout(() => setShimmer(true), 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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

      {/* Phase 2 — Unified logo lockup reveal */}
      <div
        aria-hidden={!logoIn}
        className="pointer-events-none absolute inset-x-0 flex justify-center"
        style={{
          top: "calc(env(safe-area-inset-top) + 5%)",
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Soft divine glow behind the lockup */}
          <div
            className={[
              "pointer-events-none absolute left-1/2 top-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full",
              "transition-opacity ease-out [transition-duration:1400ms]",
              logoIn ? "opacity-100" : "opacity-0",
            ].join(" ")}
            style={{
              width: "280px",
              height: "280px",
              background:
                "radial-gradient(closest-side, rgba(255, 214, 140, 0.42), rgba(255, 200, 120, 0.16) 45%, transparent 75%)",
              filter: "blur(10px)",
              mixBlendMode: "screen",
            }}
          />

          {/* The official logo lockup — single unified asset, untouched */}
          <div className="relative">
            <img
              src={alphaLockup}
              alt=""
              draggable={false}
              className={[
                "relative block w-[230px] h-auto select-none",
                "transition-all ease-out [transition-duration:1200ms]",
                logoIn
                  ? "opacity-100 scale-100 translate-y-0 blur-0"
                  : "opacity-0 scale-[0.72] -translate-y-[30px] blur-[10px]",
              ].join(" ")}
              style={{
                filter: logoIn
                  ? "drop-shadow(0 2px 22px rgba(255, 200, 110, 0.38))"
                  : "drop-shadow(0 0 0 rgba(0,0,0,0))",
                transitionProperty: "opacity, transform, filter",
              }}
            />

            {/* Subtle light shimmer that sweeps across after settle */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: `url(${alphaLockup})`,
                maskImage: `url(${alphaLockup})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            >
              <div
                className={[
                  "absolute top-0 h-full w-[40%]",
                  shimmer ? "animate-[shimmerSweep_1800ms_ease-out_forwards]" : "",
                ].join(" ")}
                style={{
                  background:
                    "linear-gradient(100deg, transparent 0%, rgba(255, 240, 200, 0.55) 50%, transparent 100%)",
                  filter: "blur(6px)",
                  mixBlendMode: "screen",
                  transform: "translateX(-120%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(320%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
