import {
  getChannelMemberRole,
  isChannelAdmin,
} from "@/components/alpha/connect-channel-state";
import { getCurrentViewerUserId, hasAlphaPermission } from "@/features/alpha-connect/alpha-permissions";
import { connectEffectiveAlphaRole } from "@/components/alpha/connect-alpha-access";
import { readTripChannelLink } from "./trip-channel-links";
import {
  TRIP_ORGANIZER_PERMISSIONS,
  type TripOrganizerPermission,
  type TripOrganizerRole,
} from "./trip-channel-types";

const ORGANIZERS_KEY = "alpha:083:trip-organizers";

type OrganizerRow = { postId: string; userId: string; role: TripOrganizerRole; assignedAt: number };

function readOrganizers(): OrganizerRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORGANIZERS_KEY);
    return raw ? (JSON.parse(raw) as OrganizerRow[]) : [];
  } catch {
    return [];
  }
}

function writeOrganizers(rows: OrganizerRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORGANIZERS_KEY, JSON.stringify(rows));
  } catch { /* ignore */ }
}

export function assignTripOrganizerRole(input: {
  postId: string;
  userId: string;
  role: TripOrganizerRole;
}) {
  const rows = readOrganizers().filter((r) => !(r.postId === input.postId && r.userId === input.userId));
  rows.push({ ...input, assignedAt: Date.now() });
  writeOrganizers(rows);
}

export function getTripOrganizerRole(postId: string, userId: string): TripOrganizerRole | null {
  return readOrganizers().find((r) => r.postId === postId && r.userId === userId)?.role ?? null;
}

export function isTripOrganizerStaff(postId: string, userId: string): boolean {
  if (hasAlphaPermission(userId, "manage_channels")) return true;
  const role = connectEffectiveAlphaRole();
  if (role === "priest" || role === "servant" || role === "owner") {
    const assigned = getTripOrganizerRole(postId, userId);
    if (assigned) return true;
    const link = readTripChannelLink(postId);
    if (link?.createdBy === userId) return true;
    const orgRole = getChannelMemberRole(link?.organizerChannelId ?? "", userId);
    if (isChannelAdmin(orgRole)) return true;
  }
  return Boolean(getTripOrganizerRole(postId, userId));
}

export function canAccessOrganizerChannel(postId: string, userId = getCurrentViewerUserId()): boolean {
  return isTripOrganizerStaff(postId, userId);
}

export function hasTripOrganizerPermission(
  postId: string,
  permission: TripOrganizerPermission,
  userId = getCurrentViewerUserId(),
): boolean {
  if (hasAlphaPermission(userId, "manage_channels")) return true;
  const assigned = getTripOrganizerRole(postId, userId);
  if (assigned) return TRIP_ORGANIZER_PERMISSIONS[assigned].includes(permission);
  const link = readTripChannelLink(postId);
  if (link?.createdBy === userId) return true;
  const orgRole = getChannelMemberRole(link?.organizerChannelId ?? "", userId);
  if (isChannelAdmin(orgRole)) return true;
  return false;
}

export function resolveTripChannelTabs(postId: string, userId = getCurrentViewerUserId()) {
  const link = readTripChannelLink(postId);
  if (!link) return null;
  const showOrganizer = canAccessOrganizerChannel(postId, userId);
  return {
    link,
    showOrganizer,
    publicId: link.tripChannelId,
    organizerId: link.organizerChannelId,
  };
}
