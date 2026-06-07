import { useMemo, useState } from "react";
import { X, ImagePlus, Send, ShieldCheck } from "lucide-react";
import { POST_TYPE_META, type ChurchPost, type ChurchPostDetails, type PostType } from "@/data/church-posts";
import { computeDefaultExpiry, newPostId, saveUserPost } from "./post-store";
import { generatePostImage } from "./post-image-engine";

/* --------------------------------- Categories -------------------------------- */
export type CategoryKey =
  | "news" | "announcement" | "liturgy" | "meeting" | "trip"
  | "wedding-full" | "wedding-half"
  | "condolence" | "fortyDay" | "annual"
  | "report" | "prayer";

type CategoryDef = {
  key: CategoryKey;
  label: string;
  type: PostType;
  eventType?: string;
};

export const CATEGORIES: CategoryDef[] = [
  { key: "news",         label: "خبر",          type: "news" },
  { key: "announcement", label: "إعلان",        type: "announcement" },
  { key: "liturgy",      label: "قداس",         type: "liturgy" },
  { key: "meeting",      label: "اجتماع",       type: "meeting" },
  { key: "trip",         label: "رحلة",         type: "trip" },
  { key: "wedding-full", label: "فرح",          type: "wedding",      eventType: "إكليل" },
  { key: "wedding-half", label: "نصف إكليل",    type: "wedding",      eventType: "نصف إكليل" },
  { key: "condolence",   label: "تعزية",        type: "condolence",   eventType: "تعزية" },
  { key: "fortyDay",     label: "أربعين",       type: "condolence",   eventType: "أربعين" },
  { key: "annual",       label: "ذكرى سنوية",   type: "condolence",   eventType: "ذكرى سنوية" },
  { key: "report",       label: "تقرير خدمة",   type: "report" },
  { key: "prayer",       label: "طلبة صلاة",    type: "prayer" },
];

