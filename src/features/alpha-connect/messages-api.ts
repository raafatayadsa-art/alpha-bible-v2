import { supabase } from "@/integrations/supabase/client";
import { coerceMessageRetentionPolicy, filterActiveAlphaConnectMessages, normalizeInsertedMessage } from "./retention";
import type {
  AlphaConnectConversationSummary,
  AlphaConnectMessage,
  AlphaConnectRetentionPolicy,
  AlphaConnectThreadScope,
} from "./types";

const MESSAGE_COLUMNS =
  "id, conversation_id, sender_id, kind, body, audio_path, duration_ms, retention_policy, expires_at, read_at, created_at";

export function formatAlphaConnectError(step: string, error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [record.message, record.details, record.hint, record.code].filter(Boolean);
    if (parts.length) return `[${step}] ${parts.join(" — ")}`;
  }
  return `[${step}] ${String(error)}`;
}

function isRetentionPolicyCheckViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return (
    record.code === "23514" ||
    /alpha_connect_messages_retention_policy_check|retention_policy_check/i.test(record.message ?? "")
  );
}

/** Try modern policy first, then fallbacks for unmigrated DB constraints. */
function retentionPolicyInsertAttempts(primary: AlphaConnectRetentionPolicy): string[] {
  const seen = new Set<string>();
  const attempts: string[] = [];
  const push = (value: string) => {
    if (seen.has(value)) return;
    seen.add(value);
    attempts.push(value);
  };

  const fallbackOrder: AlphaConnectRetentionPolicy[] = [
    primary,
    "5s",
    "10s",
    "30s",
    "1m",
    "5m",
    "30m",
    "1d",
    "1h",
    "24h",
    "7d",
  ];
  for (const policy of fallbackOrder) push(policy);
  if (primary === "on_read") push("1m");

  const legacyMap: Record<AlphaConnectRetentionPolicy, string> = {
    on_read: "read",
    "5s": "30s",
    "10s": "30s",
    "30s": "1m",
    "1m": "5m",
    "5m": "30m",
    "30m": "1h",
    "1d": "day",
    "1h": "hour",
    "6h": "hour",
    "12h": "hour",
    "24h": "day",
    "3d": "week",
    "7d": "week",
  };
  for (const policy of fallbackOrder) push(legacyMap[policy]);
  push("24h");
  push("day");
  push("week");
  return attempts;
}

async function insertAlphaConnectMessageRow(
  row: Record<string, unknown>,
  retentionPolicy: AlphaConnectRetentionPolicy,
): Promise<AlphaConnectMessage> {
  const attempts = retentionPolicyInsertAttempts(retentionPolicy);
  let lastError: unknown = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attemptPolicy = attempts[index];
    const { data, error } = await supabase
      .from("alpha_connect_messages")
      .insert({ ...row, retention_policy: attemptPolicy })
      .select(MESSAGE_COLUMNS)
      .single();

    if (!error && data) {
      const intended = coerceMessageRetentionPolicy(retentionPolicy);
      const normalized = normalizeInsertedMessage(data as AlphaConnectMessage, intended);
      if (index > 0) {
        console.warn(
          `[messages.insert] retention_policy "${retentionPolicy}" rejected; used "${attemptPolicy}" — client expiry from intended policy.`,
        );
      }
      return normalized;
    }

    lastError = error;
    if (!isRetentionPolicyCheckViolation(error) || index === attempts.length - 1) break;
  }

  throw new Error(formatAlphaConnectError("messages.insert", lastError));
}

export async function requireAlphaConnectAuthUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(formatAlphaConnectError("auth", error));
  if (!data.user?.id) throw new Error("[auth] سجّل الدخول لاستخدام Alpha Connect");
  return data.user.id;
}

