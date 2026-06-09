import { useSyncExternalStore } from "react";
import type { ChurchNotification } from "./church-notifications";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications-api";
import { subscribeAuthContext } from "@/features/auth";

let items: ChurchNotification[] = [];
let loading = true;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotifItems() {
  return items;
}

export function getNotifUnreadCount() {
  return items.filter((n) => !n.read).length;
}

export function getNotifLoading() {
  return loading;
}

export async function refreshNotifications(): Promise<void> {
  loading = true;
  emit();
  try {
    items = await fetchNotifications();
  } catch (error) {
    console.log("Notifications query error", error);
    console.log("Notifications query result", null);
    items = [];
  } finally {
    loading = false;
    emit();
  }
}

export function markNotifRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  emit();
  void markNotificationRead(id).then((ok) => {
    if (!ok) void refreshNotifications();
  });
}

export function markAllNotifsRead() {
  items = items.map((n) => ({ ...n, read: true }));
  emit();
  void markAllNotificationsRead().then((ok) => {
    if (!ok) void refreshNotifications();
  });
}

export function useNotifItems(): ChurchNotification[] {
  return useSyncExternalStore(subscribe, getNotifItems, getNotifItems);
}

export function useNotifUnreadCount(): number {
  return useSyncExternalStore(subscribe, getNotifUnreadCount, getNotifUnreadCount);
}

export function useNotifLoading(): boolean {
  return useSyncExternalStore(subscribe, getNotifLoading, () => true);
}

if (typeof window !== "undefined") {
  void refreshNotifications();
  subscribeAuthContext(() => {
    void refreshNotifications();
  });
}
