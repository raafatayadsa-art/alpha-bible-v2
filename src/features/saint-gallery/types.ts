export type SaintGalleryStatus = "pending" | "under_review" | "approved" | "rejected" | "needs_changes";

export type SaintGalleryImage = {
  id: string;
  saintId: string;
  storagePath: string;
  publicUrl: string;
  thumbnailUrl?: string;
  title?: string;
  note?: string;
  status: SaintGalleryStatus;
  submittedBy?: string;
  contributorDisplayName?: string;
  showPublicName: boolean;
  membershipCode?: string;
  isFeatured: boolean;
  likeCount: number;
  viewCount: number;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubmitSaintImageInput = {
  saintId: string;
  file: File;
  title?: string;
  note?: string;
  contributorDisplayName?: string;
  showPublicName?: boolean;
  membershipCode?: string;
};

export const SAINT_GALLERY_STATUS_LABEL: Record<SaintGalleryStatus, string> = {
  pending: "🟡 قيد المراجعة",
  under_review: "🔵 قيد المراجعة",
  approved: "🟢 معتمدة",
  rejected: "🔴 مرفوضة",
  needs_changes: "🟠 مطلوب تعديل",
};

export function contributorLabel(image: SaintGalleryImage): string {
  if (!image.showPublicName) {
    const code = image.membershipCode ?? image.submittedBy?.slice(0, 6).toUpperCase() ?? "A1024";
    return `Contributor #${code}`;
  }
  return image.contributorDisplayName ?? "مساهم Alpha";
}
