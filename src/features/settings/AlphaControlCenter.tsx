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
  Languages,
  Moon,
  Shield,
  Scale,
  LifeBuoy,
} from "lucide-react";
import { ALPHA_OFFICIAL_SLOGAN } from "@/components/brand";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation";
import { ControlCenterScreenBackground } from "./components/ControlCenterScreenBackground";
import { BottomDock } from "@/components/bible/BottomDock";
import {
  ActionRow,
  ControlCenterHero,
  DarkModeToggle,
  PremiumLinkCard,
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

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <AlphaHeaderShell className="pb-0">
          <AlphaHeader variant="internal" title={t("pageTitle")} />
        </AlphaHeaderShell>

        {sectionVisible(search, t("sections.heroKeywords", { returnObjects: true }) as string[]) && (
          <div className="mt-4">
            <ControlCenterHero score={score} scoreLabelKey={scoreLabelKey} devicesCount={state.registeredDevices} />
          </div>
        )}

        <SettingsSearch value={search} onChange={setSearch} />

        {sectionVisible(search, t("sections.trustKeywords", { returnObjects: true }) as string[]) && (
          <PremiumLinkCard
            to="/settings/trust"
            icon={Shield}
            title={t("trustCard.title")}
            subtitle={t("trustCard.subtitle")}
            accent="#3f9d6e"
          />
        )}

        <div className="space-y-0.5">
          {/* 1. اللغة */}
          {sectionVisible(search, t("sections.language.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="language"
              title={t("sections.language.title")}
              description={t("sections.language.description")}
              icon={Languages}
              accent="#5b8fd1"
              isOpen={sectionOpen("language")}
              onToggle={handleToggle}
            >
              <LanguageSwitcher className="mb-3.5 border-[#efe2c4]/40 bg-white/40 px-4 py-4 shadow-[0_2px_10px_-4px_rgba(120,80,30,0.08)] backdrop-blur-sm transition-all hover:bg-white/50" />
            </PremiumSectionCard>
          )}

          {/* 2. المظهر */}
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
              <DarkModeToggle
                checked={isDark}
                onChange={(v) => p("themeMode")(v ? "dark" : "light")}
              />
            </PremiumSectionCard>
          )}

          {/* 3. الإشعارات */}
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
              <ToggleRow label={t("rows.notifyVerse.label")} subtitle={t("rows.notifyVerse.subtitle")} checked={state.notifyVerse} onChange={p("notifyVerse")} />
              <ToggleRow label={t("rows.notifyPrayer.label")} subtitle={t("rows.notifyPrayer.subtitle")} checked={state.notifyPrayer} onChange={p("notifyPrayer")} />
              <ToggleRow label={t("rows.notifySaint.label")} subtitle={t("rows.notifySaint.subtitle")} checked={state.notifySaint} onChange={p("notifySaint")} />
              <ToggleRow label={t("rows.notifyKatameros.label")} subtitle={t("rows.notifyKatameros.subtitle")} checked={state.notifyKatameros} onChange={p("notifyKatameros")} />
              
              <SectionLabel>{t("labels.church")}</SectionLabel>
              <ToggleRow label={t("rows.notifyMeetings.label")} subtitle={t("rows.notifyMeetings.subtitle")} checked={state.notifyMeetings} onChange={p("notifyMeetings")} />
              <ToggleRow label={t("rows.notifyEvents.label")} subtitle={t("rows.notifyEvents.subtitle")} checked={state.notifyTrips} onChange={p("notifyTrips")} />
              <ToggleRow label={t("rows.notifyServices.label")} subtitle={t("rows.notifyServices.subtitle")} checked={state.notifyPrayerRequests} onChange={p("notifyPrayerRequests")} />
              <ToggleRow label={t("rows.notifyDonations.label")} subtitle={t("rows.notifyDonations.subtitle")} checked={state.notifyComments} onChange={p("notifyComments")} />
              
              <SectionLabel>{t("labels.community")}</SectionLabel>
              <ToggleRow label={t("rows.notifyMessages.label")} subtitle={t("rows.notifyMessages.subtitle")} checked={state.notifyReplies} onChange={p("notifyReplies")} />
              <ToggleRow label={t("rows.notifyPrayerRequests.label")} subtitle={t("rows.notifyPrayerRequests.subtitle")} checked={state.notifyMentions} onChange={p("notifyMentions")} />
              <ToggleRow label={t("rows.notifyCommunity.label")} subtitle={t("rows.notifyCommunity.subtitle")} checked={state.notifyMentions} onChange={p("notifyMentions")} />
              <ToggleRow label={t("rows.notifyInteractions.label")} subtitle={t("rows.notifyInteractions.subtitle")} checked={state.notifyMentions} onChange={p("notifyMentions")} />
            </PremiumSectionCard>
          )}

          {/* 4. مركز الأمان */}
          {sectionVisible(search, t("sections.security.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="security"
              title={t("sections.security.title")}
              description={t("sections.security.description")}
              icon={Shield}
              accent="#3f9d6e"
              isOpen={sectionOpen("security")}
              onToggle={handleToggle}
            >
              <SectionLabel>{t("labels.accountProtection")}</SectionLabel>
              <ToggleRow label={t("rows.biometric.label")} subtitle={t("rows.biometric.subtitle")} checked={state.biometric} onChange={p("biometric")} />
              <ToggleRow label={t("rows.passkeys.label")} subtitle={t("rows.passkeys.subtitle")} checked={state.twoFactor} onChange={p("twoFactor")} />
              <ActionRow label={t("rows.changePassword.label")} subtitle={t("rows.changePassword.subtitle")} />
              <ToggleRow label={t("rows.twoFactor.label")} subtitle={t("rows.twoFactor.subtitle")} checked={state.twoFactor} onChange={p("twoFactor")} />
              
              <SectionLabel>{t("labels.accountRecovery")}</SectionLabel>
              <ActionRow label={t("rows.recoveryCodes.label")} subtitle={t("rows.recoveryCodes.subtitle")} />
              <ActionRow label={t("rows.trustedContact.label")} subtitle={t("rows.trustedContact.subtitle")} />
              <ActionRow label={t("rows.churchVerification.label")} subtitle={t("rows.churchVerification.subtitle")} />
              <ActionRow label={t("rows.recoveryEmail.label")} subtitle={t("rows.recoveryEmail.subtitle")} />
              <ActionRow label={t("rows.recoveryPhone.label")} subtitle={t("rows.recoveryPhone.subtitle")} />

              <SectionLabel>{t("labels.devicesAndSessions")}</SectionLabel>
              <ActionRow label={t("rows.registeredDevices.label")} subtitle={t("rows.registeredDevices.subtitle")} />
              <ActionRow label={t("rows.lastLogin.label")} subtitle={t("rows.lastLogin.subtitle")} />
              <ActionRow label={t("rows.logoutAllDevices.label")} subtitle={t("rows.logoutAllDevices.subtitle")} danger />

              <SectionLabel>{t("labels.securityGuarantees")}</SectionLabel>
              <ActionRow label={t("rows.howWeProtect.label")} subtitle={t("rows.howWeProtect.subtitle")} />
              <ActionRow label={t("rows.securityPolicy.label")} subtitle={t("rows.securityPolicy.subtitle")} />
              <ActionRow label={t("rows.currentSecurityLevel.label")} subtitle={t("rows.currentSecurityLevel.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 5. الخصوصية */}
          {sectionVisible(search, t("sections.privacy.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="privacy"
              title={t("sections.privacy.title")}
              description={t("sections.privacy.description")}
              icon={Eye}
              accent="#8a6ec1"
              isOpen={sectionOpen("privacy")}
              onToggle={handleToggle}
            >
              <SectionLabel>{t("labels.visibilityAndData")}</SectionLabel>
              <ToggleRow label={t("rows.hidePhone.label")} subtitle={t("rows.hidePhone.subtitle")} checked={state.hidePhone} onChange={p("hidePhone")} />
              <ToggleRow label={t("rows.hideEmail.label")} subtitle={t("rows.hideEmail.subtitle")} checked={state.hideEmail} onChange={p("hideEmail")} />
              <ToggleRow label={t("rows.hideChurch.label")} subtitle={t("rows.hideChurch.subtitle")} checked={state.hideChurch} onChange={p("hideChurch")} />
              <ToggleRow label={t("rows.hideBirthdate.label")} subtitle={t("rows.hideBirthdate.subtitle")} checked={state.hideBirthdate} onChange={p("hideBirthdate")} />

              <SectionLabel>{t("labels.privateMessages")}</SectionLabel>
              <SelectRow label={t("rows.whoCanMessage.label")} value={state.whoCanMessage} options={visibilityOptions} onChange={(v) => p("whoCanMessage")(v as SettingsState["whoCanMessage"])} />
              <ToggleRow label={t("rows.receivePrivateMessages.label")} subtitle={t("rows.receivePrivateMessages.subtitle")} checked={state.blockStrangers} onChange={p("blockStrangers")} />
              <SelectRow label={t("rows.autoDeleteMessages.label")} value={state.messageDeleteDuration} options={messageDurationOptions} onChange={(v) => p("messageDeleteDuration")(v as MessageDeleteDuration)} />

              <SectionLabel>{t("labels.dataManagement")}</SectionLabel>
              <ActionRow label={t("rows.downloadData.label")} subtitle={t("rows.downloadData.subtitle")} />
              <ActionRow label={t("rows.requestDataDeletion.label")} subtitle={t("rows.requestDataDeletion.subtitle")} danger />
              <ActionRow label={t("rows.deleteAccount.label")} subtitle={t("rows.deleteAccount.subtitle")} danger />

              <SectionLabel>{t("labels.blocking")}</SectionLabel>
              <ActionRow label={t("rows.blockedUsers.label")} subtitle={t("rows.blockedUsers.subtitle")} />
              <ActionRow label={t("rows.sentReports.label")} subtitle={t("rows.sentReports.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 6. تفضيلات القراءة */}
          {sectionVisible(search, t("sections.reading.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="reading"
              title={t("sections.reading.title")}
              description={t("sections.reading.description")}
              icon={BookOpen}
              accent="#1f8a5a"
              isOpen={sectionOpen("reading")}
              onToggle={handleToggle}
            >
              <SectionLabel>{t("labels.bible")}</SectionLabel>
              <SelectRow label={t("rows.bibleFontSize.label")} value={String(state.bibleFontSize)} options={fontSizeOptions} onChange={(v) => p("bibleFontSize")(Number(v))} />
              <SelectRow label={t("rows.bibleFontFamily.label")} value={state.bibleFontFamily} options={fontFamilyOptions} onChange={(v) => p("bibleFontFamily")(v as SettingsState["bibleFontFamily"])} />
              <SelectRow label={t("rows.bibleAutoscrollSpeed.label")} value={String(state.bibleAutoscrollSpeed)} options={scrollSpeedOptions} onChange={(v) => p("bibleAutoscrollSpeed")(Number(v))} />
              <ToggleRow label={t("rows.smartReadingMode.label")} subtitle={t("rows.smartReadingMode.subtitle")} checked={state.highContrast} onChange={p("highContrast")} />
              <ToggleRow label={t("rows.reduceMotion.label")} subtitle={t("rows.reduceMotion.subtitle")} checked={!state.haptics} onChange={(v) => p("haptics")(!v)} />

              <SectionLabel>{t("labels.spiritualPrefs")}</SectionLabel>
              <ActionRow label={t("rows.biblePreferredTranslation.label")} subtitle={t("rows.biblePreferredTranslation.subtitle")} />
              <ToggleRow label={t("rows.showDiacritics.label")} subtitle={t("rows.showDiacritics.subtitle")} checked={state.bibleShowVerseNumbers} onChange={p("bibleShowVerseNumbers")} />
              <ToggleRow label={t("rows.bibleSaveLastRead.label")} subtitle={t("rows.bibleSaveLastRead.subtitle")} checked={state.bibleSaveLastRead} onChange={p("bibleSaveLastRead")} />
            </PremiumSectionCard>
          )}

          {/* 7. كنيستي */}
          {sectionVisible(search, t("sections.myChurch.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="myChurch"
              title={t("sections.myChurch.title")}
              description={t("sections.myChurch.description")}
              icon={Church}
              accent="#c9a05a"
              isOpen={sectionOpen("myChurch")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.currentChurch.label")} subtitle={t("rows.currentChurch.subtitle")} />
              <ActionRow label={t("rows.membershipStatus.label")} subtitle={t("rows.membershipStatus.subtitle")} />
              <ActionRow label={t("rows.joinRequests.label")} subtitle={t("rows.joinRequests.subtitle")} />
              <ActionRow label={t("rows.transferRequests.label")} subtitle={t("rows.transferRequests.subtitle")} />
              <ActionRow label={t("rows.rolesAndServices.label")} subtitle={t("rows.rolesAndServices.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 8. التخزين والبيانات */}
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
              <ActionRow label={t("rows.dataUsage.label")} subtitle={t("rows.dataUsage.subtitle")} />
              <ActionRow label={t("rows.manageDownloads.label")} subtitle={t("rows.manageDownloads.subtitle")} />
              <ActionRow label={t("rows.clearTempFiles.label")} subtitle={t("rows.clearTempFiles.subtitle")} onClick={clearCache} />
              <ActionRow label={t("rows.cleanStorage.label")} subtitle={t("rows.cleanStorage.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 9. المركز القانوني */}
          {sectionVisible(search, t("sections.legal.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="legal"
              title={t("sections.legal.title")}
              description={t("sections.legal.description")}
              icon={Scale}
              accent="#7a5c9e"
              isOpen={sectionOpen("legal")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.privacyPolicy.label")} subtitle={t("rows.privacyPolicy.subtitle")} />
              <ActionRow label={t("rows.termsConditions.label")} subtitle={t("rows.termsConditions.subtitle")} />
              <ActionRow label={t("rows.communityGuidelines.label")} subtitle={t("rows.communityGuidelines.subtitle")} />
              <ActionRow label={t("rows.securityGuaranteesLegal.label")} subtitle={t("rows.securityGuaranteesLegal.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 10. الدعم والتواصل */}
          {sectionVisible(search, t("sections.support.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="support"
              title={t("sections.support.title")}
              description={t("sections.support.description")}
              icon={LifeBuoy}
              accent="#b8893a"
              isOpen={sectionOpen("support")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.reportProblem.label")} subtitle={t("rows.reportProblem.subtitle")} />
              <ActionRow label={t("rows.suggestFeature.label")} subtitle={t("rows.suggestFeature.subtitle")} />
              <ActionRow label={t("rows.contactUs.label")} subtitle={t("rows.contactUs.subtitle")} />
              <ActionRow label={t("rows.faq.label")} subtitle={t("rows.faq.subtitle")} />
            </PremiumSectionCard>
          )}

          {/* 11. حول Alpha */}
          {sectionVisible(search, t("sections.about.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="about"
              title={t("sections.about.title")}
              description={t("sections.about.description")}
              icon={Headphones}
              accent="#8a5a14"
              isOpen={sectionOpen("about")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.appVersion.label")} subtitle={t("rows.appVersion.subtitle")} />
              <ActionRow label={t("rows.changelog.label")} subtitle={t("rows.changelog.subtitle")} />
              <ActionRow label={t("rows.appInfo.label")} subtitle={t("rows.appInfo.subtitle")} />
              <ActionRow label={t("rows.openSourceLicenses.label")} subtitle={t("rows.openSourceLicenses.subtitle")} />
              
              {/* TEMP DEV ACCESS ONLY - REMOVE BEFORE PRODUCTION */}
              <button
                type="button"
                onClick={() => setOwnerPinOpen(true)}
                className="mt-4 mx-4 mb-2 flex w-[calc(100%-2rem)] flex-col items-center gap-0.5 rounded-2xl border-2 border-dashed border-[#b85450]/50 bg-[#b85450]/10 px-4 py-3 active:scale-[0.98]"
              >
                <span className="text-[11px] font-extrabold text-[#8b3a36]">{t("devAccess.title")}</span>
                <span className="text-[10px] font-bold text-[#8b3a36]/80">{t("devAccess.subtitle")}</span>
              </button>
            </PremiumSectionCard>
          )}

          {/* 12. تسجيل الخروج */}
          {sectionVisible(search, t("sections.logout.keywords", { returnObjects: true }) as string[]) && (
            <PremiumSectionCard
              id="logout"
              title={t("sections.logout.title")}
              description={t("sections.logout.description")}
              icon={Moon} // Not sure what icon to use, maybe just a generic one. Let's use Moon for now or remove. Actually, we can use Shield or just render buttons directly.
              accent="#c14545"
              isOpen={sectionOpen("logout")}
              onToggle={handleToggle}
            >
              <ActionRow label={t("rows.logoutThisDevice.label")} subtitle={t("rows.logoutThisDevice.subtitle")} danger />
              <ActionRow label={t("rows.logoutAllDevicesAction.label")} subtitle={t("rows.logoutAllDevicesAction.subtitle")} danger />
            </PremiumSectionCard>
          )}
        </div>

        <div className="mt-10 mb-8 flex flex-col items-center justify-center text-center">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.15em] leading-none"
            style={{
              background: "linear-gradient(90deg, #9a7a42 0%, #d4a857 38%, #e8c878 62%, #9a7a42 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 6px rgba(212,168,87,0.28))",
            }}
            aria-label={ALPHA_OFFICIAL_SLOGAN}
          >
            {ALPHA_OFFICIAL_SLOGAN}
          </p>
          <p className="mt-2.5 text-[11px] font-semibold text-[#8a5a14]">
            Alpha Coptic
          </p>
          <p className="mt-0.5 text-[10px] text-[#9a7e5a]">
            Version 1.0
          </p>
        </div>
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
