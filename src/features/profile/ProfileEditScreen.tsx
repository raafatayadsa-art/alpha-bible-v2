import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Church, Eye, User, ChevronRight } from "lucide-react";
import { AlphaDatePicker } from "@/components/controls/AlphaDatePicker";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { getAlphaRoleSync } from "@/features/auth";
import { getCurrentUser } from "@/features/church/current-user";
import { useMemberChurch } from "@/features/church/use-member-church";
import { ProfileAvatarMenu, ProfileAvatarViewer, useAvatarFilePicker } from "./ProfileAvatarMenu";
import { ProfileAvatarCropEditor } from "./ProfileAvatarCropEditor";
import { roleLabelAr } from "./profile-role";
import {
  VISIBILITY_OPTIONS,
  type ProfileFieldPrivacy,
  type ProfileVisibility,
} from "./profile-privacy";
import { resolveProfileAvatar, useProfileUser, type ProfileUserState } from "./profile-user-store";
import { writeSettingsState } from "@/features/settings/settings-store";
import { usePlatformModules } from "@/lib/platform-modules";

const CARD_BG = "linear-gradient(155deg, rgba(26,16,8,0.92) 0%, rgba(30,20,12,0.88) 100%)";
const DARK_DATE_CLS =
  "w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-[13px] font-semibold text-white/85 shadow-none backdrop-blur-none outline-none focus:border-[#f0d78c]/40";

type EditSectionId = "personal" | "privacy" | "church";

function EditSection({
  sectionId,
  isOpen,
  onToggle,
  icon: Icon,
  title,
  subtitle,
  accent,
  children,
}: {
  sectionId: EditSectionId;
  isOpen: boolean;
  onToggle: (id: EditSectionId) => void;
  icon: typeof User;
  title: string;
  subtitle: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="overflow-hidden rounded-[20px] border"
      style={{ borderColor: `${accent}33`, background: CARD_BG }}
    >
      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right active:bg-white/5"
        dir="rtl"
        aria-expanded={isOpen}
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
          style={{ borderColor: `${accent}44`, background: `${accent}18`, color: accent }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-white/90">{title}</p>
          <p className="mt-0.5 text-[10px] text-white/45">{subtitle}</p>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${isOpen ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
      {isOpen ? (
        <div className="border-t border-white/8 px-4 py-3 space-y-3">{children}</div>
      ) : null}
    </section>
  );
}

function DarkLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-white/45 mb-1">{children}</p>;
}

function DarkTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir="rtl"
      rows={3}
      className="w-full resize-none rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-right text-[13px] leading-relaxed text-white/85 placeholder:text-white/30 outline-none focus:border-[#f0d78c]/40"
    />
  );
}

function PrivacyFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ProfileVisibility;
  onChange: (v: ProfileVisibility) => void;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5" dir="rtl">
      <p className="mb-2 text-[12px] font-extrabold text-white/85">{label}</p>
      <div className="flex flex-wrap justify-end gap-1.5">
        {VISIBILITY_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-full px-2.5 py-1 text-[9.5px] font-extrabold transition-all active:scale-95"
            style={{
              border: `1px solid ${value === o.value ? "#f0d78c" : "rgba(255,255,255,0.1)"}`,
              background: value === o.value ? "rgba(240,215,140,0.18)" : "rgba(0,0,0,0.2)",
              color: value === o.value ? "#f0d78c" : "rgba(255,255,255,0.5)",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PrivacyToggleRow({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5" dir="rtl">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors active:scale-95"
        style={{
          background: checked ? "rgba(240,215,140,0.45)" : "rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[right]"
          style={{ right: checked ? "2px" : "22px" }}
        />
      </button>
      <div className="min-w-0 text-right">
        <p className="text-[12px] font-extrabold text-white/85">{label}</p>
        {subtitle ? <p className="mt-0.5 text-[9.5px] text-white/40">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2.5 text-right" dir="rtl">
      <p className="text-[9.5px] font-bold text-white/40">{label}</p>
      <p className="mt-0.5 text-[13px] font-extrabold text-white/85">{value}</p>
    </div>
  );
}

const PRIVACY_FIELDS: { key: keyof ProfileFieldPrivacy; label: string }[] = [
  { key: "avatar", label: "الصورة الشخصية" },
  { key: "bio", label: "النبذة الشخصية" },
  { key: "achievements", label: "الإنجازات والشارات" },
  { key: "spiritualStats", label: "الإحصائيات الروحية" },
  { key: "church", label: "الكنيسة وكارت كنيستي" },
  { key: "birthDate", label: "تاريخ الميلاد" },
  { key: "family", label: "أفراد العائلة" },
  { key: "peopleConnect", label: "التواصل مع الأشخاص" },
];

export function ProfileEditScreen() {
  const { goBack } = useAlphaNavigation();
  const user = getCurrentUser();
  const displayName = user.name?.trim() || "مستخدم Alpha";
  const { church: memberChurch } = useMemberChurch();
  const { isModuleEnabled } = usePlatformModules();
  const communityOn = isModuleEnabled("community");
  const roleLabel = roleLabelAr(getAlphaRoleSync());
  const { state: saved, replace } = useProfileUser();

  const [draft, setDraft] = useState<ProfileUserState>(() => saved);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [avatarViewerOpen, setAvatarViewerOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<EditSectionId | null>("personal");

  const toggleSection = (id: EditSectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const patchDraft = (partial: Partial<ProfileUserState>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  };

  const draftAvatar = useMemo(
    () => resolveProfileAvatar(draft.customAvatarUrl, user.avatarUrl),
    [draft.customAvatarUrl, user.avatarUrl],
  );

  const { openPicker, input: avatarFileInput } = useAvatarFilePicker((dataUrl) => {
    setCropSource(dataUrl);
    setCropOpen(true);
  });

  useEffect(() => {
    setDraft(saved);
    setDirty(false);
  }, [saved]);

  const patchDraftPrivacy = <K extends keyof ProfileFieldPrivacy>(
    key: K,
    value: ProfileFieldPrivacy[K],
  ) => {
    setDraft((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
    setDirty(true);
  };

  const handleSave = () => {
    replace(draft);
    writeSettingsState({ hidePhone: draft.hidePhone });
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const visiblePrivacyFields = useMemo(
    () =>
      PRIVACY_FIELDS.filter((field) => {
        if (!communityOn && (field.key === "church" || field.key === "family" || field.key === "peopleConnect")) {
          return false;
        }
        if (!communityOn && field.key === "spiritualStats") return false;
        return true;
      }),
    [communityOn],
  );

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: "linear-gradient(180deg,#0e0a06 0%,#1a1208 55%,#120c08 100%)" }}
    >
      <CopticWatermark />
      <HeroLedgerStylesHost />
      {avatarFileInput}

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-44">
        <header className="flex items-center justify-between gap-2 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xl active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h1 className="text-[16px] font-extrabold text-white/90">تحرير الملف الشخصي</h1>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty && !savedFlash}
            className="rounded-full px-3.5 py-2 text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-40"
            style={{
              background: savedFlash
                ? "rgba(31,170,106,0.35)"
                : dirty
                  ? "linear-gradient(135deg,rgba(240,215,140,0.28),rgba(0,0,0,0.35))"
                  : "rgba(255,255,255,0.08)",
              border: `1px solid ${savedFlash ? "rgba(31,170,106,0.5)" : "rgba(240,215,140,0.35)"}`,
              color: savedFlash ? "#8fe8b8" : "#f0d78c",
            }}
          >
            {savedFlash ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                تم الحفظ
              </span>
            ) : (
              "حفظ"
            )}
          </button>
        </header>

        <div className="space-y-3">
          <EditSection
            sectionId="personal"
            isOpen={openSection === "personal"}
            onToggle={toggleSection}
            icon={User}
            title="المعلومات الشخصية"
            subtitle="الصورة والاسم والنبذة"
            accent="#5b9fd8"
          >
            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <p className="text-[12px] font-extrabold text-white/85">{displayName}</p>
                <p className="text-[9.5px] text-white/40">اضغط على الصورة للتعديل</p>
              </div>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen(true)}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#f0d78c]/45 active:scale-95"
              >
                {draftAvatar ? (
                  <img src={draftAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[#2a1f45] text-lg font-extrabold text-[#f0d78c]">
                    {displayName.charAt(0)}
                  </span>
                )}
              </button>
            </div>
            <div>
              <DarkLabel>النبذة الشخصية</DarkLabel>
              <DarkTextArea
                value={draft.bio}
                onChange={(v) => patchDraft({ bio: v })}
                placeholder="اكتب نبذة قصيرة عنك..."
              />
            </div>
            <div>
              <DarkLabel>تاريخ الميلاد (اختياري)</DarkLabel>
              <AlphaDatePicker
                value={draft.birthDate ?? ""}
                onChange={(v) => patchDraft({ birthDate: v || null })}
                title="تاريخ الميلاد"
                placeholder="اختر تاريخ الميلاد"
                maxYear={new Date().getFullYear()}
                className={DARK_DATE_CLS}
              />
            </div>
            <ReadOnlyRow label="الاسم" value={displayName} />
            <p className="text-[9px] text-white/35 text-right">تعديل الاسم من إعدادات الحساب قريباً</p>
          </EditSection>

          <EditSection
            sectionId="privacy"
            isOpen={openSection === "privacy"}
            onToggle={toggleSection}
            icon={Eye}
            title="خصوصية الملف الشخصي"
            subtitle="من يرى كل بند على ملفك"
            accent="#8a6ec1"
          >
            <PrivacyToggleRow
              label="إخفاء رقم هاتفي"
              subtitle="لن يظهر رقمك للآخرين في التطبيق"
              checked={draft.hidePhone}
              onChange={(v) => patchDraft({ hidePhone: v })}
            />
            {visiblePrivacyFields.map((field) => (
              <PrivacyFieldRow
                key={field.key}
                label={field.label}
                value={draft.privacy[field.key]}
                onChange={(v) => patchDraftPrivacy(field.key, v)}
              />
            ))}
          </EditSection>

          {communityOn ? (
          <EditSection
            sectionId="church"
            isOpen={openSection === "church"}
            onToggle={toggleSection}
            icon={Church}
            title="بيانات الكنيسة"
            subtitle="معلومات العضوية — للعرض"
            accent="#c98a3c"
          >
            <ReadOnlyRow label="الكنيسة الحالية" value={memberChurch?.name ?? "لم تُحدد بعد"} />
            <ReadOnlyRow label="الإيبارشية" value={memberChurch?.diocese ?? "—"} />
            <ReadOnlyRow label="الرتبة / الخدمة" value={roleLabel} />
            <Link
              to="/church/directory"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#f0d78c]/30 bg-[#f0d78c]/10 px-3 py-2.5 text-[11px] font-extrabold text-[#f0d78c] active:scale-[0.98]"
            >
              طلب نقل الكنيسة
            </Link>
          </EditSection>
          ) : null}
        </div>
      </div>

      <ProfileAvatarMenu
        open={avatarMenuOpen}
        avatarUrl={draftAvatar}
        name={displayName}
        onClose={() => setAvatarMenuOpen(false)}
        onView={() => setAvatarViewerOpen(true)}
        onChange={openPicker}
      />
      <ProfileAvatarViewer
        open={avatarViewerOpen}
        avatarUrl={draftAvatar}
        name={displayName}
        onClose={() => setAvatarViewerOpen(false)}
      />
      <ProfileAvatarCropEditor
        open={cropOpen}
        imageSrc={cropSource}
        onClose={() => {
          setCropOpen(false);
          setCropSource(null);
        }}
        onConfirm={(dataUrl) => {
          patchDraft({ customAvatarUrl: dataUrl });
          setCropOpen(false);
          setCropSource(null);
        }}
      />

      {!cropOpen ? <BottomDock /> : null}
    </div>
  );
}
