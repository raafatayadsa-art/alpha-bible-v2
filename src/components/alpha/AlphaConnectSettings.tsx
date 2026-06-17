import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  MoreVertical,
  ShieldPlus,
  Fingerprint,
  RefreshCw,
  Mic,
  ShieldCheck,
  SignalHigh,
  Users,
  HardDrive,
  ChevronLeft,
  Check,
  Ban,
  Download,
  Trash2,
  Info,
  FileText,
  AlertCircle,
  Bluetooth,
  ChevronDown,
} from "lucide-react";
import {
  applyAlphaConnectSecurity,
  disableBiometricLock,
  enableBiometricLock,
  isSecurityLockEnabled,
  lockAlphaConnect,
  normalizeAlphaConnectSettings,
  SECURITY_PIN_LENGTH,
  verifySecurityPin,
} from "./alpha-connect-security";
import { normalizeRetentionPolicy } from "@/features/alpha-connect/retention";
import {
  ConnectCenterPopup,
  ConnectPinInput,
  ConnectPopupActions,
} from "./connect-code-ui";
import type { AlphaConnectThemeId } from "./alpha-connect-theme";
import { dispatchConnectThemeChanged, normalizeConnectTheme } from "./alpha-connect-theme";
import { AlphaConnectLogo } from "./AlphaConnectLogo";

type CodePopup = "create" | "reset-verify" | "reset-confirm" | null;

/* ─── Settings model (frontend-only) ─────────────────────────── */

export type AudioOutput = "earpiece" | "speaker" | "bluetooth";
export type WhoCanCall = "all" | "friends" | "church" | "none";
export type EphemeralDelete = "on_read" | "1h" | "6h" | "12h" | "24h" | "3d" | "7d";
export type CallQuality = "auto" | "economy" | "high";

export type AlphaConnectSettingsState = {
  micSensitivity: number;
  noiseMute: boolean;
  echoCancel: boolean;
  audioEnhance: boolean;
  audioOutput: AudioOutput;
  pttHoldMs: number;
  vibrateStart: boolean;
  vibrateEnd: boolean;
  soundStart: boolean;
  soundEnd: boolean;
  backgroundMode: boolean;
  whoCanCall: WhoCanCall;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowVoiceMessages: boolean;
  ephemeralDelete: EphemeralDelete;
  saveImportantOnly: boolean;
  groupNotifications: boolean;
  allowGroupAdd: boolean;
  groupBroadcast: boolean;
  callQuality: CallQuality;
  fingerprintLock: boolean;
  faceIdLock: boolean;
  securityPin: string;
  blockScreenshots: boolean;
  screenshotAlert: boolean;
  cacheSizeMb: number;
  voiceSizeMb: number;
  theme: AlphaConnectThemeId;
};

export const ALPHA_CONNECT_SETTINGS_KEY = "alpha_connect_settings_v2";

export const DEFAULT_ALPHA_CONNECT_SETTINGS: AlphaConnectSettingsState = {
  micSensitivity: 68,
  noiseMute: true,
  echoCancel: true,
  audioEnhance: true,
  audioOutput: "earpiece",
  pttHoldMs: 320,
  vibrateStart: true,
  vibrateEnd: true,
  soundStart: true,
  soundEnd: false,
  backgroundMode: true,
  whoCanCall: "church",
  showOnlineStatus: true,
  showLastSeen: false,
  allowVoiceMessages: true,
  ephemeralDelete: "24h",
  saveImportantOnly: true,
  groupNotifications: true,
  allowGroupAdd: false,
  groupBroadcast: true,
  callQuality: "auto",
  fingerprintLock: false,
  faceIdLock: false,
  securityPin: "",
  blockScreenshots: true,
  screenshotAlert: true,
  cacheSizeMb: 42.6,
  voiceSizeMb: 128.4,
  theme: "secure",
};

export function loadAlphaConnectSettings(): AlphaConnectSettingsState {
  if (typeof window === "undefined") return DEFAULT_ALPHA_CONNECT_SETTINGS;
  try {
    const raw = localStorage.getItem(ALPHA_CONNECT_SETTINGS_KEY);
    if (!raw) return DEFAULT_ALPHA_CONNECT_SETTINGS;
    const merged = { ...DEFAULT_ALPHA_CONNECT_SETTINGS, ...JSON.parse(raw) } as AlphaConnectSettingsState;
    merged.ephemeralDelete = normalizeRetentionPolicy(merged.ephemeralDelete);
    merged.theme = normalizeConnectTheme(merged.theme);
    const normalized = normalizeAlphaConnectSettings(merged);
    if (
      normalized.fingerprintLock !== merged.fingerprintLock ||
      normalized.faceIdLock !== merged.faceIdLock
    ) {
      saveAlphaConnectSettings(normalized);
    }
    return normalized;
  } catch {
    return DEFAULT_ALPHA_CONNECT_SETTINGS;
  }
}

