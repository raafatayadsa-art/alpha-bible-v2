import { useSyncExternalStore } from "react";
import { CHURCH_NOTIFICATIONS, type ChurchNotification } from "./church-notifications";

/* Module-level mutable state — single source of truth for all screens */
let items: ChurchNotification[] = [...CHURCH_NOTIFICATIONS];
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

export function markNotifRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  emit();
}

export function markAllNotifsRead() {
  items = items.map((n) => ({ ...n, read: true }));
  emit();
}

export function useNotifItems(): ChurchNotification[] {
  return useSyncExternalStore(subscribe, getNotifItems);
}

export function useNotifUnreadCount(): number {
  return useSyncExternalStore(subscribe, getNotifUnreadCount);
}
