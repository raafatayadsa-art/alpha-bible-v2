import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTodayFeast } from "@/features/feasts";
import { katamerosDayQueryOptions } from "@/features/katameros";
import { todaySynaxariumSaintQueryOptions } from "@/features/synaxarium";
import { buildHeroDailyCards } from "./hero-stack-data";
import type { HeroDailyCardData } from "./HeroDailyCard";

export function useHeroStackData(): {
  cards: Record<1 | 2 | 3, HeroDailyCardData>;
  isLoading: boolean;
} {
  const katameros = useQuery(katamerosDayQueryOptions());
  const saint = useQuery(todaySynaxariumSaintQueryOptions());

  const cards = useMemo(
    () =>
      buildHeroDailyCards({
        katamerosDay: katameros.data,
        todaySaint: saint.data,
        todayFeast: getTodayFeast(),
      }),
    [katameros.data, saint.data],
  );

  return {
    cards,
    isLoading: katameros.isPending || saint.isPending,
  };
}