/* --------------------------------- Primitives -------------------------------- */
function Field({
  label, value, onChange, placeholder, type = "text", multiline, maxLength, required, rows = 2,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "number";
  multiline?: boolean; maxLength?: number; required?: boolean; rows?: number;
}) {
  const isTemporal = type === "date" || type === "time";
  const cls =
    "w-full min-w-0 max-w-full box-border rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[13px] text-[#3a2a18] outline-none focus:border-[#c79356] placeholder:text-[#a99060]" +
    (isTemporal ? " [color-scheme:light]" : "");
  return (
    <label className="block min-w-0 max-w-full">
      <span className="block text-[11px] font-extrabold text-[#7a5a30] mb-1">
        {label}{required ? <span className="text-[#c44569]"> *</span> : null}
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          className={cls + " resize-none min-h-[4.5rem] max-h-32 leading-relaxed"}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          dir={isTemporal ? "ltr" : undefined}
          className={cls}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ImagePicker({
  value, preview, useAuto, onChange, onAutoChange,
}: {
  value: string | null;
  preview: string | null;
  useAuto: boolean;
  onChange: (dataUrl: string | null) => void;
  onAutoChange: (v: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const shown = value || (useAuto ? preview : null);
  return (
    <div className="block min-w-0 max-w-full">
      <span className="block text-[11px] font-extrabold text-[#7a5a30] mb-1">صورة المنشور</span>
      <div className="flex items-center gap-3 min-w-0">
        <label className="relative inline-flex items-center justify-center h-[78px] w-[78px] rounded-2xl bg-white/90 border border-dashed border-[#c79356]/60 text-[#7a5a30] cursor-pointer overflow-hidden active:scale-95 transition-transform shrink-0">
          {shown ? (
            <img src={shown} alt="معاينة" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              setError(null);
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 3 * 1024 * 1024) {
                setError("الحد الأقصى للصورة 3 ميجابايت");
                return;
              }
              onAutoChange(false);
              const reader = new FileReader();
              reader.onload = () => onChange(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <div className="flex-1 min-w-0 text-right">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAuto}
              onChange={(e) => {
                onAutoChange(e.target.checked);
                if (e.target.checked) onChange(null);
              }}
              className="h-4 w-4 rounded border-[#c79356] text-[#1f8a5a] accent-[#2f9d6e]"
            />
            <span className="text-[11.5px] font-extrabold text-[#3a2a18]">استخدام الصورة التلقائية</span>
          </label>
          <p className="mt-1 text-[10.5px] text-[#6a543a] leading-snug">
            صورة روحية تُولَّد تلقائيًا حسب نوع المنشور. يمكنك استبدالها بصورة من جهازك.
          </p>
          {value ? (
            <button
              type="button"
              onClick={() => { onChange(null); onAutoChange(true); }}
              className="mt-1 text-[10.5px] font-extrabold text-[#a8344f]"
            >
              إزالة الصورة اليدوية
            </button>
          ) : null}
          {error ? <p className="mt-1 text-[10.5px] font-bold text-[#a8344f]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Builder content ------------------------------- */
type FormState = {
  title: string;
  body: string;
  author: string;
  image: string | null;
  date: string;
  time: string;
  place: string;
  priest: string;
  audience: string;
  groom: string;
  bride: string;
  personName: string;
  deathDate: string;
  verse: string;
  returnDate: string;
  seats: string;
  places: string;
  expiresAt: string; // datetime-local string ("YYYY-MM-DDTHH:mm"), "" means no expiration
  useAutoImage: boolean;
};

const EMPTY: FormState = {
  title: "", body: "", author: "خدمة الإعلام", image: null,
  date: "", time: "", place: "", priest: "", audience: "",
  groom: "", bride: "", personName: "", deathDate: "",
  verse: "", returnDate: "", seats: "", places: "", expiresAt: "", useAutoImage: true,
};

function toDatetimeLocal(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromDatetimeLocal(s: string): number | null {
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? ms : null;
}

function formatHijriOrToday(): string {
  const d = new Date();
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function resolvePostImage(cat: CategoryDef, f: FormState, postId: string): string {
  if (f.image) return f.image;
  return generatePostImage(cat.key, postId);
}

function buildPost(cat: CategoryDef, f: FormState): ChurchPost | null {
  const id = newPostId();
  const image = resolvePostImage(cat, f, id);
  const author = f.author.trim() || "خدمة الإعلام";
  const date = formatHijriOrToday();
  const details: ChurchPostDetails = { eventType: cat.eventType };

  const trim = (s: string) => s.trim();
  const has = (s: string) => trim(s).length > 0;

  const userExpiry = fromDatetimeLocal(f.expiresAt);
  const finalize = (base: ChurchPost): ChurchPost => {
    const exp =
      userExpiry !== null
        ? userExpiry
        : computeDefaultExpiry(base.type, {
            date: f.date,
            time: f.time,
            returnDate: f.returnDate,
          });
    return { ...base, expiresAt: exp };
  };

  switch (cat.key) {
    case "news":
    case "announcement":
    case "report": {
      if (!has(f.title) || !has(f.body)) return null;
      return finalize({
        id, type: cat.type, title: trim(f.title), body: trim(f.body),
        excerpt: trim(f.body).slice(0, 140), image, date, author, details,
      });
    }
    case "prayer": {
      if (!has(f.title) || !has(f.body)) return null;
      return finalize({
        id, type: "prayer", title: trim(f.title), body: trim(f.body),
        excerpt: trim(f.body).slice(0, 140), image, date, author, details,
      });
    }
    case "liturgy": {
      if (!has(f.title) || !has(f.date)) return null;
      details.date = f.date; details.time = f.time; details.place = f.place; details.priest = f.priest;
      return finalize({
        id, type: "liturgy", title: trim(f.title),
        body: trim(f.body) || `قداس ${trim(f.title)}${has(f.place) ? ` بـ${trim(f.place)}` : ""}.`,
        excerpt: `${f.date}${has(f.time) ? ` · ${f.time}` : ""}${has(f.place) ? ` · ${f.place}` : ""}`,
        image, date, author, details,
      });
    }
    case "meeting": {
      if (!has(f.title) || !has(f.date)) return null;
      details.date = f.date; details.time = f.time; details.place = f.place; details.audience = f.audience;
      return finalize({
        id, type: "meeting", title: trim(f.title),
        body: trim(f.body) || `اجتماع ${trim(f.title)}${has(f.audience) ? ` · ${trim(f.audience)}` : ""}.`,
        excerpt: `${f.date}${has(f.time) ? ` · ${f.time}` : ""}${has(f.place) ? ` · ${f.place}` : ""}`,
        image, date, author, details,
      });
    }
    case "trip": {
      if (!has(f.title) || !has(f.date)) return null;
      const seatsN = Number(f.seats);
      details.date = f.date; details.returnDate = f.returnDate;
      details.places = f.places;
      if (!Number.isNaN(seatsN) && seatsN > 0) details.seats = seatsN;
      return finalize({
        id, type: "trip", title: trim(f.title),
        body: trim(f.body) || `رحلة إلى ${trim(f.places) || trim(f.title)}.`,
        excerpt: `${f.date}${has(f.returnDate) ? ` → ${f.returnDate}` : ""}${seatsN > 0 ? ` · ${seatsN} مكان` : ""}`,
        image, date, author, details,
      });
    }
    case "wedding-full":
    case "wedding-half": {
      if (!has(f.groom) || !has(f.bride) || !has(f.date)) return null;
      details.groom = f.groom; details.bride = f.bride;
      details.date = f.date; details.place = f.place; details.verse = f.verse;
      const label = cat.eventType || "فرح";
      return finalize({
        id, type: "wedding",
        title: `${label} مبارك: ${trim(f.groom)} و${trim(f.bride)}`,
        body: trim(f.body) || `نشارككم فرحة ${label} الأخ ${trim(f.groom)} والأخت ${trim(f.bride)}.`,
        excerpt: `${f.date}${has(f.place) ? ` · ${trim(f.place)}` : ""}`,
        image, date, author, details,
      });
    }
    case "condolence":
    case "fortyDay":
    case "annual": {
      if (!has(f.personName)) return null;
      details.personName = f.personName; details.deathDate = f.deathDate; details.verse = f.verse;
      const label = cat.eventType || "تعزية";
      return finalize({
        id, type: "condolence",
        title: `${label}: ${trim(f.personName)}`,
        body: trim(f.body) || `بقلوب مؤمنة بقيامة الموتى، نطلب صلواتكم من أجل نياحة ${trim(f.personName)}.`,
        excerpt: `${has(f.deathDate) ? f.deathDate + " · " : ""}${trim(f.body).slice(0, 100)}`,
        image, date, author, details,
      });
    }
    default:
      return null;
  }
}

function CategoryForm({
  cat, f, set, autoPreview,
}: {
  cat: CategoryDef;
  f: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  autoPreview: string | null;
}) {
  const imgProps = {
    value: f.image,
    preview: autoPreview,
    useAuto: f.useAutoImage,
    onChange: (v: string | null) => set("image", v),
    onAutoChange: (v: boolean) => set("useAutoImage", v),
  };
  switch (cat.key) {
    case "news":
    case "announcement":
    case "report":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <Field label="العنوان" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <Field label="النص" value={f.body} onChange={(v) => set("body", v)} multiline required maxLength={2000} rows={3} />
        </div>
      );
    case "prayer":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <Field label="عنوان الطلبة" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <Field label="نص الطلبة" value={f.body} onChange={(v) => set("body", v)} multiline required maxLength={1000} rows={3} />
        </div>
      );
    case "liturgy":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <Field label="اسم القداس" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 min-w-0">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="الوقت" type="time" value={f.time} onChange={(v) => set("time", v)} />
          </div>
          <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          <Field label="اسم الكاهن" value={f.priest} onChange={(v) => set("priest", v)} maxLength={120} />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} rows={3} />
        </div>
      );
    case "meeting":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <Field label="اسم الاجتماع" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 min-w-0">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="الوقت" type="time" value={f.time} onChange={(v) => set("time", v)} />
          </div>
          <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          <Field label="الفئة المستهدفة" value={f.audience} onChange={(v) => set("audience", v)} placeholder="مثال: الشباب · الأمهات · الأطفال" maxLength={120} />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} rows={3} />
        </div>
      );
    case "trip":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <Field label="اسم الرحلة" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 min-w-0">
            <Field label="تاريخ الذهاب" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="تاريخ العودة" type="date" value={f.returnDate} onChange={(v) => set("returnDate", v)} />
          </div>
          <Field label="عدد الأماكن المتاحة" type="number" value={f.seats} onChange={(v) => set("seats", v)} placeholder="مثال: 40" />
          <Field label="أماكن الزيارة" value={f.places} onChange={(v) => set("places", v)} maxLength={200} placeholder="دير الأنبا بيشوي · وادي النطرون" />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} rows={3} />
        </div>
      );
    case "wedding-full":
    case "wedding-half":
      return (
        <div className="space-y-2.5 min-w-0">
          <ImagePicker {...imgProps} />
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 min-w-0">
            <Field label="اسم العريس" value={f.groom} onChange={(v) => set("groom", v)} required maxLength={80} />
            <Field label="اسم العروسة" value={f.bride} onChange={(v) => set("bride", v)} required maxLength={80} />
          </div>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 min-w-0">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          </div>
          <Field label="آية كتابية" value={f.verse} onChange={(v) => set("verse", v)} maxLength={200} placeholder="مثال: ما جمعه الله لا يفرّقه إنسان" />
          <Field label="نص إضافي" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} rows={3} />
        </div>
      );
    case "condolence":
    case "fortyDay":
    case "annual":
      return (
        <div className="space-y-2.5 min-w-0">
          <div className="rounded-2xl bg-white/70 border border-[#efe2c4] px-3 py-2 text-[11px] text-[#7a5a30] text-right">
            نوع المناسبة: <span className="font-extrabold text-[#3a2a18]">{cat.eventType}</span>
          </div>
          <ImagePicker {...imgProps} />
          <Field label="اسم المنتقل" value={f.personName} onChange={(v) => set("personName", v)} required maxLength={120} />
          <Field label="تاريخ الوفاة" type="date" value={f.deathDate} onChange={(v) => set("deathDate", v)} />
          <Field label="آية كتابية" value={f.verse} onChange={(v) => set("verse", v)} maxLength={200} placeholder="مثال: أنا هو القيامة والحياة" />
          <Field label="نص المنشور" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} rows={3} />
        </div>
      );
    default:
      return null;
  }
}

