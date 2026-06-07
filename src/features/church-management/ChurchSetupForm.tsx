import { Fragment, useCallback, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  FileUp,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AlphaBrandFooter } from "@/components/brand";
import { CopticCross } from "@/components/coptic";
import { cn } from "@/lib/utils";
import { useChurchHub, readSetupDraft, writeSetupDraft } from "./church-hub-store";
import { ChurchLocationPicker } from "./ChurchLocationPicker";
import { AlphaDatePicker, formatAlphaDateDisplay } from "@/components/controls";
import { hasChurchLocation, parseLocationDisplay } from "./church-location";
import {
  setupGreenButton,
  setupGreenButtonSm,
  setupInput,
  setupLabel,
  setupSectionCard,
  setupTextarea,
} from "./church-setup-styles";
import type { ChurchServantEntry, ChurchSetupFormData } from "./types";
import { EMPTY_SETUP_FORM, PRIEST_RANKS } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePriestStep(form: ChurchSetupFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.priestName.trim()) errors.priestName = "يرجى إدخال اسم الكاهن الكامل";
  if (!form.priestRank.trim()) errors.priestRank = "يرجى اختيار الدرجة الكهنوتية";
  if (!form.priestPhone.trim()) errors.priestPhone = "يرجى إدخال رقم الهاتف";
  if (!form.priestEmail.trim()) {
    errors.priestEmail = "يرجى إدخال البريد الإلكتروني";
  } else if (!EMAIL_RE.test(form.priestEmail.trim())) {
    errors.priestEmail = "يرجى إدخال بريد إلكتروني صحيح";
  }
  if (!form.priestDiocese.trim()) errors.priestDiocese = "يرجى إدخال الإيبارشية التابع لها الكاهن";
  return errors;
}

const STEPS = [
  { title: "بيانات الكنيسة", icon: Building2, accent: "#b8893a" },
  { title: "بيانات الكاهن", icon: UserRound, accent: "#a07ec4" },
  { title: "بيانات التواصل", icon: Phone, accent: "#b8893a" },
  { title: "الخدام", icon: Users, accent: "#a07ec4" },
  { title: "المستندات", icon: FileUp, accent: "#b8893a" },
  { title: "المراجعة والإرسال", icon: ClipboardList, accent: "#3f9d6e" },
] as const;

const TOTAL_STEPS = STEPS.length;

function newServant(): ChurchServantEntry {
  return { id: crypto.randomUUID(), name: "", phone: "", role: "" };
}

