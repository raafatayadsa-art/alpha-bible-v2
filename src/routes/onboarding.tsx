import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
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

const CARD_COUNT = 9;

function OnboardingScreen() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const go = () => {
    if (leaving) return;
    try {
      localStorage.setItem("alpha.interests", JSON.stringify([...selected]));
    } catch {}
    setLeaving(true);
    setTimeout(() => navigate({ to: "/books" }), 350);
  };

  return (
    <div dir="rtl" className="relative h-screen w-screen overflow-hidden bg-[#f4ead8]">
      <img
        src={interestsImage}
        alt="اختر اهتماماتك"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        draggable={false}
      />

      {/* Selectable interest cards overlay (invisible hotspots + checkmark) */}
      <div
        className="absolute grid grid-cols-3 grid-rows-3"
        style={{
          top: "17%",
          bottom: "20%",
          left: "5%",
          right: "5%",
          columnGap: "3.5%",
          rowGap: "2.5%",
        }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => {
          const isSelected = selected.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isSelected}
              aria-label={`اهتمام ${i + 1}`}
              className="relative rounded-2xl bg-transparent transition-transform duration-200 active:scale-[0.97] focus:outline-none"
            >
              {isSelected && (
                <>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-[#a8782a] ring-offset-0"
                    style={{ boxShadow: "0 0 0 2px rgba(168,120,42,0.35) inset" }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a8782a] shadow-md ring-2 ring-white"
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Invisible tap target over the gold CTA button at the bottom of the artwork */}
      <button
        type="button"
        onClick={go}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        aria-label="ابدأ رحلتك"
        className={[
          "absolute left-1/2 -translate-x-1/2 rounded-full bg-transparent",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pressed ? "scale-[0.97]" : "scale-100",
        ].join(" ")}
        style={{ bottom: "0", width: "90%", height: "9%" }}
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
