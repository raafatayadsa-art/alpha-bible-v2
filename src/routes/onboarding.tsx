import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import interestsImage from "@/assets/interests.png";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "اختر اهتماماتك — ألفا" },
      { name: "description", content: "اختر اهتماماتك لنقدم لك تجربة روحية مخصصة." },
    ],
  }),
  component: OnboardingScreen,
});

function OnboardingScreen() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [pressed, setPressed] = useState(false);

  const go = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate({ to: "/books" }), 350);
  };

  return (
    <div dir="rtl" className="relative h-screen w-screen overflow-hidden bg-[#f4ead8]">
      <img
        src={interestsImage}
        alt="اختر اهتماماتك"
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />

      {/* Invisible tap target over the gold "تابع" button in the artwork */}
      <button
        type="button"
        onClick={go}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        aria-label="تابع"
        className={[
          "absolute left-1/2 -translate-x-1/2 rounded-full bg-transparent",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pressed ? "scale-[0.97]" : "scale-100",
        ].join(" ")}
        style={{ bottom: "13%", width: "82%", height: "7%" }}
      />

      <div
        aria-hidden
        className={[
          "pointer-events-none fixed inset-0 z-30 bg-[#f4ead8] transition-opacity duration-300",
          leaving ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
}
