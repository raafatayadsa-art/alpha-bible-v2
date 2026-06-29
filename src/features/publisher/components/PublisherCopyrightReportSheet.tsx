import { useState } from "react";
import { LoaderCircle, ShieldAlert, X } from "lucide-react";
import {
  PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS,
  type PublisherCopyrightReportKind,
} from "../publisher-legal";
import { submitPublisherCopyrightReport } from "../publisher-legal-api";
import {
  PUBLISHER_GLASS_INPUT,
  PUBLISHER_GLASS_LABEL,
  PUBLISHER_REPORT_FIELD,
  PUBLISHER_REPORT_SHEET,
  PUBLISHER_SHEET_OVERLAY,
  PUBLISHER_TEXT_ERROR,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

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
      className={PUBLISHER_SHEET_OVERLAY}
      onClick={onClose}
    >
      <div
        className={PUBLISHER_REPORT_SHEET}
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
              <p className={PUBLISHER_TEXT_TITLE}>بلاغ حقوق نشر</p>
            </div>
            <span className="w-9" />
          </div>

          {contentTitle ? (
            <p className={`mb-3 text-right ${PUBLISHER_TEXT_SUB}`}>{contentTitle}</p>
          ) : null}

          <label className="mb-2 block text-right">
            <span className={`mb-1 block ${PUBLISHER_GLASS_LABEL}`}>نوع البلاغ</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as PublisherCopyrightReportKind)}
              className={PUBLISHER_REPORT_FIELD}
            >
              {(Object.keys(PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS) as PublisherCopyrightReportKind[]).map((k) => (
                <option key={k} value={k}>
                  {PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-right">
            <span className={`mb-1 block ${PUBLISHER_GLASS_LABEL}`}>التفاصيل</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="اشرح المشكلة والأدلة المتاحة…"
              className={`resize-none ${PUBLISHER_GLASS_INPUT}`}
            />
          </label>

          {feedback ? <p className={`mt-2 ${PUBLISHER_TEXT_ERROR}`}>{feedback}</p> : null}
        </div>

        <div className="shrink-0 border-t border-[rgba(93,50,145,0.08)] bg-white p-4 pt-3">
          <button
            type="button"
            disabled={saving || description.trim().length < 10}
            onClick={() => void submit()}
            className="inline-flex w-full items-center justify-center gap-1 rounded-full py-3 alpha-type-body font-extrabold text-white disabled:opacity-60"
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
