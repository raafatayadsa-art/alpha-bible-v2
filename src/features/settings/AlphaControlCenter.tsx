import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation";
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
  securityLabel,
  useSettings,
  type MessageDeleteDuration,
  type SettingsState,
} from "./settings-store";
import { AboutAlphaAppCard } from "@/features/platform-admin/AboutAlphaAppCard";
import { OwnerAccessPinSheet } from "@/features/platform-admin/OwnerAccessPinSheet";
import { grantOwnerSession } from "@/features/platform-admin/owner-access-store";

function sectionVisible(query: string, keywords: string[]): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return keywords.some((k) => k.toLowerCase().includes(q));
}

export function AlphaControlCenter() {
  const navigate = useNavigate();
  const { state, patch, clearCache } = useSettings();
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [ownerPinOpen, setOwnerPinOpen] = useState(false);
  const score = computeSecurityScore(state);
  const scoreLabel = securityLabel(score);
  const isDark = state.themeMode === "dark";

  const syncLabel = useMemo(
    () => new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const p = <K extends keyof SettingsState>(key: K) => (v: SettingsState[K]) => patch(key, v);

  const handleToggle = useCallback((id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  }, []);

  const sectionOpen = useCallback((id: string) => openSection === id, [openSection]);

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 0%, rgba(231,201,122,0.35), transparent 60%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#ecdcb6 100%)",
        }}
      />
      <CopticWatermark subtle />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),10px)]">
        <AlphaHeaderShell className="pb-0">
          <AlphaHeader variant="internal" title="مركز التحكم" />
        </AlphaHeaderShell>

        {sectionVisible(search, ["مركز", "تحكم", "أمان", "خصوصية", "hero", "score"]) && (
          <div className="mt-4">
            <ControlCenterHero
              score={score}
              scoreLabel={scoreLabel}
              devices={state.registeredDevices}
              verified={state.verified}
            />
          </div>
        )}

        <SettingsSearch value={search} onChange={setSearch} />

        <div className="space-y-0.5">
          {sectionVisible(search, ["خصوصية", "أمان", "كلمة", "جهاز", "face", "touch", "تحقق", "حظر", "رسائل"]) && (
            <PremiumSectionCard
              id="privacy"
              title="الخصوصية والأمان"
              description="تحكم كامل في الخصوصية والحماية والحساب"
              icon={Shield}
              accent="#3f9d6e"
              isOpen={sectionOpen("privacy")}
              onToggle={handleToggle}
            >
              <SectionLabel>الأمان</SectionLabel>
              <ToggleRow label="Face ID / Touch ID" subtitle="فتح التطبيق بالبصمة" checked={state.biometric} onChange={p("biometric")} />
              <ToggleRow label="التحقق بخطوتين" subtitle="حماية إضافية عند تسجيل الدخول" checked={state.twoFactor} onChange={p("twoFactor")} />
              <ActionRow label="الأجهزة المسجلة" subtitle={`${state.registeredDevices} أجهزة نشطة`} />
              <PasswordChangeForm />
              <ActionRow label="تسجيل الخروج من جميع الأجهزة" subtitle="إنهاء كل الجلسات النشطة" danger />
              <Divider />
              <SectionLabel>جلسات تسجيل الدخول النشطة</SectionLabel>
              <ActiveSessionsList />
              <ActionRow label="المستخدمون المحظورون" subtitle="إدارة قائمة الحظر" />
              <Divider />
              <SectionLabel>الخصوصية</SectionLabel>
              <SelectRow
                label="من يرى ملفي الشخصي"
                value={state.profileVisibility}
                options={[
                  { value: "everyone", label: "الجميع" },
                  { value: "church", label: "الكنيسة" },
                  { value: "friends", label: "الأصدقاء" },
                ]}
                onChange={(v) => p("profileVisibility")(v as SettingsState["profileVisibility"])}
              />
              <SelectRow
                label="من يستطيع مراسلتي"
                value={state.whoCanMessage}
                options={[
                  { value: "everyone", label: "الجميع" },
                  { value: "church", label: "الكنيسة" },
                  { value: "friends", label: "الأصدقاء" },
                ]}
                onChange={(v) => p("whoCanMessage")(v as SettingsState["whoCanMessage"])}
              />
              <ToggleRow label="إخفاء رقم الهاتف" checked={state.hidePhone} onChange={p("hidePhone")} />
              <ToggleRow label="إخفاء البريد الإلكتروني" checked={state.hideEmail} onChange={p("hideEmail")} />
              <ToggleRow label="إخفاء الكنيسة" checked={state.hideChurch} onChange={p("hideChurch")} />
              <ToggleRow label="إخفاء تاريخ الميلاد" checked={state.hideBirthdate} onChange={p("hideBirthdate")} />
              <Divider />
              <SectionLabel>رسائل خاصة</SectionLabel>
              <SelectRow
                label="مدة حذف الرسائل الافتراضية"
                value={state.messageDeleteDuration}
                options={[
                  { value: "after_view", label: "بعد المشاهدة" },
                  { value: "1h", label: "بعد ساعة" },
                  { value: "1d", label: "بعد يوم" },
                  { value: "1w", label: "بعد أسبوع" },
                ]}
                onChange={(v) => p("messageDeleteDuration")(v as MessageDeleteDuration)}
              />
              <ToggleRow label="منع استقبال رسائل الغرباء" checked={state.blockStrangers} onChange={p("blockStrangers")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["مظهر", "فاتح", "داكن", "dark", "theme"]) && (
            <PremiumSectionCard
              id="appearance"
              title="المظهر والقراءة"
              description="الوضع الفاتح والداكن وتجربة العرض"
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

          {sectionVisible(search, ["إشعار", "آية", "صلاة", "قديس", "قطمارس", "اجتماع", "رحلة", "تعليق"]) && (
            <PremiumSectionCard
              id="notifications"
              title="الإشعارات"
              description="إدارة جميع التنبيهات والإشعارات"
              icon={Bell}
              accent="#c98a3c"
              isOpen={sectionOpen("notifications")}
              onToggle={handleToggle}
            >
              <SectionLabel>روحيات</SectionLabel>
              <ToggleRow label="آية اليوم" checked={state.notifyVerse} onChange={p("notifyVerse")} />
              <ToggleRow label="صلاة اليوم" checked={state.notifyPrayer} onChange={p("notifyPrayer")} />
              <ToggleRow label="قديس اليوم" checked={state.notifySaint} onChange={p("notifySaint")} />
              <ToggleRow label="القطمارس" checked={state.notifyKatameros} onChange={p("notifyKatameros")} />
              <Divider />
              <SectionLabel>الكنيسة</SectionLabel>
              <ToggleRow label="الاجتماعات" checked={state.notifyMeetings} onChange={p("notifyMeetings")} />
              <ToggleRow label="الرحلات" checked={state.notifyTrips} onChange={p("notifyTrips")} />
              <ToggleRow label="طلبات الصلاة" checked={state.notifyPrayerRequests} onChange={p("notifyPrayerRequests")} />
              <Divider />
              <SectionLabel>المجتمع</SectionLabel>
              <ToggleRow label="التعليقات" checked={state.notifyComments} onChange={p("notifyComments")} />
              <ToggleRow label="الردود" checked={state.notifyReplies} onChange={p("notifyReplies")} />
              <ToggleRow label="الإشارات" checked={state.notifyMentions} onChange={p("notifyMentions")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["كتاب", "قراءة", "ترجمة", "آيات", "تمرير", "أجبية", "كنيسة"]) && (
            <PremiumSectionCard
              id="bible"
              title="الكتاب المقدس والأجبية"
              description="إعدادات المحتوى الروحي"
              icon={BookOpen}
              accent="#8a6ec1"
              isOpen={sectionOpen("bible")}
              onToggle={handleToggle}
            >
              <SelectRow
                label="حجم خط القراءة"
                value={String(state.bibleFontSize)}
                options={[
                  { value: "14", label: "صغير" },
                  { value: "16", label: "متوسط" },
                  { value: "18", label: "كبير" },
                  { value: "20", label: "أكبر" },
                ]}
                onChange={(v) => p("bibleFontSize")(Number(v))}
              />
              <SelectRow
                label="نوع خط القراءة"
                value={state.bibleFontFamily}
                options={[
                  { value: "serif", label: "Serif" },
                  { value: "sans", label: "Sans" },
                ]}
                onChange={(v) => p("bibleFontFamily")(v as SettingsState["bibleFontFamily"])}
              />
              <ToggleRow label="حفظ آخر قراءة" checked={state.bibleSaveLastRead} onChange={p("bibleSaveLastRead")} />
              <SelectRow
                label="سرعة التمرير التلقائي"
                value={String(state.bibleAutoscrollSpeed)}
                options={[
                  { value: "1", label: "بطيء" },
                  { value: "2", label: "متوسط" },
                  { value: "3", label: "سريع" },
                ]}
                onChange={(v) => p("bibleAutoscrollSpeed")(Number(v))}
              />
              <ActionRow label="الترجمة المفضلة" subtitle={state.biblePreferredTranslation} />
              <ToggleRow label="إظهار أرقام الآيات" checked={state.bibleShowVerseNumbers} onChange={p("bibleShowVerseNumbers")} />
              <Divider />
              <SectionLabel>تفضيلات روحية</SectionLabel>
              <LinkCard to="/church/directory" icon={Church} title="الكنائس المحفوظة" subtitle="كنائسك المفضلة" accent="#5b8fd1" />
              <ActionRow label="الكهنة المفضلون" subtitle="قائمة الكهنة المتابَعين" />
              <ActionRow label="الخدام المفضلون" subtitle="خدم وخدّام مميزون" />
              <ActionRow label="الاجتماعات المحفوظة" subtitle="اجتماعاتك القادمة" />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["صلاة", "تذكير", "صمت", "نوم", "باكر", "أجبية"]) && (
            <PremiumSectionCard
              id="prayer"
              title="الصلاة والتذكيرات"
              description="تذكيرات الصلاة والأجبية اليومية"
              icon={Clock}
              accent="#1f8a5a"
              isOpen={sectionOpen("prayer")}
              onToggle={handleToggle}
            >
              <ToggleRow label="تذكير الصلاة" checked={state.prayerReminder} onChange={p("prayerReminder")} />
              <ActionRow label="ساعات الصلاة المفضلة" subtitle="الإعداد قريباً" />
              <ToggleRow label="وضع الصمت أثناء الصلاة" checked={state.prayerSilentMode} onChange={p("prayerSilentMode")} />
              <ToggleRow label="تذكير صلاة النوم" checked={state.prayerBedtimeReminder} onChange={p("prayerBedtimeReminder")} />
              <ToggleRow label="تذكير صلاة باكر" checked={state.prayerMorningReminder} onChange={p("prayerMorningReminder")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["تخزين", "كاش", "مزامنة", "بيانات", "إنترنت", "محفوظ", "مجتمع"]) && (
            <PremiumSectionCard
              id="storage"
              title="التخزين والبيانات"
              description="إدارة التخزين والمزامنة"
              icon={Cloud}
              accent="#6a543a"
              isOpen={sectionOpen("storage")}
              onToggle={handleToggle}
            >
              <ActionRow label="حجم البيانات المحلية" subtitle="~24 ميجابايت" />
              <ActionRow label="مسح الكاش" subtitle="تحرير مساحة التخزين" onClick={clearCache} />
              <ActionRow label="مزامنة الآن" subtitle="مزامنة مع السحابة" />
              <ActionRow label="آخر مزامنة" subtitle={syncLabel} />
              <ActionRow label="تحميل المحتوى للاستخدام بدون إنترنت" subtitle="الكتاب المقدس والأجبية" />
              <Divider />
              <SectionLabel>المحتوى المحفوظ</SectionLabel>
              <ActionRow label="المحتوى المحفوظ" subtitle="منشورات ومواد محفوظة" />
              <ActionRow label="المنشورات المعجب بها" subtitle="تفاعلاتك في المجتمع" />
              <ActionRow label="طلبات الصداقة" subtitle="إدارة طلبات التواصل" />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["وصول", "تباين", "صوت", "اهتزاز", "حركة", "خط"]) && (
            <PremiumSectionCard
              id="a11y"
              title="إمكانية الوصول"
              description="تخصيص تجربة القراءة والتفاعل"
              icon={Eye}
              accent="#7a5c9e"
              isOpen={sectionOpen("a11y")}
              onToggle={handleToggle}
            >
              <ToggleRow label="تكبير الخط" checked={state.largeText} onChange={p("largeText")} />
              <ToggleRow label="التباين العالي" checked={state.highContrast} onChange={p("highContrast")} />
              <ToggleRow label="القراءة الصوتية" checked={state.screenReader} onChange={p("screenReader")} />
              <ToggleRow label="الاهتزازات" checked={state.haptics} onChange={p("haptics")} />
            </PremiumSectionCard>
          )}

          {sectionVisible(search, ["alpha", "إصدار", "خصوصية", "شروط", "دعم", "تقييم", "حول"]) && (
            <PremiumSectionCard
              id="about"
              title="حول Alpha"
              description="معلومات التطبيق والدعم الفني"
              icon={Headphones}
              accent="#b8893a"
              isOpen={sectionOpen("about")}
              onToggle={handleToggle}
            >
              <AboutAlphaAppCard onVersionUnlock={() => setOwnerPinOpen(true)} />
              {/* TEMP DEV ACCESS ONLY - REMOVE BEFORE PRODUCTION */}
              <button
                type="button"
                onClick={() => {
                  grantOwnerSession();
                  navigate({ to: "/platform" });
                }}
                className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-col items-center gap-0.5 rounded-2xl border-2 border-dashed border-[#b85450]/50 bg-[#b85450]/10 px-4 py-3 active:scale-[0.98]"
              >
                <span className="text-[11px] font-extrabold text-[#8b3a36]">Alpha Control Dev Access</span>
                <span className="text-[10px] font-bold text-[#8b3a36]/80">دخول مؤقت إلى Alpha Control · للتطوير فقط</span>
              </button>
              <p className="px-4 py-2 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-[#8a6a3a]">
                {ALPHA_OFFICIAL_SLOGAN}
              </p>
              <Divider />
              <ActionRow label="سياسة الخصوصية" />
              <ActionRow label="الشروط والأحكام" />
              <ActionRow label="الدعم الفني" />
              <ActionRow label="الإبلاغ عن مشكلة" />
              <ActionRow label="تقييم التطبيق" />
            </PremiumSectionCard>
          )}
        </div>

        <LogoutButton />

        <p className="mt-6 text-center text-[10px] text-[#9a7e5a]">ⲁⲗⲫⲁ · Alpha Coptic · مركز التحكم</p>
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
