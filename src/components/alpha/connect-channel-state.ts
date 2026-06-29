import avatarMina from "@/assets/avatar-mina.jpg";
import avatarPriest from "@/assets/avatar-priest.jpg";
import type { AlphaRole } from "@/features/auth/alpha-roles";
import { getDisplayShieldRoleSync } from "@/features/auth";
import { getCurrentUser } from "@/features/church/current-user";
import { conversations } from "./messaging-data";
import { hasAlphaPermission, isAlphaOwner } from "@/features/alpha-connect/alpha-permissions";

export type ChannelMemberRole = "super_admin" | "admin" | "member";
export type ConnectTalkPermission = "super_admin_only" | "admins_only" | "everyone";
export type ChannelInvitePolicy = "admins_only" | "everyone";
export type ChannelModerationAction = "kick" | "mute" | "block";

export type ChannelMemberShieldRole = "member" | "servant" | "priest" | "official";

export type ChannelMember = {
  id: string;
  name: string;
  avatar: string;
  role: ChannelMemberRole;
  shieldRole?: ChannelMemberShieldRole;
  muted?: boolean;
  blocked?: boolean;
};

export function actorHasAlphaShieldSupremacy(actorId: string): boolean {
  if (isAlphaOwner(actorId)) return true;
  return hasAlphaPermission(actorId, "manage_channels");
}

export function resolveChannelMemberShieldRole(member: ChannelMember): ChannelMemberShieldRole | null {
  if (member.shieldRole) return member.shieldRole;

  const fromContact = conversations.find((contact) => contact.id === member.id);
  if (fromContact) return fromContact.role;

  const user = getCurrentUser();
  if (member.id === user.id) {
    return getDisplayShieldRoleSync();
  }

  return null;
}

export function alphaRoleToChannelMemberShield(role: AlphaRole): ChannelMemberShieldRole {
  switch (role) {
    case "owner":
      return "official";
    case "priest":
      return "priest";
    case "servant":
      return "servant";
    default:
      return "member";
  }
}

export type ChannelSettings = {
  talkPermission: ConnectTalkPermission;
  invitePolicy: ChannelInvitePolicy;
  joinApproval: boolean;
  maxParticipants: number;
  pttOnly: boolean;
  pinned: boolean;
  slowModeSec: number;
  notifyOnJoin: boolean;
};

export type ChannelState = {
  creatorId: string;
  members: ChannelMember[];
  settings: ChannelSettings;
};

const STORAGE_KEY = "ab.alpha-connect.channels.v1";

const DEFAULT_SETTINGS: ChannelSettings = {
  talkPermission: "admins_only",
  invitePolicy: "admins_only",
  joinApproval: false,
  maxParticipants: 50,
  pttOnly: true,
  pinned: false,
  slowModeSec: 0,
  notifyOnJoin: true,
};

const SEED_MEMBERS: ChannelMember[] = [
  { id: "creator", name: "أبونا بولس", avatar: avatarPriest, role: "super_admin", shieldRole: "priest" },
  { id: "p2", name: "مينا جورج", avatar: avatarMina, role: "admin", shieldRole: "servant" },
  { id: "p3", name: "مارينا سمير", avatar: avatarMina, role: "member", shieldRole: "member" },
  { id: "p4", name: "مايكل عادل", avatar: avatarPriest, role: "member", shieldRole: "member" },
];

function defaultChannelState(creatorId = "creator"): ChannelState {
  return {
    creatorId,
    members: SEED_MEMBERS.map((member) => ({ ...member })),
    settings: { ...DEFAULT_SETTINGS },
  };
}

let memoryStore: Record<string, ChannelState> | null = null;

function readStore(): Record<string, ChannelState> {
  if (memoryStore) return memoryStore;
  if (typeof window === "undefined") return { main: defaultChannelState() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryStore = { main: defaultChannelState() };
      return memoryStore;
    }
    memoryStore = JSON.parse(raw) as Record<string, ChannelState>;
    return memoryStore;
  } catch {
    memoryStore = { main: defaultChannelState() };
    return memoryStore;
  }
}

