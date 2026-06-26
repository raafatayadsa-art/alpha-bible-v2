import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  EMPTY_PUBLISHER_LEGAL_ACK,
  isPublisherLegalAckComplete,
  PUBLISHER_LEGAL_ACK_ITEMS,
  type PublisherLegalAckState,
} from "../publisher-legal-terms";
import { PublisherLegalTermsSheet } from "./PublisherLegalTermsSheet";

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
      <div className="rounded-[18px] border border-[rgba(93,50,145,0.14)] bg-[#faf8f5] p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#5D3291]/25 px-2.5 py-1 text-[9px] font-extrabold text-[#5D3291]"
          >
            <FileText className="h-3 w-3" />
            الشروط كاملة
          </button>
          <p className="flex-1 text-right text-[10px] font-extrabold text-[#5D3291]">
            {variant === "application" ? "إقرار الناشر — Version 1.0" : "إقرار حقوق النشر — Version 1.0"}
          </p>
        </div>

        <p className="text-right text-[10px] font-bold leading-relaxed text-[#6b658a]">
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
              <span className="flex-1 text-right text-[10px] font-extrabold leading-relaxed text-[#3a3258]">
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
