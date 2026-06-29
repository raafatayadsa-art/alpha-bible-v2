import { supabase } from "@/integrations/supabase/client";
import {
  PUBLISHER_ASSETS_BUCKET,
  mapPublisherUploadError,
} from "@/features/publisher/publisher-storage-api";

export { mapPublisherUploadError as mapProfileAvatarUploadError };

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data");
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

export async function uploadProfileAvatarFromDataUrl(
  userId: string,
  dataUrl: string,
): Promise<string> {
  const { blob, contentType } = dataUrlToBlob(dataUrl);
  if (blob.size > 5 * 1024 * 1024) throw new Error("الحد الأقصى للصورة 5 ميجابايت");

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/profile/avatar/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(PUBLISHER_ASSETS_BUCKET).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PUBLISHER_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function persistProfileAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}
