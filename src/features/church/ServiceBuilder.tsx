import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ImagePlus, Check } from "lucide-react";
import { AlphaDatePicker, AlphaTimePicker } from "@/components/controls";
import {
  addService, addActivity,
  SERVICE_TYPE_LABELS, ACTIVITY_TYPES, REPEAT_LABELS,
  type ServiceType, type ActivityType, type RepeatSchedule,
} from "./service-store";

type Mode = "service" | "activity";

export function ServiceBuilder({
  mode,
  onClose,
  onSaved,
}: {
  mode: Mode;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-sm">
      <div
        className="relative flex h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border-t border-x border-white/70 shadow-[0_-30px_60px_-20px_rgba(60,40,16,0.55)]"
        style={{
          background:
            "linear-gradient(180deg, #faefd6 0%, #f4ead8 60%, #f0e1c6 100%)",
        }}
      >
        <BuilderHeader mode={mode} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
          {mode === "service"
            ? <ServiceForm onSaved={(id) => { onSaved?.(id); onClose(); }} />
            : <ActivityForm onSaved={(id) => { onSaved?.(id); onClose(); }} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BuilderHeader({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const title = mode === "service" ? "إنشاء خدمة جديدة" : "إنشاء نشاط جديد";
  const subtitle = mode === "service" ? "أضِف فريق خدمة جديد للكنيسة" : "اجتماع، مؤتمر، رحلة أو تدريب";
  return (
    <header
      className="relative px-4 pt-3 pb-3 border-b border-white/60"
      style={{
        background:
          "linear-gradient(180deg, rgba(251,243,225,0.95) 0%, rgba(243,228,250,0.85) 100%)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#c79356]/40" />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="inline-grid h-9 w-9 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
        <div className="text-right">
          <h2 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] leading-none">{title}</h2>
          <p className="mt-1 text-[11px] text-[#6a543a]">{subtitle}</p>
        </div>
        <span className="w-9" />
      </div>
    </header>
  );
}

/* ----------------------------- form primitives ---------------------------- */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-[12px] font-extrabold text-[#3a2a18]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10.5px] text-[#8a6f4d]">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 text-[13.5px] font-bold text-[#3a2a18] placeholder:text-[#b8a07e] backdrop-blur-md outline-none focus:border-[#c79356] focus:ring-2 focus:ring-[#c79356]/30 transition-shadow";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 p-3.5 shadow-[0_18px_36px_-24px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(251,243,225,0.95) 0%, rgba(243,228,250,0.85) 100%)",
      }}
    >
      {children}
    </div>
  );
}

function ImagePicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#efe2c4] bg-white/85 text-[#b8893a] active:scale-95"
      >
        {value
          ? <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          : <ImagePlus className="h-6 w-6" strokeWidth={2} />}
      </button>
      <div className="text-right text-[11px] text-[#6a543a]">
        <p className="font-extrabold text-[#3a2a18]">صورة (اختياري)</p>
        <p>JPG / PNG · حتى ~2MB</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="mt-1 text-[10.5px] font-extrabold text-[#c44569]"
          >
            حذف الصورة
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : undefined);
          reader.readAsDataURL(f);
        }}
      />
    </div>
  );
}

function SaveBar({ disabled, onSave, label }: { disabled?: boolean; onSave: () => void; label: string }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 -mx-4 mt-4 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 bg-gradient-to-t from-[#f4ead8] via-[#f4ead8]/95 to-transparent">
      <button
        type="button"
        disabled={disabled}
        onClick={onSave}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-extrabold text-white disabled:opacity-50 active:scale-[0.98] transition-transform shadow-[0_18px_36px_-16px_rgba(120,80,30,0.6)]"
        style={{
          background:
            "linear-gradient(160deg, #3a2a18 0%, #6a4a26 50%, #b8893a 100%)",
        }}
      >
        <Check className="h-4 w-4" strokeWidth={2.6} />
        {label}
      </button>
    </div>
  );
}

