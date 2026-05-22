import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import bgImage from "@/assets/splash-bg.png";
import churchImage from "@/assets/splash-church.png";
import logoImage from "@/assets/splash-logo.png";
import buttonImage from "@/assets/splash-button.png";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — البيت الرقمي للأقباط الأرثوذكس" },
      { name: "description", content: "ابدأ رحلتك الروحية مع ألفا." },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [pulse, setPulse] = useState(false);

  const enter = () => {
    if (leaving) return;
    setPulse(true);
    setTimeout(() => setLeaving(true), 220);
    setTimeout(() => navigate({ to: "/books" }), 780);
  };

  return (
    <div
      dir="rtl"
      className="relative h-screen w-screen overflow-hidden bg-[#f6ecd6]"
    >
      {/* Background — subtle parallax */}
      <img
        src={bgImage}
        alt=""
        aria-hidden
        draggable={false}
        className={[
          "absolute inset-0 h-full w-full object-cover object-center select-none",
          "splash-bg-parallax",
          leaving ? "opacity-0" : "opacity-100",
          "transition-opacity duration-700 ease-out",
        ].join(" ")}
      />

      {/* Heavenly light rays */}
      <div aria-hidden className="pointer-events-none absolute inset-0 splash-rays" />
      {/* Warm glow overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 splash-glow" />

      {/* Church — descends from top with blur-to-focus */}
      <div
        className="absolute left-1/2 -translate-x-1/2 splash-church"
        style={{ top: "11%", width: "78%" }}
      >
        <img
          src={churchImage}
          alt=""
          aria-hidden
          draggable={false}
          className="block w-full h-auto select-none drop-shadow-[0_18px_30px_rgba(160,110,30,0.18)]"
        />
      </div>

      {/* Golden arched frame around logo+church (CSS/SVG only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 splash-frame"
        style={{ top: "8%", width: "86%", height: "62%" }}
      >
        <svg viewBox="0 0 200 280" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="goldStroke" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#e7c477" />
              <stop offset="45%" stopColor="#f6dfa0" />
              <stop offset="100%" stopColor="#b8862f" />
            </linearGradient>
            <linearGradient id="goldStrokeInner" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#d4a85a" />
              <stop offset="100%" stopColor="#9a6f24" />
            </linearGradient>
          </defs>
          {/* Pointed arch (oval-arched) */}
          <path
            d="M 100 6 C 178 30, 196 110, 196 180 L 196 264 Q 196 274 186 274 L 14 274 Q 4 274 4 264 L 4 180 C 4 110, 22 30, 100 6 Z"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="1.6"
          />
          <path
            d="M 100 14 C 172 36, 188 112, 188 180 L 188 260 Q 188 266 182 266 L 18 266 Q 12 266 12 260 L 12 180 C 12 112, 28 36, 100 14 Z"
            fill="none"
            stroke="url(#goldStrokeInner)"
            strokeWidth="0.8"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Logo */}
      <div
        className="absolute left-1/2 -translate-x-1/2 splash-logo"
        style={{ top: "54%", width: "58%" }}
      >
        <img
          src={logoImage}
          alt="ألفا — البيت الرقمي للأقباط الأرثوذكس"
          draggable={false}
          className="block w-full h-auto select-none"
        />
      </div>

      {/* Start button */}
      <div
        className="absolute left-1/2 -translate-x-1/2 splash-button-wrap"
        style={{ bottom: "8%", width: "82%" }}
      >
        <button
          type="button"
          onClick={enter}
          aria-label="ابدأ رحلتك الروحية"
          className={[
            "relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 rounded-full",
            pulse ? "splash-button-pulse" : "",
          ].join(" ")}
        >
          <img
            src={buttonImage}
            alt=""
            aria-hidden
            draggable={false}
            className="block w-full h-auto select-none"
          />
          {/* Overlay the requested label on top of the gold button frame */}
          <span
            className="absolute inset-0 flex items-center justify-center pr-[18%] font-serif text-[#7a4e16] tracking-wide"
            style={{ fontSize: "clamp(15px, 4.6vw, 22px)", textShadow: "0 1px 0 rgba(255,240,200,0.7)" }}
          >
            ابدأ رحلتك الروحية
          </span>
        </button>
      </div>

      {/* Fade-to-next veil */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 bg-[#f6ecd6] transition-opacity duration-500",
          leaving ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
}