export function saveAlphaConnectSettings(settings: AlphaConnectSettingsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALPHA_CONNECT_SETTINGS_KEY, JSON.stringify(settings));
}

const AUDIO_OUTPUT_LABELS: Record<AudioOutput, string> = {
  earpiece: "سماعة الهاتف (تلقائي)",
  speaker: "السماعة الخارجية (اختياري)",
  bluetooth: "Bluetooth",
};

const WHO_CAN_CALL_LABELS: Record<WhoCanCall, string> = {
  all: "الجميع",
  friends: "الأصدقاء فقط",
  church: "أعضاء الكنيسة فقط",
  none: "لا أحد",
};

const EPHEMERAL_LABELS: Record<EphemeralDelete, string> = {
  on_read: "فوراً بعد القراءة/الاستماع",
  "1h": "بعد ساعة",
  "6h": "بعد 6 ساعات",
  "12h": "بعد 12 ساعة",
  "24h": "بعد 24 ساعة",
  "3d": "بعد 3 أيام",
  "7d": "بعد 7 أيام",
};

const QUALITY_LABELS: Record<CallQuality, string> = {
  auto: "تلقائي",
  economy: "اقتصادي",
  high: "عالي الجودة",
};

type SettingsSectionId =
  | "audio"
  | "ptt"
  | "privacy"
  | "ephemeral"
  | "groups"
  | "security"
  | "storage"
  | "about"
  | "appearance";

/* ─── Main screen ───────────────────────────────────────────── */

