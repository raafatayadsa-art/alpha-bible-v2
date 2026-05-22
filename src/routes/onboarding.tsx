import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Leaf,
  Headphones,
  HandHeart,
  Radio as RadioIcon,
  Church,
  Baby,
  MapPin,
  Check,
  Tv,
} from "lucide-react";
import splashImage from "@/assets/splash.png";


export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "اختر اهتماماتك — ألفا" },
      {
        name: "description",
        content: "اختر اهتماماتك لنقدم لك تجربة روحية مخصصة كل يوم.",
      },
    ],
  }),
  component: OnboardingScreen,
});

type Interest = {
  id: string;
  title: string;
  description: string;
  Icon: typeof BookOpen;
  tint: string; // gradient classes for the icon disc
  ring: string; // shadow color for the disc
  titleColor: string;
};

const INTERESTS: Interest[] = [
  {
    id: "bible",
    title: "الكتاب المقدس",
    description: "قراءة وتأمل في كلمة الله كل يوم",
    Icon: BookOpen,
    tint: "from-[#6b4a8a] to-[#3f2a5a]",
    ring: "shadow-[0_10px_24px_-10px_rgba(90,55,140,0.55)]",
    titleColor: "text-[#3f2a5a]",
  },
  {
    id: "devotions",
    title: "تأملات يومية",
    description: "كلام روحي ملهم لبداية يومك",
    Icon: Leaf,
    tint: "from-[#5d7a3a] to-[#36501f]",
    ring: "shadow-[0_10px_24px_-10px_rgba(70,100,40,0.55)]",
    titleColor: "text-[#36501f]",
  },
  {
    id: "audio",
    title: "صوتيات وترانيم",
    description: "استمع إلى صوتيات وترانيم ملهمة",
    Icon: Headphones,
    tint: "from-[#b04a32] to-[#7a2e1c]",
    ring: "shadow-[0_10px_24px_-10px_rgba(150,55,30,0.55)]",
    titleColor: "text-[#7a2e1c]",
  },
  {
    id: "prayer",
    title: "دعم وصلاة",
    description: "اطلب وصلوات ودعم في وقت احتياجك",
    Icon: HandHeart,
    tint: "from-[#d6a849] to-[#9a7626]",
    ring: "shadow-[0_10px_24px_-10px_rgba(180,140,50,0.6)]",
    titleColor: "text-[#7a5a18]",
  },
  {
    id: "live",
    title: "البث المباشر",
    description: "شاهد البث المباشر للخدمات والبرامج",
    Icon: Tv,
    tint: "from-[#6b4a8a] to-[#3f2a5a]",
    ring: "shadow-[0_10px_24px_-10px_rgba(90,55,140,0.55)]",
    titleColor: "text-[#3f2a5a]",
  },
  {
    id: "radio",
    title: "راديو الكنيسة",
    description: "استمع لراديو الكنيسة على مدار اليوم",
    Icon: RadioIcon,
    tint: "from-[#3a5d8a] to-[#1f3a5c]",
    ring: "shadow-[0_10px_24px_-10px_rgba(40,80,140,0.55)]",
    titleColor: "text-[#1f3a5c]",
  },
  {
    id: "churches",
    title: "الكنائس",
    description: "ابحث عن الكنائس وتعرف على خدماتها",
    Icon: Church,
    tint: "from-[#3a5d8a] to-[#1f3a5c]",
    ring: "shadow-[0_10px_24px_-10px_rgba(40,80,140,0.55)]",
    titleColor: "text-[#1f3a5c]",
  },
  {
    id: "kids",
    title: "أطفالنا",
    description: "محتوى آمن وممتع للأطفال",
    Icon: Baby,
    tint: "from-[#c44a32] to-[#7a2c1c]",
    ring: "shadow-[0_10px_24px_-10px_rgba(180,70,40,0.55)]",
    titleColor: "text-[#7a2c1c]",
  },
  {
    id: "map",
    title: "الخريطة",
    description: "اكتشف الكنائس القريبة واتجاهات الوصول",
    Icon: MapPin,
    tint: "from-[#6b4a8a] to-[#3f2a5a]",
    ring: "shadow-[0_10px_24px_-10px_rgba(90,55,140,0.55)]",
    titleColor: "text-[#3f2a5a]",
  },
];

function OnboardingScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pressed, setPressed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canContinue = selected.size > 0 && !leaving;

  const handleContinue = () => {
    if (!canContinue) return;
    try {
      localStorage.setItem(
        "alpha.interests",
        JSON.stringify(Array.from(selected)),
      );
    } catch {
      // ignore storage errors
    }
    setLeaving(true);
    setTimeout(() => navigate({ to: "/books" }), 350);
  };

  const handleSkip = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate({ to: "/books" }), 250);
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#f7ecd2] via-[#f4ead8] to-[#ead7b3]"
    >
      {/* Soft ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(255, 225, 165, 0.55), transparent 70%)",
        }}
      />

      <main className="relative mx-auto flex max-w-md flex-col px-5 pt-10 pb-44">
        {/* Logo / brand */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#e7c97a] to-[#b8862e] shadow-[0_10px_24px_-8px_rgba(180,130,40,0.5)]">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3l4 4v9a4 4 0 1 1-8 0V7l4-4z" />
              <path d="M12 9v6" />
              <path d="M9.5 11.5h5" />
            </svg>
          </div>
          <p className="mt-2 text-sm font-semibold tracking-[0.35em] text-[#8a6620]">
            ALPHA
          </p>

          <h1 className="mt-5 text-[28px] font-bold leading-tight text-[#2a3a6e]">
            اختر اهتماماتك
          </h1>
          <p className="mt-3 max-w-[280px] text-[15px] leading-7 text-[#6b5836]">
            لنقدم لك تجربة مخصصة تلهم روحك كل يوم
          </p>
        </div>

        {/* Interests grid */}
        <ul className="mt-8 grid grid-cols-3 gap-3">
          {INTERESTS.map((it) => {
            const isSelected = selected.has(it.id);
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => toggle(it.id)}
                  aria-pressed={isSelected}
                  className={[
                    "group relative flex w-full flex-col items-center rounded-2xl px-2 py-4",
                    "border transition-all duration-300 ease-out",
                    "backdrop-blur-md",
                    "active:scale-[0.97]",
                    isSelected
                      ? "border-[#d6a849]/80 bg-[rgba(255,247,225,0.9)] shadow-[0_10px_28px_-12px_rgba(214,168,73,0.65),0_0_0_3px_rgba(214,168,73,0.18)]"
                      : "border-white/60 bg-[rgba(255,250,235,0.65)] shadow-[0_6px_18px_-12px_rgba(120,90,40,0.35)]",
                  ].join(" ")}
                >
                  {/* Selection indicator */}
                  <span
                    aria-hidden
                    className={[
                      "absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                      isSelected
                        ? "border-[#d6a849] bg-gradient-to-b from-[#e7c97a] to-[#b8862e] text-white shadow-[0_2px_6px_rgba(180,130,40,0.5)]"
                        : "border-[#d8c89a]/70 bg-white/70",
                    ].join(" ")}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>

                  {/* Icon disc */}
                  <span
                    className={[
                      "flex h-14 w-14 items-center justify-center rounded-full",
                      "bg-gradient-to-b",
                      it.tint,
                      it.ring,
                      "ring-1 ring-white/40",
                    ].join(" ")}
                  >
                    <it.Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                  </span>

                  <span
                    className={[
                      "mt-3 text-[13px] font-bold leading-tight",
                      it.titleColor,
                    ].join(" ")}
                  >
                    {it.title}
                  </span>
                  <span className="mt-1 text-center text-[11px] leading-snug text-[#7a6a4a]">
                    {it.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      {/* Fixed bottom CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20">
        <div
          aria-hidden
          className="h-16 w-full"
          style={{
            background:
              "linear-gradient(to top, rgba(244,234,216,0.95), rgba(244,234,216,0))",
          }}
        />
        <div className="pointer-events-auto bg-[#f4ead8]/95 px-5 pb-6 pt-2 backdrop-blur-md">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              onPointerDown={() => canContinue && setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onPointerCancel={() => setPressed(false)}
              className={[
                "relative flex h-14 w-full items-center justify-center rounded-full",
                "text-[17px] font-bold text-white",
                "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "bg-gradient-to-b from-[#e7c97a] via-[#d4a849] to-[#a8782a]",
                "shadow-[0_14px_28px_-10px_rgba(180,130,40,0.55),0_0_0_1px_rgba(255,240,200,0.4)_inset]",
                canContinue ? "opacity-100" : "opacity-50 grayscale-[0.2]",
                pressed && canContinue ? "scale-[0.97]" : "scale-100",
              ].join(" ")}
              aria-label="ابدأ رحلتك الروحية"
            >
              <span className="absolute right-5 flex h-7 w-7 items-center justify-center">
                {/* small olive-branch glyph */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-white/95"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 20c4-1 8-5 9-9" />
                  <path d="M9 13c-1-2-1-4 0-6" />
                  <path d="M13 11c2-1 4-1 6 0" />
                  <path d="M11 16c-2 0-4 1-5 2" />
                </svg>
              </span>
              <span>ابدأ رحلتك الروحية</span>
              <span className="absolute left-5">
                <ChevronLeft className="h-5 w-5 text-white/95" />
              </span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="mt-3 inline-flex items-center gap-1 text-[14px] text-[#7a6a4a] hover:text-[#5a4a2a]"
            >
              <ChevronLeft className="h-4 w-4" />
              تخطي الآن
            </button>
          </div>
        </div>
      </div>

      {/* Leave veil */}
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
