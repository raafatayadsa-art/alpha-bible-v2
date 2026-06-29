import { getMemberProfile } from "../post-registrations";

/** ALPHA-086 — Family booking */

export type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  avatarUrl?: string;
  alphaId?: string;
  linkedUserId?: string;
};

export type FamilyProfile = {
  userId: string;
  householdName: string;
  members: FamilyMember[];
};

export type FamilyBookingMode = "solo" | "family";

export type FamilyBookingMeta = {
  registrationId: string;
  postId: string;
  mode: FamilyBookingMode;
  householdName: string;
  members: { id: string; name: string; relation: string }[];
  bookedAt: string;
};

const PROFILE_KEY = "alpha:086:family-profile";
const META_KEY = "alpha:086:family-booking-meta";

export function clearFamilyProfileStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(META_KEY);
  } catch {
    /* ignore */
  }
}

export function getFamilyProfile(): FamilyProfile {
  const profile = getMemberProfile();
  if (!profile.id) {
    return { userId: "", householdName: "", members: [] };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FamilyProfile;
      if (parsed.userId === profile.id) {
        return {
          ...parsed,
          members: Array.isArray(parsed.members) ? parsed.members.filter((m) => m.name?.trim()) : [],
        };
      }
    }
  } catch { /* ignore */ }
  return {
    userId: profile.id,
    householdName: "",
    members: [],
  };
}

export function saveFamilyProfile(patch: Partial<FamilyProfile>): FamilyProfile {
  const cur = getFamilyProfile();
  const next = { ...cur, ...patch };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  return next;
}

export function upsertFamilyMember(member: FamilyMember) {
  const cur = getFamilyProfile();
  const exists = cur.members.some((m) => m.id === member.id);
  const members = exists
    ? cur.members.map((m) => (m.id === member.id ? member : m))
    : [...cur.members, member];
  return saveFamilyProfile({ members });
}

function readMeta(): FamilyBookingMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as FamilyBookingMeta[]) : [];
  } catch {
    return [];
  }
}

function writeMeta(rows: FamilyBookingMeta[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(rows));
}

export function saveFamilyBookingMeta(meta: FamilyBookingMeta) {
  const rest = readMeta().filter((m) => m.registrationId !== meta.registrationId);
  writeMeta([meta, ...rest]);
}

export function getFamilyBookingMeta(registrationId: string): FamilyBookingMeta | undefined {
  return readMeta().find((m) => m.registrationId === registrationId);
}

export function getFamilyBookingsForPost(postId: string): FamilyBookingMeta[] {
  return readMeta().filter((m) => m.postId === postId);
}

export function familyDisplayLabel(meta: FamilyBookingMeta): string {
  if (meta.mode === "solo") return meta.members[0]?.name ?? "فردي";
  const count = meta.members.length;
  return `${meta.householdName} · ${count.toLocaleString("ar-EG")} أفراد`;
}

export function totalSeatsForFamilySelection(
  mode: FamilyBookingMode,
  selectedMemberIds: string[],
  includeSelf: boolean,
): number {
  if (mode === "solo") return 1;
  return (includeSelf ? 1 : 0) + selectedMemberIds.length;
}
