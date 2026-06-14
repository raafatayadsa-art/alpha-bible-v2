import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AlphaOnboarding } from "@/components/onboarding/AlphaOnboarding";

function IntroPage() {
  // Lock body scroll while onboarding is mounted — prevents any bleed-through
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  return <AlphaOnboarding />;
}

export const Route = createFileRoute("/intro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Alpha — البيت القبطي الرقمي" },
      { name: "description", content: "مرحباً بك في Alpha — ابدأ رحلتك الروحية." },
    ],
  }),
  component: IntroPage,
});