export async function verifyAlphaConnectConversationMember(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("alpha_connect_conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(formatAlphaConnectError("members", error));
  return !!data;
}

export type OpenAlphaConnectConversationInput = {
  scope: AlphaConnectThreadScope;
  peerKey?: string;
  groupCode?: string;
  groupTitle?: string;
  existingConversationId?: string | null;
};

/** Open (or reuse) a conversation and verify the current user is a member. */
export async function openAndEnsureAlphaConnectConversation(
  input: OpenAlphaConnectConversationInput,
): Promise<{ conversationId: string; userId: string }> {
  const userId = await requireAlphaConnectAuthUserId();

  let conversationId = input.existingConversationId?.trim() || null;

  if (conversationId) {
    const isMember = await verifyAlphaConnectConversationMember(conversationId, userId);
    if (isMember) return { conversationId, userId };
    conversationId = null;
  }

  await purgeExpiredAlphaConnectMessages();

  if (input.scope === "direct") {
    const peerKey = input.peerKey?.trim();
    if (!peerKey) throw new Error("[open] peerKey required");
    conversationId = await openAlphaConnectConversation("direct", {
      peerKey,
      title: input.groupTitle ?? peerKey,
    });
  } else if (input.scope === "personal") {
    conversationId = await openAlphaConnectConversation("personal");
  } else {
    const groupCode = input.groupCode?.trim();
    if (!groupCode) throw new Error("[open] groupCode required");
    conversationId = await openAlphaConnectConversation("group", {
      groupCode,
      title: input.groupTitle ?? groupCode,
    });
  }

  const isMember = await verifyAlphaConnectConversationMember(conversationId, userId);
  if (!isMember) {
    throw new Error(
      `[members] لم يتم العثور على عضويتك في المحادثة (${conversationId}). تحقق من RPC alpha_connect_open_group / alpha_connect_open_direct`,
    );
  }

  return { conversationId, userId };
}

export async function purgeExpiredAlphaConnectMessages(): Promise<void> {
  try {
    const { error } = await supabase.rpc("alpha_connect_purge_expired_messages");
    if (error) {
      console.warn("[AlphaConnect:purge]", formatAlphaConnectError("purge", error));
    }
  } catch (error) {
    console.warn("[AlphaConnect:purge]", error);
  }
}

export async function openAlphaConnectConversation(
  scope: AlphaConnectThreadScope,
  opts?: { groupCode?: string; title?: string; peerKey?: string },
): Promise<string> {
  if (scope === "personal") {
    const { data, error } = await supabase.rpc("alpha_connect_open_personal");
    if (error) throw new Error(formatAlphaConnectError("alpha_connect_open_personal", error));
    if (!data) throw new Error("[alpha_connect_open_personal] returned empty conversation id");
    return data as string;
  }

  if (scope === "direct") {
    const peerKey = opts?.peerKey?.trim();
    if (!peerKey) throw new Error("peerKey required");

    const userId = await requireAlphaConnectAuthUserId();
    const directCode = `direct:${userId}:${peerKey}`;
    const title = opts?.title ?? peerKey;

    const { data: directData, error: directError } = await supabase.rpc("alpha_connect_open_direct", {
      p_peer_key: peerKey,
      p_title: title,
    });
    if (!directError && directData) return directData as string;

    const { data, error } = await supabase.rpc("alpha_connect_open_group", {
      p_group_code: directCode,
      p_title: title,
    });
    if (error) {
      throw new Error(
        formatAlphaConnectError(
          directError ? "alpha_connect_open_direct" : "alpha_connect_open_group",
          directError ?? error,
        ),
      );
    }
    if (!data) throw new Error("[alpha_connect_open_group] returned empty conversation id (direct fallback)");
    return data as string;
  }

  const groupCode = opts?.groupCode?.trim();
  if (!groupCode) throw new Error("groupCode required");

  const { data, error } = await supabase.rpc("alpha_connect_open_group", {
    p_group_code: groupCode,
    p_title: opts?.title ?? groupCode,
  });
  if (error) throw new Error(formatAlphaConnectError("alpha_connect_open_group", error));
  if (!data) throw new Error("[alpha_connect_open_group] returned empty conversation id");
  return data as string;
}

export async function listAlphaConnectConversations(): Promise<AlphaConnectConversationSummary[]> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return [];

  const { data: members, error: memberError } = await supabase
    .from("alpha_connect_conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  if (memberError) throw memberError;

  const conversationIds = [...new Set((members ?? []).map((row) => row.conversation_id))];
  if (!conversationIds.length) return [];

  const { data: conversations, error: convError } = await supabase
    .from("alpha_connect_conversations")
    .select("id, kind, title, group_code, updated_at")
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (convError) throw convError;

  const summaries: AlphaConnectConversationSummary[] = [];

  for (const conv of conversations ?? []) {
    const groupCode = conv.group_code as string | null;
    if (groupCode?.startsWith("personal:")) continue;

    const { data: lastRows } = await supabase
      .from("alpha_connect_messages")
      .select("body, kind, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const last = lastRows?.[0] ?? null;

    const { count } = await supabase
      .from("alpha_connect_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .neq("sender_id", userId)
      .is("read_at", null);

    summaries.push({
      id: conv.id,
      kind: conv.kind === "group" ? "group" : "direct",
      title: conv.title,
      group_code: groupCode,
      peer_key: parsePeerKeyFromGroupCode(groupCode, userId),
      updated_at: conv.updated_at,
      last_message_body: last?.body ?? null,
      last_message_kind: (last?.kind as AlphaConnectMessage["kind"] | undefined) ?? null,
      last_message_at: last?.created_at ?? null,
      unread_count: count ?? 0,
    });
  }

  return summaries.sort(
    (a, b) =>
      new Date(b.last_message_at ?? b.updated_at).getTime() -
      new Date(a.last_message_at ?? a.updated_at).getTime(),
  );
}

function parsePeerKeyFromGroupCode(groupCode: string | null, userId: string): string | null {
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

export function subscribeAlphaConnectInbox(userId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`alpha-connect-inbox:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "alpha_connect_messages" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "alpha_connect_conversations" },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function listAlphaConnectMessages(conversationId: string, limit = 50): Promise<AlphaConnectMessage[]> {
  const { data, error } = await supabase
    .from("alpha_connect_messages")
    .select(MESSAGE_COLUMNS)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return filterActiveAlphaConnectMessages((data ?? []) as AlphaConnectMessage[]);
}

export async function sendAlphaConnectTextMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  retentionPolicy: AlphaConnectRetentionPolicy;
}): Promise<AlphaConnectMessage> {
  const retentionPolicy = coerceMessageRetentionPolicy(input.retentionPolicy);
  return insertAlphaConnectMessageRow(
    {
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      kind: "text",
      body: input.body.trim(),
    },
    retentionPolicy,
  );
}

export async function sendAlphaConnectVoiceMessage(input: {
  conversationId: string;
  senderId: string;
  audioPath: string;
  durationMs: number;
  retentionPolicy: AlphaConnectRetentionPolicy;
  kind?: "voice" | "ptt";
}): Promise<AlphaConnectMessage> {
  const retentionPolicy = coerceMessageRetentionPolicy(input.retentionPolicy);
  return insertAlphaConnectMessageRow(
    {
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      kind: input.kind ?? "ptt",
      audio_path: input.audioPath,
      duration_ms: input.durationMs,
    },
    retentionPolicy,
  );
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

export async function deleteAlphaConnectMessage(messageId: string): Promise<void> {
  const { data, error } = await supabase
    .from("alpha_connect_messages")
    .delete()
    .eq("id", messageId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(formatAlphaConnectError("messages.delete", error));
  if (!data?.id) {
    throw new Error("[messages.delete] لم يتم العثور على الرسالة أو لا تملك صلاحية الحذف — شغّل RUN_ALPHA_CONNECT_MESSAGE_DELETE.sql");
  }
}

export async function clearAlphaConnectConversation(input: {
  conversationId?: string | null;
  peerKey?: string;
  scope?: AlphaConnectThreadScope;
  groupCode?: string;
  groupTitle?: string;
  forBoth: boolean;
}): Promise<string> {
  const { conversationId, userId } = await openAndEnsureAlphaConnectConversation({
    scope: input.scope ?? "direct",
    peerKey: input.peerKey,
    groupCode: input.groupCode,
    groupTitle: input.groupTitle,
    existingConversationId: input.conversationId,
  });

  const { error } = await supabase.rpc("alpha_connect_clear_conversation", {
    p_conversation_id: conversationId,
    p_for_both: input.forBoth,
  });

  if (error) throw new Error(formatAlphaConnectError("conversation.clear", error));
  return conversationId;
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
