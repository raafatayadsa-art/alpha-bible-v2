/** Platform feature modules — synced from `platform_modules` table. */
export type PlatformModuleKey =
  | "bible"
  | "agpeya"
  | "kholagy"
  | "synaxarium"
  | "katameros"
  | "audio"
  | "kids"
  | "meditations"
  | "community"
  | "messaging"
  | "trips"
  | "reservations"
  | "donations";

export type PlatformModuleRow = {
  key: PlatformModuleKey;
  label: string;
  labelAr: string;
  enabled: boolean;
};

export const PLATFORM_MODULE_KEYS: PlatformModuleKey[] = [
  "bible",
  "agpeya",
  "kholagy",
  "synaxarium",
  "katameros",
  "audio",
  "kids",
  "meditations",
  "community",
  "messaging",
  "trips",
  "reservations",
  "donations",
];
