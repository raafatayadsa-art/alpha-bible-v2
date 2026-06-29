import { useSyncExternalStore } from "react";
import { toast } from "sonner";

export const COMMUNITY_MODERATION_CHANGED = "ab:community-moderation-changed";

const BLOCKED_KEY = "ab:community-blocked-users-v1";
const REPORTS_KEY = "ab:community-reported-comments-v1";

type BlockedEntry = { userId: string; userName: string; blockedAt: string };
type ReportEntry = {
  commentId: string;
  momentId?: string;
  userId?: string;
  userName?: string;
  text?: string;
  reportedAt: string;
};

const listeners = new Set<() => void>();

const EMPTY_BLOCKED: string[] = [];
let blockedSnapshot: string[] = EMPTY_BLOCKED;
let blockedSnapshotRaw = "";

function invalidateBlockedSnapshot() {
  blockedSnapshot = EMPTY_BLOCKED;
  blockedSnapshotRaw = "";
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMMUNITY_MODERATION_CHANGED));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(COMMUNITY_MODERATION_CHANGED, listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(COMMUNITY_MODERATION_CHANGED, listener);
    }
  };
}

function readBlocked(): BlockedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BLOCKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlockedEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBlocked(list: BlockedEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOCKED_KEY, JSON.stringify(list.slice(0, 200)));
  invalidateBlockedSnapshot();
  notify();
}

function readReports(): ReportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReportEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReports(list: ReportEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(list.slice(0, 300)));
  notify();
}

export function getBlockedCommunityUserIds(): string[] {
  if (typeof window === "undefined") return EMPTY_BLOCKED;
  try {
    const raw = window.localStorage.getItem(BLOCKED_KEY) ?? "";
    if (raw === blockedSnapshotRaw) return blockedSnapshot;
    blockedSnapshotRaw = raw;
    if (!raw) {
      blockedSnapshot = EMPTY_BLOCKED;
      return blockedSnapshot;
    }
    const parsed = JSON.parse(raw) as BlockedEntry[];
    blockedSnapshot = Array.isArray(parsed) ? parsed.map((b) => b.userId) : EMPTY_BLOCKED;
    return blockedSnapshot;
  } catch {
    blockedSnapshotRaw = "";
    blockedSnapshot = EMPTY_BLOCKED;
    return blockedSnapshot;
  }
}

export function isCommunityUserBlocked(userId: string): boolean {
  if (!userId) return false;
  return readBlocked().some((b) => b.userId === userId);
}

export function blockCommunityUser(userId: string, userName?: string): void {
  if (!userId) return;
  const list = readBlocked();
  if (list.some((b) => b.userId === userId)) {
    toast.info(`${userName ?? "هذا العضو"} محظور مسبقاً`);
    return;
  }
  writeBlocked([
    { userId, userName: userName ?? "عضو", blockedAt: new Date().toISOString() },
    ...list,
  ]);

  void import("./community-friends-store").then(({ getCommunityFriends, removeCommunityFriend }) => {
    const friend = getCommunityFriends().find((f) => f.linkedUserId === userId);
    if (friend) removeCommunityFriend(friend.id);
  });

  void import("./community-store").then(({ refreshCommunityFeedCaches }) => refreshCommunityFeedCaches());

  toast.success(`تم حظر ${userName ?? "العضو"}`);
}

export function reportCommunityComment(input: {
  commentId: string;
  momentId?: string;
  userId?: string;
  userName?: string;
  text?: string;
}): void {
  const list = readReports();
  if (list.some((r) => r.commentId === input.commentId)) {
    toast.info("تم إرسال هذا التبليغ مسبقاً");
    return;
  }
  writeReports([
    {
      ...input,
      reportedAt: new Date().toISOString(),
    },
    ...list,
  ]);
  toast.success("شكراً — تم استلام التبليغ");
}

export function useCommunityBlockedUserIds(): string[] {
  return useSyncExternalStore(subscribe, getBlockedCommunityUserIds, () => []);
}
