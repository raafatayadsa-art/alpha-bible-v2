import { supabase } from "@/integrations/supabase/client";
import { PUBLISHER_ASSETS_BUCKET } from "@/features/publisher/publisher-storage-api";

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data");
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

export async function uploadProfileCoverFromDataUrl(
  userId: string,
  dataUrl: string,
): Promise<string> {
  const { blob, contentType } = dataUrlToBlob(dataUrl);
  if (blob.size > 8 * 1024 * 1024) throw new Error("الحد الأقصى للغلاف 8 ميجابايت");

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/profile/cover/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(PUBLISHER_ASSETS_BUCKET).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PUBLISHER_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function persistProfileCoverUrl(userId: string, coverUrl: string): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function fetchProfileCoverUrl(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("cover_url")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data?.cover_url) return null;
  const url = String(data.cover_url).trim();
  return url || null;
}
