import type { AlphaConnectConversationSummary } from "@/features/alpha-connect/types";
import { formatMessageRelativeTime } from "@/features/alpha-connect/retention";
import type { ShieldRole } from "./AlphaShield";

export type Conversation = {
  id: string;
  name: string;
  role: ShieldRole;
  avatar: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
  kind: "private" | "group";
  phone?: string;
  conversationId?: string;
};

const avatar = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128&bold=true&rounded=true`;

const priestAvatar = avatar("أبونا داود", "7c5cbf");
const servantAvatar = avatar("مينا فادي", "3a8c6e");
const memberAvatar = avatar("مريم عادل", "4a7ab8");
const officialAvatar = avatar("Alpha", "b8893a");

/** Static contact directory — display metadata only (no mock message history). */
export const CONVERSATION_CONTACTS: Omit<Conversation, "message" | "time">[] = [
  {
    id: "priest",
    name: "أبونا داود",
    role: "priest",
    avatar: priestAvatar,
    online: true,
    kind: "private",
    phone: "+201001234567",
  },
  {
    id: "alpha",
    name: "Alpha الرسمي",
    role: "official",
    avatar: officialAvatar,
    kind: "private",
    phone: "+20223456789",
  },
  {
    id: "servant",
    name: "مينا فادي",
    role: "servant",
    avatar: servantAvatar,
    kind: "private",
    phone: "+201112345678",
  },
  {
    id: "member",
    name: "مريم عادل",
    role: "member",
    avatar: memberAvatar,
    kind: "private",
    phone: "+201223456789",
  },
  {
    id: "group",
    name: "خدام اجتماع الشباب",
    role: "servant",
    avatar: servantAvatar,
    kind: "group",
  },
];

/** Contact directory as full Conversation rows (empty preview until DB merge). */
export const conversations: Conversation[] = CONVERSATION_CONTACTS.map((contact) => ({
  ...contact,
  message: "اضغط لبدء المحادثة",
  time: "",
  unread: 0,
}));

export const priestProfile: Conversation = conversations[0];

export function getConversationPhone(id: string): string | undefined {
  return CONVERSATION_CONTACTS.find((c) => c.id === id)?.phone;
}

const roleAvatarBg: Record<Conversation["role"], string> = {
  priest: "7c5cbf",
  servant: "3a8c6e",
  member: "4a7ab8",
  official: "b8893a",
};

function previewFromRow(row: AlphaConnectConversationSummary): string {
  if (!row.last_message_kind) return "اضغط لبدء المحادثة";
  if (row.last_message_kind === "ptt") return "🎙️ رسالة PTT";
  if (row.last_message_kind === "voice") return "🎤 رسالة صوتية";
  return row.last_message_body?.trim() || "رسالة";
}

export function mergeConversationWithDb(
  contact: Omit<Conversation, "message" | "time">,
  row: AlphaConnectConversationSummary | undefined,
): Conversation {
  if (!row) {
    return {
      ...contact,
      message: "اضغط لبدء المحادثة",
      time: "",
      unread: 0,
    };
  }

  return {
    ...contact,
    conversationId: row.id,
    message: previewFromRow(row),
    time: formatMessageRelativeTime(row.last_message_at ?? row.updated_at),
    unread: row.unread_count,
  };
}

export function buildConversationList(
  rows: AlphaConnectConversationSummary[],
  _userId: string,
): Conversation[] {
  const byPeer = new Map<string, AlphaConnectConversationSummary>();
  for (const row of rows) {
    const key = row.peer_key ?? row.group_code ?? row.id;
    byPeer.set(key, row);
  }

  const merged = CONVERSATION_CONTACTS.map((contact) =>
    mergeConversationWithDb(contact, byPeer.get(contact.id)),
  );

  for (const row of rows) {
    const key = row.peer_key ?? row.group_code ?? row.id;
    if (CONVERSATION_CONTACTS.some((c) => c.id === key)) continue;
    merged.push({
      id: key,
      name: row.title ?? key,
      role: "member",
      avatar: avatar(row.title ?? key, "4a7ab8"),
      kind: row.kind === "group" ? "group" : "private",
      conversationId: row.id,
      message: previewFromRow(row),
      time: formatMessageRelativeTime(row.last_message_at ?? row.updated_at),
      unread: row.unread_count,
    });
  }

  return merged.sort((a, b) => {
    const ta = a.time === "" ? 0 : 1;
    const tb = b.time === "" ? 0 : 1;
    if (ta !== tb) return tb - ta;
    return a.name.localeCompare(b.name, "ar");
  });
}

/** Build an Alpha conversation profile from a church leader contact. */
export function conversationFromContact(input: {
  id: string;
  name: string;
  role: "priest" | "servant" | "admin";
  phone?: string;
}): Conversation {
  const role: Conversation["role"] =
    input.role === "priest" ? "priest" : input.role === "servant" ? "servant" : "official";
  return {
    id: input.id,
    name: input.name,
    role,
    avatar: avatar(input.name, roleAvatarBg[role]),
    message: "اضغط لبدء المحادثة",
    time: "",
    online: true,
    kind: "private",
    phone: input.phone,
    unread: 0,
  };
}
