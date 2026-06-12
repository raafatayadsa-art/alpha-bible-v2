import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import arCommon from "./locales/ar/common.json";
import arLegal from "./locales/ar/legal.json";
import arNotifications from "./locales/ar/notifications.json";
import arSettings from "./locales/ar/settings.json";
import arTrust from "./locales/ar/trust.json";
import enCommon from "./locales/en/common.json";
import enLegal from "./locales/en/legal.json";
import enNotifications from "./locales/en/notifications.json";
import enSettings from "./locales/en/settings.json";
import enTrust from "./locales/en/trust.json";

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "ar";

export const I18N_NAMESPACES = ["common", "settings", "trust", "notifications", "legal"] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export function isAppLocale(value: unknown): value is AppLocale {
  return value === "ar" || value === "en";
}

export function localeToDir(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function normalizeLocale(value: unknown): AppLocale {
  if (typeof value !== "string") return DEFAULT_LOCALE;
  const base = value.toLowerCase().split("-")[0];
  return isAppLocale(base) ? base : DEFAULT_LOCALE;
}

export function detectDeviceLocale(): AppLocale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const normalized = normalizeLocale(lang);
    if (normalized === "en") return "en";
    if (normalized === "ar") return "ar";
  }
  return DEFAULT_LOCALE;
}

const resources = {
  ar: {
    common: arCommon,
    settings: arSettings,
    trust: arTrust,
    notifications: arNotifications,
    legal: arLegal,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    trust: enTrust,
    notifications: enNotifications,
    legal: enLegal,
  },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "common",
    ns: [...I18N_NAMESPACES],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "ab:locale",
      caches: ["localStorage"],
    },
  });

export default i18n;
