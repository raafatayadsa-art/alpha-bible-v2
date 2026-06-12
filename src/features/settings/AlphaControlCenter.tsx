import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BookOpen,
  Church,
  Clock,
  Cloud,
  Eye,
  Headphones,
  Moon,
  Shield,
} from "lucide-react";
import { ALPHA_OFFICIAL_SLOGAN } from "@/components/brand";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation";
import { ControlCenterScreenBackground } from "./components/ControlCenterScreenBackground";
import { BottomDock } from "@/components/bible/BottomDock";
import {
  ActionRow,
  ActiveSessionsList,
  ControlCenterHero,
  DarkModeToggle,
  Divider,
  LinkCard,
  LogoutButton,
  PasswordChangeForm,
  PremiumSectionCard,
  SectionLabel,
  SelectRow,
  SettingsSearch,
  ToggleRow,
} from "./control-center-ui";
import {
  computeSecurityScore,
  securityLabelKey,
  useSettings,
  type MessageDeleteDuration,
  type SettingsState,
} from "./settings-store";
import { AboutAlphaAppCard } from "@/features/platform-admin/AboutAlphaAppCard";
import { OwnerAccessPinSheet } from "@/features/platform-admin/OwnerAccessPinSheet";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/use-locale";

function sectionVisible(query: string, keywords: string[]): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return keywords.some((k) => k.toLowerCase().includes(q));
}

