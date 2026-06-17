import { supabase } from "@/integrations/supabase/client";

export const ALPHA_CONNECT_AUDIO_BUCKET = "alpha-connect-audio";

export function buildAlphaConnectAudioPath(
  userId: string,
  conversationId: string,
  messageId: string,
  ext: string,
): string {
  return `${userId}/${conversationId}/${messageId}.${ext}`;
}

function extensionFromMime(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mpeg")) return "mp3";
  return "webm";
}

export async function uploadAlphaConnectAudio(input: {
  userId: string;
  conversationId: string;
  messageId: string;
  blob: Blob;
}): Promise<string> {
  const ext = extensionFromMime(input.blob.type || "audio/webm");
  const path = buildAlphaConnectAudioPath(input.userId, input.conversationId, input.messageId, ext);

  const { error } = await supabase.storage.from(ALPHA_CONNECT_AUDIO_BUCKET).upload(path, input.blob, {
    contentType: input.blob.type || "audio/webm",
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function downloadAlphaConnectAudio(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from(ALPHA_CONNECT_AUDIO_BUCKET).download(path);
  if (error || !data) return null;
  return data;
}
