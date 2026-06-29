import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Church, Eye, User, ChevronRight } from "lucide-react";
import { AlphaDatePicker } from "@/components/controls/AlphaDatePicker";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { ControlCenterScreenBackground } from "@/features/settings/components/ControlCenterScreenBackground";
import { getAlphaRoleSync, useAlphaAuth } from "@/features/auth";
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
import {
  mapProfileAvatarUploadError,
  persistProfileAvatarUrl,
  uploadProfileAvatarFromDataUrl,
} from "./profile-avatar-api";
import { refreshAuthContext } from "@/features/auth";
import { writeSettingsState } from "@/features/settings/settings-store";
import { usePlatformModules } from "@/lib/platform-modules";
import { cn } from "@/lib/utils";

const FIELD_INPUT_CLS =
  "w-full rounded-xl border border-alpha/60 bg-white/55 px-3.5 py-2.5 text-[13px] font-semibold text-alpha shadow-[inset_0_1px_2px_rgba(120,80,30,0.05)] outline-none backdrop-blur-sm focus:border-alpha-gold-bright/50 focus:bg-white/72";

type EditSectionId = "personal" | "privacy" | "church";

const SECTION_ACCENT: Record<EditSectionId, string> = {
  personal: "var(--alpha-accent-purple-deep)",
  privacy: "var(--alpha-accent-green-deep)",
  church: "var(--alpha-accent-purple-deep)",
};

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
      className={cn(
        "relative overflow-hidden rounded-[var(--alpha-radius-card-compact)] border backdrop-blur-xl alpha-motion-standard",
        isOpen ? "border-alpha/95" : "border-alpha/80",
      )}
      style={{
        background:
          "linear-gradient(to bottom, color-mix(in srgb, var(--alpha-bg-elevated) 97%, transparent), color-mix(in srgb, var(--alpha-bg-base) 95%, transparent))",
        boxShadow: isOpen
          ? `0 22px 44px -20px rgba(120,80,30,0.38), 0 0 28px -14px color-mix(in srgb, ${accent} 28%, transparent), inset 0 1px 0 rgba(255,255,255,0.9)`
          : "0 14px 30px -22px rgba(120,80,30,0.22), inset 0 1px 0 rgba(255,255,255,0.82)",
      }}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 rounded-t-[var(--alpha-radius-card-compact)] bg-gradient-to-b to-transparent transition-all",
          isOpen ? "h-[52%] from-white/55" : "h-[42%] from-white/40",
        )}
      />
      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        className="relative flex w-full items-center gap-3 px-4 py-3.5 text-right active:bg-white/25"
        dir="rtl"
        aria-expanded={isOpen}
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 38%, var(--alpha-border))`,
            background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 14%, white), color-mix(in srgb, ${accent} 6%, var(--alpha-bg-elevated)))`,
            color: accent,
          }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold" style={{ color: accent }}>
            {title}
          </p>
          <p className="mt-0.5 text-[10px] text-alpha-field-label">{subtitle}</p>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-alpha-gold-deep/55 transition-transform",
            isOpen ? "-rotate-90" : "rotate-90",
          )}
        />
      </button>
      {isOpen ? (
        <div className="relative border-t border-alpha/50 bg-white/12 px-4 py-3 space-y-3 backdrop-blur-sm">{children}</div>
      ) : null}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-alpha-field-label mb-1">{children}</p>;
}

