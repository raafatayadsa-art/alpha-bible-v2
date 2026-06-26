import { useEffect, useState } from "react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import {
  fetchAudioPublisherFeed,
  fetchDiscoveryContent,
  repairAudioPublishersForFeed,
  type DiscoveryContentItem,
  type AudioPublisherCardModel,
} from "@/features/publisher/publisher-discovery-api";
import { AudioHeader } from "./components/AudioHeader";
import { HeroCard } from "./components/HeroCard";
import { CategoriesStrip } from "./components/CategoriesStrip";
import { LiveStreamSection } from "./components/LiveStreamSection";
import { ContinueListening } from "./components/ContinueListening";
import { FeaturedPlaylists } from "./components/FeaturedPlaylists";
import { MostListened } from "./components/MostListened";
import { AudioPublishersSection } from "./components/AudioPublishersSection";
import { LatestAlbumsSection } from "./components/LatestAlbumsSection";

export function AudioScreen() {
  const [publishers, setPublishers] = useState<AudioPublisherCardModel[]>([]);
  const [albums, setAlbums] = useState<DiscoveryContentItem[]>([]);
  const [publishersLoading, setPublishersLoading] = useState(true);

  useEffect(() => {
    setPublishersLoading(true);
    void (async () => {
      let pubs = await fetchAudioPublisherFeed(24);
      if (!pubs.length) {
        await repairAudioPublishersForFeed();
        pubs = await fetchAudioPublisherFeed(24);
      }
      const albums = await fetchDiscoveryContent(["album"], 8);
      setPublishers(pubs);
      setAlbums(albums);
      setPublishersLoading(false);
    })();
  }, []);

  return (
    <main dir="rtl" className="relative min-h-dvh bg-[#F4EEE6] pb-28">
      <CopticWatermark />
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)]">
        <AudioHeader />
        <HeroCard />
        <CategoriesStrip />
        <AudioPublishersSection publishers={publishers} loading={publishersLoading} />
        <LatestAlbumsSection albums={albums} />
        <LiveStreamSection />
        <ContinueListening />
        {albums.length ? null : <FeaturedPlaylists />}
        <MostListened />
      </div>

      <BottomDock />
    </main>
  );
}
