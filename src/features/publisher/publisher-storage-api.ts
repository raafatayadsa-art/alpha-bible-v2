import { supabase } from "@/integrations/supabase/client";

export const PUBLISHER_ASSETS_BUCKET = "publisher-assets";

export type PublisherAssetKind = "image" | "audio" | "video" | "pdf";

const MAX_BYTES: Record<PublisherAssetKind, number> = {
  image: 5 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
};

const ACCEPT: Record<PublisherAssetKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  audio: "audio/mpeg,audio/mp3,audio/mp4,audio/webm,audio/ogg,audio/aac,.mp3,.m4a",
  video: "video/mp4,video/webm,video/quicktime,.mp4,.mov",
  pdf: "application/pdf,.pdf",
};

export function publisherAssetAccept(kind: PublisherAssetKind): string {
  return ACCEPT[kind];
}

export function publisherAssetMaxBytes(kind: PublisherAssetKind): number {
  return MAX_BYTES[kind];
}

function extensionFromFile(file: File, kind: PublisherAssetKind): string {
  const lower = file.name.toLowerCase();
  if (kind === "pdf") return "pdf";
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".gif")) return "gif";
  if (lower.endsWith(".mp3")) return "mp3";
  if (lower.endsWith(".m4a")) return "m4a";
  if (lower.endsWith(".webm")) return "webm";
  if (lower.endsWith(".ogg")) return "ogg";
  if (lower.endsWith(".mov")) return "mov";
  if (lower.endsWith(".pdf")) return "pdf";
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  if (file.type.includes("gif")) return "gif";
  if (file.type.includes("pdf")) return "pdf";
  if (file.type.includes("webm")) return "webm";
  if (file.type.includes("ogg")) return "ogg";
  if (file.type.includes("quicktime")) return "mov";
  if (kind === "video") return "mp4";
  if (kind === "audio") return "mp3";
  return "jpg";
}

function normalizeUploadContentType(file: File, kind: PublisherAssetKind): string {
  if (file.type && file.type !== "application/octet-stream") {
    if (kind === "audio" && file.type.startsWith("audio/")) return file.type;
    if (kind === "video" && file.type.startsWith("video/")) return file.type;
    if (kind === "image" && file.type.startsWith("image/")) return file.type;
    if (kind === "pdf" && file.type === "application/pdf") return file.type;
  }
  return contentTypeFromFile(file, kind);
}

function contentTypeFromFile(file: File, kind: PublisherAssetKind): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = extensionFromFile(file, kind);
  if (ext === "pdf") return "application/pdf";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "m4a") return "audio/mp4";
  if (ext === "webm" && kind === "video") return "video/webm";
  if (ext === "webm") return "audio/webm";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "mov") return "video/quicktime";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (kind === "video") return "video/mp4";
  if (kind === "audio") return "audio/mpeg";
  return "image/jpeg";
}

export function buildPublisherAssetPath(
  userId: string,
  scopeId: string,
  assetId: string,
  ext: string,
  folder: "profile" | "content" | "apply",
): string {
  return `${userId}/${scopeId}/${folder}/${assetId}.${ext}`;
}

export function mapPublisherUploadError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Bucket not found")) return "خزنة الرفع غير مفعّلة بعد على السيرفر.";
  if (msg.includes("payload too large") || msg.includes("exceeded")) return "حجم الملف أكبر من المسموح.";
  if (msg.includes("mime") || msg.includes("Invalid")) return "نوع الملف غير مدعوم.";
  if (msg.includes("not_authenticated") || msg.includes("JWT")) return "سجّل دخولك أولاً.";
  return "تعذّر رفع الملف. حاول مرة أخرى.";
}

export async function uploadPublisherAsset(input: {
  userId: string;
  scopeId: string;
  file: File;
  assetKind: PublisherAssetKind;
  folder?: "profile" | "content" | "apply";
}): Promise<{ path: string; publicUrl: string }> {
  const folder = input.folder ?? "content";
  const max = MAX_BYTES[input.assetKind];
  if (input.file.size > max) {
    throw new Error(
      input.assetKind === "image"
        ? "الحد الأقصى للصورة 5 ميجابايت"
        : input.assetKind === "audio"
          ? "الحد الأقصى للصوت 50 ميجابايت"
          : input.assetKind === "video"
            ? "الحد الأقصى للفيديو 100 ميجابايت"
            : "الحد الأقصى لملف PDF 25 ميجابايت",
    );
  }

  const assetId = crypto.randomUUID();
  const ext = extensionFromFile(input.file, input.assetKind);
  const contentType = normalizeUploadContentType(input.file, input.assetKind);
  const path = buildPublisherAssetPath(input.userId, input.scopeId, assetId, ext, folder);

  const { error } = await supabase.storage.from(PUBLISHER_ASSETS_BUCKET).upload(path, input.file, {
    contentType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(PUBLISHER_ASSETS_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
