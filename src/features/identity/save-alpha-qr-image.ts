/** Download or share the membership QR as a PNG (not a full-page print). */
export async function saveAlphaQrImage(
  payload: string,
  filename: string,
): Promise<boolean> {
  if (!payload.trim()) return false;

  const QRCode = (await import("qrcode")).default;
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#1a1028", light: "#ffffff" },
  });

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "باركود Alpha" });
      return true;
    }
  } catch {
    /* share cancelled or unsupported — fall through to download */
  }

  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}
