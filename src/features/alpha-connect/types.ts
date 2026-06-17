export type AlphaConnectMessageKind = "voice" | "text" | "ptt";

export type AlphaConnectRetentionPolicy = "on_read" | "1h" | "6h" | "12h" | "24h" | "3d" | "7d";

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

export type AlphaConnectThreadScope = "personal" | "group";
