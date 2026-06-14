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
  CenterGlassPopup,
  MESSAGING_CREAM_ICON_BOX,
  MESSAGING_CREAM_INNER,
  MessagingCreamSettingsCard,
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

type CodePopup = "create" | "reset" | null;

export function AlphaMessageSettings({ onBack }: { onBack: () => void }) {
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
    if (codeExists) hapticMediumImpact();
    setPopup(codeExists ? "reset" : "create");
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
    <main dir="rtl" className="alpha-messaging-bg min-h-screen font-arabic text-foreground">
      <div className="mx-auto max-w-[420px] px-4 pb-28 pt-[max(env(safe-area-inset-top),16px)]">

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
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#1F2937]">إعدادات الرسائل</h1>
            <p className="text-[10px] text-[#6B7280]">الخصوصية والأمان</p>
          </div>
        </header>

        <MessagingCreamSettingsCard
          title="القفل والخصوصية"
          desc="الكود السري، Face ID، والمحادثات المقفلة"
          className="mb-3"
        >
            <SettingsGlassToggle
              tone="cream"
              icon={LockKeyhole}
              iconClass="text-[#14532D]"
              checked={secretLockEnabled}
              onChange={handleSecretLockToggle}
              label="تفعيل القفل السري"
              desc="حماية المحادثات المخفية والمقفلة"
            />

            <SettingsGlassToggle
              tone="cream"
              icon={Fingerprint}
              iconClass="text-gold"
              checked={lockMethod === "face-id"}
              onChange={handleLockMethodToggle}
              label="Face ID / Touch ID"
              desc="استخدام البصمة لفتح المحادثات المقفلة"
            />

            <div className={`${MESSAGING_CREAM_INNER} px-3 py-3`}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className={MESSAGING_CREAM_ICON_BOX}>
                  <Clock3 className="size-4 text-gold" />
                </span>
                <p className="text-[12px] font-semibold text-[#1F2937]">مدة القفل التلقائي</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pr-1">
                {AUTO_LOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAutoLockChange(opt.value)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${
                      autoLock === opt.value
                        ? "border border-gold/40 bg-gold/15 text-gold shadow-sm"
                        : "border border-gold/12 bg-[rgba(255,255,255,0.35)] text-muted-foreground/75 hover:bg-[rgba(255,255,255,0.5)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${MESSAGING_CREAM_INNER} px-3 py-3`}>
              <div className="mb-2 flex items-center gap-2.5">
                <span className={MESSAGING_CREAM_ICON_BOX}>
                  <LockKeyhole className="size-4 text-[#14532D]" />
                </span>
                <p className="text-[12px] font-semibold text-[#1F2937]">المحادثات المقفلة</p>
              </div>
              {lockedConversations.length === 0 ? (
                <p className="pr-1 text-[10px] text-muted-foreground/75">لا توجد محادثات مقفلة حالياً</p>
              ) : (
                <div className="space-y-1.5">
                  {lockedConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center gap-2.5 rounded-[12px] border border-gold/10 bg-[rgba(255,255,255,0.32)] px-2.5 py-2 backdrop-blur-sm">
                      <img src={conv.avatar} alt="" className="size-8 rounded-full border border-gold/20 object-cover" />
                      <span className="flex-1 truncate text-[11px] font-medium text-[#374151]">{conv.name}</span>
                      <button
                        type="button"
                        onClick={() => { unlockConversation(conv.id); refreshLocked(); showToast("تم إلغاء القفل"); }}
                        className="rounded-lg border border-[#166534]/15 bg-[#ECFDF5]/80 px-2.5 py-1 text-[9px] font-semibold text-[#14532D]"
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
                        className="flex items-center gap-1 rounded-full border border-[#166534]/15 bg-[#ECFDF5]/80 px-2.5 py-1 text-[9px] font-medium text-[#14532D]"
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
              tone="cream"
              icon={codeExists ? RefreshCw : Fingerprint}
              iconClass={codeExists ? "text-[#B91C1C]" : "text-[#14532D]"}
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
        </MessagingCreamSettingsCard>

        <p className="px-1 text-center text-[9px] leading-relaxed text-[#6B7280]">
          يمكنك الوصول للمحادثات المخفية بكتابة الكود السري في شريط البحث
        </p>
      </div>

      <AlphaBottomNavigation />

      {popup === "create" && createStep === 1 && (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-gold/25 bg-gold/8">
              <Fingerprint className="size-5 text-gold" />
            </div>
            <p className="mb-1 text-[14px] font-bold text-[#1F2937]">إنشاء كود سري</p>
            <p className="mb-4 text-[10px] text-[#6B7280]">4–6 أرقام — كود واحد لجميع المحادثات المخفية</p>
            <PinInput id="create-pin" value={pin} onChange={setPin} />
            <PopupActions onCancel={closePopup} onConfirm={() => setCreateStep(2)} confirmLabel="التالي" confirmDisabled={pin.length < 4} />
          </div>
        </CenterGlassPopup>
      )}

      {popup === "create" && createStep === 2 && (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <p className="mb-1 text-[14px] font-bold text-[#1F2937]">تأكيد الكود</p>
            <p className="mb-4 text-[10px] text-[#6B7280]">أعد إدخال الكود للتأكيد</p>
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
      )}

      {popup === "reset" && (
        <CenterGlassPopup onClose={closePopup}>
          <div className="pt-2 text-center">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
              <RefreshCw className="size-4 text-[#B91C1C]" />
            </div>
            <p className="mb-1 text-[13px] font-bold text-[#1F2937]">إعادة تعيين الكود؟</p>
            <p className="mb-4 text-[10px] text-[#6B7280]">سيتم مسح الكود السري. المحادثات المخفية ستبقى مخفية.</p>
            <PopupActions onCancel={closePopup} onConfirm={handleResetCode} confirmLabel="إعادة التعيين" danger />
          </div>
        </CenterGlassPopup>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-4">
          <span className="rounded-full border border-white/20 bg-[#1F2937]/88 px-4 py-2 text-[11px] text-white/90 shadow-lg backdrop-blur-md">
            {toast}
          </span>
        </div>
      )}
    </main>
  );
}
