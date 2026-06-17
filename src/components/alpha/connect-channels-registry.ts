import { useCallback, useSyncExternalStore } from "react";
import avatarMina from "@/assets/avatar-mina.jpg";
import avatarPriest from "@/assets/avatar-priest.jpg";
import type { AlphaRole } from "@/features/auth/alpha-roles";
import { buildChannelQrPayload, deriveChannelCode, parseAlphaDeepLink } from "@/features/identity/alpha-identity";
import {
  actorHasAlphaShieldSupremacy,
  alphaRoleToChannelMemberShield,
  deleteChannelState,
  evictParticipantsOnChannelSuspend,
  getChannelMemberRole,
  getChannelState,
  isChannelAdmin,
  saveChannelState,
} from "./connect-channel-state";
import { countPresenceVisibleMembers } from "@/features/alpha-connect/presence";

export type ConnectChannelStatus = "active" | "suspended";

export type ConnectChannelIcon =
  | "shield"
  | "users"
  | "book"
  | "family"
  | "music"
  | "video"
  | "handshake";

export type ConnectChannel = {
  id: string;
  name: string;
  topic?: string;
  onlineCount: number;
  adminName: string;
  creatorName?: string;
  favorite?: boolean;
  icon: ConnectChannelIcon;
  status?: ConnectChannelStatus;
};

export function normalizeConnectChannelTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function countConnectChannelTopicWords(topic: string): number {
  return normalizeConnectChannelTopic(topic).split(" ").filter(Boolean).length;
}

export function getConnectChannelIconOptionsForRole(role: AlphaRole): { id: ConnectChannelIcon; label: string }[] {
  return CHANNEL_ICON_OPTIONS.filter((option) => option.id !== "shield" || role === "owner");
}

export function assertConnectChannelIconAllowed(icon: ConnectChannelIcon, role: AlphaRole): string | null {
  if (icon === "shield" && role !== "owner") {
    return "أيقونة الدرع مخصصة لدرع Alpha فقط";
  }
  return null;
}

export const CHANNEL_ICON_OPTIONS: { id: ConnectChannelIcon; label: string }[] = [
  { id: "shield", label: "درع" },
  { id: "users", label: "مجموعة" },
  { id: "book", label: "كتاب" },
  { id: "family", label: "أسرة" },
  { id: "music", label: "تسبيح" },
  { id: "video", label: "إعلام" },
  { id: "handshake", label: "علاقات" },
];

const STORAGE_KEY = "ab.alpha-connect.channel-list.v1";

const SEED_CHANNELS: ConnectChannel[] = [
  {
    id: "main",
    name: "قناة الكنيسة الرئيسية",
    onlineCount: 24,
    adminName: "أبونا بولس",
    favorite: true,
    icon: "shield",
  },
  {
    id: "servants",
    name: "خدمة الشباب",
    onlineCount: 12,
    adminName: "أبونا بولس",
    favorite: true,
    icon: "users",
  },
  {
    id: "bible",
    name: "دراسة الكتاب المقدس",
    onlineCount: 8,
    adminName: "أبونا بولس",
    favorite: true,
    icon: "book",
  },
  {
    id: "family",
    name: "أسرة الكنيسة",
    onlineCount: 15,
    adminName: "أبونا بولس",
    favorite: true,
    icon: "family",
  },
  {
    id: "worship",
    name: "فريق التسبيح",
    onlineCount: 6,
    adminName: "مينا جورج",
    icon: "music",
  },
  {
    id: "media",
    name: "فريق الإعلام",
    onlineCount: 4,
    adminName: "مارينا سمير",
    icon: "video",
  },
  {
    id: "youth",
    name: "شباب الكنيسة",
    onlineCount: 18,
    adminName: "مايكل عادل",
    icon: "users",
  },
  {
    id: "relations",
    name: "فريق العلاقات",
    onlineCount: 5,
    adminName: "أبونا بولس",
    icon: "handshake",
  },
];

const SEED_CHANNEL_IDS = new Set(SEED_CHANNELS.map((channel) => channel.id));

export function normalizeConnectChannelName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isConnectChannelNameTaken(name: string, excludeChannelId?: string): boolean {
  const normalized = normalizeConnectChannelName(name);
  return readChannels().some(
    (channel) =>
      channel.id !== excludeChannelId && normalizeConnectChannelName(channel.name) === normalized,
  );
}

export function canCreateConnectChannelsByRole(role: AlphaRole): boolean {
  return role === "owner" || role === "priest" || role === "servant";
}

export function getConnectChannelStatus(channelId: string): ConnectChannelStatus {
  return getConnectChannel(channelId).status ?? "active";
}

export function canManageConnectChannelLifecycle(channelId: string, userId: string): boolean {
  if (actorHasAlphaShieldSupremacy(userId)) return true;
  const state = getChannelState(channelId);
  const role = getChannelMemberRole(channelId, userId);
  return userId === state.creatorId || role === "super_admin" || role === "admin";
}

export function canDeleteConnectChannel(channelId: string, userId: string): boolean {
  if (actorHasAlphaShieldSupremacy(userId)) return !SEED_CHANNEL_IDS.has(channelId);
  if (SEED_CHANNEL_IDS.has(channelId)) return false;
  const state = getChannelState(channelId);
  const role = getChannelMemberRole(channelId, userId);
  return userId === state.creatorId || role === "super_admin";
}

export function listConnectChannelsForUser(userId: string): ConnectChannel[] {
  return readChannels().filter((channel) => {
    const status = channel.status ?? "active";
    if (status === "active") return true;
    const role = getChannelMemberRole(channel.id, userId);
    return isChannelAdmin(role);
  });
}

