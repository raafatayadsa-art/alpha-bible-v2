import { formatAlphaDateDisplay } from "@/components/controls/AlphaDatePicker";

export type ProfileVisibility = "hidden" | "everyone" | "church" | "friends";

export type ProfileFieldPrivacy = {
  avatar: ProfileVisibility;
  bio: ProfileVisibility;
  achievements: ProfileVisibility;
  spiritualStats: ProfileVisibility;
  church: ProfileVisibility;
  birthDate: ProfileVisibility;
  family: ProfileVisibility;
  peopleConnect: ProfileVisibility;
};

export const DEFAULT_FIELD_PRIVACY: ProfileFieldPrivacy = {
  avatar: "church",
  bio: "church",
  achievements: "church",
  spiritualStats: "church",
  church: "church",
  birthDate: "friends",
  family: "friends",
  peopleConnect: "church",
};

export const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: "everyone", label: "الجميع" },
  { value: "church", label: "أعضاء الكنيسة" },
  { value: "friends", label: "الأصدقاء فقط" },
  { value: "hidden", label: "إخفاء" },
];

export function isFieldHidden(v: ProfileVisibility): boolean {
  return v === "hidden";
}

export function visibilityLabel(v: ProfileVisibility): string {
  return VISIBILITY_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}

export function formatBirthDateDisplay(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const datePart = iso.trim().slice(0, 10);
  const formatted = formatAlphaDateDisplay(datePart);
  return formatted || null;
}

export function formatProfileDate(iso: string | null | undefined): string | null {
  return formatBirthDateDisplay(iso);
}

/** Owner profile page: show field when not hidden. */
export function isFieldVisibleOnProfile(v: ProfileVisibility): boolean {
  return v !== "hidden";
}

/** Who can see this field on a public profile view. */
export function isFieldVisibleToViewer(
  visibility: ProfileVisibility,
  viewer: "everyone" | "church" | "friends",
): boolean {
  if (visibility === "hidden") return false;
  if (visibility === "everyone") return true;
  if (visibility === "church") return viewer === "church" || viewer === "friends";
  if (visibility === "friends") return viewer === "friends";
  return false;
}
