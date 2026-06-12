import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n, { localeToDir, type AppLocale } from "./index";
import { useSettings } from "@/features/settings/settings-store";
import {
  applyDocumentLocale,
  bootstrapAppLocale,
  changeAppLocale,
  readUserLocaleFromMetadata,
} from "./locale-sync";
import { fetchAuthSession, subscribeAuthContext } from "@/features/auth";

export function useLocale() {
  const { i18n: i18nInstance } = useTranslation();
  const { state, patch } = useSettings();
  const locale = (state.locale ?? i18nInstance.language) as AppLocale;

  const setLocale = useCallback(
    async (next: AppLocale) => {
      patch("locale", next);
      await changeAppLocale(next);
    },
    [patch],
  );

  return {
    locale,
    dir: localeToDir(locale),
    isRtl: locale === "ar",
    setLocale,
  };
}

export function I18nBootstrap() {
  const { patch } = useSettings();

  useEffect(() => {
    void (async () => {
      const session = await fetchAuthSession();
      const accountLocale = readUserLocaleFromMetadata(session.data.session?.user.user_metadata);
      const locale = await bootstrapAppLocale(accountLocale ?? undefined);
      patch("locale", locale);
    })();

    const unsub = subscribeAuthContext(() => {
      void (async () => {
        const session = await fetchAuthSession();
        const accountLocale = readUserLocaleFromMetadata(session.data.session?.user.user_metadata);
        const stored = readSettingsLocaleSafe();
        if (accountLocale && stored === "ar" && !hasExplicitLocaleChoice()) {
          patch("locale", accountLocale);
          await changeAppLocale(accountLocale);
        }
      })();
    });

    const onLanguageChanged = (lng: string) => {
      const next = lng as AppLocale;
      applyDocumentLocale(next);
      patch("locale", next);
    };

    i18n.on("languageChanged", onLanguageChanged);
    return () => {
      unsub();
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, [patch]);

  return null;
}

function readSettingsLocaleSafe(): AppLocale {
  try {
    const raw = localStorage.getItem("ab:alpha-settings");
    if (!raw) return "ar";
    const parsed = JSON.parse(raw) as { locale?: AppLocale };
    return parsed.locale ?? "ar";
  } catch {
    return "ar";
  }
}

function hasExplicitLocaleChoice(): boolean {
  try {
    return Boolean(localStorage.getItem("ab:locale"));
  } catch {
    return false;
  }
}
