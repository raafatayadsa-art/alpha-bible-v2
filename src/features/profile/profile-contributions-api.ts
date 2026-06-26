import { useQuery } from "@tanstack/react-query";
import { getAuthUserId } from "@/features/auth";
import { fetchMySaintContributions } from "@/features/saint-gallery/gallery-api";
import type { SaintGalleryImage, SaintGalleryStatus } from "@/features/saint-gallery/types";
import { supabase } from "@/integrations/supabase/client";

export type PlatformContribution = {
  id: string;
  kind: string;
  title: string;
  status: string;
  createdAt: string;
  thumbnailUrl: string | null;
  rejectionReason: string | null;
};

export type ProfileContributionsBundle = {
  saintImages: SaintGalleryImage[];
  platformItems: PlatformContribution[];
  total: number;
};

const PLATFORM_STATUS_LABEL: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  needs_info: "يحتاج معلومات",
};

const PLATFORM_KIND_LABEL: Record<string, string> = {
  saint_image: "صورة قديس",
  church_setup: "طلب كنيسة",
  church_claim: "مطالبة كنيسة",
  critical_report: "بلاغ",
  publisher: "ناشر",
};

export function platformContributionStatusLabel(status: string): string {
  return PLATFORM_STATUS_LABEL[status] ?? status;
}

export function platformContributionKindLabel(kind: string): string {
  return PLATFORM_KIND_LABEL[kind] ?? "مساهمة";
}

async function fetchMyPlatformContributions(userId: string): Promise<PlatformContribution[]> {
  const { data, error } = await supabase
    .from("platform_approvals")
    .select("id, kind, type, title, status, submitted_at, payload, rejection_reason, source_table")
    .eq("submitted_by", userId)
    .neq("source_table", "saint_gallery_images")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("profile contributions platform_approvals", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const thumb =
      (typeof payload.thumbnailUrl === "string" ? payload.thumbnailUrl : null) ??
      (typeof payload.imageUrl === "string" ? payload.imageUrl : null);
    return {
      id: row.id as string,
      kind: (row.kind as string) ?? (row.type as string) ?? "other",
      title: (row.title as string) ?? "مساهمة",
      status: (row.status as string) ?? "pending",
      createdAt: (row.submitted_at as string) ?? new Date().toISOString(),
      thumbnailUrl: thumb,
      rejectionReason: (row.rejection_reason as string | null) ?? null,
    };
  });
}

export async function fetchMyProfileContributions(userId?: string | null): Promise<ProfileContributionsBundle> {
  const uid = userId ?? (await getAuthUserId());
  if (!uid) {
    return { saintImages: [], platformItems: [], total: 0 };
  }

  const [saintImages, platformItems] = await Promise.all([
    fetchMySaintContributions(uid),
    fetchMyPlatformContributions(uid),
  ]);

  return {
    saintImages,
    platformItems,
    total: saintImages.length + platformItems.length,
  };
}

export const profileContributionsQueryKey = ["profile", "contributions", "mine"] as const;

export function useMyProfileContributions() {
  return useQuery({
    queryKey: profileContributionsQueryKey,
    queryFn: async () => {
      const uid = await getAuthUserId();
      if (!uid) return { saintImages: [], platformItems: [], total: 0 } satisfies ProfileContributionsBundle;
      return fetchMyProfileContributions(uid);
    },
    staleTime: 30_000,
  });
}

export function saintStatusAccent(status: SaintGalleryStatus): string {
  if (status === "approved") return "#3d9a6a";
  if (status === "rejected") return "#c45c5c";
  return "#b8893a";
}
