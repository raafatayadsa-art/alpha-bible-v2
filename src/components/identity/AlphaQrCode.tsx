import { useEffect, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

type AlphaQrCodeProps = {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  alt?: string;
  margin?: number;
  /** When set, tapping the QR copies this ID (not the encoded payload). */
  copyIdOnTap?: string;
};

function withHash(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

/** Client-side QR — canvas render, works offline and on mobile. */
export function AlphaQrCode({
  value,
  size = 200,
  fgColor = "#1a1208",
  bgColor = "#ffffff",
  className,
  alt = "Alpha QR",
  margin = 2,
  copyIdOnTap,
}: AlphaQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) return;

    let active = true;
    void import("qrcode")
      .then(({ default: QRCode }) => {
        if (!active || !canvasRef.current) return;
        return QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin,
          color: { dark: withHash(fgColor), light: withHash(bgColor) },
          errorCorrectionLevel: "H",
        });
      })
      .catch(() => {
        /* QR library failed — canvas stays blank */
      });

    return () => {
      active = false;
    };
  }, [value, size, fgColor, bgColor, margin]);

  const handleTap = async (e: MouseEvent) => {
    if (!copyIdOnTap?.trim()) return;
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyTextToClipboard(copyIdOnTap.trim());
    if (ok) {
      setCopied(true);
      toast.success("تم نسخ رقم العضوية");
      window.setTimeout(() => setCopied(false), 1400);
    } else {
      toast.error("تعذّر النسخ");
    }
  };

  const canvas = (
    <canvas
      ref={canvasRef}
      className={className}
      width={size}
      height={size}
      aria-label={copied ? `تم نسخ ${copyIdOnTap}` : alt}
      role="img"
    />
  );

  if (!copyIdOnTap?.trim()) return canvas;

  return (
    <button
      type="button"
      onClick={(e) => void handleTap(e)}
      className="touch-manipulation border-0 bg-transparent p-0 active:scale-[0.98]"
      aria-label={`نسخ ${copyIdOnTap}`}
    >
      {canvas}
    </button>
  );
}
