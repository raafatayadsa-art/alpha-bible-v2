/** ALPHA-084 — Trip organizer role grants */

export type TripOrganizerGrantScope = "permanent" | "single_trip";

export type TripOrganizerGrant = {
  userId: string;
  userName: string;
  churchId: string;
  scope: TripOrganizerGrantScope;
  grantedBy: string;
  grantedByName: string;
  grantedAt: number;
  linkedPostId?: string;
  expiresAt?: number;
};

const GRANTS_KEY = "alpha:084:trip-organizer-grants";
const REVIEWERS_KEY = "alpha:084:trip-reviewers";

function readGrants(): TripOrganizerGrant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GRANTS_KEY);
    return raw ? (JSON.parse(raw) as TripOrganizerGrant[]) : [];
  } catch {
    return [];
  }
}

function writeGrants(rows: TripOrganizerGrant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GRANTS_KEY, JSON.stringify(rows));
}

export function grantTripOrganizerRole(input: Omit<TripOrganizerGrant, "grantedAt">) {
  const rows = readGrants().filter((g) => !(g.userId === input.userId && g.churchId === input.churchId));
  rows.push({ ...input, grantedAt: Date.now() });
  writeGrants(rows);
}

export function revokeTripOrganizerRole(userId: string, churchId: string) {
  writeGrants(readGrants().filter((g) => !(g.userId === userId && g.churchId === churchId)));
}

export function listTripOrganizerGrants(churchId: string): TripOrganizerGrant[] {
  const now = Date.now();
  return readGrants().filter((g) => {
    if (g.churchId !== churchId) return false;
    if (g.expiresAt && g.expiresAt < now) return false;
    if (g.scope === "single_trip" && g.linkedPostId) return true;
    return g.scope === "permanent";
  });
}

export function hasTripOrganizerGrant(userId: string, churchId: string): boolean {
  return listTripOrganizerGrants(churchId).some((g) => g.userId === userId);
}

export function grantSingleTripOrganizer(input: {
  userId: string;
  userName: string;
  churchId: string;
  postId: string;
  grantedBy: string;
  grantedByName: string;
}) {
  grantTripOrganizerRole({
    ...input,
    scope: "single_trip",
    linkedPostId: input.postId,
  });
}

export function expireSingleTripGrant(postId: string) {
  writeGrants(readGrants().filter((g) => g.linkedPostId !== postId));
}

function readReviewers(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REVIEWERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

/** Servants authorized to review trip posts (in addition to priests). */
export function grantTripReviewer(userId: string, churchId: string) {
  const map = readReviewers();
  const list = new Set(map[churchId] ?? []);
  list.add(userId);
  map[churchId] = Array.from(list);
  localStorage.setItem(REVIEWERS_KEY, JSON.stringify(map));
}

export function isAuthorizedTripReviewer(userId: string, churchId: string): boolean {
  return (readReviewers()[churchId] ?? []).includes(userId);
}
