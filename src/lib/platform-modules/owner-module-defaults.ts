import { PLATFORM_MODULE_KEYS, type PlatformModuleKey } from "./types";

export type OwnerModuleState = {
  key: PlatformModuleKey;
  label: string;
  labelAr: string;
  enabled: boolean;
};

export const OWNER_MODULE_DEFAULTS: OwnerModuleState[] = [
  { key: "bible", label: "Bible", labelAr: "الكتاب المقدس", enabled: true },
  { key: "agpeya", label: "Agpeya", labelAr: "الأجبية", enabled: true },
  { key: "kholagy", label: "Khoulagy", labelAr: "الخولاجي المقدس", enabled: true },
  { key: "synaxarium", label: "Synaxarium", labelAr: "السنكسار", enabled: true },
  { key: "katameros", label: "Katameros", labelAr: "القطمارس", enabled: true },
  { key: "audio", label: "Audio", labelAr: "الصوتيات", enabled: true },
  { key: "kids", label: "Kids", labelAr: "الأطفال", enabled: true },
  { key: "meditations", label: "Meditations", labelAr: "التأملات", enabled: true },
  { key: "community", label: "Community", labelAr: "المجتمع", enabled: true },
  { key: "messaging", label: "Alpha Connect", labelAr: "الفا كونكت", enabled: true },
  { key: "trips", label: "Trips", labelAr: "الرحلات", enabled: true },
  { key: "reservations", label: "Reservations", labelAr: "الحجوزات", enabled: false },
  { key: "donations", label: "Donations", labelAr: "التبرعات", enabled: true },
];

const DEFAULTS_BY_KEY = new Map(OWNER_MODULE_DEFAULTS.map((m) => [m.key, m]));

/** Ensures every known module key appears — merges DB/cache rows with shipped defaults. */
export function mergeOwnerModuleStates(rows: OwnerModuleState[]): OwnerModuleState[] {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return PLATFORM_MODULE_KEYS.map((key) => {
    const remote = byKey.get(key);
    const fallback = DEFAULTS_BY_KEY.get(key);
    if (remote && fallback) {
      return {
        ...fallback,
        enabled: remote.enabled,
      };
    }
    if (remote) return remote;
    if (fallback) return fallback;
    return { key, label: key, labelAr: key, enabled: true };
  });
}
