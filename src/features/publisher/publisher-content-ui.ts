import type { PublisherContentItem } from "./types";

/** Hymns eligible for album / playlist track lists in the workspace (not only already-approved). */
export function publisherSelectableAlbumHymns(hymns: PublisherContentItem[]): PublisherContentItem[] {
  return hymns.filter(
    (h) =>
      h.contentKind === "hymn" &&
      h.status !== "rejected" &&
      h.status !== "needs_changes",
  );
}

export function formatPublisherContentDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function publisherContentDateLabel(item: PublisherContentItem): string {
  const stamp = formatPublisherContentDate(item.updatedAt || item.createdAt);
  if (item.status === "approved") {
    return item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt
      ? `آخر تعديل · ${stamp}`
      : `نُشر · ${stamp}`;
  }
  if (item.status === "pending_review") return `قيد المراجعة · ${stamp}`;
  if (item.status === "draft") return `مسودة · ${stamp}`;
  if (item.status === "rejected" || item.status === "needs_changes") return `مرفوض · ${stamp}`;
  return `أُنشئ · ${formatPublisherContentDate(item.createdAt)}`;
}