function Section({
  title,
  icon: Icon,
  accent = "#b8893a",
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(setupSectionCard, "animate-in fade-in duration-300")}
      style={{
        boxShadow: `0 12px 32px -20px rgba(120,80,30,0.4), 0 0 24px -16px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#efe2c4]/70 px-3.5 py-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#efe2c4]/80 bg-white/60"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-arabic-serif text-[15px] font-bold text-[#3a2a18]">{title}</h2>
      </div>
      <div className="space-y-3 p-3.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className={setupLabel}>{label}</span>
      {children}
      {error && (
        <p className="mt-1 text-[10.5px] font-semibold leading-relaxed text-[#9b6bb8]">
          {error}
        </p>
      )}
    </label>
  );
}

function PhoneInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Phone
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7e5a]"
        strokeWidth={2}
      />
      <input
        className={cn(setupInput, "pl-10 text-left")}
        type="tel"
        dir="ltr"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function StepDot({ index, activeStep }: { index: number; activeStep: number }) {
  const done = index < activeStep;
  const current = index === activeStep;

  return (
    <span
      className={cn(
        "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold transition-all duration-300",
        done && "bg-[#2a9d78] text-white shadow-[0_4px_12px_-4px_rgba(42,157,120,0.55)]",
        current && "bg-[#a07ec4] text-white shadow-[0_4px_14px_-4px_rgba(160,126,196,0.55)] ring-2 ring-[#cdb8ef]/50",
        !done && !current && "bg-[#ebe6dc] text-[#9a7e5a] border border-[#efe2c4]",
      )}
      aria-current={current ? "step" : undefined}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
    </span>
  );
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <span
      className={cn(
        "h-[3px] min-w-0 flex-1 rounded-full transition-colors duration-300",
        completed ? "bg-[#2a9d78]" : "bg-[#ebe6dc]",
      )}
    />
  );
}

function WizardProgress({ step }: { step: number }) {
  const current = STEPS[step];
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[12px] font-extrabold text-[#3a2a18]">
          الخطوة {step + 1} من {TOTAL_STEPS}
        </p>
        <CopticCross className="text-[#b8893a]" size={14} />
      </div>

      <div
        className={cn(setupSectionCard, "px-3 py-3")}
        style={{ boxShadow: "0 12px 32px -20px rgba(120,80,30,0.35), inset 0 1px 0 rgba(255,255,255,0.85)" }}
      >
        <div className="flex w-full items-center px-0.5" dir="rtl">
          {STEPS.map((_, i) => (
            <Fragment key={i}>
              <StepDot index={i} activeStep={step} />
              {i < TOTAL_STEPS - 1 && <StepConnector completed={i < step} />}
            </Fragment>
          ))}
        </div>

        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#efe2c4]/70" dir="rtl">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(to left, #1f6e54, #3eb482)",
            }}
          />
        </div>

        <h3 className="mt-3 text-center font-arabic-serif text-[17px] font-bold leading-snug text-[#3a2a18]">
          {current.title}
        </h3>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#efe2c4]/60 py-2 last:border-b-0">
      <span className="text-[11px] font-bold text-[#6a543a]">{label}</span>
      <span className="text-left text-[12.5px] font-semibold text-[#3a2a18] max-w-[58%]">{value}</span>
    </div>
  );
}

function DevSetupResetButton({ onReset }: { onReset: () => void }) {
  if (!import.meta.env.DEV) return null;
  return (
    <button
      type="button"
      onClick={onReset}
      className="mx-auto mt-4 block rounded-xl border border-dashed border-[#cdb8ef]/70 bg-[#efe7fb]/40 px-3 py-2 text-[10.5px] font-bold text-[#6b4a9a] transition hover:bg-[#efe7fb]/70 active:scale-[0.98]"
    >
      إعادة اختبار طلب التأسيس
    </button>
  );
}

function SetupSuccess({ onDevReset }: { onDevReset: () => void }) {
  return (
    <div
      className={cn(setupSectionCard, "p-6 text-center animate-in fade-in zoom-in-95 duration-400")}
      style={{ boxShadow: "0 12px 32px -20px rgba(16,120,80,0.35), inset 0 1px 0 rgba(255,255,255,0.85)" }}
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#9fd4b0]/60 bg-gradient-to-br from-[#e8faf3] to-[#b8f0d8]/80 shadow-[0_10px_24px_-12px_rgba(16,120,80,0.35)]">
        <CheckCircle2 className="h-8 w-8 text-[#2a9d78]" />
      </div>
      <CopticCross className="mx-auto mt-4 text-[#b8893a]" size={18} />
      <h2 className="mt-3 font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
        تم إرسال طلب تأسيس الكنيسة للمراجعة
      </h2>
      <Link to="/profile/church" className={cn(setupGreenButton, "mt-6")}>
        العودة إلى إدارة الكنيسة
      </Link>
      <DevSetupResetButton onReset={onDevReset} />
      <AlphaBrandFooter className="mt-8" />
    </div>
  );
}

function loadInitialForm(hubStatus: string, requestForm?: ChurchSetupFormData): ChurchSetupFormData {
  if (requestForm) return { ...EMPTY_SETUP_FORM, ...requestForm };
  if (hubStatus === "none") {
    const draft = readSetupDraft();
    if (draft) return { ...EMPTY_SETUP_FORM, ...draft };
  }
  return { ...EMPTY_SETUP_FORM };
}

function validateStep(step: number, form: ChurchSetupFormData): string | null {
  switch (step) {
    case 0:
      if (!form.churchName.trim()) return "يرجى إدخال اسم الكنيسة";
      if (!form.diocese.trim()) return "يرجى إدخال الإيبارشية";
      if (!form.governorate.trim()) return "يرجى إدخال المحافظة";
      if (!form.city.trim()) return "يرجى إدخال المدينة";
      if (!form.address.trim()) return "يرجى إدخال العنوان";
      if (!hasChurchLocation(form)) return "يرجى تحديد موقع الكنيسة";
      return null;
    case 1:
      return Object.keys(validatePriestStep(form)).length > 0 ? "incomplete" : null;
    case 2:
      if (!form.churchPhone.trim()) return "يرجى إدخال رقم الكنيسة";
      return null;
    case 3: {
      const incomplete = form.servants.find((s) => s.name.trim() && (!s.phone.trim() || !s.role.trim()));
      if (incomplete) return "يرجى إكمال بيانات الخدام المضافين";
      return null;
    }
    case 4:
      return null;
    case 5:
      if (!form.churchName.trim() || !form.priestName.trim() || !hasChurchLocation(form)) {
        return "يرجى التأكد من إكمال البيانات الأساسية";
      }
      return null;
    default:
      return null;
  }
}

export function ChurchSetupForm() {
  const { state, submitting, submitSetupRequest, resubmitRequest, devResetChurchSetup } = useChurchHub();
  const isResubmit = state.status === "needs_info";
  const isViewOnly = state.status === "pending";

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState<"forward" | "backward">("forward");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ChurchSetupFormData>(() =>
    loadInitialForm(state.status, state.request?.formData),
  );

  const patch = useCallback(<K extends keyof ChurchSetupFormData>(key: K, value: ChurchSetupFormData[K]) => {
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (!isViewOnly) writeSetupDraft(next);
      return next;
    });
  }, [isViewOnly]);

  const setLocation = useCallback(
    (value: {
      latitude: number;
      longitude: number;
      locationLabel: string;
      mapLocation: string;
    }) => {
      setForm((prev) => {
        const next = { ...prev, ...value };
        if (!isViewOnly) writeSetupDraft(next);
        return next;
      });
    },
    [isViewOnly],
  );

  const addServant = () => patch("servants", [...form.servants, newServant()]);

  const updateServant = (id: string, field: keyof ChurchServantEntry, value: string) => {
    patch(
      "servants",
      form.servants.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const removeServant = (id: string) => {
    patch("servants", form.servants.filter((s) => s.id !== id));
  };

  const canSubmit = useMemo(
    () => form.churchName.trim() && form.priestName.trim() && hasChurchLocation(form),
    [form],
  );

  const goNext = () => {
    if (isViewOnly) {
      setFieldErrors({});
      setSlideDir("forward");
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
      return;
    }
    if (step === 1) {
      const priestErrors = validatePriestStep(form);
      if (Object.keys(priestErrors).length > 0) {
        setFieldErrors(priestErrors);
        return;
      }
      setFieldErrors({});
    } else if (validateStep(step, form)) {
      return;
    } else {
      setFieldErrors({});
    }
    setSlideDir("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goPrev = () => {
    setFieldErrors({});
    setSlideDir("backward");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!canSubmit || isViewOnly || submitting) return;
    if (validateStep(5, form)) return;
    setSubmitError(null);
    const ok = isResubmit ? await resubmitRequest(form) : await submitSetupRequest(form);
    if (!ok) {
      setSubmitError("تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.");
      return;
    }
    setSubmitted(true);
  };

  const handleDevReset = () => {
    devResetChurchSetup();
    setSubmitted(false);
    setStep(0);
    setSlideDir("forward");
    setFieldErrors({});
    setForm({ ...EMPTY_SETUP_FORM });
  };

  const currentStep = STEPS[step];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            <Field label="اسم الكنيسة *">
              <input
                className={setupInput}
                value={form.churchName}
                onChange={(e) => patch("churchName", e.target.value)}
                placeholder="مثال: كنيسة الشهيد مار جرجس"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="الإيبارشية *">
              <input className={setupInput} value={form.diocese} onChange={(e) => patch("diocese", e.target.value)} disabled={isViewOnly} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المحافظة *">
                <input className={setupInput} value={form.governorate} onChange={(e) => patch("governorate", e.target.value)} disabled={isViewOnly} />
              </Field>
              <Field label="المدينة *">
                <input className={setupInput} value={form.city} onChange={(e) => patch("city", e.target.value)} disabled={isViewOnly} />
              </Field>
            </div>
            <Field label="العنوان *">
              <input className={setupInput} value={form.address} onChange={(e) => patch("address", e.target.value)} disabled={isViewOnly} />
            </Field>
            <Field label="الموقع على الخريطة *">
              <ChurchLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                locationLabel={form.locationLabel}
                mapLocation={form.mapLocation}
                disabled={isViewOnly}
                onSelect={setLocation}
              />
            </Field>
          </Section>
        );

      case 1:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            <Field label="اسم الكاهن الكامل *" error={fieldErrors.priestName}>
              <input
                className={setupInput}
                value={form.priestName}
                onChange={(e) => patch("priestName", e.target.value)}
                placeholder="مثال: القمص داود عبد الملاك"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="الدرجة الكهنوتية *" error={fieldErrors.priestRank}>
              <select
                className={cn(setupInput, !form.priestRank && "text-[#9a7e5a]")}
                value={form.priestRank}
                onChange={(e) => patch("priestRank", e.target.value)}
                disabled={isViewOnly}
              >
                <option value="">اختر الدرجة الكهنوتية</option>
                {PRIEST_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="رقم الهاتف *" error={fieldErrors.priestPhone}>
              <PhoneInput
                value={form.priestPhone}
                onChange={(v) => patch("priestPhone", v)}
                placeholder="+20 10 0000 0000"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="البريد الإلكتروني *" error={fieldErrors.priestEmail}>
              <input
                className={cn(setupInput, "text-left")}
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                value={form.priestEmail}
                onChange={(e) => patch("priestEmail", e.target.value)}
                placeholder="name@example.com"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="الإيبارشية التابع لها الكاهن *" error={fieldErrors.priestDiocese}>
              <input
                className={setupInput}
                value={form.priestDiocese}
                onChange={(e) => patch("priestDiocese", e.target.value)}
                placeholder="مثال: إيبارشية المنيا"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="تاريخ السيامة">
              <AlphaDatePicker
                value={form.ordinationDate}
                onChange={(v) => patch("ordinationDate", v)}
                disabled={isViewOnly}
                title="تاريخ السيامة"
                placeholder="اختر تاريخ السيامة"
                className={setupInput}
              />
            </Field>
            <Field label="رقم الكارنيه الكهنوتي / الرقم التعريفي">
              <input
                className={cn(setupInput, "text-left")}
                dir="ltr"
                value={form.priestIdNumber}
                onChange={(e) => patch("priestIdNumber", e.target.value)}
                placeholder="اختياري"
                disabled={isViewOnly}
              />
            </Field>
            <Field label="ملاحظات إضافية">
              <textarea
                className={setupTextarea}
                value={form.priestNotes}
                onChange={(e) => patch("priestNotes", e.target.value)}
                placeholder="أي تفاصيل إضافية عن الكاهن..."
                disabled={isViewOnly}
              />
            </Field>
          </Section>
        );

      case 2:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            <Field label="رقم الكنيسة *">
              <input className={setupInput} type="tel" dir="ltr" value={form.churchPhone} onChange={(e) => patch("churchPhone", e.target.value)} disabled={isViewOnly} />
            </Field>
            <Field label="واتساب">
              <input className={setupInput} type="tel" dir="ltr" value={form.whatsapp} onChange={(e) => patch("whatsapp", e.target.value)} disabled={isViewOnly} />
            </Field>
            <Field label="فيسبوك">
              <input className={setupInput} dir="ltr" value={form.facebook} onChange={(e) => patch("facebook", e.target.value)} placeholder="https://" disabled={isViewOnly} />
            </Field>
            <Field label="يوتيوب">
              <input className={setupInput} dir="ltr" value={form.youtube} onChange={(e) => patch("youtube", e.target.value)} placeholder="https://" disabled={isViewOnly} />
            </Field>
            <Field label="الموقع الإلكتروني">
              <input className={setupInput} dir="ltr" value={form.website} onChange={(e) => patch("website", e.target.value)} placeholder="https://" disabled={isViewOnly} />
            </Field>
          </Section>
        );

      case 3:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            {form.servants.length === 0 && (
              <p className="text-[12px] text-[#6a543a] leading-relaxed">
                يمكنك إضافة الخدام الآن أو تخطي هذه الخطوة والمتابعة.
              </p>
            )}
            {form.servants.map((s, i) => (
              <div key={s.id} className="rounded-xl border border-[#efe2c4]/80 bg-white/50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#6a543a]">خادم {i + 1}</span>
                  {!isViewOnly && (
                    <button type="button" onClick={() => removeServant(s.id)} className="text-[#9a7e5a] active:scale-95" aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Field label="اسم الخادم">
                  <input className={setupInput} value={s.name} onChange={(e) => updateServant(s.id, "name", e.target.value)} disabled={isViewOnly} />
                </Field>
                <Field label="رقم الهاتف">
                  <input className={setupInput} type="tel" dir="ltr" value={s.phone} onChange={(e) => updateServant(s.id, "phone", e.target.value)} disabled={isViewOnly} />
                </Field>
                <Field label="الخدمة / الدور">
                  <input className={setupInput} value={s.role} onChange={(e) => updateServant(s.id, "role", e.target.value)} disabled={isViewOnly} />
                </Field>
              </div>
            ))}
            {!isViewOnly && (
              <button type="button" onClick={addServant} className={setupGreenButtonSm}>
                <Plus className="h-4 w-4" />
                إضافة خادم
              </button>
            )}
          </Section>
        );

      case 4:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            <Field label="رفع كارنيه الكهنوت أو خطاب رسمي">
              {isViewOnly ? (
                <p className={cn(setupInput, "text-[#6a543a]")}>{form.documentName || "—"}</p>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#4fd4a8]/50 bg-[#f0fdf8]/60 px-3.5 py-3 transition hover:bg-[#e8faf3]/80">
                  <FileUp className="h-5 w-5 shrink-0 text-[#2a9d78]" />
                  <span className="text-[12px] font-bold text-[#3a2a18]">
                    {form.documentName || "اختر ملفاً (PDF أو صورة)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) => patch("documentName", e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              )}
            </Field>
            <Field label="ملاحظات إضافية">
              <textarea
                className={setupTextarea}
                value={form.additionalNotes}
                onChange={(e) => patch("additionalNotes", e.target.value)}
                placeholder="أي تفاصيل تود إيضاحها للإدارة..."
                disabled={isViewOnly}
              />
            </Field>
          </Section>
        );

      case 5:
        return (
          <Section title={currentStep.title} icon={currentStep.icon} accent={currentStep.accent}>
            <p className="text-[12px] leading-relaxed text-[#6a543a]">
              راجع بيانات الطلب قبل الإرسال. يمكنك العودة لأي خطوة لتعديل البيانات.
            </p>
            <div className="rounded-xl border border-[#efe2c4]/80 bg-white/55 px-3.5 py-2">
              <p className="mb-1 text-[10.5px] font-extrabold text-[#b8893a]">بيانات الكنيسة</p>
              <ReviewRow label="اسم الكنيسة" value={form.churchName} />
              <ReviewRow label="الإيبارشية" value={form.diocese} />
              <ReviewRow label="المحافظة" value={form.governorate} />
              <ReviewRow label="المدينة" value={form.city} />
              <ReviewRow label="العنوان" value={form.address} />
              {hasChurchLocation(form) && (() => {
                const loc = parseLocationDisplay(form.locationLabel);
                return (
                  <>
                    {loc.city && <ReviewRow label="المدينة" value={loc.city} />}
                    {loc.governorate && <ReviewRow label="المحافظة" value={loc.governorate} />}
                    <ReviewRow label="خرائط Google" value={form.mapLocation} />
                  </>
                );
              })()}
            </div>
            <div className="rounded-xl border border-[#efe2c4]/80 bg-white/55 px-3.5 py-2">
              <p className="mb-1 text-[10.5px] font-extrabold text-[#a07ec4]">بيانات الكاهن</p>
              <ReviewRow label="اسم الكاهن" value={form.priestName} />
              <ReviewRow label="الدرجة الكهنوتية" value={form.priestRank} />
              <ReviewRow label="الهاتف" value={form.priestPhone} />
              <ReviewRow label="البريد" value={form.priestEmail} />
              <ReviewRow label="إيبارشية الكاهن" value={form.priestDiocese} />
              <ReviewRow
                label="تاريخ السيامة"
                value={formatAlphaDateDisplay(form.ordinationDate) || form.ordinationDate}
              />
              <ReviewRow label="الرقم التعريفي" value={form.priestIdNumber} />
              <ReviewRow label="ملاحظات الكاهن" value={form.priestNotes} />
            </div>
            <div className="rounded-xl border border-[#efe2c4]/80 bg-white/55 px-3.5 py-2">
              <p className="mb-1 text-[10.5px] font-extrabold text-[#b8893a]">التواصل</p>
              <ReviewRow label="رقم الكنيسة" value={form.churchPhone} />
              <ReviewRow label="واتساب" value={form.whatsapp} />
              <ReviewRow label="فيسبوك" value={form.facebook} />
              <ReviewRow label="يوتيوب" value={form.youtube} />
              <ReviewRow label="الموقع" value={form.website} />
            </div>
            {form.servants.filter((s) => s.name.trim()).length > 0 && (
              <div className="rounded-xl border border-[#efe2c4]/80 bg-white/55 px-3.5 py-2">
                <p className="mb-1 text-[10.5px] font-extrabold text-[#a07ec4]">الخدام ({form.servants.filter((s) => s.name.trim()).length})</p>
                {form.servants.filter((s) => s.name.trim()).map((s, i) => (
                  <ReviewRow key={s.id} label={`خادم ${i + 1}`} value={`${s.name} — ${s.role}`} />
                ))}
              </div>
            )}
            <div className="rounded-xl border border-[#efe2c4]/80 bg-white/55 px-3.5 py-2">
              <p className="mb-1 text-[10.5px] font-extrabold text-[#b8893a]">المستندات</p>
              <ReviewRow label="الملف" value={form.documentName} />
              <ReviewRow label="ملاحظات" value={form.additionalNotes} />
            </div>
          </Section>
        );

      default:
        return null;
    }
  };

  if (submitted) return <SetupSuccess onDevReset={handleDevReset} />;

  const isLastStep = step === TOTAL_STEPS - 1;
  const isFirstStep = step === 0;

  return (
    <div className="space-y-2 pb-2">
      {isViewOnly && (
        <div className="rounded-2xl border border-[#cdb8ef]/50 bg-[#efe7fb]/60 px-3.5 py-2.5 text-[12px] font-bold text-[#4a2f8a]">
          الطلب قيد المراجعة — يمكنك مراجعة البيانات فقط.
        </div>
      )}
      {isResubmit && state.request?.adminNotes && (
        <div className="rounded-2xl border border-[#f0c878]/50 bg-[#fff8e9]/80 px-3.5 py-2.5">
          <p className="text-[10.5px] font-extrabold text-[#9a5a12]">ملاحظات الإدارة</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#3a2a18]">{state.request.adminNotes}</p>
        </div>
      )}

      <WizardProgress step={step} />

      <div
        key={step}
        className={cn(
          "space-y-2.5 animate-in fade-in duration-300 ease-out",
          slideDir === "forward" ? "slide-in-from-left-6" : "slide-in-from-right-6",
        )}
      >
        {renderStep()}

        {submitError && (
          <p className="rounded-xl border border-[#e8a8a8]/60 bg-[#fff0f0]/80 px-3 py-2 text-center text-[11px] font-bold text-[#a85450]">
            {submitError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirstStep}
            className={cn(
              "flex h-12 items-center justify-center rounded-2xl border border-[#efe2c4] bg-white/75 text-[14px] font-extrabold text-[#3a2a18] shadow-[0_8px_18px_-14px_rgba(120,80,30,0.35)] backdrop-blur-sm active:scale-95 transition-transform",
              isFirstStep && "opacity-40 pointer-events-none",
            )}
          >
            السابق
          </button>

          {isLastStep && !isViewOnly ? (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit || submitting}
              className={cn(setupGreenButton, "h-12", (!canSubmit || submitting) && "opacity-50 pointer-events-none")}
            >
              {submitting ? "جاري الإرسال…" : isResubmit ? "إعادة الإرسال" : "إرسال طلب التأسيس"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={isLastStep && isViewOnly}
              className={cn(
                setupGreenButton,
                "h-12",
                isLastStep && isViewOnly && "opacity-40 pointer-events-none",
              )}
            >
              التالي
            </button>
          )}
        </div>
      </div>

      <DevSetupResetButton onReset={handleDevReset} />
      <AlphaBrandFooter />
    </div>
  );
}
