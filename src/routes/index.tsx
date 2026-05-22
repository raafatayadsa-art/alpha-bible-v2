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

  const [pressed, setPressed] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate({ to: "/onboarding" }), 550);
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

      {/* Glass + glow enhancement layered over the existing button area */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full",
          "splash-btn-glass",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pressed ? "splash-btn-pressed" : "",
        ].join(" ")}
        style={{ bottom: "9%", width: "82%", height: "11%" }}
      />

      {/* Interactive tap target over the CTA button */}
      <button
        type="button"
        onClick={enter}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        aria-label="ابدأ رحلتك الروحية"
        className={[
          "absolute left-1/2 -translate-x-1/2 rounded-full",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pressed ? "scale-[0.96]" : "scale-100",
        ].join(" ")}
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