function writeStore(store: Record<string, ChannelState>) {
  memoryStore = store;
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getChannelState(channelId: string): ChannelState {
  const store = readStore();
  if (!store[channelId]) {
    store[channelId] = defaultChannelState();
    writeStore(store);
  }
  return store[channelId]!;
}

export function saveChannelState(channelId: string, state: ChannelState) {
  const store = readStore();
  store[channelId] = state;
  writeStore(store);
}

export function deleteChannelState(channelId: string) {
  const store = readStore();
  delete store[channelId];
  writeStore(store);
}

export function patchChannelSettings(channelId: string, patch: Partial<ChannelSettings>) {
  const state = getChannelState(channelId);
  state.settings = { ...state.settings, ...patch };
  saveChannelState(channelId, state);
  return state;
}

export function isChannelAdmin(role: ChannelMemberRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function canMemberSpeakInChannel(
  member: ChannelMember,
  talkPermission: ConnectTalkPermission,
): boolean {
  if (member.muted || member.blocked) return false;
  if (talkPermission === "everyone") return true;
  if (talkPermission === "admins_only") return isChannelAdmin(member.role);
  if (talkPermission === "super_admin_only") return member.role === "super_admin";
  return false;
}

export function canManageAdmins(role: ChannelMemberRole, userId: string, creatorId: string): boolean {
  if (actorHasAlphaShieldSupremacy(userId)) return true;
  return role === "super_admin" || userId === creatorId;
}

export function getChannelMemberRole(channelId: string, userId: string): ChannelMemberRole {
  if (actorHasAlphaShieldSupremacy(userId)) return "super_admin";
  const member = getChannelState(channelId).members.find((item) => item.id === userId);
  if (member?.role) return member.role;
  if (userId === getChannelState(channelId).creatorId) return "super_admin";
  return "member";
}

export function channelRoleLabel(role: ChannelMemberRole): string {
  if (role === "super_admin") return "سوبر أدمن";
  if (role === "admin") return "أدمن";
  return "عضو";
}

export function talkPermissionLabel(value: ConnectTalkPermission): string {
  if (value === "everyone") return "الجميع";
  return "المسئولون";
}

export function promoteChannelMember(
  channelId: string,
  memberId: string,
  role: Extract<ChannelMemberRole, "admin" | "super_admin">,
  actorId: string,
): string | null {
  const state = getChannelState(channelId);
  const actor = state.members.find((item) => item.id === actorId);
  const alphaSupreme = actorHasAlphaShieldSupremacy(actorId);
  if (!alphaSupreme && (!actor || !canManageAdmins(actor.role, actorId, state.creatorId))) {
    return "لا تملك صلاحية الترقية";
  }
  if (
    !alphaSupreme &&
    role === "super_admin" &&
    actor &&
    actor.role !== "super_admin" &&
    actorId !== state.creatorId
  ) {
    return "فقط سوبر أدمن أو منشئ القناة يمكنه ترقية سوبر أدمن";
  }
  const target = state.members.find((item) => item.id === memberId);
  if (!target) return "العضو غير موجود";
  if (!alphaSupreme && target.role === "super_admin") return "لا يمكن تعديل سوبر أدمن";
  target.role = role;
  saveChannelState(channelId, state);
  return null;
}

export function addChannelAdmin(channelId: string, memberId: string, actorId: string): string | null {
  return promoteChannelMember(channelId, memberId, "admin", actorId);
}

export function removeChannelAdmin(channelId: string, memberId: string, actorId: string): string | null {
  const state = getChannelState(channelId);
  const actor = state.members.find((item) => item.id === actorId);
  const alphaSupreme = actorHasAlphaShieldSupremacy(actorId);
  if (!alphaSupreme && (!actor || !canManageAdmins(actor.role, actorId, state.creatorId))) {
    return "لا تملك صلاحية إزالة أدمن";
  }
  const target = state.members.find((item) => item.id === memberId);
  if (!target) return "العضو غير موجود";
  if (!alphaSupreme && target.role === "super_admin") return "لا يمكن إزالة سوبر أدمن";
  target.role = "member";
  saveChannelState(channelId, state);
  return null;
}

export function moderateChannelMember(
  channelId: string,
  memberId: string,
  action: ChannelModerationAction,
  actorId: string,
): string | null {
  const state = getChannelState(channelId);
  const actor = state.members.find((item) => item.id === actorId);
  const alphaSupreme = actorHasAlphaShieldSupremacy(actorId);
  if (!alphaSupreme && (!actor || !isChannelAdmin(actor.role))) return "لا تملك صلاحية الإدارة";

  const targetIndex = state.members.findIndex((item) => item.id === memberId);
  if (targetIndex < 0) return "العضو غير موجود";
  const target = state.members[targetIndex]!;
  if (!alphaSupreme && target.role === "super_admin" && actor && actor.role !== "super_admin") {
    return "لا يمكن إدارة سوبر أدمن";
  }
  if (target.id === actorId && !alphaSupreme) return "لا يمكن تنفيذ هذا الإجراء على نفسك";

  if (action === "kick") {
    state.members.splice(targetIndex, 1);
  } else if (action === "mute") {
    target.muted = !target.muted;
  } else {
    target.blocked = !target.blocked;
    target.muted = true;
  }
  saveChannelState(channelId, state);
  return null;
}

export function inviteMembersToChannel(channelId: string, memberIds: string[], contacts: { id: string; name: string; avatar: string }[]) {
  const state = getChannelState(channelId);
  for (const id of memberIds) {
    if (state.members.some((member) => member.id === id)) continue;
    const contact = contacts.find((item) => item.id === id);
    if (!contact) continue;
    const fromContact = conversations.find((item) => item.id === id);
    state.members.push({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      role: "member",
      shieldRole: fromContact?.role,
    });
  }
  saveChannelState(channelId, state);
}

export function visibleChannelMembers(channelId: string): ChannelMember[] {
  return getChannelState(channelId).members.filter((member) => !member.blocked);
}

/** Remove all non-admin participants when a channel is suspended. */
export function evictParticipantsOnChannelSuspend(channelId: string): number {
  const state = getChannelState(channelId);
  const before = state.members.length;
  state.members = state.members.filter((member) => isChannelAdmin(member.role));
  saveChannelState(channelId, state);
  return before - state.members.length;
}

export type ChannelJoinResult =
  | { status: "joined"; message: string }
  | { status: "already"; message: string }
  | { status: "pending"; message: string }
  | { status: "blocked"; message: string };

export function joinChannelViaInvite(
  channelId: string,
  user: { id: string; name: string; avatar: string; shieldRole?: ChannelMemberShieldRole },
): ChannelJoinResult {
  const state = getChannelState(channelId);
  const existing = state.members.find((member) => member.id === user.id);

  if (existing?.blocked) {
    return { status: "blocked", message: "لا يمكنك الانضمام — حسابك محظور من هذه القناة" };
  }

  if (existing) {
    return { status: "already", message: "أنت عضو في هذه القناة بالفعل" };
  }

  if (state.settings.joinApproval) {
    return {
      status: "pending",
      message: "تم إرسال طلب الانضمام — بانتظار موافقة الإدارة",
    };
  }

  state.members.push({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    role: "member",
    shieldRole: user.shieldRole ?? resolveChannelMemberShieldRole({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: "member",
    }),
  });
  saveChannelState(channelId, state);
  return { status: "joined", message: "تم قبول الدعوة — مرحباً بك في القناة" };
}
