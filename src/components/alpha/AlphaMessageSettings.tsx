import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Clock3, Fingerprint, LockKeyhole, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlphaBottomNavigation } from "./AlphaBottomNavigation";
import {
  AUTO_LOCK_OPTIONS,
  HIDDEN_CODE_KEY,
  HIDDEN_SESSION_KEY,
  MESSAGES_AUTO_LOCK,
  MESSAGES_LOCK_METHOD,
  MESSAGES_SECRET_LOCK_ENABLED,
  type AutoLockDuration,
  type LockMethod,
  hasSecretCode,
  isConvLocked,
  loadLS,
  lockConversation,
  saveLS,
  unlockConversation,
} from "./messaging-storage";
import {
  ConnectCenterPopup,
  ConnectConfirmDialog,
  ConnectPopupActions,
  ConnectPinInput,
} from "./connect-code-ui";
import {
  ALPHA_SETTINGS_CARD,
  ALPHA_SETTINGS_ICON_BOX,
  ALPHA_SETTINGS_INNER,
  CenterGlassPopup,
  MESSAGING_CREAM_CARD,
  MESSAGING_CREAM_ICON_BOX,
  MESSAGING_CREAM_INNER,
  PinInput,
  PopupActions,
  SettingsGlassActionRow,
  SettingsGlassToggle,
} from "./messaging-ui";
import { conversations } from "./messaging-data";
import {
  hapticMediumImpact,
  hapticSelection,
} from "./messaging-haptics";

type CodePopup = "create" | "reset-verify" | "reset-confirm" | null;