export function AlphaControlCenter() {
  const navigate = useNavigate();
  const { t } = useTranslation(["settings", "legal"]);
  const { dir, locale } = useLocale();
  const { state, patch, clearCache } = useSettings();
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [ownerPinOpen, setOwnerPinOpen] = useState(false);
  const score = computeSecurityScore(state);
  const scoreLabelKey = securityLabelKey(score);
  const isDark = state.themeMode === "dark";

  const syncLabel = useMemo(
    () =>
      new Date().toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const visibilityOptions = useMemo(
    () => [
      { value: "everyone", label: t("options.everyone") },
      { value: "church", label: t("options.church") },
      { value: "friends", label: t("options.friends") },
    ],
    [t],
  );

  const messageDurationOptions = useMemo(
    () => [
      { value: "after_view", label: t("options.afterView") },
      { value: "1h", label: t("options.oneHour") },
      { value: "1d", label: t("options.oneDay") },
      { value: "1w", label: t("options.oneWeek") },
    ],
    [t],
  );

  const fontSizeOptions = useMemo(
    () => [
      { value: "14", label: t("options.fontSmall") },
      { value: "16", label: t("options.fontMedium") },
      { value: "18", label: t("options.fontLarge") },
      { value: "20", label: t("options.fontXLarge") },
    ],
    [t],
  );

  const fontFamilyOptions = useMemo(
    () => [
      { value: "serif", label: t("options.serif") },
      { value: "sans", label: t("options.sans") },
    ],
    [t],
  );

  const scrollSpeedOptions = useMemo(
    () => [
      { value: "1", label: t("options.scrollSlow") },
      { value: "2", label: t("options.scrollMedium") },
      { value: "3", label: t("options.scrollFast") },
    ],
    [t],
  );

  const p = <K extends keyof SettingsState>(key: K) => (v: SettingsState[K]) => patch(key, v);

  const handleToggle = useCallback((id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  }, []);

  const sectionOpen = useCallback((id: string) => openSection === id, [openSection]);

  return (
    <div dir={dir} className="relative min-h-screen w-full overflow-x-hidden">
      <ControlCenterScreenBackground />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),10px)]">
        <AlphaHeaderShell className="pb-0">
          <AlphaHeader variant="internal" title={t("pageTitle")} />
        </AlphaHeaderShell>

        {sectionVisible(search, t("sections.heroKeywords", { returnObjects: true }) as string[]) && (
          <div className="mt-4">
            <ControlCenterHero score={score} scoreLabelKey={scoreLabelKey} />
          </div>
        )}

        <SettingsSearch value={search} onChange={setSearch} />

        {sectionVisible(search, t("sections.trustKeywords", { returnObjects: true }) as string[]) && (
          <div className="mb-2.5 overflow-hidden rounded-[22px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fbf3e1]/96 to-[#f4ead8]/94 shadow-[0_14px_30px_-22px_rgba(120,80,30,0.38)]">
            <LinkCard
              to="/settings/trust"
              icon={Shield}
              title={t("trustCard.title")}
              subtitle={t("trustCard.subtitle")}
              accent="#3f9d6e"
            />
          </div>
        )}

        <div className="space-y-0.5">
          {sectionVisible(search, t("sections.privacy.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="privacy"
              title={t("sections.privacy.title")}
              description={t("sections.privacy.description")}
              icon={Shield}
              accent="#3f9d6e"
              isOpen={sectionOpen("privacy")}
              onToggle={handleToggle}
            >
              <SectionLabel>{t("labels.security")}</SectionLabel>
              <ToggleRow label={t("rows.biometric.label")} subtitle={t("rows.biometric.subtitle")} checked={state.biometric} onChange={p("biometric")} />
              <ToggleRow label={t("rows.twoFactor.label")} subtitle={t("rows.twoFactor.subtitle")} checked={state.twoFactor} onChange={p("twoFactor")} />
              <ActionRow label={t("rows.registeredDevices.label")} subtitle={t("security.activeDevices", { count: state.registeredDevices })} />
              <PasswordChangeForm />
              <ActionRow label={t("rows.logoutAllDevices.label")} subtitle={t("rows.logoutAllDevices.subtitle")} danger />
              <Divider />
              <SectionLabel>{t("rows.activeSessions")}</SectionLabel>
              <ActiveSessionsList />
              <ActionRow label={t("rows.blockedUsers.label")} subtitle={t("rows.blockedUsers.subtitle")} />
              <Divider />
              <SectionLabel>{t("labels.privacy")}</SectionLabel>
              <SelectRow
                label={t("rows.profileVisibility")}
                value={state.profileVisibility}
                options={visibilityOptions}
                onChange={(v) => p("profileVisibility")(v as SettingsState["profileVisibility"])}
              />
              <SelectRow
                label={t("rows.whoCanMessage")}
                value={state.whoCanMessage}
                options={visibilityOptions}
                onChange={(v) => p("whoCanMessage")(v as SettingsState["whoCanMessage"])}
              />
              <ToggleRow label={t("rows.hidePhone")} checked={state.hidePhone} onChange={p("hidePhone")} />
              <ToggleRow label={t("rows.hideEmail")} checked={state.hideEmail} onChange={p("hideEmail")} />
              <ToggleRow label={t("rows.hideChurch")} checked={state.hideChurch} onChange={p("hideChurch")} />
              <ToggleRow label={t("rows.hideBirthdate")} checked={state.hideBirthdate} onChange={p("hideBirthdate")} />
              <Divider />
              <SectionLabel>{t("labels.privateMessages")}</SectionLabel>
              <SelectRow
                label={t("rows.messageDeleteDuration")}
                value={state.messageDeleteDuration}
                options={messageDurationOptions}
                onChange={(v) => p("messageDeleteDuration")(v as MessageDeleteDuration)}
              />
              <ToggleRow label={t("rows.blockStrangers")} checked={state.blockStrangers} onChange={p("blockStrangers")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.appearance.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="appearance"
              title={t("sections.appearance.title")}
              description={t("sections.appearance.description")}
              icon={Moon}
              accent="#d8a83a"
              isOpen={sectionOpen("appearance")}
              onToggle={handleToggle}
            >
              <LanguageSwitcher className="mx-1.5 mb-2" />
              <DarkModeToggle
                checked={isDark}
                onChange={(v) => p("themeMode")(v ? "dark" : "light")}
              />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.notifications.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="notifications"
              title={t("sections.notifications.title")}
              description={t("sections.notifications.description")}
              icon={Bell}
              accent="#c98a3c"
              isOpen={sectionOpen("notifications")}
              onToggle={handleToggle}
            >
              <SectionLabel>{t("labels.spiritual")}</SectionLabel>
              <ToggleRow label={t("rows.notifyVerse")} checked={state.notifyVerse} onChange={p("notifyVerse")} />
              <ToggleRow label={t("rows.notifyPrayer")} checked={state.notifyPrayer} onChange={p("notifyPrayer")} />
              <ToggleRow label={t("rows.notifySaint")} checked={state.notifySaint} onChange={p("notifySaint")} />
              <ToggleRow label={t("rows.notifyKatameros")} checked={state.notifyKatameros} onChange={p("notifyKatameros")} />
              <Divider />
              <SectionLabel>{t("labels.church")}</SectionLabel>
              <ToggleRow label={t("rows.notifyMeetings")} checked={state.notifyMeetings} onChange={p("notifyMeetings")} />
              <ToggleRow label={t("rows.notifyTrips")} checked={state.notifyTrips} onChange={p("notifyTrips")} />
              <ToggleRow label={t("rows.notifyPrayerRequests")} checked={state.notifyPrayerRequests} onChange={p("notifyPrayerRequests")} />
              <Divider />
              <SectionLabel>{t("labels.community")}</SectionLabel>
              <ToggleRow label={t("rows.notifyComments")} checked={state.notifyComments} onChange={p("notifyComments")} />
              <ToggleRow label={t("rows.notifyReplies")} checked={state.notifyReplies} onChange={p("notifyReplies")} />
              <ToggleRow label={t("rows.notifyMentions")} checked={state.notifyMentions} onChange={p("notifyMentions")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.bible.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="bible"
              title={t("sections.bible.title")}
              description={t("sections.bible.description")}
              icon={BookOpen}
              accent="#8a6ec1"
              isOpen={sectionOpen("bible")}
              onToggle={handleToggle}
            >
              <SelectRow
                label={t("rows.bibleFontSize")}
                value={String(state.bibleFontSize)}
                options={fontSizeOptions}
                onChange={(v) => p("bibleFontSize")(Number(v))}
              />
              <SelectRow
                label={t("rows.bibleFontFamily")}
                value={state.bibleFontFamily}
                options={fontFamilyOptions}
                onChange={(v) => p("bibleFontFamily")(v as SettingsState["bibleFontFamily"])}
              />
              <ToggleRow label={t("rows.bibleSaveLastRead")} checked={state.bibleSaveLastRead} onChange={p("bibleSaveLastRead")} />
              <SelectRow
                label={t("rows.bibleAutoscrollSpeed")}
                value={String(state.bibleAutoscrollSpeed)}
                options={scrollSpeedOptions}
                onChange={(v) => p("bibleAutoscrollSpeed")(Number(v))}
              />
              <ActionRow label={t("rows.biblePreferredTranslation")} subtitle={t("preferredTranslation")} />
              <ToggleRow label={t("rows.bibleShowVerseNumbers")} checked={state.bibleShowVerseNumbers} onChange={p("bibleShowVerseNumbers")} />
              <Divider />
              <SectionLabel>{t("labels.spiritualPrefs")}</SectionLabel>
              <LinkCard to="/church/directory" icon={Church} title={t("rows.savedChurches.title")} subtitle={t("rows.savedChurches.subtitle")} accent="#5b8fd1" />
              <ActionRow label={t("rows.favoritePriests.label")} subtitle={t("rows.favoritePriests.subtitle")} />
              <ActionRow label={t("rows.favoriteServants.label")} subtitle={t("rows.favoriteServants.subtitle")} />
              <ActionRow label={t("rows.savedMeetings.label")} subtitle={t("rows.savedMeetings.subtitle")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.prayer.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="prayer"
              title={t("sections.prayer.title")}
              description={t("sections.prayer.description")}
              icon={Clock}
              accent="#1f8a5a"
              isOpen={sectionOpen("prayer")}
              onToggle={handleToggle}
            >
              <ToggleRow label={t("rows.prayerReminder")} checked={state.prayerReminder} onChange={p("prayerReminder")} />
              <ActionRow label={t("rows.prayerHours.label")} subtitle={t("rows.prayerHours.subtitle")} />
              <ToggleRow label={t("rows.prayerSilentMode")} checked={state.prayerSilentMode} onChange={p("prayerSilentMode")} />
              <ToggleRow label={t("rows.prayerBedtimeReminder")} checked={state.prayerBedtimeReminder} onChange={p("prayerBedtimeReminder")} />
              <ToggleRow label={t("rows.prayerMorningReminder")} checked={state.prayerMorningReminder} onChange={p("prayerMorningReminder")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.storage.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="storage"
              title={t("sections.storage.title")}
              description={t("sections.storage.description")}
              icon={Cloud}
              accent="#6a543a"
              isOpen={sectionOpen("storage")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.localDataSize.label")} subtitle={t("rows.localDataSize.subtitle")} />
              <ActionRow label={t("rows.clearCache.label")} subtitle={t("rows.clearCache.subtitle")} onClick={clearCache} />
              <ActionRow label={t("rows.syncNow.label")} subtitle={t("rows.syncNow.subtitle")} />
              <ActionRow label={t("rows.lastSync")} subtitle={syncLabel} />
              <ActionRow label={t("rows.offlineDownload.label")} subtitle={t("rows.offlineDownload.subtitle")} />
              <Divider />
              <SectionLabel>{t("labels.savedContent")}</SectionLabel>
              <ActionRow label={t("rows.savedPosts.label")} subtitle={t("rows.savedPosts.subtitle")} />
              <ActionRow label={t("rows.likedPosts.label")} subtitle={t("rows.likedPosts.subtitle")} />
              <ActionRow label={t("rows.friendRequests.label")} subtitle={t("rows.friendRequests.subtitle")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.a11y.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="a11y"
              title={t("sections.a11y.title")}
              description={t("sections.a11y.description")}
              icon={Eye}
              accent="#7a5c9e"
              isOpen={sectionOpen("a11y")}
              onToggle={handleToggle}
            >
              <ToggleRow label={t("rows.largeText")} checked={state.largeText} onChange={p("largeText")} />
              <ToggleRow label={t("rows.highContrast")} checked={state.highContrast} onChange={p("highContrast")} />
              <ToggleRow label={t("rows.screenReader")} checked={state.screenReader} onChange={p("screenReader")} />
              <ToggleRow label={t("rows.haptics")} checked={state.haptics} onChange={p("haptics")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, t("sections.about.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="about"
              title={t("sections.about.title")}
              description={t("sections.about.description")}
              icon={Headphones}
              accent="#b8893a"
              isOpen={sectionOpen("about")}
              onToggle={handleToggle}
            >
              <AboutAlphaAppCard onVersionUnlock={() => setOwnerPinOpen(true)} />
              {/* TEMP DEV ACCESS ONLY - REMOVE BEFORE PRODUCTION */}
              <button
                type="button"
                onClick={() => setOwnerPinOpen(true)}
                className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-col items-center gap-0.5 rounded-2xl border-2 border-dashed border-[#b85450]/50 bg-[#b85450]/10 px-4 py-3 active:scale-[0.98]"
              >
                <span className="text-[11px] font-extrabold text-[#8b3a36]">{t("devAccess.title")}</span>
                <span className="text-[10px] font-bold text-[#8b3a36]/80">{t("devAccess.subtitle")}</span>
              </button>
              <p className="px-4 py-2 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-[#8a6a3a]">
                {ALPHA_OFFICIAL_SLOGAN}
              </p>
              <Divider />
              <ActionRow label={t("privacyPolicy", { ns: "legal" })} />
              <ActionRow label={t("termsAndConditions", { ns: "legal" })} />
              <ActionRow label={t("support", { ns: "legal" })} />
              <ActionRow label={t("reportProblem", { ns: "legal" })} />
              <ActionRow label={t("rateApp", { ns: "legal" })} />
            </PremiumSectionCard>
          )}
        </div>

        <LogoutButton />

        <p className="mt-6 text-center text-[10px] text-[#9a7e5a]">{t("pageFooter")}</p>
      </div>

      <OwnerAccessPinSheet
        open={ownerPinOpen}
        onClose={() => setOwnerPinOpen(false)}
        onSuccess={() => {
          setOwnerPinOpen(false);
          navigate({ to: "/platform" });
        }}
      />

      <BottomDock />
    </div>
  );
}
