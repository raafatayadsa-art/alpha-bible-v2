import { featureCardsData } from "../data/featureCards";
import { BibleFeatureCard } from "./FeatureCard";

export function FeatureCardsGrid({ openSearchOverlay }: { openSearchOverlay?: () => void }) {
  return (
    <section className="relative isolate z-30 mt-1 grid grid-cols-4 gap-2 pointer-events-auto">
      {featureCardsData.map((card) => (
        <BibleFeatureCard key={card.id} card={card} openSearchOverlay={openSearchOverlay} />
      ))}
    </section>
  );
}
