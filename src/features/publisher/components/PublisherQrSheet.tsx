import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import {
  buildPublisherQrPayload,
  derivePublisherCode,
  shareUrlForPublisher,
} from "../publisher-identity";
import type { PublisherRecord } from "../types";
import {
  PUBLISHER_PURPLE_BTN_OUTLINE,
  PUBLISHER_QR_FRAME,
  PUBLISHER_SHEET_OVERLAY_QR,
  PUBLISHER_SHEET_PANEL_SM,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

type Props = {
  publisher: Pick<PublisherRecord, "id" | "name"> | null;
  onClose: () => void;
};

type CopiedKey = "code" | "url" | null;

export function PublisherQrSheet({ publisher, onClose }: Props) {
  const [copied, setCopied] = useState<CopiedKey>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!publisher) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [publisher, onClose]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  if (!publisher) return null;

  const code = derivePublisherCode(publisher.id);
  const qrValue = buildPublisherQrPayload(publisher.id);
  const url = shareUrlForPublisher(publisher.id);

  const copy = async (text: string, key: Exclude<CopiedKey, null>) => {
    setCopyError(null);
    const ok = await copyTextToClipboard(text);
    if (!ok) {
      setCopied(null);
      setCopyError("تعذّر النسخ — حاول مرة أخرى");
      return;
    }
    setCopied(key);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div
      className={PUBLISHER_SHEET_OVERLAY_QR}
      onClick={onClose}
    >
      <div
        className={PUBLISHER_SHEET_PANEL_SM}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border bg-white/90"
          >
            <X className={`h-4 w-4 ${PUBLISHER_TEXT_TITLE}`} />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className={PUBLISHER_TEXT_TITLE}>باركود صفحة الناشر</p>
            <p className={`truncate ${PUBLISHER_TEXT_SUB}`}>{publisher.name}</p>
          </div>
        </div>

        <div className={PUBLISHER_QR_FRAME}>
          <AlphaQrCode value={qrValue} size={168} className="h-[168px] w-[168px] rounded-lg" />
          <p className={`mt-2 ${PUBLISHER_TEXT_ACCENT_CAPTION} tracking-wide`} dir="ltr">
            {code}
          </p>
          <p className={`mt-1 max-w-[240px] truncate ${PUBLISHER_TEXT_MUTED}`} dir="ltr">
            {url}
          </p>
          <p className={`mt-1 ${PUBLISHER_TEXT_MUTED}`}>امسح للفتح داخل ألفا</p>
        </div>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void copy(code, "code");
            }}
            className={PUBLISHER_PURPLE_BTN_OUTLINE}
          >
            {copied === "code" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "code" ? "تم نسخ الكود" : "نسخ الكود"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void copy(url, "url");
            }}
            className={PUBLISHER_PURPLE_BTN_OUTLINE}
          >
            {copied === "url" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "url" ? "تم نسخ الرابط" : "نسخ رابط الصفحة"}
          </button>
          {copyError ? (
            <p className="text-center text-[10px] font-bold text-red-600">{copyError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
