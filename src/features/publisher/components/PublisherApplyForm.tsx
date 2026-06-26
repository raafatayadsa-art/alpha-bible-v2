import { useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { LoaderCircle, ShieldPlus } from "lucide-react";
import { APPLY_PUBLISHER_TYPES, PUBLISHER_TYPE_LABELS, type PublisherType } from "../types";
import { submitPublisherApplication } from "../publisher-api";
import { PublisherAssetUpload } from "./PublisherAssetUpload";
import { PublisherCopyrightConsent } from "./PublisherCopyrightConsent";

export function PublisherApplyForm() {
  const navigate = useNavigate();
  const applyScopeId = useRef(crypto.randomUUID()).current;
  const [publisherType, setPublisherType] = useState<PublisherType>("choir");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [legalConsent, setLegalConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalConsent) {
      setFeedback("يجب الموافقة على الشروط القانونية.");
      return;
    }
    setFeedback(null);
    setSubmitting(true);
    const result = await submitPublisherApplication({
      publisherType,
      name,
      bio,
      logoUrl: logoUrl ?? undefined,
      coverUrl: coverUrl ?? undefined,
      phone,
      email,
      websiteUrl,
      legalConsent: true,
    });
    setSubmitting(false);

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    if (!result.publisherId) {
      setFeedback("تم إنشاء الطلب لكن تعذّر فتح المساحة. افتحها من صفحات الناشر.");
      return;
    }

    void navigate({
      to: "/publisher/workspace/$publisherId",
      params: { publisherId: result.publisherId },
      replace: true,
    });
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="rounded-[20px] border border-[rgba(93,50,145,0.12)] bg-white/90 p-4 text-right">
        <p className="text-[12px] font-extrabold text-[#3a3258]">طلب صفحة ناشر</p>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-[#6b658a]">
          الكنائس والأديرة تُستلم من{" "}
          <Link to="/church/directory" className="text-[#5D3291] underline">
            دليل الكنائس
          </Link>{" "}
          — هذا النموذج للكورالات وفرق الترانيم ودور النشر.
        </p>
      </div>

      <label className="block text-right">
        <span className="mb-1 block text-[11px] font-extrabold text-[#3a3258]">نوع الجهة</span>
        <select
          value={publisherType}
          onChange={(e) => setPublisherType(e.target.value as PublisherType)}
          className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-3 text-[13px] font-bold text-[#3a3258]"
        >
          {APPLY_PUBLISHER_TYPES.map((t) => (
            <option key={t} value={t}>
              {PUBLISHER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <Field label="اسم الجهة" value={name} onChange={setName} required />
      <Field label="نبذة تعريفية" value={bio} onChange={setBio} multiline />
      <PublisherAssetUpload
        label="شعار الجهة"
        hint="اختياري — ارفع من جهازك"
        assetKind="image"
        scopeId={applyScopeId}
        folder="apply"
        value={logoUrl}
        onChange={(url) => setLogoUrl(url)}
        disabled={submitting}
      />
      <PublisherAssetUpload
        label="صورة الغلاف"
        hint="اختياري — ارفع من جهازك"
        assetKind="image"
        scopeId={applyScopeId}
        folder="apply"
        value={coverUrl}
        onChange={(url) => setCoverUrl(url)}
        disabled={submitting}
      />
      <Field label="الهاتف" value={phone} onChange={setPhone} />
      <Field label="البريد" value={email} onChange={setEmail} />
      <Field label="الموقع (اختياري)" value={websiteUrl} onChange={setWebsiteUrl} />

      <PublisherCopyrightConsent
        variant="application"
        checked={legalConsent}
        onChange={setLegalConsent}
        disabled={submitting}
      />

      <button
        type="submit"
        disabled={submitting || name.trim().length < 2 || !legalConsent}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-extrabold text-white disabled:opacity-70"
        style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
      >
        {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
        {submitting ? "جاري الإرسال…" : "إنشاء مساحة الناشر الخاصة"}
      </button>

      {feedback ? (
        <p className="text-center text-[11px] font-bold leading-relaxed text-red-700">{feedback}</p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-1 block text-[11px] font-extrabold text-[#3a3258]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-3 text-[13px] font-bold text-[#3a3258]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-3 text-[13px] font-bold text-[#3a3258]"
        />
      )}
    </label>
  );
}