function FieldTextArea({
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
      className="w-full resize-none rounded-xl border border-alpha/60 bg-white/55 px-3 py-2.5 text-right text-[13px] leading-relaxed text-alpha placeholder:text-alpha-muted/45 outline-none backdrop-blur-sm focus:border-alpha-gold-bright/50 focus:bg-white/72 shadow-[inset_0_1px_2px_rgba(120,80,30,0.05)]"
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
    <div className="rounded-xl border border-alpha/55 bg-white/42 px-3 py-2.5 backdrop-blur-sm" dir="rtl">
      <p className="mb-2 text-[12px] font-extrabold text-alpha-section-purple">{label}</p>
      <div className="flex flex-wrap justify-end gap-1.5">
        {VISIBILITY_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[9.5px] font-extrabold transition-all active:scale-95",
              value === o.value ? "alpha-chip-selected-green" : "alpha-chip-unselected",
            )}
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-alpha/55 bg-white/42 px-3 py-2.5 backdrop-blur-sm" dir="rtl">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors active:scale-95"
        style={{
          background: checked
            ? "linear-gradient(160deg, var(--alpha-accent-green), var(--alpha-accent-green-deep))"
            : "color-mix(in srgb, var(--alpha-border) 65%, white)",
        }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(120,80,30,0.18)] transition-[right]"
          style={{ right: checked ? "2px" : "22px" }}
        />
      </button>
      <div className="min-w-0 text-right">
        <p className="text-[12px] font-extrabold text-alpha-section-purple">{label}</p>
        {subtitle ? <p className="mt-0.5 text-[9.5px] text-alpha-field-label">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-alpha/55 bg-white/45 px-3 py-2.5 text-right backdrop-blur-sm" dir="rtl">
      <p className="text-[9.5px] font-bold text-alpha-field-label">{label}</p>
      <p className="mt-0.5 text-[13px] font-extrabold text-alpha-field-value">{value}</p>
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
  return <ProfileEditScreenContent />;
}

function ProfileEditScreenContent() {
  const { goBack } = useAlphaNavigation();
  const { user } = useAlphaAuth();
  const displayName = user?.displayName?.trim() || "مستخدم Alpha";
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<EditSectionId | null>("personal");

  const toggleSection = (id: EditSectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const patchDraft = (partial: Partial<ProfileUserState>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  };

  const draftAvatar = useMemo(
    () => resolveProfileAvatar(draft.customAvatarUrl, user?.avatarUrl ?? ""),
    [draft.customAvatarUrl, user?.avatarUrl],
  );

  const { openPicker, input: avatarFileInput } = useAvatarFilePicker((dataUrl) => {
    setCropSource(dataUrl);
    setCropOpen(true);
  });

  useEffect(() => {
    if (!dirty) {
      setDraft(saved);
    }
  }, [saved, dirty]);

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

  const handleSave = async () => {
    setSaveError(null);
    let nextDraft = draft;

    if (draft.customAvatarUrl?.startsWith("data:") && user?.id) {
      try {
        const publicUrl = await uploadProfileAvatarFromDataUrl(user.id, draft.customAvatarUrl);
        await persistProfileAvatarUrl(user.id, publicUrl);
        nextDraft = { ...draft, customAvatarUrl: publicUrl };
      } catch (err) {
        setSaveError(mapProfileAvatarUploadError(err));
        return;
      }
    }

    replace(nextDraft);
    writeSettingsState({ hidePhone: draft.hidePhone });
    setDirty(false);
    setSavedFlash(true);
    await refreshAuthContext();
    void import("@/lib/user-sync-scheduler").then(({ flushUserDataSync }) => flushUserDataSync());
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
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base">
      <ControlCenterScreenBackground />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[9] bg-[var(--alpha-bg-radial)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[8] bg-[var(--alpha-bg-bloom)]" />
      <CopticWatermark />
      {avatarFileInput}

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-44">
        <header className="flex items-center justify-between gap-2 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-alpha bg-alpha-surface text-alpha shadow-[var(--alpha-shadow-mini)] backdrop-blur-xl active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h1 className="font-arabic-serif text-[16px] font-extrabold text-alpha-section-purple">تحرير الملف الشخصي</h1>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty && !savedFlash}
            className="rounded-full px-3.5 py-2 text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-40"
            style={{
              background: savedFlash
                ? "linear-gradient(160deg, rgba(52,211,153,0.85), rgba(16,120,80,0.75))"
                : dirty
                  ? "linear-gradient(160deg, var(--alpha-gold-bright), var(--alpha-gold-deep))"
                  : "color-mix(in srgb, var(--alpha-bg-elevated) 88%, white)",
              border: `1px solid ${savedFlash ? "rgba(52,211,153,0.45)" : "color-mix(in srgb, var(--alpha-gold-deep) 45%, var(--alpha-border))"}`,
              color: savedFlash ? "#fff" : dirty ? "var(--alpha-btn-primary-text)" : "var(--alpha-text-muted)",
              boxShadow: dirty && !savedFlash ? "0 4px 14px -6px rgba(120,80,30,0.35)" : undefined,
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

        {saveError ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-300/60 bg-red-50/90 px-3 py-2.5 text-[12px] font-semibold text-red-800"
          >
            {saveError}
          </div>
        ) : null}

        <div className="space-y-3">
          <EditSection
            sectionId="personal"
            isOpen={openSection === "personal"}
            onToggle={toggleSection}
            icon={User}
            title="المعلومات الشخصية"
            subtitle="الصورة والاسم والنبذة"
            accent={SECTION_ACCENT.personal}
          >
            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <p className="text-[12px] font-extrabold text-alpha-heading">{displayName}</p>
                <p className="text-[9.5px] text-alpha-muted">اضغط على الصورة للتعديل</p>
              </div>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen(true)}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-alpha-gold-bright/55 shadow-[0_4px_14px_-6px_rgba(120,80,30,0.35)] active:scale-95"
              >
                {draftAvatar ? (
                  <img src={draftAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span
                    className="grid h-full w-full place-items-center text-lg font-extrabold text-alpha-gold-deep"
                    style={{
                      background:
                        "linear-gradient(155deg, color-mix(in srgb, var(--alpha-gold-bright) 28%, white), color-mix(in srgb, var(--alpha-gold-deep) 12%, var(--alpha-bg-elevated)))",
                    }}
                  >
                    {displayName.charAt(0)}
                  </span>
                )}
              </button>
            </div>
            <div>
              <FieldLabel>النبذة الشخصية</FieldLabel>
              <FieldTextArea
                value={draft.bio}
                onChange={(v) => patchDraft({ bio: v })}
                placeholder="اكتب نبذة قصيرة عنك..."
              />
            </div>
            <div>
              <FieldLabel>تاريخ الميلاد (اختياري)</FieldLabel>
              <AlphaDatePicker
                value={draft.birthDate ?? ""}
                onChange={(v) => patchDraft({ birthDate: v || null })}
                title="تاريخ الميلاد"
                placeholder="اختر تاريخ الميلاد"
                maxYear={new Date().getFullYear()}
                className={FIELD_INPUT_CLS}
              />
            </div>
            <ReadOnlyRow label="الاسم" value={displayName} />
            <p className="text-[9px] text-alpha-muted/70 text-right">تعديل الاسم من إعدادات الحساب قريباً</p>
          </EditSection>

          <EditSection
            sectionId="privacy"
            isOpen={openSection === "privacy"}
            onToggle={toggleSection}
            icon={Eye}
            title="خصوصية الملف الشخصي"
            subtitle="من يرى كل بند على ملفك"
            accent={SECTION_ACCENT.privacy}
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
            accent={SECTION_ACCENT.church}
          >
            <ReadOnlyRow label="الكنيسة الحالية" value={memberChurch?.name ?? "لم تُحدد بعد"} />
            <ReadOnlyRow label="الإيبارشية" value={memberChurch?.diocese ?? "—"} />
            <ReadOnlyRow label="الرتبة / الخدمة" value={roleLabel} />
            <Link
              to="/church/directory"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-alpha-gold-deep/35 bg-gradient-to-l from-[color-mix(in_srgb,var(--alpha-gold-bright)_18%,white)] to-[color-mix(in_srgb,var(--alpha-gold-deep)_8%,white)] px-3 py-2.5 text-[11px] font-extrabold text-alpha-gold-deep shadow-[0_4px_12px_-6px_rgba(120,80,30,0.25)] active:scale-[0.98]"
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
