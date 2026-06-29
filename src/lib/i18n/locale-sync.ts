import { supabase } from "@/integrations/supabase/client";
import i18n, { detectDeviceLocale, localeToDir, normalizeLocale, type AppLocale } from "./index";
import { readSettingsState, writeSettingsState } from "@/features/settings/settings-store";

const LOCALE_STORAGE_KEY = "ab:locale";

export function applyDocumentLocale(locale: AppLocale) {
  if (typeof document === "undefined") return;
  const dir = localeToDir(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  document.body?.setAttribute("dir", dir);
}

export function readStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const settingsLocale = readSettingsState().locale;
    if (settingsLocale) return settingsLocale;
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    return raw ? normalizeLocale(raw) : null;
  } catch {
    return null;
  }
}

export function resolveInitialLocale(userLocale?: unknown): AppLocale {
  return readStoredLocale() ?? (userLocale ? normalizeLocale(userLocale) : detectDeviceLocale());
}

export async function persistLocaleToUserAccount(locale: AppLocale) {
  try {
    await supabase.auth.updateUser({ data: { locale } });
  } catch {
    /* ignore when signed out or offline */
  }
}

export async function changeAppLocale(locale: AppLocale) {
  const next = normalizeLocale(locale);
  writeSettingsState({ locale: next });
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
      scheduleUserDataSync({ delayMs: 2000, extraKey: LOCALE_STORAGE_KEY }),
    );
  } catch {
    /* ignore */
  }
  applyDocumentLocale(next);
  await i18n.changeLanguage(next);
  void persistLocaleToUserAccount(next);
}

export async function bootstrapAppLocale(userLocale?: unknown) {
  const locale = resolveInitialLocale(userLocale);
  applyDocumentLocale(locale);
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
  writeSettingsState({ locale });
  return locale;
}

export function readUserLocaleFromMetadata(metadata?: Record<string, unknown>): AppLocale | null {
  if (!metadata || typeof metadata.locale !== "string") return null;
  return normalizeLocale(metadata.locale);
}
