import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { searchChurchDirectoryPage, fetchChurchDirectoryFacets } from "./api";
import type { ChurchDirectoryFilterState, ChurchDirectoryRow } from "./types";
import { CHURCH_DIR_PAGE_SIZE } from "./tokens";

export const EMPTY_DIRECTORY_FILTERS: ChurchDirectoryFilterState = {
  query: "",
  governorate: "",
  city: "",
  patronSaint: "",
  verifiedOnly: false,
  nearbyOnly: false,
};

export function useUserGeoLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDenied(false);
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 },
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coords, loading, denied, refresh };
}

export function useChurchDirectoryFacets() {
  return useQuery({
    queryKey: ["church-directory-facets"],
    queryFn: fetchChurchDirectoryFacets,
    staleTime: 1000 * 60 * 10,
  });
}

export function useChurchDirectorySearch(
  filters: ChurchDirectoryFilterState,
  userLat: number | null,
  userLng: number | null,
) {
  const query = useInfiniteQuery({
    queryKey: ["church-directory", filters, userLat, userLng],
    queryFn: ({ pageParam }) =>
      searchChurchDirectoryPage(filters, pageParam, userLat, userLng),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loaded = (lastPageParam + 1) * CHURCH_DIR_PAGE_SIZE;
      return loaded < lastPage.totalCount ? lastPageParam + 1 : undefined;
    },
    staleTime: 30_000,
  });

  const rows: ChurchDirectoryRow[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.rows) ?? [],
    [query.data],
  );

  const totalCount = query.data?.pages[0]?.totalCount ?? 0;

  return { ...query, rows, totalCount };
}
