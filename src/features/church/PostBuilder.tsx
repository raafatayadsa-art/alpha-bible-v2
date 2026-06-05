import { useMemo, useState } from "react";
import { X, ImagePlus, Send, ShieldCheck } from "lucide-react";
import { POST_TYPE_META, type ChurchPost, type ChurchPostDetails, type PostType } from "@/data/church-posts";
import { computeDefaultExpiry, newPostId, saveUserPost } from "./post-store";
import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import cardChildren from "@/assets/home/card-children.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";

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
  defaultImage: string;
};

export const CATEGORIES: CategoryDef[] = [
  { key: "news",         label: "خبر",          type: "news",         defaultImage: newsCandle },
  { key: "announcement", label: "إعلان",        type: "announcement", defaultImage: newsMass },
  { key: "liturgy",      label: "قداس",         type: "liturgy",      defaultImage: cardChurch },
  { key: "meeting",      label: "اجتماع",       type: "meeting",      defaultImage: newsYouth },
  { key: "trip",         label: "رحلة",         type: "trip",         defaultImage: heavenlyChurch },
  { key: "wedding-full", label: "فرح",          type: "wedding",      eventType: "إكليل",         defaultImage: cardChildren },
  { key: "wedding-half", label: "نصف إكليل",    type: "wedding",      eventType: "نصف إكليل",    defaultImage: cardChildren },
  { key: "condolence",   label: "تعزية",        type: "condolence",   eventType: "تعزية",         defaultImage: cardAgpeya },
  { key: "fortyDay",     label: "أربعين",       type: "condolence",   eventType: "أربعين",        defaultImage: cardAgpeya },
  { key: "annual",       label: "ذكرى سنوية",   type: "condolence",   eventType: "ذكرى سنوية",   defaultImage: cardAgpeya },
  { key: "report",       label: "تقرير خدمة",   type: "report",       defaultImage: cardKatameros },
  { key: "prayer",       label: "طلبة صلاة",    type: "prayer",       defaultImage: cardAgpeya },
];

