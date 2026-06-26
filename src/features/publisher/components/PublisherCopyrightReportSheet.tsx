import { useState } from "react";
import { LoaderCircle, ShieldAlert, X } from "lucide-react";
import {
  PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS,
  type PublisherCopyrightReportKind,
} from "../publisher-legal";
import { submitPublisherCopyrightReport } from "../publisher-legal-api";

type Props = {
  contentId: string | null;
  contentTitle: string | null;
  onClose: () => void;
  onSubmitted?: () => void;
};

const DOCK_OFFSET =
  "calc(var(--alpha-bottom-nav-height, 72px) + env(safe-area-inset-bottom, 0px) + 12px)";

export function PublisherCopyrightReportSheet({ contentId, contentTitle, onClose, onSubmitted }: Props) {
  const [kind, setKind] = useState<PublisherCopyrightReportKind>("copyright_violation");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!contentId) return null;

  const submit = async () => {
    setSaving(true);
    setFeedback(null);
    const result = await submitPublisherCopyrightReport(contentId, kind, description);
    setSaving(false);
    if (result.ok) {
      onSubmitted?.();
      onClose();
    } else {
      setFeedback(result.message ?? "تعذّر الإرسال.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm max-h-[min(82dvh,520px)] flex-col overflow-hidden rounded-t-[22px] border border-b-0 border-[rgba(93,50,145,0.14)] bg-white shadow-[0_-16px_48px_rgba(0,0,0,0.22)]"
        style={{ marginBottom: DOCK_OFFSET }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-4 pb-2">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-[#a8344f]" />
              <p className="text-[13px] font-extrabold text-[#3a3258]">بلاغ حقوق نشر</p>
            </div>
            <span className="w-9" />
          </div>

          {contentTitle ? (
            <p className="mb-3 text-right text-[11px] font-bold text-[#6b658a]">{contentTitle}</p>
          ) : null}

          <label className="mb-2 block text-right">
            <span className="mb-1 block text-[10px] font-extrabold text-[#6b658a]">نوع البلاغ</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as PublisherCopyrightReportKind)}
              className="w-full rounded-xl border px-3 py-2 text-[12px] font-bold"
            >
              {(Object.keys(PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS) as PublisherCopyrightReportKind[]).map((k) => (
                <option key={k} value={k}>
                  {PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-right">
            <span className="mb-1 block text-[10px] font-extrabold text-[#6b658a]">التفاصيل</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="اشرح المشكلة والأدلة المتاحة…"
              className="w-full resize-none rounded-xl border px-3 py-2 text-[12px] font-bold"
            />
          </label>

          {feedback ? <p className="mt-2 text-center text-[10px] font-bold text-[#a8344f]">{feedback}</p> : null}
        </div>

        <div className="shrink-0 border-t border-[rgba(93,50,145,0.08)] bg-white p-4 pt-3">
          <button
            type="button"
            disabled={saving || description.trim().length < 10}
            onClick={() => void submit()}
            className="inline-flex w-full items-center justify-center gap-1 rounded-full py-3 text-[12px] font-extrabold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(160deg, #a8344f, #7a2840)" }}
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            إرسال البلاغ
          </button>
        </div>
      </div>
    </div>
  );
}
