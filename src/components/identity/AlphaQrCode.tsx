import { useEffect, useRef } from "react";

type AlphaQrCodeProps = {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  alt?: string;
  margin?: number;
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
}: AlphaQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={size}
      height={size}
      aria-label={alt}
      role="img"
    />
  );
}