/* --------------------------------- Primitives -------------------------------- */
function Field({
  label, value, onChange, placeholder, type = "text", multiline, maxLength, required,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "number";
  multiline?: boolean; maxLength?: number; required?: boolean;
}) {
  const cls =
    "w-full rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2.5 text-[13px] text-[#3a2a18] outline-none focus:border-[#c79356] placeholder:text-[#a99060]";
  return (
    <label className="block">
      <span className="block text-[11px] font-extrabold text-[#7a5a30] mb-1">
        {label}{required ? <span className="text-[#c44569]"> *</span> : null}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          className={cls + " resize-none"}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
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

function ImagePicker({ value, onChange }: { value: string | null; onChange: (dataUrl: string | null) => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="block">
      <span className="block text-[11px] font-extrabold text-[#7a5a30] mb-1">صورة (اختياري)</span>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center justify-center h-[78px] w-[78px] rounded-2xl bg-white/90 border border-dashed border-[#c79356]/60 text-[#7a5a30] cursor-pointer overflow-hidden active:scale-95 transition-transform">
          {value ? (
            <img src={value} alt="معاينة" className="absolute inset-0 h-full w-full object-cover" />
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
              const reader = new FileReader();
              reader.onload = () => onChange(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <div className="flex-1 text-right">
          <p className="text-[11.5px] text-[#6a543a] leading-snug">
            اضغط لرفع صورة من جهازك. لو لم تختر صورة، سيتم استخدام صورة افتراضية حسب نوع المنشور.
          </p>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-1 text-[10.5px] font-extrabold text-[#a8344f]"
            >
              إزالة الصورة
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
};

const EMPTY: FormState = {
  title: "", body: "", author: "خدمة الإعلام", image: null,
  date: "", time: "", place: "", priest: "", audience: "",
  groom: "", bride: "", personName: "", deathDate: "",
  verse: "", returnDate: "", seats: "", places: "", expiresAt: "",
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

function buildPost(cat: CategoryDef, f: FormState): ChurchPost | null {
  const id = newPostId();
  const image = f.image || cat.defaultImage;
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

function CategoryForm({ cat, f, set }: { cat: CategoryDef; f: FormState; set: (k: keyof FormState, v: string | null) => void }) {
  switch (cat.key) {
    case "news":
    case "announcement":
    case "report":
      return (
        <div className="space-y-2.5">
          <Field label="العنوان" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="النص" value={f.body} onChange={(v) => set("body", v)} multiline required maxLength={2000} />
        </div>
      );
    case "prayer":
      return (
        <div className="space-y-2.5">
          <Field label="عنوان الطلبة" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <Field label="نص الطلبة" value={f.body} onChange={(v) => set("body", v)} multiline required maxLength={1000} />
        </div>
      );
    case "liturgy":
      return (
        <div className="space-y-2.5">
          <Field label="اسم القداس" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="الوقت" type="time" value={f.time} onChange={(v) => set("time", v)} />
          </div>
          <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          <Field label="اسم الكاهن" value={f.priest} onChange={(v) => set("priest", v)} maxLength={120} />
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} />
        </div>
      );
    case "meeting":
      return (
        <div className="space-y-2.5">
          <Field label="اسم الاجتماع" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="الوقت" type="time" value={f.time} onChange={(v) => set("time", v)} />
          </div>
          <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          <Field label="الفئة المستهدفة" value={f.audience} onChange={(v) => set("audience", v)} placeholder="مثال: الشباب · الأمهات · الأطفال" maxLength={120} />
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} />
        </div>
      );
    case "trip":
      return (
        <div className="space-y-2.5">
          <Field label="اسم الرحلة" value={f.title} onChange={(v) => set("title", v)} required maxLength={120} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="تاريخ الذهاب" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="تاريخ العودة" type="date" value={f.returnDate} onChange={(v) => set("returnDate", v)} />
          </div>
          <Field label="عدد الأماكن المتاحة" type="number" value={f.seats} onChange={(v) => set("seats", v)} placeholder="مثال: 40" />
          <Field label="أماكن الزيارة" value={f.places} onChange={(v) => set("places", v)} maxLength={200} placeholder="دير الأنبا بيشوي · وادي النطرون" />
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="وصف" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} />
        </div>
      );
    case "wedding-full":
    case "wedding-half":
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="اسم العريس" value={f.groom} onChange={(v) => set("groom", v)} required maxLength={80} />
            <Field label="اسم العروسة" value={f.bride} onChange={(v) => set("bride", v)} required maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="التاريخ" type="date" value={f.date} onChange={(v) => set("date", v)} required />
            <Field label="المكان" value={f.place} onChange={(v) => set("place", v)} maxLength={120} />
          </div>
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="آية كتابية" value={f.verse} onChange={(v) => set("verse", v)} maxLength={200} placeholder="مثال: ما جمعه الله لا يفرّقه إنسان" />
          <Field label="نص إضافي" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} />
        </div>
      );
    case "condolence":
    case "fortyDay":
    case "annual":
      return (
        <div className="space-y-2.5">
          <div className="rounded-2xl bg-white/70 border border-[#efe2c4] px-3 py-2 text-[11px] text-[#7a5a30] text-right">
            نوع المناسبة: <span className="font-extrabold text-[#3a2a18]">{cat.eventType}</span>
          </div>
          <Field label="اسم المنتقل" value={f.personName} onChange={(v) => set("personName", v)} required maxLength={120} />
          <ImagePicker value={f.image} onChange={(v) => set("image", v)} />
          <Field label="تاريخ الوفاة" type="date" value={f.deathDate} onChange={(v) => set("deathDate", v)} />
          <Field label="آية كتابية" value={f.verse} onChange={(v) => set("verse", v)} maxLength={200} placeholder="مثال: أنا هو القيامة والحياة" />
          <Field label="نص المنشور" value={f.body} onChange={(v) => set("body", v)} multiline maxLength={1500} />
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
    <div className="mt-3 rounded-2xl bg-white/85 border border-[#efe2c4] p-3 text-right">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10.5px] font-bold text-[#7a5a30]">{EXPIRY_HINTS[cat.key]}</span>
        <span className="text-[11.5px] font-extrabold text-[#3a2a18]">تاريخ الانتهاء</span>
      </div>
      <input
        type="datetime-local"
        className="w-full rounded-xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[13px] text-[#3a2a18] outline-none focus:border-[#c79356]"
        value={f.expiresAt}
        onChange={(e) => set("expiresAt", e.target.value)}
      />
      {f.expiresAt ? (
        <button
          type="button"
          onClick={() => set("expiresAt", "")}
          className="mt-1.5 text-[10.5px] font-extrabold text-[#a8344f]"
        >
          مسح — استخدام الافتراضي
        </button>
      ) : null}
    </div>
  );
}


/* --------------------------------- Builder ----------------------------------- */
export function PostBuilder({ onClose }: { onClose: () => void }) {
  const [activeKey, setActiveKey] = useState<CategoryKey>("news");
  const [form, setForm] = useState<FormState>(EMPTY);
  const cat = useMemo(() => CATEGORIES.find((c) => c.key === activeKey)!, [activeKey]);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof FormState, v: string | null) {
    setForm((f) => ({ ...f, [k]: v as never }));
    if (error) setError(null);
  }

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
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[12px] font-extrabold px-3 py-2 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.7)] active:scale-95"
          >
            <Send className="h-3.5 w-3.5 -scale-x-100" />
            نشر
          </button>
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
                    "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold border transition-all " +
                    (active
                      ? "text-white border-white/40 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.45)]"
                      : "bg-white/85 border-[#efe2c4] text-[#3a2a18]")
                  }
                  style={
                    active
                      ? { background: `linear-gradient(180deg, ${m.tone}, ${m.tone}cc)` }
                      : undefined
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-3 rounded-2xl bg-white/80 border border-[#efe2c4] p-3 text-right">
            <p className="text-[10.5px] font-extrabold text-[#b8893a]">{meta.label}</p>
            <p className="mt-0.5 text-[11.5px] text-[#6a543a] leading-snug">
              املأ الحقول المطلوبة (المعلّمة بـ <span className="text-[#c44569] font-extrabold">*</span>) ثم اضغط نشر.
            </p>
          </div>

          <CategoryForm cat={cat} f={form} set={set} />

          <ExpirationField cat={cat} f={form} set={set} />

          {error ? (
            <p className="mt-3 text-[12px] font-extrabold text-[#a8344f] text-right">{error}</p>
          ) : null}

          <div className="h-[env(safe-area-inset-bottom,12px)]" />
        </div>
      </div>
    </div>
  );
}