export function suspendConnectChannel(channelId: string, actorId: string): string | null {
  if (!canManageConnectChannelLifecycle(channelId, actorId)) {
    return "لا تملك صلاحية تعطيل القناة";
  }
  const channels = readChannels();
  const index = channels.findIndex((channel) => channel.id === channelId);
  if (index < 0) return "القناة غير موجودة";
  channels[index] = { ...channels[index]!, status: "suspended" };
  writeChannels(channels);
  evictParticipantsOnChannelSuspend(channelId);
  return null;
}

export function reactivateConnectChannel(channelId: string, actorId: string): string | null {
  if (!canManageConnectChannelLifecycle(channelId, actorId)) {
    return "لا تملك صلاحية تفعيل القناة";
  }
  const channels = readChannels();
  const index = channels.findIndex((channel) => channel.id === channelId);
  if (index < 0) return "القناة غير موجودة";
  channels[index] = { ...channels[index]!, status: "active" };
  writeChannels(channels);
  return null;
}

export function deleteConnectChannel(channelId: string, actorId: string): string | null {
  if (!canDeleteConnectChannel(channelId, actorId)) {
    return SEED_CHANNEL_IDS.has(channelId)
      ? "لا يمكن حذف القنوات الأساسية للنظام"
      : "لا تملك صلاحية حذف القناة";
  }
  const channels = readChannels().filter((channel) => channel.id !== channelId);
  writeChannels(channels);
  deleteChannelState(channelId);
  return null;
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let memoryChannels: ConnectChannel[] | null = null;

function normalizeChannels(raw: unknown): ConnectChannel[] {
  if (!Array.isArray(raw)) return SEED_CHANNELS.map((channel) => ({ ...channel }));
  const parsed = raw.filter(
    (item): item is ConnectChannel =>
      !!item &&
      typeof item === "object" &&
      typeof (item as ConnectChannel).id === "string" &&
      typeof (item as ConnectChannel).name === "string",
  );
  return parsed.length > 0 ? parsed : SEED_CHANNELS.map((channel) => ({ ...channel }));
}

function readChannels(): ConnectChannel[] {
  if (memoryChannels) return memoryChannels;
  if (typeof window === "undefined") return SEED_CHANNELS.map((channel) => ({ ...channel }));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryChannels = SEED_CHANNELS.map((channel) => ({ ...channel }));
      return memoryChannels;
    }
    memoryChannels = normalizeChannels(JSON.parse(raw));
    return memoryChannels;
  } catch {
    memoryChannels = SEED_CHANNELS.map((channel) => ({ ...channel }));
    return memoryChannels;
  }
}

function writeChannels(channels: ConnectChannel[]) {
  memoryChannels = channels;
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  emitChange();
}

function getSnapshot(): ConnectChannel[] {
  return readChannels();
}

function getServerSnapshot(): ConnectChannel[] {
  return SEED_CHANNELS.map((channel) => ({ ...channel }));
}

export function useConnectChannels() {
  const channels = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const refresh = useCallback(() => emitChange(), []);
  return { channels, refresh };
}

export function getConnectChannels(): ConnectChannel[] {
  return readChannels();
}

export function getConnectChannel(id: string): ConnectChannel {
  return readChannels().find((channel) => channel.id === id) ?? readChannels()[0]!;
}

export function getChannelInviteCode(channelId: string): string {
  return deriveChannelCode(channelId);
}

export function getChannelInviteLink(channelId: string): string {
  return buildChannelQrPayload(getChannelInviteCode(channelId));
}

export function resolveChannelIdFromInvite(raw: string): string | null {
  const trimmed = raw.trim();
  const parsed = parseAlphaDeepLink(trimmed);
  const code = parsed?.kind === "channel" ? parsed.code : trimmed;
  const normalized = code.toUpperCase();
  return (
    readChannels().find((channel) => getChannelInviteCode(channel.id).toUpperCase() === normalized)?.id ?? null
  );
}

export function createConnectChannel(input: {
  name: string;
  topic?: string;
  icon?: ConnectChannelIcon;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: AlphaRole;
}): ConnectChannel {
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error("أدخل اسم القناة");
  if (isConnectChannelNameTaken(trimmed)) {
    throw new Error("يوجد قناة بنفس الاسم — اختر اسماً مختلفاً");
  }

  const icon = input.icon ?? "users";
  const iconError = assertConnectChannelIconAllowed(icon, input.creatorRole);
  if (iconError) throw new Error(iconError);

  const topic = input.topic ? normalizeConnectChannelTopic(input.topic) : "";
  if (topic && countConnectChannelTopicWords(topic) > 10) {
    throw new Error("الموضوع لا يتعدى 10 كلمات");
  }

  const id = `ch-${Date.now().toString(36)}`;
  const channel: ConnectChannel = {
    id,
    name: trimmed,
    ...(topic ? { topic } : {}),
    onlineCount: 1,
    adminName: input.creatorName,
    creatorName: input.creatorName,
    icon,
    status: "active",
  };

  const channels = readChannels();
  writeChannels([channel, ...channels]);

  saveChannelState(id, {
    creatorId: input.creatorId,
    members: [
      {
        id: input.creatorId,
        name: input.creatorName,
        avatar: input.creatorAvatar,
        role: "super_admin",
        shieldRole: alphaRoleToChannelMemberShield(input.creatorRole),
      },
    ],
    settings: {
      ...getChannelState("main").settings,
      joinApproval: false,
      pinned: false,
    },
  });

  return channel;
}

export function getConnectChannelOnlineCount(channelId: string): number {
  const members = getChannelState(channelId).members.filter((member) => !member.blocked);
  return countPresenceVisibleMembers(members.map((member) => member.id));
}
