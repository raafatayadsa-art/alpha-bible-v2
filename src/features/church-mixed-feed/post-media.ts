import type { ChurchPost } from "@/data/church-posts";

/** All image URLs for a post — primary `image` plus optional `images[]`. */
export function getPostImages(post: ChurchPost): string[] {
  const extra = (post.images ?? []).map((u) => u.trim()).filter(Boolean);
  if (extra.length > 0) return extra;
  if (post.image?.trim()) return [post.image.trim()];
  return [];
}

export function hasPostMedia(post: ChurchPost): boolean {
  return getPostImages(post).length > 0;
}
