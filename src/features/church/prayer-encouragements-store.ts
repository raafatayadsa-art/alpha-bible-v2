import { useCallback, useEffect, useState } from "react";
import type { EncouragementMessage } from "@/data/prayer-requests";
import { currentUserName } from "@/features/church/current-user";

const STORAGE_KEY = "ab:prayer-encouragements-v1";
const CHANGED = "ab:prayer-encouragements-changed";

type StoredMessage = EncouragementMessage & { prayerRequestId?: string };

function readAll(): StoredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: StoredMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 80)));
  window.dispatchEvent(new Event(CHANGED));
}

export function listPrayerEncouragements(limit = 20): EncouragementMessage[] {
  return readAll()
    .sort((a, b) => (a.id > b.id ? -1 : 1))
    .slice(0, limit)
    .map(({ prayerRequestId: _pid, ...msg }) => msg);
}

export function addPrayerEncouragement(
  text: string,
  opts: { anonymous?: boolean; prayerRequestId?: string } = {},
): EncouragementMessage {
  const entry: StoredMessage = {
    id: `enc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: opts.anonymous ? "عضو الكنيسة" : currentUserName() || "أنت",
    text: text.trim(),
    time: "الآن",
    anonymous: opts.anonymous,
    prayerRequestId: opts.prayerRequestId,
  };
  writeAll([entry, ...readAll()]);
  const { prayerRequestId: _pid, ...msg } = entry;
  return msg;
}

export function usePrayerEncouragements() {
  const [messages, setMessages] = useState<EncouragementMessage[]>(() => listPrayerEncouragements());

  useEffect(() => {
    const sync = () => setMessages(listPrayerEncouragements());
    window.addEventListener(CHANGED, sync);
    return () => window.removeEventListener(CHANGED, sync);
  }, []);

  const add = useCallback((text: string, opts?: { anonymous?: boolean; prayerRequestId?: string }) => {
    const msg = addPrayerEncouragement(text, opts);
    setMessages(listPrayerEncouragements());
    return msg;
  }, []);

  return { messages, add };
}