/* --------------------------- Expiration field -------------------------------- */
const EXPIRY_HINTS: Record<CategoryKey, string> = {
  news: "اختياري — يُنصح بضبط تاريخ انتهاء.",
  announcement: "اختياري — يُنصح بضبط تاريخ انتهاء.",
  liturgy: "افتراضيًا: ينتهي تلقائيًا بعد موعد القداس.",
  meeting: "افتراضيًا: ينتهي تلقائيًا بعد موعد الاجتماع.",
  trip: "افتراضيًا: ينتهي تلقائيًا بعد تاريخ العودة.",
  "wedding-full": "افتراضيًا: 7 أيام، يمكن التعديل.",
  "wedding-half": "افتراضيًا: 7 أيام، يمكن التعديل.",
  condolence: "افتراضيًا: 7 أيام، يمكن التعديل.",
  fortyDay: "افتراضيًا: 7 أيام، يمكن التعديل.",
  annual: "افتراضيًا: 7 أيام، يمكن التعديل.",
  report: "بدون تاريخ انتهاء افتراضيًا (اختياري).",
  prayer: "ينتهي فقط عند إغلاق الطلبة يدويًا.",
};

function ExpirationField({
  cat, f, set,
}: { cat: CategoryDef; f: FormState; set: (k: keyof FormState, v: string | null) => void }) {
  return (
    <div className="mt-3 w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-white/85 border border-[#efe2c4] p-3 text-right">
      <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11.5px] font-extrabold text-[#3a2a18]">تاريخ الانتهاء (اختياري)</span>
        <span className="text-[10.5px] font-bold text-[#7a5a30] leading-snug">{EXPIRY_HINTS[cat.key]}</span>
      </div>
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <input
          type="datetime-local"
          dir="ltr"
          className="block w-full min-w-0 max-w-full box-border rounded-xl bg-white/90 border border-[#efe2c4] px-3 py-2.5 text-[13px] text-[#3a2a18] outline-none focus:border-[#c79356] [color-scheme:light]"
          style={{ WebkitAppearance: "none", appearance: "none" }}
          value={f.expiresAt}
          onChange={(e) => set("expiresAt", e.target.value)}
        />
      </div>
      {f.expiresAt ? (
        <button
          type="button"
          onClick={() => set("expiresAt", "")}
          className="mt-2 text-[10.5px] font-extrabold text-[#a8344f]"
        >
          مسح — استخدام الافتراضي
        </button>
      ) : null}
    </div>
  );
}

function PublishButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#1a7a4a] to-[#2f9d6e] text-white text-[15px] font-extrabold shadow-[0_14px_32px_-12px_rgba(31,138,90,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] border border-[#1f8a5a]/30 active:scale-[0.98] transition-transform"
    >
      <Send className="h-5 w-5 -scale-x-100" strokeWidth={2.4} />
      نشر المنشور
    </button>
  );
}


/* --------------------------------- Builder ----------------------------------- */
export function PostBuilder({ onClose }: { onClose: () => void }) {
  const [activeKey, setActiveKey] = useState<CategoryKey>("news");
  const [form, setForm] = useState<FormState>(EMPTY);
  const cat = useMemo(() => CATEGORIES.find((c) => c.key === activeKey)!, [activeKey]);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError(null);
  }

  const autoPreview = useMemo(() => {
    if (!form.useAutoImage || form.image) return null;
    return generatePostImage(activeKey);
  }, [activeKey, form.useAutoImage, form.image]);

  function submit() {
    const post = buildPost(cat, form);
    if (!post) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    saveUserPost(post);
    onClose();
  }

  const meta = POST_TYPE_META[cat.type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      className="fixed inset-0 z-[70] flex flex-col bg-[#f4ead8]"
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,234,216,0.98) 0%, rgba(244,234,216,0.85) 100%)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="text-[15px] font-extrabold text-[#3a2a18] leading-none">إنشاء منشور</h1>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#7a5a30]">
              <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> للكهنة والخدام
            </p>
          </div>
          <span className="w-10" aria-hidden />
        </div>

        {/* Category tabs */}
        <div className="-mx-4 mt-2.5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 pb-1">
            {CATEGORIES.map((c) => {
              const m = POST_TYPE_META[c.type];
              const active = c.key === activeKey;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveKey(c.key)}
                  className={
                    "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold border backdrop-blur-xl transition-all " +
                    (active
                      ? "bg-[#1f8a5a]/22 border-[#1f8a5a]/45 text-[#1a5a38] shadow-[0_6px_14px_-8px_rgba(31,138,90,0.35)]"
                      : "bg-white/30 border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]")
                  }
                  style={active ? undefined : { color: m.tone }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 pb-2">
        <div className="mx-auto w-full max-w-[440px] min-w-0">
          <div className="mb-3 rounded-2xl bg-white/80 border border-[#efe2c4] p-3 text-right">
            <p className="text-[10.5px] font-extrabold text-[#b8893a]">{meta.label}</p>
            <p className="mt-0.5 text-[11.5px] text-[#6a543a] leading-snug">
              املأ الحقول المطلوبة (المعلّمة بـ <span className="text-[#c44569] font-extrabold">*</span>) ثم انشر من الأسفل.
            </p>
          </div>

          <CategoryForm cat={cat} f={form} set={set} autoPreview={autoPreview} />

          <ExpirationField cat={cat} f={form} set={set} />

          {error ? (
            <p className="mt-3 text-[12px] font-extrabold text-[#a8344f] text-right">{error}</p>
          ) : null}
        </div>
      </div>

      {/* Publish — fixed final action */}
      <div
        className="shrink-0 px-4 pt-2 border-t border-[#efe2c4]/80 bg-[#f4ead8]/95 backdrop-blur-xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
      >
        <div className="mx-auto w-full max-w-[440px] min-w-0">
          <PublishButton onClick={submit} />
        </div>
      </div>
    </div>
  );
}
