import { useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

type CopiedKey = "id" | "url" | null;

type Props = {
  title?: string;
  subtitle?: string;
  alphaId: string;
  qrPayload: string;
  shareUrl: string;
  variant?: "dark" | "light";
  onShare?: () => void;
  className?: string;
  compact?: boolean;
};

export function ProfileIdentityShareCard({
  title = "باركود الملف الشخصي",
  subtitle,
  alphaId,
  qrPayload,
  shareUrl,
  variant = "dark",
  onShare,
  className = "",
  compact = false,
}: Props) {
  const [copied, setCopied] = useState<CopiedKey>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = variant === "dark";

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

  const qrSize = compact ? 120 : 168;

  return (
    <section
      className={`overflow-hidden rounded-[20px] border ${compact ? "px-3 py-3" : "px-4 py-4"} ${className}`}
      style={{
        borderColor: isDark ? "rgba(240,215,140,0.14)" : "rgba(93,50,145,0.14)",
        background: isDark
          ? "linear-gradient(155deg, rgba(26,16,8,0.92) 0%, rgba(30,20,12,0.88) 100%)"
          : "#fbf7f0",
      }}
      dir="rtl"
    >
      <div className="mb-3 text-right">
        <p className={`${compact ? "text-[12px]" : "text-[13px]"} font-extrabold ${isDark ? "text-white/90" : "text-[#3a3258]"}`}>
          {title}
        </p>
        {subtitle ? (
          <p className={`mt-0.5 text-[10px] font-bold ${isDark ? "text-white/45" : "text-[#6b658a]"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div
        className="mx-auto flex w-fit flex-col items-center rounded-[14px] border p-2.5"
        style={{
          borderColor: isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.35)",
          background: "#ffffff",
        }}
      >
        <AlphaQrCode
          value={qrPayload}
          copyIdOnTap={alphaId}
          size={qrSize}
          className={`rounded-lg ${compact ? "h-[120px] w-[120px]" : "h-[168px] w-[168px]"}`}
        />
        <p className="mt-2 text-[11px] font-extrabold tracking-wide text-[#5D3291]" dir="ltr">
          {alphaId}
        </p>
        <p className="mt-1 max-w-[260px] truncate text-[9px] font-bold text-[#8a84a8]" dir="ltr">
          {shareUrl}
        </p>
        <p className="mt-1 text-[9px] font-bold text-[#8a84a8]">امسح للفتح داخل ألفا</p>
      </div>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={() => void copy(alphaId, "id")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 text-[11px] font-extrabold active:scale-[0.98]"
          style={{
            borderColor: isDark ? "rgba(240,215,140,0.28)" : "rgba(93,50,145,0.25)",
            color: isDark ? "#f0d78c" : "#5D3291",
            background: isDark ? "rgba(0,0,0,0.25)" : "transparent",
          }}
        >
          {copied === "id" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === "id" ? "تم نسخ Alpha ID" : "نسخ Alpha ID"}
        </button>
        <button
          type="button"
          onClick={() => void copy(shareUrl, "url")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 text-[11px] font-extrabold active:scale-[0.98]"
          style={{
            borderColor: isDark ? "rgba(240,215,140,0.28)" : "rgba(93,50,145,0.25)",
            color: isDark ? "#f0d78c" : "#5D3291",
            background: isDark ? "rgba(0,0,0,0.25)" : "transparent",
          }}
        >
          {copied === "url" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === "url" ? "تم نسخ الرابط" : "نسخ رابط الملف"}
        </button>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-extrabold text-white active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,rgba(31,170,106,0.55),rgba(0,0,0,0.35))",
              border: "1px solid rgba(31,170,106,0.45)",
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            مشاركة الملف
          </button>
        ) : null}
        {copyError ? (
          <p className="text-center text-[10px] font-bold text-red-400">{copyError}</p>
        ) : null}
      </div>
    </section>
  );
}
