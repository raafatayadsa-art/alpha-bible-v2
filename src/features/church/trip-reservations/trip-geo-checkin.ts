/** ALPHA-092 — Smart geo check-in */

import type { GeoCheckInZone } from "./trip-features-roadmap";
import { incrementCheckIn } from "./trip-command-center";

const ZONE_KEY = "alpha:092:geo-zones";
const CHECKIN_KEY = "alpha:092:geo-checkins";

export type GeoCheckInRecord = {
  registrationId: string;
  postId: string;
  at: string;
  lat: number;
  lng: number;
};

function readZones(): GeoCheckInZone[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ZONE_KEY);
    return raw ? (JSON.parse(raw) as GeoCheckInZone[]) : [];
  } catch {
    return [];
  }
}

function writeZones(rows: GeoCheckInZone[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ZONE_KEY, JSON.stringify(rows));
}

function readCheckins(): GeoCheckInRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    return raw ? (JSON.parse(raw) as GeoCheckInRecord[]) : [];
  } catch {
    return [];
  }
}

function writeCheckins(rows: GeoCheckInRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(rows));
}

export function getGeoZone(postId: string): GeoCheckInZone | undefined {
  return readZones().find((z) => z.postId === postId);
}

export function setGeoZone(zone: GeoCheckInZone) {
  const rest = readZones().filter((z) => z.postId !== zone.postId);
  writeZones([zone, ...rest]);
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinGeoZone(postId: string, lat: number, lng: number): boolean {
  const zone = getGeoZone(postId);
  if (!zone) return true;
  return haversineMeters(lat, lng, zone.lat, zone.lng) <= zone.radiusMeters;
}

export async function performGeoCheckIn(input: {
  postId: string;
  registrationId: string;
}): Promise<{ ok: boolean; error?: string; record?: GeoCheckInRecord }> {
  if (!navigator.geolocation) {
    return { ok: false, error: "الموقع غير متاح على هذا الجهاز" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!isWithinGeoZone(input.postId, lat, lng)) {
          resolve({ ok: false, error: "أنت خارج نطاق موقع الفعالية" });
          return;
        }
        const record: GeoCheckInRecord = {
          registrationId: input.registrationId,
          postId: input.postId,
          at: new Date().toISOString(),
          lat,
          lng,
        };
        writeCheckins([record, ...readCheckins()]);
        incrementCheckIn(input.postId);
        resolve({ ok: true, record });
      },
      () => resolve({ ok: false, error: "تعذّر تحديد موقعك" }),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  });
}

export function hasCheckedIn(registrationId: string): boolean {
  return readCheckins().some((c) => c.registrationId === registrationId);
}
