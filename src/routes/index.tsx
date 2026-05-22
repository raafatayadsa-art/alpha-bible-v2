import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import splashImage from "@/assets/splash.png";

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
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate({ to: "/books" }), 550);
  };

  return (
    <div
      dir="rtl"
      className="relative h-screen w-screen overflow-hidden bg-[#f4ead8]"
    >
      {/* Background artwork — exact uploaded image, untouched */}
      <img
        src={splashImage}
        alt="Alpha — The Coptic Orthodox Digital Home"
        className={[
          "absolute inset-0 h-full w-full object-cover object-center",
          "transition-opacity duration-[1600ms] ease-out",
          "splash-parallax",
          leaving ? "opacity-0" : "opacity-100 animate-splash-fade",
        ].join(" ")}
        draggable={false}
      />

      {/* Soft warm glow overlay (does not alter artwork colors) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 splash-glow"
      />

      {/* Subtle shimmer over button area only */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "10.5%", width: "78%", height: "9%" }}
      >
        <div className="splash-shimmer h-full w-full rounded-full" />
      </div>

      {/* Invisible tap target over the CTA button */}
      <button
        type="button"
        onClick={enter}
        aria-label="مرحبًا بك في ألفا"
        className="absolute left-1/2 -translate-x-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
        style={{ bottom: "9%", width: "82%", height: "11%" }}
      />

      {/* Fade-to-home veil */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 bg-[#f4ead8] transition-opacity duration-500",
          leaving ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
}
