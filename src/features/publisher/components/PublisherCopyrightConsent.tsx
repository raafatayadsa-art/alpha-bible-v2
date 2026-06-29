import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  EMPTY_PUBLISHER_LEGAL_ACK,
  isPublisherLegalAckComplete,
  PUBLISHER_LEGAL_ACK_ITEMS,
  type PublisherLegalAckState,
} from "../publisher-legal-terms";
import { PublisherLegalTermsSheet } from "./PublisherLegalTermsSheet";
import {
  PUBLISHER_CONSENT_CARD,
  PUBLISHER_TERMS_CHIP,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: "application" | "content";
};

export function PublisherCopyrightConsent({ checked, onChange, disabled, variant = "content" }: Props) {
  const [acks, setAcks] = useState<PublisherLegalAckState>(EMPTY_PUBLISHER_LEGAL_ACK);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (!checked) setAcks(EMPTY_PUBLISHER_LEGAL_ACK);
  }, [checked]);

  const toggleAck = (id: keyof PublisherLegalAckState, value: boolean) => {
    const next = { ...acks, [id]: value };
    setAcks(next);
    onChange(isPublisherLegalAckComplete(next));
  };

  return (
    <>
      <div className={PUBLISHER_CONSENT_CARD}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className={PUBLISHER_TERMS_CHIP}
          >
            <FileText className="h-3 w-3" />
            الشروط كاملة
          </button>
          <p className={`flex-1 text-right ${PUBLISHER_TEXT_ACCENT_CAPTION}`}>
            {variant === "application" ? "إقرار الناشر — Version 1.0" : "إقرار حقوق النشر — Version 1.0"}
          </p>
        </div>

        <p className={`text-right ${PUBLISHER_TEXT_SUB} leading-relaxed`}>
          {variant === "application"
            ? "بإنشاء صفحة ناشر فإنك تقر بقراءة شروط النشر وحقوق الملكية الفكرية والالتزام بها."
            : "قبل رفع المحتوى، أكّد الإقرارات التالية وفق شروط Alpha للناشرين."}
        </p>

        <div className="space-y-1.5">
          {PUBLISHER_LEGAL_ACK_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-2 rounded-xl border border-[rgba(93,50,145,0.1)] bg-white px-2.5 py-2"
            >
              <input
                type="checkbox"
                checked={acks[item.id]}
                disabled={disabled}
                onChange={(e) => toggleAck(item.id, e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#5D3291]"
              />
              <span className={`flex-1 text-right ${PUBLISHER_TEXT_TITLE} text-[10px] leading-relaxed`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <PublisherLegalTermsSheet open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
}