export function AlphaMessageSettings({
  onBack,
  embedded = false,
}: {
  onBack: () => void;
  embedded?: boolean;
}) {
  const settingsTone = embedded ? ("alpha" as const) : ("cream" as const);
  const innerCls = embedded ? ALPHA_SETTINGS_INNER : MESSAGING_CREAM_INNER;
  const iconBoxCls = embedded ? ALPHA_SETTINGS_ICON_BOX : MESSAGING_CREAM_ICON_BOX;
  const clockColor = embedded ? "text-[var(--neon-blue)]" : "text-gold";
  const lockColor = embedded ? "text-neon-green" : "text-[#14532D]";
  const labelColor = embedded ? "text-foreground" : "text-alpha-heading";

  const [secretLockEnabled, setSecretLockEnabled] = useState(() => loadLS(MESSAGES_SECRET_LOCK_ENABLED, true));
  const [lockMethod, setLockMethod] = useState<LockMethod>(() => loadLS(MESSAGES_LOCK_METHOD, "face-id"));
  const [autoLock, setAutoLock] = useState<AutoLockDuration>(() => loadLS(MESSAGES_AUTO_LOCK, "5"));
  const [codeExists, setCodeExists] = useState(hasSecretCode);
  const [popup, setPopup] = useState<CodePopup>(null);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lockedIds, setLockedIds] = useState<string[]>([]);

  const refreshLocked = useCallback(() => {
    setLockedIds(conversations.filter((c) => isConvLocked(c.id)).map((c) => c.id));
    setCodeExists(hasSecretCode());
  }, []);

  useEffect(() => { refreshLocked(); }, [refreshLocked]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const resetPinState = useCallback(() => {
    setPin(""); setPinConfirm("");
    setPinError(false); setCreateStep(1);
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
    resetPinState();
  }, [resetPinState]);

  const openSecretCodeAction = () => {
    resetPinState();
    if (codeExists) {
      hapticMediumImpact();
      setPopup("reset-verify");
      return;
    }
    setPopup("create");
  };

  const handleSecretLockToggle = (v: boolean) => {
    setSecretLockEnabled(v);
    saveLS(MESSAGES_SECRET_LOCK_ENABLED, v);
    if (!v) saveLS(HIDDEN_SESSION_KEY, false);
  };

  const handleLockMethodToggle = (useFaceId: boolean) => {
    const method: LockMethod = useFaceId ? "face-id" : "pin";
    setLockMethod(method);
    saveLS(MESSAGES_LOCK_METHOD, method);
  };

  const handleAutoLockChange = (value: AutoLockDuration) => {
    hapticSelection();
    setAutoLock(value);
    saveLS(MESSAGES_AUTO_LOCK, value);
  };

  const handleCreateConfirm = () => {
    if (pinConfirm !== pin) {
      setPinError(true);
      setTimeout(() => { setPinError(false); setPinConfirm(""); }, 800);
      return;
    }
    saveLS(HIDDEN_CODE_KEY, pin);
    setCodeExists(true);
    closePopup();
    showToast("تم إنشاء الكود السري");
  };

  const handleVerifyOldCode = () => {
    const saved = loadLS<string>(HIDDEN_CODE_KEY, "");
    if (pin !== saved) {
      setPinError(true);
      setTimeout(() => { setPinError(false); setPin(""); }, 800);
      return;
    }
    setPin("");
    setPinError(false);
    setPopup("reset-confirm");
  };

  const handleResetCode = () => {
    saveLS(HIDDEN_CODE_KEY, "");
    saveLS(HIDDEN_SESSION_KEY, false);
    setCodeExists(false);
    closePopup();
    showToast("تم إعادة تعيين الكود");
  };

  const lockedConversations = useMemo(
    () => conversations.filter((c) => lockedIds.includes(c.id)),
    [lockedIds],
  );

  const unlockableConversations = useMemo(
    () => conversations.filter((c) => !lockedIds.includes(c.id)),
    [lockedIds],
  );

  return (
    <main dir="rtl" className={embedded ? "connect-settings-screen connect-embedded-panel flex h-full min-h-0 flex-col overflow-hidden font-arabic text-foreground" : "flex h-full min-h-0 flex-col overflow-hidden font-arabic text-foreground"}>
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain ${embedded ? "pb-2" : "mx-auto max-w-[var(--alpha-dock-max-width)] px-4 pb-28 pt-[max(env(safe-area-inset-top),16px)]"}`}>

        {embedded ? (
          /* ── Compact embedded header ── */
          <div className="mb-3 flex items-center gap-2 pb-2 border-b border-white/10">
            <button
              type="button"
              onClick={onBack}
              aria-label="رجوع"
              className="glass flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/20 text-muted-foreground transition-all active:scale-90"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <p className="text-[13px] font-semibold text-foreground">إعدادات الرسائل</p>
          </div>
        ) : (
          <header className="mb-5 flex items-center gap-3 pt-2">
            <Button
              onClick={onBack}
              aria-label="رجوع"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-[18px] border border-gold/12 bg-[rgba(247,240,224,0.62)] text-gold shadow-[0_2px_12px_-4px_rgba(200,149,42,0.18),0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:border-gold/28 hover:bg-[rgba(247,240,224,0.78)]"
            >
              <ArrowLeft className="size-[18px]" />
            </Button>
            <div>
              <div className="mb-0.5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-gold/75">
                <span>Α</span><span className="h-px w-4 bg-gold/40" /><span>Ω</span>
              </div>
              <h1 className="alpha-type-h2 font-extrabold tracking-tight text-alpha-heading">إعدادات الرسائل</h1>
              <p className="alpha-type-caption text-alpha-muted">الخصوصية والأمان</p>
            </div>
          </header>
        )}

        <div className={`${embedded ? ALPHA_SETTINGS_CARD : MESSAGING_CREAM_CARD} mb-3`}>
          {!embedded && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
              <img src="/shields/official-shield.png?v=14" alt="" className="size-[118px] object-contain opacity-[0.065]" />
            </div>
          )}
          <div className="relative z-[1] p-2.5">
            <div className="mb-2 px-1 text-center">
              <p className={`text-[13px] font-bold ${labelColor}`}>القفل والخصوصية</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground/75">الكود السري، Face ID، والمحادثات المقفلة</p>
            </div>
            <div className="space-y-2">
            <SettingsGlassToggle
              tone={settingsTone}
              icon={LockKeyhole}
              iconClass={lockColor}
              checked={secretLockEnabled}
              onChange={handleSecretLockToggle}
              label="تفعيل القفل السري"
              desc="حماية المحادثات المخفية والمقفلة"
            />

            <SettingsGlassToggle
              tone={settingsTone}
              icon={Fingerprint}
              iconClass="text-gold"
              checked={lockMethod === "face-id"}
              onChange={handleLockMethodToggle}
              label="Face ID / Touch ID"
              desc="استخدام البصمة لفتح المحادثات المقفلة"
            />

            <div className={`${innerCls} px-3 py-3`}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className={iconBoxCls}>
                  <Clock3 className={`size-4 ${clockColor}`} />
                </span>
                <p className={`text-[12px] font-semibold ${labelColor}`}>مدة القفل التلقائي</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pr-1">
                {AUTO_LOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAutoLockChange(opt.value)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${
                      autoLock === opt.value
                        ? embedded
                          ? "border border-neon-green/40 bg-neon-green/15 text-neon-green shadow-sm"
                          : "border border-gold/40 bg-gold/15 text-gold shadow-sm"
                        : embedded
                          ? "border border-white/12 bg-white/8 text-muted-foreground hover:bg-white/12"
                          : "border border-gold/12 bg-[rgba(255,255,255,0.35)] text-muted-foreground/75 hover:bg-[rgba(255,255,255,0.5)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${innerCls} px-3 py-3`}>
              <div className="mb-2 flex items-center gap-2.5">
                <span className={iconBoxCls}>
                  <LockKeyhole className={`size-4 ${lockColor}`} />
                </span>
                <p className={`text-[12px] font-semibold ${labelColor}`}>المحادثات المقفلة</p>
              </div>
              {lockedConversations.length === 0 ? (
                <p className="pr-1 text-[10px] text-muted-foreground/75">لا توجد محادثات مقفلة حالياً</p>
              ) : (
                <div className="space-y-1.5">
                  {lockedConversations.map((conv) => (
                    <div key={conv.id} className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 backdrop-blur-sm ${embedded ? "border border-white/10 bg-white/5" : "border border-gold/10 bg-[rgba(255,255,255,0.32)]"}`}>
                      <img src={conv.avatar} alt="" className="size-8 rounded-full border border-gold/20 object-cover" />
                      <span className={`flex-1 truncate alpha-type-desc font-medium ${embedded ? "text-foreground" : "text-alpha-heading"}`}>{conv.name}</span>
                      <button
                        type="button"
                        onClick={() => { unlockConversation(conv.id); refreshLocked(); showToast("تم إلغاء القفل"); }}
                        className={`rounded-lg px-2.5 py-1 text-[9px] font-semibold ${embedded ? "border border-neon-green/20 bg-neon-green/10 text-neon-green" : "border border-[#166534]/15 bg-[#ECFDF5]/80 text-[#14532D]"}`}
                      >
                        إلغاء القفل
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {unlockableConversations.length > 0 && (
                <div className="mt-2.5">
                  <p className="mb-1.5 pr-1 text-[10px] text-muted-foreground/75">قفل محادثة</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unlockableConversations.slice(0, 4).map((conv) => (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => { lockConversation(conv.id); refreshLocked(); showToast(`تم قفل ${conv.name}`); }}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-medium ${embedded ? "border border-neon-green/20 bg-neon-green/10 text-neon-green" : "border border-[#166534]/15 bg-[#ECFDF5]/80 text-[#14532D]"}`}
                      >
                        <LockKeyhole className="size-2.5" />
                        {conv.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <SettingsGlassActionRow
              tone={settingsTone}
              icon={codeExists ? RefreshCw : Fingerprint}
              iconClass={codeExists ? (embedded ? "text-destructive" : "text-[#B91C1C]") : lockColor}
              label={codeExists ? "إعادة تعيين الكود السري" : "إنشاء كود سري"}
              desc={
                codeExists
                  ? "مسح الكود الحالي — ستحتاج لإنشاء كود جديد"
                  : "كود واحد لجميع محادثاتك المخفية"
              }
              danger={codeExists}
              success={!codeExists}
              onClick={openSecretCodeAction}
            />
            </div>
          </div>
        </div>

        <p className="px-1 text-center alpha-type-caption leading-relaxed text-alpha-muted">
          يمكنك الوصول للمحادثات المخفية بكتابة الكود السري في شريط البحث
        </p>
      </div>

      {!embedded && <AlphaBottomNavigation />}

      {popup === "create" && createStep === 1 && (
        embedded ? (
          <ConnectCenterPopup onClose={closePopup}>
            <div className="pt-1 text-center">
              <div className="mb-2.5 flex justify-center">
                <div className="connect-popup-icon-ring connect-popup-icon-ring--green">
                  <Fingerprint className="size-[18px]" strokeWidth={2.2} />
                </div>
              </div>
              <p className="mb-1 text-[13px] font-bold text-foreground">إنشاء كود سري</p>
              <p className="mb-4 text-[10px] text-muted-foreground/85">4–6 أرقام — كود واحد لجميع المحادثات المخفية</p>
              <ConnectPinInput id="create-pin" value={pin} onChange={setPin} />
              <ConnectPopupActions onCancel={closePopup} onConfirm={() => setCreateStep(2)} confirmLabel="التالي" confirmDisabled={pin.length < 4} />
            </div>
          </ConnectCenterPopup>
        ) : (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-gold/25 bg-gold/8">
              <Fingerprint className="size-5 text-gold" />
            </div>
            <p className="mb-1 alpha-type-h2 font-bold text-alpha-heading">إنشاء كود سري</p>
            <p className="mb-4 alpha-type-caption text-alpha-muted">4–6 أرقام — كود واحد لجميع المحادثات المخفية</p>
            <PinInput id="create-pin" value={pin} onChange={setPin} />
            <PopupActions onCancel={closePopup} onConfirm={() => setCreateStep(2)} confirmLabel="التالي" confirmDisabled={pin.length < 4} />
          </div>
        </CenterGlassPopup>
        )
      )}

      {popup === "create" && createStep === 2 && (
        embedded ? (
          <ConnectCenterPopup onClose={closePopup}>
            <div className="pt-1 text-center">
              <p className="mb-1 text-[13px] font-bold text-foreground">تأكيد الكود</p>
              <p className="mb-4 text-[10px] text-muted-foreground/85">أعد إدخال الكود للتأكيد</p>
              <ConnectPinInput id="create-confirm" value={pinConfirm} onChange={(v) => { setPinConfirm(v); setPinError(false); }} error={pinError} />
              {pinError && <p className="mt-2 text-[10px] text-destructive">الكود غير متطابق</p>}
              <ConnectPopupActions
                onCancel={() => { setCreateStep(1); setPinConfirm(""); setPinError(false); }}
                onConfirm={handleCreateConfirm}
                cancelLabel="رجوع"
                confirmDisabled={pinConfirm.length < 4}
              />
            </div>
          </ConnectCenterPopup>
        ) : (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <p className="mb-1 alpha-type-h2 font-bold text-alpha-heading">تأكيد الكود</p>
            <p className="mb-4 alpha-type-caption text-alpha-muted">أعد إدخال الكود للتأكيد</p>
            <PinInput id="create-confirm" value={pinConfirm} onChange={(v) => { setPinConfirm(v); setPinError(false); }} error={pinError} />
            {pinError && <p className="mt-2 text-[10px] text-[#B91C1C]">الكود غير متطابق</p>}
            <PopupActions
              onCancel={() => { setCreateStep(1); setPinConfirm(""); setPinError(false); }}
              onConfirm={handleCreateConfirm}
              cancelLabel="رجوع"
              confirmDisabled={pinConfirm.length < 4}
            />
          </div>
        </CenterGlassPopup>
        )
      )}

      {popup === "reset-verify" && (
        embedded ? (
          <ConnectCenterPopup onClose={closePopup}>
            <div className="pt-1 text-center">
              <div className="mb-2.5 flex justify-center">
                <div className="connect-popup-icon-ring connect-popup-icon-ring--green">
                  <LockKeyhole className="size-[18px]" strokeWidth={2.2} />
                </div>
              </div>
              <p className="mb-1 text-[13px] font-bold text-foreground">تأكيد الكود الحالي</p>
              <p className="mb-4 text-[10px] text-muted-foreground/85">أدخل الكود السري الحالي لإعادة التعيين</p>
              <ConnectPinInput id="reset-verify-pin" value={pin} onChange={(v) => { setPin(v); setPinError(false); }} error={pinError} />
              {pinError && <p className="mt-2 text-[10px] text-destructive">الكود غير صحيح</p>}
              <ConnectPopupActions
                onCancel={closePopup}
                onConfirm={handleVerifyOldCode}
                confirmLabel="متابعة"
                confirmDisabled={pin.length < 4}
              />
            </div>
          </ConnectCenterPopup>
        ) : (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-gold/25 bg-gold/8">
              <LockKeyhole className="size-5 text-gold" />
            </div>
            <p className="mb-1 alpha-type-h2 font-bold text-alpha-heading">تأكيد الكود الحالي</p>
            <p className="mb-4 alpha-type-caption text-alpha-muted">أدخل الكود السري الحالي لإعادة التعيين</p>
            <PinInput id="reset-verify-pin" value={pin} onChange={(v) => { setPin(v); setPinError(false); }} error={pinError} />
            {pinError && <p className="mt-2 text-[10px] text-[#B91C1C]">الكود غير صحيح</p>}
            <PopupActions
              onCancel={closePopup}
              onConfirm={handleVerifyOldCode}
              confirmLabel="متابعة"
              confirmDisabled={pin.length < 4}
            />
          </div>
        </CenterGlassPopup>
        )
      )}

      {popup === "reset-confirm" && (
        embedded ? (
          <ConnectConfirmDialog
            open
            onClose={closePopup}
            onConfirm={handleResetCode}
            title="إعادة تعيين الكود؟"
            description="سيتم مسح الكود السري. المحادثات المخفية ستبقى مخفية."
            confirmLabel="إعادة التعيين"
            tone="danger"
            icon={RefreshCw}
          />
        ) : (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
              <RefreshCw className="size-4 text-[#B91C1C]" />
            </div>
            <p className="mb-1 alpha-type-body font-bold text-alpha-heading">إعادة تعيين الكود؟</p>
            <p className="mb-4 alpha-type-caption text-alpha-muted">سيتم مسح الكود السري. المحادثات المخفية ستبقى مخفية.</p>
            <PopupActions onCancel={closePopup} onConfirm={handleResetCode} confirmLabel="إعادة التعيين" danger />
          </div>
        </CenterGlassPopup>
        )
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-4">
          <span className="rounded-full border border-white/20 bg-[color-mix(in_srgb,var(--alpha-bg-cinematic)_88%,transparent)] px-4 py-2 alpha-type-desc text-white/90 shadow-lg backdrop-blur-md">
            {toast}
          </span>
        </div>
      )}
    </main>
  );
}
