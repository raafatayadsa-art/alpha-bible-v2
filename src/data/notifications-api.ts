import { supabase } from "@/integrations/supabase/client";
import type { ChurchNotification, NotifCategory, NotifScope } from "./church-notifications";

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  scope: NotifScope;
  is_read: boolean;
  created_at: string;
  target_url?: string | null;
};

const NOTIFICATION_SELECT =
  "id, title, body, type, scope, is_read, created_at, target_url" as const;

const TYPE_TO_CATEGORY: Record<string, NotifCategory> = {
  prayer: "prayer",
  "prayer-comment": "prayer-comment",
  encouragement: "encouragement",
  post: "post",
  announcement: "announcement",
  meeting: "meeting",
  live: "live",
  service: "service",
  message: "message",
  membership: "membership",
  general: "announcement",
  system: "announcement",
  church_post: "post",
};

function mapTypeToCategory(type: string): NotifCategory {
  return TYPE_TO_CATEGORY[type] ?? "announcement";
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  return `منذ ${days} يوم`;
}

export function mapNotificationRow(row: NotificationRow): ChurchNotification {
  return {
    id: row.id,
    category: mapTypeToCategory(row.type),
    scope: row.scope,
    title: row.title,
    description: row.body?.trim() || row.title,
    time: formatRelativeTime(row.created_at),
    read: row.is_read,
    href: row.target_url?.trim() || "/home",
  };
}

/** Fetch notifications — visibility enforced by Supabase RLS on public.notifications. */
export async function fetchNotifications(): Promise<ChurchNotification[]> {
  try {
    // Wait for persisted session so RLS sees authenticated role when available.
    await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("notifications")
      .select(NOTIFICATION_SELECT)
      .order("created_at", { ascending: false });

    console.log("Notifications query result", data);
    console.log("Notifications query error", error);

    if (error) {
      return [];
    }

    return ((data ?? []) as NotificationRow[]).map(mapNotificationRow);
  } catch (error) {
    console.log("Notifications query result", null);
    console.log("Notifications query error", error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

  if (error) {
    console.log("Notifications query error", error);
    return false;
  }

  return true;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    console.log("Notifications query error", error);
    return false;
  }

  return true;
}

export async function createChurchPostNotification(input: {
  churchId: string;
  postId: string;
  postTitle?: string;
}): Promise<void> {
  const body = input.postTitle?.trim()
    ? input.postTitle.trim()
    : "تم نشر منشور جديد من الكنيسة";

  const { error } = await supabase.from("notifications").insert({
    title: "منشور جديد",
    body,
    type: "church_post",
    scope: "church",
    church_id: input.churchId,
    target_url: `/church/post/${input.postId}`,
    is_read: false,
  });

  if (error) {
    console.log("Notifications query error", error);
    return;
  }

  console.log("Church post notification created");
}
