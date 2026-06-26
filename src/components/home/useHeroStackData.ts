import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTodayFeast } from "@/features/feasts";
import { katamerosDayQueryOptions } from "@/features/katameros";
import { todaySynaxariumSaintQueryOptions } from "@/features/synaxarium";
import { fetchApprovedSaintGallery } from "@/features/saint-gallery";
import { buildHeroDailyCards } from "./hero-stack-data";
import type { HeroDailyCardData } from "./HeroDailyCard";

export function useHeroStackData(): {
  cards: Record<1 | 2 | 3, HeroDailyCardData>;
  isLoading: boolean;
} {
  const katameros = useQuery(katamerosDayQueryOptions());
  const saint = useQuery(todaySynaxariumSaintQueryOptions());
  const gallery = useQuery({
    queryKey: ["saint-gallery", "approved", saint.data?.id ?? ""],
    queryFn: () => fetchApprovedSaintGallery(saint.data!.id),
    enabled: Boolean(saint.data?.id),
    staleTime: 60_000,
  });

  const cards = useMemo(() => {
    const base = buildHeroDailyCards({
      katamerosDay: katameros.data,
      todaySaint: saint.data,
      todayFeast: getTodayFeast(),
    });
    const featured =
      gallery.data?.find((img) => img.isFeatured)?.publicUrl ?? gallery.data?.[0]?.publicUrl;
    if (featured) {
      base[2] = { ...base[2], image: featured };
    }
    return base;
  }, [katameros.data, saint.data, gallery.data]);

  return {
    cards,
    isLoading: katameros.isPending || saint.isPending,
  };
}