export function AlphaConnectSettings({
  onBack,
  trustShield,
  onThemeChange,
}: {
  onBack: () => void;
  trustShield?: ReactNode;
  onThemeChange?: (theme: AlphaConnectThemeId) => void;
}) {
  const [draft, setDraft] = useState<AlphaConnectSettingsState>(() => loadAlphaConnectSettings());
  const [toast, setToast] = useState<string | null>(null);
  const [selectSheet, setSelectSheet] = useState<{
    title: string;
    options: { id: string; label: string }[];
    active: string;
    onPick: (id: string) => void;
  } | null>(null);
  const [liveStats, setLiveStats] = useState({ ping: 26, packetLoss: 0.18, signal: 94 });
  const [openSection, setOpenSection] = useState<SettingsSectionId | null>(null);
  const [codePopup, setCodePopup] = useState<CodePopup>(null);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  const codeExists = draft.securityPin.length === SECURITY_PIN_LENGTH;

  const toggleSection = useCallback((id: SettingsSectionId) => {
    setOpenSection((current) => (current === id ? null : id));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const patch = useCallback((next: Partial<AlphaConnectSettingsState>) => {
    setDraft((current) => ({ ...current, ...next }));
  }, []);

  const resetPinState = useCallback(() => {
    setPin("");
    setPinConfirm("");
    setPinError(false);
    setCreateStep(1);
  }, []);

  const closeCodePopup = useCallback(() => {
    setCodePopup(null);
    resetPinState();
  }, [resetPinState]);

  const openCodeAction = () => {
    resetPinState();
    setCodePopup(codeExists ? "reset-verify" : "create");
  };

  const handleCreateConfirm = () => {
    if (pinConfirm !== pin) {
      setPinError(true);
      window.setTimeout(() => {
        setPinError(false);
        setPinConfirm("");
      }, 800);
      return;
    }
    patch({ securityPin: pin });
    closeCodePopup();
    showToast("تم إنشاء الكود");
  };

  const handleVerifyOldPin = () => {
    if (!verifySecurityPin(pin, draft.securityPin)) {
      setPinError(true);
      window.setTimeout(() => {
        setPinError(false);
        setPin("");
      }, 800);
      return;
    }
    setPin("");
    setPinError(false);
    setCodePopup("reset-confirm");
  };

  const handleResetCode = () => {
    patch({ securityPin: "" });
    closeCodePopup();
    showToast("تم إعادة تعيين الكود");
  };

  const toggleFingerprintLock = async (next: boolean) => {
    if (biometricBusy) return;
    if (!next) {
      patch(disableBiometricLock(draft, "fingerprint"));
      return;
    }
    setBiometricBusy(true);
    const result = await enableBiometricLock(draft, "fingerprint");
    setBiometricBusy(false);
    if (!result.ok || !result.settings) {
      showToast(result.error ?? "تعذّر تفعيل البصمة");
      return;
    }
    patch(result.settings);
    showToast("تم تفعيل البصمة");
  };

  const toggleFaceIdLock = async (next: boolean) => {
    if (biometricBusy) return;
    if (!next) {
      patch(disableBiometricLock(draft, "faceId"));
      return;
    }
    setBiometricBusy(true);
    const result = await enableBiometricLock(draft, "faceId");
    setBiometricBusy(false);
    if (!result.ok || !result.settings) {
      showToast(result.error ?? "تعذّر تفعيل Face ID");
      return;
    }
    patch(result.settings);
    showToast("تم تفعيل Face ID");
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveStats((s) => ({
        ping: Math.max(12, Math.min(48, s.ping + (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3))),
        packetLoss: Math.max(0, Math.min(2.5, +(s.packetLoss + (Math.random() - 0.5) * 0.12).toFixed(2))),
        signal: Math.max(72, Math.min(100, s.signal + (Math.random() > 0.5 ? 1 : -1))),
      }));
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  const handleSave = () => {
    saveAlphaConnectSettings(draft);
    applyAlphaConnectSecurity(draft);
    if (isSecurityLockEnabled(draft)) lockAlphaConnect();
    showToast("تم حفظ التغييرات بنجاح");
    window.setTimeout(onBack, 900);
  };

  const openSelect = (
    title: string,
    options: { id: string; label: string }[],
    active: string,
    onPick: (id: string) => void,
  ) => setSelectSheet({ title, options, active, onPick });

  const applyTheme = (theme: AlphaConnectThemeId) => {
    const next = { ...draft, theme };
    setDraft(next);
    saveAlphaConnectSettings(next);
    dispatchConnectThemeChanged(theme);
    onThemeChange?.(theme);
    showToast(theme === "classic" ? "تم تفعيل Alpha Connect Classic" : "تم تفعيل Alpha Connect Secure");
  };

  return (
    <div dir="rtl" className="connect-settings-screen relative mx-auto w-full max-w-[430px] min-h-0">
      <ConnectSettingsHeader onBack={onBack} trustShield={trustShield} />

      <div className="space-y-3 px-5 pb-[calc(env(safe-area-inset-bottom)+108px)] pt-1">
        <ConnectSettingsLivePanel
          callQuality={draft.callQuality}
          liveStats={liveStats}
          onQualityPick={() =>
            openSelect(
              "جودة الاتصال",
              (Object.keys(QUALITY_LABELS) as CallQuality[]).map((id) => ({
                id,
                label: QUALITY_LABELS[id],
              })),
              draft.callQuality,
              (id) => patch({ callQuality: id as CallQuality }),
            )
          }
        />

        {/* §1 الصوت والاتصال */}
        <SettingsGlassCard
          id="audio"
          title="الصوت والاتصال"
          open={openSection === "audio"}
          onToggle={() => toggleSection("audio")}
        >
          <SettingsSliderRow
            label="حساسية الميكروفون"
            value={draft.micSensitivity}
            min={0}
            max={100}
            suffix="%"
            onChange={(micSensitivity) => patch({ micSensitivity })}
          />
          <SettingsSwitchRow label="كتم الضوضاء" checked={draft.noiseMute} onChange={(noiseMute) => patch({ noiseMute })} />
          <SettingsSwitchRow label="إزالة الصدى" checked={draft.echoCancel} onChange={(echoCancel) => patch({ echoCancel })} />
          <SettingsSwitchRow
            label="تحسين جودة الصوت"
            checked={draft.audioEnhance}
            onChange={(audioEnhance) => patch({ audioEnhance })}
          />
          <SettingsButtonRow
            label="اختبار الميكروفون"
            icon={Mic}
            onClick={() => showToast("جاري اختبار الميكروفون…")}
          />
          <SettingsSelectRow
            label="المسار الافتراضي"
            value={AUDIO_OUTPUT_LABELS[draft.audioOutput]}
            onClick={() =>
              openSelect(
                "المسار الافتراضي عند الاتصال",
                (Object.keys(AUDIO_OUTPUT_LABELS) as AudioOutput[]).map((id) => ({
                  id,
                  label: AUDIO_OUTPUT_LABELS[id],
                })),
                draft.audioOutput,
                (id) => patch({ audioOutput: id as AudioOutput }),
              )
            }
          />
          <p className="px-3 pb-2 text-[10px] leading-relaxed text-muted-foreground">
            يبدأ الاتصال تلقائياً عبر سماعة الهاتف. التبديل للسماعة الخارجية من الشاشة الرئيسية.
          </p>
        </SettingsGlassCard>

        {/* § المظهر — Theme */}
        <SettingsGlassCard
          id="appearance"
          title="المظهر"
          open={openSection === "appearance"}
          onToggle={() => toggleSection("appearance")}
        >
          <p className="px-3 pb-2 text-[10px] leading-relaxed text-muted-foreground">
            اختر بين الثيم الآمن الداكن أو الثيم الكلاسيكي الفاتح. التبديل فوري.
          </p>
          <div className="grid grid-cols-2 gap-2.5 px-2 pb-2">
            {(["secure", "classic"] as AlphaConnectThemeId[]).map((themeId) => {
              const active = draft.theme === themeId;
              return (
                <button
                  key={themeId}
                  type="button"
                  onClick={() => applyTheme(themeId)}
                  className={`connect-theme-card connect-settings-pressable overflow-hidden rounded-2xl p-2.5 text-right transition-all active:scale-[0.98] ${
                    active ? "connect-theme-card--active ring-1 ring-[#E9D9A0]" : ""
                  }`}
                >
                  <div
                    className={`mb-2 h-14 w-full rounded-xl ${
                      themeId === "secure" ? "connect-theme-card--secure-preview" : "connect-theme-card--classic-preview"
                    }`}
                  />
                  <p className={`text-[11px] font-bold ${active ? "text-neon-green" : "text-foreground"}`}>
                    {themeId === "secure" ? "Alpha Connect Secure" : "Alpha Connect Classic"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    {themeId === "secure" ? "الثيم الداكن الآمن" : "ثيم عاجي فاتح"}
                  </p>
                  {active ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-neon-green">
                      <Check className="size-3" /> مفعّل
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </SettingsGlassCard>

        {/* §2 Push To Talk */}
        <SettingsGlassCard
          id="ptt"
          title="Push To Talk"
          open={openSection === "ptt"}
          onToggle={() => toggleSection("ptt")}
        >
          <SettingsSliderRow
            label="مدة الضغط المطلوبة للإرسال"
            value={draft.pttHoldMs}
            min={120}
            max={900}
            suffix=" ms"
            onChange={(pttHoldMs) => patch({ pttHoldMs })}
          />
          <SettingsSwitchRow
            label="اهتزاز عند بدء الإرسال"
            checked={draft.vibrateStart}
            onChange={(vibrateStart) => patch({ vibrateStart })}
          />
          <SettingsSwitchRow
            label="اهتزاز عند انتهاء الإرسال"
            checked={draft.vibrateEnd}
            onChange={(vibrateEnd) => patch({ vibrateEnd })}
          />
          <SettingsSwitchRow
            label="صوت بدء الإرسال"
            checked={draft.soundStart}
            onChange={(soundStart) => patch({ soundStart })}
          />
          <SettingsSwitchRow
            label="صوت انتهاء الإرسال"
            checked={draft.soundEnd}
            onChange={(soundEnd) => patch({ soundEnd })}
          />
          <SettingsSwitchRow
            label="تشغيل Alpha Connect بالخلفية"
            checked={draft.backgroundMode}
            onChange={(backgroundMode) => patch({ backgroundMode })}
          />
        </SettingsGlassCard>

        {/* §3 الخصوصية */}
        <SettingsGlassCard
          id="privacy"
          title="الخصوصية"
          open={openSection === "privacy"}
          onToggle={() => toggleSection("privacy")}
        >
          <SettingsSelectRow
            label="من يمكنه الاتصال بي"
            value={WHO_CAN_CALL_LABELS[draft.whoCanCall]}
            onClick={() =>
              openSelect(
                "من يمكنه الاتصال بي",
                (Object.keys(WHO_CAN_CALL_LABELS) as WhoCanCall[]).map((id) => ({
                  id,
                  label: WHO_CAN_CALL_LABELS[id],
                })),
                draft.whoCanCall,
                (id) => patch({ whoCanCall: id as WhoCanCall }),
              )
            }
          />
          <SettingsSwitchRow
            label="إظهار حالة الاتصال"
            checked={draft.showOnlineStatus}
            onChange={(showOnlineStatus) => patch({ showOnlineStatus })}
          />
          <SettingsSwitchRow
            label="إظهار آخر ظهور"
            checked={draft.showLastSeen}
            onChange={(showLastSeen) => patch({ showLastSeen })}
          />
          <SettingsSwitchRow
            label="السماح بالرسائل الصوتية"
            checked={draft.allowVoiceMessages}
            onChange={(allowVoiceMessages) => patch({ allowVoiceMessages })}
          />
          <SettingsButtonRow label="قائمة المحظورين" icon={Ban} onClick={() => showToast("لا يوجد محظورون حالياً")} />
        </SettingsGlassCard>

        {/* §4 الرسائل المؤقتة */}
        <SettingsGlassCard
          id="ephemeral"
          title="الرسائل المؤقتة"
          open={openSection === "ephemeral"}
          onToggle={() => toggleSection("ephemeral")}
        >
          <SettingsSelectRow
            label="مدة الاحتفاظ"
            value={EPHEMERAL_LABELS[draft.ephemeralDelete]}
            onClick={() =>
              openSelect(
                "الرسائل المؤقتة",
                (Object.keys(EPHEMERAL_LABELS) as EphemeralDelete[]).map((id) => ({
                  id,
                  label: EPHEMERAL_LABELS[id],
                })),
                draft.ephemeralDelete,
                (id) => patch({ ephemeralDelete: id as EphemeralDelete }),
              )
            }
          />
          <SettingsSwitchRow
            label="حفظ الرسائل المهمة فقط"
            checked={draft.saveImportantOnly}
            onChange={(saveImportantOnly) => patch({ saveImportantOnly })}
          />
        </SettingsGlassCard>

        {/* §5 المجموعات */}
        <SettingsGlassCard
          id="groups"
          title="المجموعات"
          open={openSection === "groups"}
          onToggle={() => toggleSection("groups")}
        >
          <SettingsSwitchRow
            label="إشعارات المجموعات"
            checked={draft.groupNotifications}
            onChange={(groupNotifications) => patch({ groupNotifications })}
          />
          <SettingsSwitchRow
            label="السماح بإضافتي للمجموعات"
            checked={draft.allowGroupAdd}
            onChange={(allowGroupAdd) => patch({ allowGroupAdd })}
          />
          <SettingsSwitchRow
            label="البث الصوتي الجماعي"
            checked={draft.groupBroadcast}
            onChange={(groupBroadcast) => patch({ groupBroadcast })}
          />
          <SettingsButtonRow
            label="إدارة المجموعات المكتومة"
            icon={Users}
            onClick={() => showToast("لا توجد مجموعات مكتومة")}
          />
        </SettingsGlassCard>

        {/* §6 الأمان */}
        <SettingsGlassCard
          id="security"
          title="الأمان"
          open={openSection === "security"}
          onToggle={() => toggleSection("security")}
        >
          <SettingsSwitchRow
            label="قفل Alpha Connect بالبصمة"
            checked={draft.fingerprintLock}
            onChange={(value) => void toggleFingerprintLock(value)}
          />
          <SettingsSwitchRow
            label="قفل Face ID"
            checked={draft.faceIdLock}
            onChange={(value) => void toggleFaceIdLock(value)}
          />
          <SettingsSwitchRow
            label="منع لقطات الشاشة"
            checked={draft.blockScreenshots}
            onChange={(blockScreenshots) => patch({ blockScreenshots })}
          />
          <SettingsSwitchRow
            label="تنبيه عند تصوير الشاشة"
            checked={draft.screenshotAlert}
            onChange={(screenshotAlert) => patch({ screenshotAlert })}
          />
          <SettingsButtonRow
            label="الأجهزة الموثوقة"
            icon={ShieldCheck}
            onClick={() => showToast("جهازك الحالي موثّق")}
          />
          <SettingsCodeActionRow codeExists={codeExists} onClick={openCodeAction} />
        </SettingsGlassCard>

        {/* §8 التخزين */}
        <SettingsGlassCard
          id="storage"
          title="التخزين"
          open={openSection === "storage"}
          onToggle={() => toggleSection("storage")}
        >
          <SettingsInfoRow label="حجم الملفات المؤقتة" value={`${draft.cacheSizeMb.toFixed(1)} MB`} />
          <SettingsInfoRow label="حجم الرسائل الصوتية" value={`${draft.voiceSizeMb.toFixed(1)} MB`} />
          <SettingsButtonRow
            label="مسح الكاش"
            icon={Trash2}
            onClick={() => {
              patch({ cacheSizeMb: 0 });
              showToast("تم مسح الكاش");
            }}
          />
          <SettingsButtonRow
            label="حذف الملفات المؤقتة"
            icon={HardDrive}
            onClick={() => {
              patch({ cacheSizeMb: 0, voiceSizeMb: Math.max(0, draft.voiceSizeMb - 24) });
              showToast("تم حذف الملفات المؤقتة");
            }}
          />
          <SettingsButtonRow
            label="إدارة التنزيلات"
            icon={Download}
            onClick={() => showToast("لا توجد تنزيلات معلّقة")}
          />
        </SettingsGlassCard>

        {/* §9 حول Alpha Connect */}
        <SettingsGlassCard
          id="about"
          title="حول Alpha Connect"
          open={openSection === "about"}
          onToggle={() => toggleSection("about")}
        >
          <SettingsInfoRow label="الإصدار" value="Alpha Connect 1.0.0" />
          <SettingsButtonRow label="سياسة الخصوصية" icon={FileText} onClick={() => showToast("سياسة الخصوصية — قريباً")} />
          <SettingsButtonRow label="شروط الاستخدام" icon={FileText} onClick={() => showToast("شروط الاستخدام — قريباً")} />
          <SettingsButtonRow label="الإبلاغ عن مشكلة" icon={AlertCircle} onClick={() => showToast("تم استلام بلاغك")} />
          <SettingsButtonRow label="معلومات الترخيص" icon={Info} onClick={() => showToast("Alpha Bible — Alpha Connect Module")} />
        </SettingsGlassCard>
      </div>

      {/* Fixed save */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),16px)]">
        <div className="pointer-events-auto w-[calc(100%-32px)] max-w-[400px]">
          <button
            type="button"
            onClick={handleSave}
            className="connect-settings-save-btn connect-settings-pressable w-full rounded-2xl py-3.5 text-[15px] font-bold backdrop-blur-xl transition-all active:scale-[0.98]"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>

      {selectSheet ? (
        <SelectSheet
          title={selectSheet.title}
          options={selectSheet.options}
          active={selectSheet.active}
          onPick={(id) => {
            selectSheet.onPick(id);
            setSelectSheet(null);
          }}
          onClose={() => setSelectSheet(null)}
        />
      ) : null}

      {codePopup === "create" && createStep === 1 ? (
        <ConnectCenterPopup onClose={closeCodePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-[oklch(0.82_0.22_145/0.35)] bg-[oklch(0.82_0.22_145/0.08)]">
              <Fingerprint className="size-5 text-neon-green" />
            </div>
            <p className="mb-1 text-[14px] font-bold text-foreground">إنشاء كود</p>
            <p className="mb-4 text-[10px] text-muted-foreground">6 أرقام — كود واحد لقفل Alpha Connect</p>
            <ConnectPinInput id="connect-create-pin" value={pin} onChange={setPin} />
            <ConnectPopupActions
              onCancel={closeCodePopup}
              onConfirm={() => setCreateStep(2)}
              confirmLabel="التالي"
              confirmDisabled={pin.length !== SECURITY_PIN_LENGTH}
            />
          </div>
        </ConnectCenterPopup>
      ) : null}

      {codePopup === "create" && createStep === 2 ? (
        <ConnectCenterPopup onClose={closeCodePopup}>
          <div className="pt-2 text-center">
            <p className="mb-1 text-[14px] font-bold text-foreground">تأكيد الكود</p>
            <p className="mb-4 text-[10px] text-muted-foreground">أعد إدخال الكود للتأكيد</p>
            <ConnectPinInput
              id="connect-create-confirm"
              value={pinConfirm}
              onChange={(v) => {
                setPinConfirm(v);
                setPinError(false);
              }}
              error={pinError}
            />
            {pinError ? <p className="mt-2 text-[10px] text-destructive">الكود غير متطابق</p> : null}
            <ConnectPopupActions
              onCancel={() => {
                setCreateStep(1);
                setPinConfirm("");
                setPinError(false);
              }}
              onConfirm={handleCreateConfirm}
              cancelLabel="رجوع"
              confirmDisabled={pinConfirm.length !== SECURITY_PIN_LENGTH}
            />
          </div>
        </ConnectCenterPopup>
      ) : null}

      {codePopup === "reset-verify" ? (
        <ConnectCenterPopup onClose={closeCodePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-[oklch(0.82_0.22_145/0.35)] bg-[oklch(0.82_0.22_145/0.08)]">
              <Fingerprint className="size-5 text-neon-green" />
            </div>
            <p className="mb-1 text-[14px] font-bold text-foreground">الكود الحالي</p>
            <p className="mb-4 text-[10px] text-muted-foreground">أدخل الكود السري الحالي للمتابعة</p>
            <ConnectPinInput
              id="connect-reset-verify"
              value={pin}
              onChange={(v) => {
                setPin(v);
                setPinError(false);
              }}
              error={pinError}
            />
            {pinError ? <p className="mt-2 text-[10px] text-destructive">الكود غير صحيح</p> : null}
            <ConnectPopupActions
              onCancel={closeCodePopup}
              onConfirm={handleVerifyOldPin}
              confirmLabel="التالي"
              confirmDisabled={pin.length !== SECURITY_PIN_LENGTH}
            />
          </div>
        </ConnectCenterPopup>
      ) : null}

      {codePopup === "reset-confirm" ? (
        <ConnectCenterPopup onClose={closeCodePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full border border-destructive/35 bg-destructive/15">
              <RefreshCw className="size-4 text-destructive" />
            </div>
            <p className="mb-1 text-[13px] font-bold text-foreground">إعادة تعيين الكود؟</p>
            <p className="mb-4 text-[10px] text-muted-foreground">سيتم مسح الكود السري الحالي. يمكنك إنشاء كود جديد بعد ذلك.</p>
            <ConnectPopupActions onCancel={closeCodePopup} onConfirm={handleResetCode} confirmLabel="إعادة التعيين" danger />
          </div>
        </ConnectCenterPopup>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),56px)] z-50 flex justify-center px-4">
          <div className="glass-strong rounded-2xl px-4 py-2.5 text-center text-[12px] font-medium text-neon-green">
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Header (same DNA as Alpha Connect) ────────────────────── */

function ConnectSettingsHeader({
  onBack,
  trustShield,
}: {
  onBack: () => void;
  trustShield?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),14px)]">
      <button
        type="button"
        onClick={onBack}
        aria-label="رجوع"
        className="connect-settings-header-btn glass connect-settings-pressable flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/90 transition-all active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-semibold tracking-tight">إعدادات Alpha Connect</h1>
          <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {trustShield ?? (
          <span className="glass flex h-11 w-11 items-center justify-center rounded-2xl border-gold/30 text-gold opacity-50" style={{ borderColor: "oklch(0.78 0.16 75 / 0.4)" }}>
            <ShieldPlus className="h-5 w-5" />
          </span>
        )}
        <button
          type="button"
          aria-label="المزيد"
          className="flex h-11 w-8 items-center justify-center text-foreground/70 active:scale-95 transition-transform"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ConnectSettingsLivePanel({
  callQuality,
  liveStats,
  onQualityPick,
}: {
  callQuality: CallQuality;
  liveStats: { ping: number; packetLoss: number; signal: number };
  onQualityPick: () => void;
}) {
  return (
    <section className="connect-settings-live-panel connect-settings-pressable connect-settings-card glass-strong overflow-hidden rounded-2xl border border-[oklch(0.82_0.22_145/0.35)] shadow-[0_0_24px_oklch(0.82_0.22_145/0.12)]">
      <div className="px-2 pb-1 pt-3">
        <SettingsSelectRow label="وضع الجودة" value={QUALITY_LABELS[callQuality]} onClick={onQualityPick} />
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-4 pt-1">
        <LiveStatCard label="Ping" value={`${liveStats.ping} ms`} icon={SignalHigh} />
        <LiveStatCard label="Packet Loss" value={`${liveStats.packetLoss.toFixed(1)}%`} icon={AlertCircle} />
        <LiveStatCard label="Signal" value={`${liveStats.signal}%`} icon={Bluetooth} />
      </div>
    </section>
  );
}

/* ─── UI primitives ─────────────────────────────────────────── */

const SETTINGS_SECTION_SCROLL_OFFSET = 12;

function findConnectSettingsScrollContainer(node: HTMLElement): HTMLElement | null {
  const closest = node.closest(".alpha-screen-frame-scroll");
  if (closest instanceof HTMLElement) return closest;
  const fallback = document.querySelector(".alpha-connect-theme .alpha-screen-frame-scroll");
  return fallback instanceof HTMLElement ? fallback : null;
}

/** Scroll expanded section header near top of the settings scroll viewport. */
function scrollConnectSettingsSectionIntoView(sectionEl: HTMLElement) {
  const toggle = sectionEl.querySelector(".connect-settings-section-toggle");
  const target = toggle instanceof HTMLElement ? toggle : sectionEl;
  const scrollEl = findConnectSettingsScrollContainer(sectionEl);

  if (!scrollEl) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const scrollRect = scrollEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop = scrollEl.scrollTop + (targetRect.top - scrollRect.top) - SETTINGS_SECTION_SCROLL_OFFSET;

  scrollEl.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
}

function SettingsGlassCard({
  title,
  open,
  onToggle,
  children,
  id,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  id?: SettingsSectionId;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    requestAnimationFrame(() => {
      scrollConnectSettingsSectionIntoView(sectionEl);
    });

    const afterExpand = window.setTimeout(() => {
      scrollConnectSettingsSectionIntoView(sectionEl);
    }, 320);

    return () => window.clearTimeout(afterExpand);
  }, [open]);

  return (
    <section
      ref={sectionRef}
      data-settings-section={id}
      className={
        "connect-settings-section connect-settings-card glass-strong overflow-hidden rounded-3xl transition-all duration-300 " +
        (open
          ? "connect-settings-section--open border border-[oklch(0.82_0.22_145/0.35)] shadow-[0_0_24px_oklch(0.82_0.22_145/0.12)]"
          : "border border-transparent")
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={
          "connect-settings-section-toggle flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition-colors " +
          (open ? "bg-[oklch(0.82_0.22_145/0.08)] connect-settings-card-open" : "")
        }
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={
              "connect-settings-section-dot h-2 w-2 shrink-0 rounded-full transition-all " +
              (open ? "connect-settings-section-dot--open" : "")
            }
          />
          <h2 className={"connect-settings-section-title text-[14px] font-bold " + (open ? "connect-settings-section-title--open" : "")}>
            {title}
          </h2>
        </div>
        <ChevronDown
          className={
            "connect-settings-section-chevron h-4 w-4 shrink-0 transition-transform duration-300 " +
            (open ? "rotate-180 connect-settings-section-chevron--open" : "")
          }
        />
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="connect-settings-section-body divide-y p-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SettingsSwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="connect-settings-switch connect-settings-pressable flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-right transition-all active:scale-[0.99]"
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="connect-settings-switch-label text-[13px] font-medium">{label}</span>
        <span className="connect-settings-switch-badge shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold">
          {checked ? "مفعّل" : "معطّل"}
        </span>
      </div>
      <span className="connect-settings-switch-track relative h-7 w-[52px] shrink-0 rounded-full border transition-all">
        <span className="connect-settings-switch-thumb absolute top-0.5 h-6 w-6 rounded-full shadow-md transition-all" />
      </span>
    </button>
  );
}

function SettingsSliderRow({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="connect-settings-slider rounded-2xl border border-transparent px-3.5 py-3 transition-colors">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="connect-settings-slider-label text-[13px] font-medium">{label}</span>
        <span className="connect-settings-slider-value rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="connect-settings-slider-track relative h-2.5 rounded-full">
        <div
          className="connect-settings-slider-fill absolute inset-y-0 right-0 rounded-full transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="connect-settings-slider-input absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-100"
        />
      </div>
    </div>
  );
}

function SettingsSelectRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="connect-settings-select connect-settings-pressable flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-right transition-all active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1 text-right">
        <p className="connect-settings-select-label text-[13px] font-medium">{label}</p>
        <p className="connect-settings-select-value mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-bold">
          <span className="connect-settings-select-dot h-1.5 w-1.5 shrink-0 rounded-full" />
          <span className="truncate">{value}</span>
        </p>
      </div>
      <ChevronLeft className="connect-settings-select-chevron h-4 w-4 shrink-0 opacity-90" />
    </button>
  );
}

function SettingsButtonRow({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="connect-settings-row-btn connect-settings-pressable flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-right transition-all active:scale-[0.99]"
    >
      <span className="text-[13px] font-medium text-foreground/92">{label}</span>
      <Icon className="connect-settings-row-icon h-[18px] w-[18px]" strokeWidth={2.2} />
    </button>
  );
}

function SettingsInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3">
      <span className="text-[13px] font-medium text-foreground/92">{label}</span>
      <span className="text-[11px] tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

function SettingsCodeActionRow({ codeExists, onClick }: { codeExists: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-right transition-all active:scale-[0.99] " +
        (codeExists
          ? "border border-destructive/35 bg-destructive/10"
          : "border border-[oklch(0.82_0.22_145/0.25)] bg-[oklch(0.82_0.22_145/0.08)]")
      }
    >
      <span
        className={
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl " +
          (codeExists ? "bg-destructive/15" : "bg-neon-green/15")
        }
      >
        {codeExists ? (
          <RefreshCw className="h-4 w-4 text-destructive" strokeWidth={2.2} />
        ) : (
          <Fingerprint className="h-4 w-4 text-neon-green" strokeWidth={2.2} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={"text-[13px] font-semibold " + (codeExists ? "text-destructive" : "text-neon-green")}>
          {codeExists ? "إعادة تعيين الكود" : "إنشاء كود"}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {codeExists ? "مسح الكود الحالي — ستحتاج لإنشاء كود جديد" : "6 أرقام لقفل Alpha Connect"}
        </p>
      </div>
    </button>
  );
}

function LiveStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="connect-settings-stat connect-settings-pressable glass rounded-2xl px-2 py-2.5 text-center">
      <Icon className="connect-settings-stat-icon mx-auto mb-1 h-4 w-4" strokeWidth={2.2} />
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="connect-settings-stat-value mt-0.5 text-[11px] font-bold tabular-nums">{value}</p>
    </div>
  );
}

function SelectSheet({
  title,
  options,
  active,
  onPick,
  onClose,
}: {
  title: string;
  options: { id: string; label: string }[];
  active: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[430px] glass-strong rounded-t-3xl pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <p className="mb-2 px-4 text-center text-sm font-semibold">{title}</p>
        <div className="max-h-[50vh] overflow-y-auto px-2">
          {options.map((option) => {
            const selected = active === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option.id)}
                className={
                  "mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition active:scale-[0.99] " +
                  (selected
                    ? "border border-[oklch(0.82_0.22_145/0.55)] bg-[oklch(0.82_0.22_145/0.18)] font-bold text-neon-green shadow-[0_0_18px_oklch(0.82_0.22_145/0.2)]"
                    : "border border-transparent text-foreground/90 hover:bg-white/5")
                }
              >
                <span className="flex items-center gap-2">
                  {selected ? (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-neon-green text-[#0a1430]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-white/20" />
                  )}
                  {option.label}
                </span>
                {selected ? (
                  <span className="text-[10px] font-bold text-neon-green">مختار</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { AlphaConnectShieldIcon } from "./AlphaConnectLogo";
