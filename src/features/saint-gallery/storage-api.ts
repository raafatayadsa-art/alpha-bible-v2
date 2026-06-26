export const SAINT_GALLERY_BUCKET = "saint-gallery";

export function buildSaintGalleryPath(saintId: string, userKey: string, imageId: string, ext: string) {
  return `${saintId}/${userKey}/${imageId}.${ext}`;
}

function extensionFromMime(mime: string, fileName?: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  const lower = (fileName ?? "").toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".gif")) return "gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  return "jpg";
}

function contentTypeFromFile(file: File): string {
  if (file.type?.startsWith("image/")) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function uploadSaintGalleryImage(input: {
  saintId: string;
  userKey: string;
  imageId: string;
  file: File;
}): Promise<{ path: string; publicUrl: string }> {
  const { supabase } = await import("@/integrations/supabase/client");
  const contentType = contentTypeFromFile(input.file);
  const ext = extensionFromMime(contentType, input.file.name);
  const path = buildSaintGalleryPath(input.saintId, input.userKey, input.imageId, ext);

  const { error } = await supabase.storage.from(SAINT_GALLERY_BUCKET).upload(path, input.file, {
    contentType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(SAINT_GALLERY_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
