import { useSyncExternalStore } from "react";

const SERVICES_KEY = "alpha:church:user-services";
const ACTIVITIES_KEY = "alpha:church:user-activities";

export type ServiceType =
  | "sunday" | "youth" | "girls" | "women" | "men"
  | "deacons" | "choir" | "sick" | "visit" | "media";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  sunday:  "مدارس الأحد",
  youth:   "الشباب",
  girls:   "الشابات",
  women:   "السيدات",
  men:     "الرجال",
  deacons: "الشمامسة",
  choir:   "الكورال",
  sick:    "خدمة المرضى",
  visit:   "الافتقاد",
  media:   "الإعلام",
};

export type UserService = {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
  leader?: string;
  servants?: string;        // comma-separated names
  targetGroup?: string;
  image?: string;           // base64 data URL
  createdAt: number;
};

export type ActivityType = "اجتماع" | "مؤتمر" | "رحلة" | "يوم روحي" | "خلوة" | "تدريب خدام";
export const ACTIVITY_TYPES: ActivityType[] = [
  "اجتماع", "مؤتمر", "رحلة", "يوم روحي", "خلوة", "تدريب خدام",
];

export type RepeatSchedule = "none" | "daily" | "weekly" | "monthly" | "yearly";
export const REPEAT_LABELS: Record<RepeatSchedule, string> = {
  none:    "بدون تكرار",
  daily:   "يومي",
  weekly:  "أسبوعي",
  monthly: "شهري",
  yearly:  "سنوي",
};

export type UserActivity = {
  id: string;
  kind: ActivityType;
  title: string;
  description?: string;
  date: string;             // YYYY-MM-DD
  time?: string;            // HH:mm
  location?: string;
  responsible?: string;
  repeat?: RepeatSchedule;
  image?: string;
  createdAt: number;
};

/* ------------------------ tiny pub/sub on localStorage ------------------------ */
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function bump() {
  cache.clear();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = () => { cache.clear(); l(); };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, v);
    return v;
  } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    cache.set(key, value);
    bump();
  } catch {}
}

const EMPTY_SERVICES: UserService[] = [];
const EMPTY_ACTIVITIES: UserActivity[] = [];

export function getUserServices(): UserService[] {
  return read<UserService[]>(SERVICES_KEY, EMPTY_SERVICES);
}
export function getUserActivities(): UserActivity[] {
  return read<UserActivity[]>(ACTIVITIES_KEY, EMPTY_ACTIVITIES);
}
export function addService(s: Omit<UserService, "id" | "createdAt">): UserService {
  const full: UserService = { ...s, id: "s-" + Date.now().toString(36), createdAt: Date.now() };
  write(SERVICES_KEY, [full, ...getUserServices()]);
  return full;
}
export function addActivity(a: Omit<UserActivity, "id" | "createdAt">): UserActivity {
  const full: UserActivity = { ...a, id: "a-" + Date.now().toString(36), createdAt: Date.now() };
  write(ACTIVITIES_KEY, [full, ...getUserActivities()]);
  return full;
}

export function useUserServices(): UserService[] {
  return useSyncExternalStore(subscribe, getUserServices, () => EMPTY_SERVICES);
}
export function useUserActivities(): UserActivity[] {
  return useSyncExternalStore(subscribe, getUserActivities, () => EMPTY_ACTIVITIES);
}
