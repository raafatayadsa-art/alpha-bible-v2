import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { AudioHeader } from "./components/AudioHeader";
import { HeroCard } from "./components/HeroCard";
import { CategoriesStrip } from "./components/CategoriesStrip";
import { LiveStreamSection } from "./components/LiveStreamSection";
import { ContinueListening } from "./components/ContinueListening";
import { FeaturedPlaylists } from "./components/FeaturedPlaylists";
import { MostListened } from "./components/MostListened";

export function AudioScreen() {
  return (
    <main dir="rtl" className="relative min-h-dvh bg-[#F4EEE6] pb-28">
      <CopticWatermark />
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)]">
        <AudioHeader />
        <HeroCard />
        <CategoriesStrip />
        <LiveStreamSection />
        <ContinueListening />
        <FeaturedPlaylists />
        <MostListened />
      </div>

      <BottomDock />
    </main>
  );
}
