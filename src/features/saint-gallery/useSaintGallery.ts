import { useQuery } from "@tanstack/react-query";
import { getAuthUserId } from "@/features/auth";
import {
  fetchApprovedSaintGallery,
  fetchMySaintContributions,
  saintGalleryQueryKeys,
} from "./gallery-api";

export function useApprovedSaintGallery(saintId: string | undefined) {
  return useQuery({
    queryKey: saintGalleryQueryKeys.approved(saintId ?? ""),
    queryFn: () => fetchApprovedSaintGallery(saintId!),
    enabled: Boolean(saintId),
    staleTime: 60_000,
  });
}

export function useMySaintContributions() {
  return useQuery({
    queryKey: saintGalleryQueryKeys.mine("current"),
    queryFn: async () => {
      const uid = await getAuthUserId();
      if (!uid) return [];
      return fetchMySaintContributions(uid);
    },
    staleTime: 30_000,
  });
}
