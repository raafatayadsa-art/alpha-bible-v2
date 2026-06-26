import { useEffect, useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";
import type { PublisherRecord } from "../types";
import { updatePublisherWorkspace } from "../publisher-api";
import { PublisherAssetUpload } from "./PublisherAssetUpload";

type Props = {
  open: boolean;
  publisher: PublisherRecord;
  onClose: () => void;
  onSaved: (publisher: PublisherRecord) => void;
};

function Field({
  label,
  value,
  onChange,
  multiline,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block text-right">
      <span className="mb-1 block text-[10px] font-extrabold text-[#5D3291]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          dir={dir}
          className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-2.5 text-[12px] font-bold text-[#3a3258]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-2.5 text-[12px] font-bold text-[#3a3258]"
        />
      )}
    </label>
  );
}

export function PublisherProfileSheet({ open, publisher, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState(publisher);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (open) setDraft(publisher);
  }, [open, publisher]);

  if (!open) return null;

  const patch = (partial: Partial<PublisherRecord>) => setDraft((d) => ({ ...d, ...partial }));

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    const result = await updatePublisherWorkspace(publisher.id, {
      name: draft.name,
      bio: draft.bio ?? "",
      logoUrl: draft.logoUrl ?? "",
      coverUrl: draft.coverUrl ?? "",
      phone: draft.phone ?? "",
      email: draft.email ?? "",
      websiteUrl: draft.websiteUrl ?? "",
      facebookUrl: draft.facebookUrl ?? "",
      youtubeUrl: draft.youtubeUrl ?? "",
    });
    setSaving(false);
    if (result.ok) {
      onSaved(draft);
      setFeedback("تم حفظ بيانات الصفحة.");
      setTimeout(() => onClose(), 600);
    } else {
      setFeedback(result.message ?? "تعذّر الحفظ.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center">
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-[#fbf7f0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[rgba(93,50,145,0.1)] px-4 py-3">
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
            <X className="h-4 w-4" />
          </button>
          <div className="text-right">
            <p className="text-[13px] font-extrabold text-[#3a3258]">بيانات الصفحة</p>
            <p className="text-[10px] font-bold text-[#6b658a]">الشعار، الغلاف، التواصل</p>
          </div>
          <span className="w-9" />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <Field label="الاسم" value={draft.name} onChange={(v) => patch({ name: v })} />
          <Field label="النبذة" value={draft.bio ?? ""} onChange={(v) => patch({ bio: v })} multiline />
          <PublisherAssetUpload
            label="شعار الجهة"
            hint="صورة مربّعة — حتى 5 ميجابايت"
            assetKind="image"
            scopeId={publisher.id}
            folder="profile"
            value={draft.logoUrl}
            onChange={(url) => patch({ logoUrl: url })}
            disabled={saving}
          />
          <PublisherAssetUpload
            label="صورة الغلاف"
            hint="غلاف عريض للصفحة — حتى 5 ميجابايت"
            assetKind="image"
            scopeId={publisher.id}
            folder="profile"
            value={draft.coverUrl}
            onChange={(url) => patch({ coverUrl: url })}
            disabled={saving}
          />
          <Field label="الهاتف" value={draft.phone ?? ""} onChange={(v) => patch({ phone: v })} dir="ltr" />
          <Field label="البريد" value={draft.email ?? ""} onChange={(v) => patch({ email: v })} dir="ltr" />
          <Field label="الموقع" value={draft.websiteUrl ?? ""} onChange={(v) => patch({ websiteUrl: v })} dir="ltr" />
          {feedback ? <p className="text-center text-[11px] font-bold text-[#5D3291]">{feedback}</p> : null}
        </div>

        <div className="shrink-0 border-t border-[rgba(93,50,145,0.1)] px-4 py-3">
          <button
            type="button"
            disabled={saving || !draft.name.trim()}
            onClick={() => void save()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "جاري الحفظ…" : "حفظ بيانات الصفحة"}
          </button>
        </div>
      </div>
    </div>
  );
}
