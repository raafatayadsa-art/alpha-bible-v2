import type { AlphaConnectMessage } from "./types";
import { formatDeletionCountdown, formatMessageRelativeTime, timerLabelToRetention } from "./retention";

export type ChatMessageView = {
  id: string;
  text: string;
  time: string;
  incoming: boolean;
  status?: "sent" | "delivered" | "read";
  isSystem?: boolean;
  edited?: boolean;
  isVoice?: boolean;
  deleteCountdown?: string | null;
  orderedAt?: number;
};

export { timerLabelToRetention };

export function mapAlphaConnectMessageToChatMessage(
  message: AlphaConnectMessage,
  currentUserId: string,
  nowMs = Date.now(),
  timerAnchorMs = 0,
): ChatMessageView {
  const incoming = message.sender_id !== currentUserId;
  const isVoice = message.kind === "voice" || message.kind === "ptt";

  let status: ChatMessageView["status"] = "sent";
  if (!incoming) {
    status = message.read_at ? "read" : "delivered";
  } else if (message.read_at) {
    status = "read";
  }

  const text = isVoice
    ? message.kind === "ptt"
      ? "🎙️ رسالة PTT"
      : "🎤 رسالة صوتية"
    : (message.body ?? "");

  return {
    id: message.id,
    text,
    time: formatMessageRelativeTime(message.created_at),
    incoming,
    status,
    isVoice,
    deleteCountdown: formatDeletionCountdown(message, nowMs, incoming, timerAnchorMs),
    orderedAt: new Date(message.created_at).getTime(),
  };
}

export function previewTextFromMessage(message: AlphaConnectMessage | null): string {
  if (!message) return "اضغط لبدء المحادثة";
  if (message.kind === "ptt") return "🎙️ رسالة PTT";
  if (message.kind === "voice") return "🎤 رسالة صوتية";
  return message.body?.trim() || "رسالة";
}

export function parsePeerKeyFromGroupCode(groupCode: string | null, userId: string): string | null {
  if (!groupCode) return null;
  if (groupCode.startsWith("personal:")) return null;
  if (groupCode.startsWith("direct:")) {
    const parts = groupCode.split(":");
    if (parts.length >= 3 && parts[1] === userId) {
      return parts.slice(2).join(":");
    }
    if (parts.length >= 2) return parts[1];
  }
  return groupCode;
}
