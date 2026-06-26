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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-[#fbf7f0] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border bg-white/90"
          >
            <X className="h-4 w-4 text-[#3a3258]" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[13px] font-extrabold text-[#3a3258]">باركود صفحة الناشر</p>
            <p className="truncate text-[10px] font-bold text-[#6b658a]">{publisher.name}</p>
          </div>
        </div>

        <div className="mx-auto flex w-fit flex-col items-center rounded-[16px] border border-[#d4af37]/35 bg-white p-3">
          <AlphaQrCode value={qrValue} size={168} className="h-[168px] w-[168px] rounded-lg" />
          <p className="mt-2 text-[10px] font-extrabold tracking-wide text-[#5D3291]" dir="ltr">
            {code}
          </p>
          <p className="mt-1 max-w-[240px] truncate text-[9px] font-bold text-[#8a84a8]" dir="ltr">
            {url}
          </p>
          <p className="mt-1 text-[9px] font-bold text-[#8a84a8]">امسح للفتح داخل ألفا</p>
        </div>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void copy(code, "code");
            }}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#5D3291]/25 py-2 text-[11px] font-extrabold text-[#5D3291] active:scale-[0.98]"
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
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#5D3291]/25 py-2 text-[11px] font-extrabold text-[#5D3291] active:scale-[0.98]"
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