/* ----------------------------- Service form ------------------------------- */
function ServiceForm({ onSaved }: { onSaved: (id: string) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ServiceType>("youth");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [servants, setServants] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const canSave = name.trim().length > 1;

  const save = () => {
    if (!canSave) return;
    const s = addService({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      leader: leader.trim() || undefined,
      servants: servants.trim() || undefined,
      targetGroup: targetGroup.trim() || undefined,
      image,
    });
    onSaved(s.id);
  };

  return (
    <div className="space-y-3.5">
      <GlassCard className="space-y-3">
        <Field label="اسم الخدمة">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: خدمة شباب مارمرقس" />
        </Field>
        <Field label="نوع الخدمة">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((k) => {
              const active = type === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={`rounded-full px-3 py-1.5 text-[11.5px] font-extrabold border transition-colors ${
                    active
                      ? "bg-[#3a2a18] text-[#f4ead8] border-[#3a2a18]"
                      : "bg-white/70 text-[#3a2a18] border-white/70"
                  }`}
                >
                  {SERVICE_TYPE_LABELS[k]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="الوصف">
          <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="رسالة الخدمة وأهدافها" />
        </Field>
      </GlassCard>

      <GlassCard className="space-y-3">
        <Field label="أمين الخدمة">
          <input className={inputCls} value={leader} onChange={(e) => setLeader(e.target.value)} placeholder="اسم أمين الخدمة" />
        </Field>
        <Field label="الخدام" hint="افصل الأسماء بفاصلة">
          <input className={inputCls} value={servants} onChange={(e) => setServants(e.target.value)} placeholder="مثال: مينا، مريم، بطرس" />
        </Field>
        <Field label="الفئة المستهدفة">
          <input className={inputCls} value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} placeholder="مثال: شباب 18-25 سنة" />
        </Field>
      </GlassCard>

      <GlassCard>
        <ImagePicker value={image} onChange={setImage} />
      </GlassCard>

      <SaveBar disabled={!canSave} onSave={save} label="حفظ الخدمة" />
    </div>
  );
}

/* ----------------------------- Activity form ------------------------------ */
function ActivityForm({ onSaved }: { onSaved: (id: string) => void }) {
  const [kind, setKind] = useState<ActivityType>("اجتماع");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [responsible, setResponsible] = useState("");
  const [repeat, setRepeat] = useState<RepeatSchedule>("none");
  const [image, setImage] = useState<string | undefined>();

  const canSave = title.trim().length > 1 && date.length >= 8;

  const save = () => {
    if (!canSave) return;
    const a = addActivity({
      kind, title: title.trim(),
      description: description.trim() || undefined,
      date, time: time || undefined,
      location: location.trim() || undefined,
      responsible: responsible.trim() || undefined,
      repeat, image,
    });
    onSaved(a.id);
  };

  return (
    <div className="space-y-3.5">
      <GlassCard className="space-y-3">
        <Field label="نوع النشاط">
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((k) => {
              const active = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-3 py-1.5 text-[11.5px] font-extrabold border transition-colors ${
                    active
                      ? "bg-[#3a2a18] text-[#f4ead8] border-[#3a2a18]"
                      : "bg-white/70 text-[#3a2a18] border-white/70"
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="عنوان النشاط">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مؤتمر الخدام السنوي" />
        </Field>
        <Field label="الوصف">
          <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="تفاصيل البرنامج والأهداف" />
        </Field>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="التاريخ">
            <AlphaDatePicker
              value={date}
              onChange={setDate}
              title="التاريخ"
              placeholder="اختر التاريخ"
              className={inputCls}
            />
          </Field>
          <Field label="الوقت">
            <AlphaTimePicker
              value={time}
              onChange={setTime}
              title="الوقت"
              placeholder="اختر الوقت"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="المكان">
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مثال: قاعة الكنيسة الكبرى" />
        </Field>
        <Field label="الخادم المسؤول">
          <input className={inputCls} value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="اسم الخادم المسؤول" />
        </Field>
        <Field label="جدول التكرار">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(REPEAT_LABELS) as RepeatSchedule[]).map((k) => {
              const active = repeat === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRepeat(k)}
                  className={`rounded-full px-3 py-1.5 text-[11.5px] font-extrabold border transition-colors ${
                    active
                      ? "bg-[#3a2a18] text-[#f4ead8] border-[#3a2a18]"
                      : "bg-white/70 text-[#3a2a18] border-white/70"
                  }`}
                >
                  {REPEAT_LABELS[k]}
                </button>
              );
            })}
          </div>
        </Field>
      </GlassCard>

      <GlassCard>
        <ImagePicker value={image} onChange={setImage} />
      </GlassCard>

      <SaveBar disabled={!canSave} onSave={save} label="حفظ النشاط" />
    </div>
  );
}
