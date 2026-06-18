/** Alpha app brand URLs for share text + share-image footer. */
export const ALPHA_WEBSITE_DISPLAY = "www.alphacoptic.com";
export const ALPHA_WEBSITE_URL = "https://www.alphacoptic.com";
export const ALPHA_IOS_STORE_URL = "https://apps.apple.com/app/alpha-coptic";
export const ALPHA_ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.alpha.coptic";

export type AlphaShareRequest = {
  title: string;
  body: string;
  meta?: string;
  imageSrc: string;
  accent: string;
};

export function alphaShareText(req: AlphaShareRequest): string {
  const ref = req.meta ? `\n— ${req.meta}` : "";
  const isVerse = req.title === "آية اليوم";
  const lead = isVerse ? `${req.body}${ref}` : `${req.title}\n\n${req.body}${ref}`;

  return `${lead}

${ALPHA_WEBSITE_DISPLAY}

 iPhone — App Store:
${ALPHA_IOS_STORE_URL}

 Android — Google Play:
${ALPHA_ANDROID_STORE_URL}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = t;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ratio = Math.max(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  fontFamily: string,
) {
  for (let size = startSize; size >= minSize; size -= 2) {
    ctx.font = `bold ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) return { size, lines };
  }
  ctx.font = `bold ${minSize}px ${fontFamily}`;
  return { size: minSize, lines: wrapText(ctx, text, maxWidth).slice(0, maxLines) };
}

function drawShareFooter(ctx: CanvasRenderingContext2D, W: number, footerTop: number, footerH: number) {
  ctx.fillStyle = "#100908";
  ctx.fillRect(0, footerTop, W, footerH);
  ctx.fillStyle = "rgba(231,201,122,0.18)";
  ctx.fillRect(0, footerTop, W, 2);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f0d78c";
  ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
  ctx.fillText(ALPHA_WEBSITE_DISPLAY, W / 2, footerTop + 68);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 24px system-ui, -apple-system, 'SF Arabic', sans-serif";
  ctx.fillText("حمّل تطبيق ألفا القبطي", W / 2, footerTop + 108);

  const pillY = footerTop + 138;
  const pillH = 52;
  const gap = 20;
  const pillW = (W - 120 - gap) / 2;

  const drawPill = (x: number, label: string, sub: string) => {
    ctx.fillStyle = "rgba(231,201,122,0.14)";
    ctx.strokeStyle = "rgba(231,201,122,0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(label, x + pillW / 2, pillY + 26);
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText(sub, x + pillW / 2, pillY + 44);
  };

  drawPill(60, "App Store", "iPhone");
  drawPill(60 + pillW + gap, "Google Play", "Android");

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "15px system-ui, sans-serif";
  ctx.fillText(ALPHA_IOS_STORE_URL, W / 2, footerTop + 228);
  ctx.fillText(ALPHA_ANDROID_STORE_URL, W / 2, footerTop + 256);
}

async function buildVerseShareImage(opts: AlphaShareRequest): Promise<Blob | null> {
  const { body, meta, imageSrc, accent } = opts;
  const img = await loadImage(imageSrc);
  const W = 1080;
  const FOOTER_H = 300;
  const IMG_H = 1200;
  const H = IMG_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no ctx");

  drawImageCover(ctx, img, 0, 0, W, IMG_H);

  const grad = ctx.createLinearGradient(0, 0, 0, IMG_H);
  grad.addColorStop(0, "rgba(0,0,0,0.2)");
  grad.addColorStop(0.38, "rgba(0,0,0,0.06)");
  grad.addColorStop(0.72, "rgba(0,0,0,0.42)");
  grad.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, IMG_H);

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  ctx.fillStyle = accent;
  ctx.font = "bold 34px system-ui, -apple-system, 'SF Arabic', sans-serif";
  ctx.fillText("آية اليوم", W / 2, 88);

  const fontFamily = "system-ui, -apple-system, 'SF Arabic', serif";
  const pad = 72;
  const maxWidth = W - pad * 2;
  const { size, lines } = fitFontSize(ctx, body, maxWidth, 5, 64, 38, fontFamily);
  const lineH = Math.round(size * 1.38);
  const blockH = lines.length * lineH;
  const refSpace = meta ? 52 : 0;
  const zoneTop = 200;
  const zoneBottom = IMG_H - 80;
  let y = zoneTop + Math.max(0, (zoneBottom - zoneTop - blockH - refSpace) / 2) + size;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.72)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineH;
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (meta) {
    ctx.fillStyle = accent;
    ctx.font = `bold ${Math.max(26, Math.round(size * 0.48))}px system-ui, -apple-system, 'SF Arabic', sans-serif`;
    ctx.fillText(`— ${meta}`, W / 2, y + 20);
  }

  ctx.fillStyle = `${accent}22`;
  ctx.font = "bold 180px serif";
  ctx.textAlign = "left";
  ctx.fillText("Ⲁ", 40, 240);

  drawShareFooter(ctx, W, IMG_H, FOOTER_H);

  return await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.93));
}

async function buildGenericShareImage(opts: AlphaShareRequest): Promise<Blob | null> {
  const { title, body, meta, imageSrc, accent } = opts;
  const img = await loadImage(imageSrc);
  const W = 1080;
  const FOOTER_H = 300;
  const IMG_H = 1140;
  const H = IMG_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no ctx");

  drawImageCover(ctx, img, 0, 0, W, IMG_H);
  const grad = ctx.createLinearGradient(0, 0, 0, IMG_H);
  grad.addColorStop(0, "rgba(0,0,0,0.15)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, IMG_H);

  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = accent;
  ctx.font = "bold 38px system-ui, -apple-system, 'SF Arabic', sans-serif";
  ctx.fillText(title, W - 64, IMG_H - 400);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px system-ui, -apple-system, 'SF Arabic', sans-serif";
  const lines = wrapText(ctx, body, W - 128).slice(0, 4);
  let y = IMG_H - 320;
  for (const line of lines) {
    ctx.fillText(line, W - 64, y);
    y += 64;
  }
  if (meta) {
    ctx.fillStyle = accent;
    ctx.font = "bold 28px system-ui, -apple-system, 'SF Arabic', sans-serif";
    ctx.fillText(meta, W - 64, y + 12);
  }

  drawShareFooter(ctx, W, IMG_H, FOOTER_H);
  return await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.93));
}

export async function buildAlphaShareImage(opts: AlphaShareRequest): Promise<Blob | null> {
  if (opts.title === "آية اليوم") return buildVerseShareImage(opts);
  return buildGenericShareImage(opts);
}
