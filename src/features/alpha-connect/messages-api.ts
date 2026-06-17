import { supabase } from "@/integrations/supabase/client";
import type { AlphaConnectMessage, AlphaConnectRetentionPolicy, AlphaConnectThreadScope } from "./types";

const MESSAGE_COLUMNS =
  "id, conversation_id, sender_id, kind, body, audio_path, duration_ms, retention_policy, expires_at, read_at, created_at";

export async function purgeExpiredAlphaConnectMessages(): Promise<void> {
  await supabase.rpc("alpha_connect_purge_expired_messages");
}

export async function openAlphaConnectConversation(
  scope: AlphaConnectThreadScope,
  opts?: { groupCode?: string; title?: string },
): Promise<string> {
  if (scope === "personal") {
    const { data, error } = await supabase.rpc("alpha_connect_open_personal");
    if (error) throw error;
    return data as string;
  }

  const groupCode = opts?.groupCode?.trim();
  if (!groupCode) throw new Error("groupCode required");

  const { data, error } = await supabase.rpc("alpha_connect_open_group", {
    p_group_code: groupCode,
    p_title: opts?.title ?? groupCode,
  });
  if (error) throw error;
  return data as string;
}

export async function listAlphaConnectMessages(conversationId: string, limit = 50): Promise<AlphaConnectMessage[]> {
  const { data, error } = await supabase
    .from("alpha_connect_messages")
    .select(MESSAGE_COLUMNS)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AlphaConnectMessage[];
}

export async function sendAlphaConnectTextMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  retentionPolicy: AlphaConnectRetentionPolicy;
}): Promise<AlphaConnectMessage> {
  const { data, error } = await supabase
    .from("alpha_connect_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      kind: "text",
      body: input.body.trim(),
      retention_policy: input.retentionPolicy,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) throw error;
  return data as AlphaConnectMessage;
}

export async function sendAlphaConnectVoiceMessage(input: {
  conversationId: string;
  senderId: string;
  audioPath: string;
  durationMs: number;
  retentionPolicy: AlphaConnectRetentionPolicy;
  kind?: "voice" | "ptt";
}): Promise<AlphaConnectMessage> {
  const { data, error } = await supabase
    .from("alpha_connect_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      kind: input.kind ?? "ptt",
      audio_path: input.audioPath,
      duration_ms: input.durationMs,
      retention_policy: input.retentionPolicy,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) throw error;
  return data as AlphaConnectMessage;
}

export async function markAlphaConnectMessageRead(messageId: string): Promise<void> {
  const { error } = await supabase
    .from("alpha_connect_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .is("read_at", null);

  if (!error) return;
  // on_read policy deletes the row immediately via DB trigger
  if (/0 rows|PGRST116|406/i.test(error.message)) return;
  throw error;
}

export function subscribeAlphaConnectMessages(
  conversationId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`alpha-connect:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "alpha_connect_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
