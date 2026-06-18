export type AlphaConnectMessageKind = "voice" | "text" | "ptt";

export type AlphaConnectRetentionPolicy =
  | "on_read"
  | "5s"
  | "10s"
  | "30s"
  | "1m"
  | "5m"
  | "30m"
  | "1d"
  | "1h"
  | "6h"
  | "12h"
  | "24h"
  | "3d"
  | "7d";

export type AlphaConnectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: AlphaConnectMessageKind;
  body: string | null;
  audio_path: string | null;
  duration_ms: number | null;
  retention_policy: AlphaConnectRetentionPolicy;
  expires_at: string | null;
  read_at: string | null;
  created_at: string;
};

export type AlphaConnectThreadScope = "personal" | "group" | "direct";

export type AlphaConnectConversationSummary = {
  id: string;
  kind: "direct" | "group";
  title: string | null;
  group_code: string | null;
  peer_key: string | null;
  updated_at: string;
  last_message_body: string | null;
  last_message_kind: AlphaConnectMessageKind | null;
  last_message_at: string | null;
  unread_count: number;
};
