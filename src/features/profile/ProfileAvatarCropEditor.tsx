import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { createPortal } from "react-dom";

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type CropState = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

function coverDrawSize(imgW: number, imgH: number, zoom: number) {
  const coverScale = Math.max(VIEWPORT_SIZE / imgW, VIEWPORT_SIZE / imgH);
  return {
    drawW: imgW * coverScale * zoom,
    drawH: imgH * coverScale * zoom,
    coverScale,
  };
}

function clampOffset(
  offsetX: number,
  offsetY: number,
  drawW: number,
  drawH: number,
): { offsetX: number; offsetY: number } {
  const centerX = (VIEWPORT_SIZE - drawW) / 2;
  const centerY = (VIEWPORT_SIZE - drawH) / 2;
  const minOffsetX = VIEWPORT_SIZE - drawW - centerX;
  const maxOffsetX = -centerX;
  const minOffsetY = VIEWPORT_SIZE - drawH - centerY;
  const maxOffsetY = -centerY;
  return {
    offsetX: Math.min(maxOffsetX, Math.max(minOffsetX, offsetX)),
    offsetY: Math.min(maxOffsetY, Math.max(minOffsetY, offsetY)),
  };
}

export function exportCircularAvatar(
  image: HTMLImageElement,
  crop: CropState,
  viewportSize = VIEWPORT_SIZE,
  outputSize = OUTPUT_SIZE,
): string {
  const { drawW, drawH } = coverDrawSize(image.naturalWidth, image.naturalHeight, crop.zoom);
  const drawX = (viewportSize - drawW) / 2 + crop.offsetX;
  const drawY = (viewportSize - drawH) / 2 + crop.offsetY;
  const map = outputSize / viewportSize;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.save();
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, drawX * map, drawY * map, drawW * map, drawH * map);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}

type Props = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
};

export function ProfileAvatarCropEditor({ open, imageSrc, onClose, onConfirm }: Props) {
  const [crop, setCrop] = useState<CropState>({ offsetX: 0, offsetY: 0, zoom: 1 });
  const [imageReady, setImageReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const markImageReady = useCallback(() => setImageReady(true), []);

  const bindImageRef = useCallback(
    (el: HTMLImageElement | null) => {
      imgRef.current = el;
      if (el?.complete && el.naturalWidth > 0) markImageReady();
    },
    [markImageReady],
  );

  useEffect(() => {
    if (!open || !imageSrc) {
      setImageReady(false);
      return;
    }
    setCrop({ offsetX: 0, offsetY: 0, zoom: 1 });
    setImageReady(false);

    const probe = new Image();
    const onReady = () => markImageReady();
    probe.onload = onReady;
    probe.onerror = onReady;
    probe.src = imageSrc;
    if (probe.complete && probe.naturalWidth > 0) onReady();
  }, [open, imageSrc, markImageReady]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const applyCrop = useCallback((updater: (prev: CropState) => CropState) => {
    setCrop((prev) => {
      const next = updater(prev);
      const img = imgRef.current;
      if (!img?.naturalWidth) return next;
      const { drawW, drawH } = coverDrawSize(img.naturalWidth, img.naturalHeight, next.zoom);
      return { ...next, ...clampOffset(next.offsetX, next.offsetY, drawW, drawH) };
    });
  }, []);

  const setZoom = useCallback(
    (zoom: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
      applyCrop((prev) => ({ ...prev, zoom: clamped }));
    },
    [applyCrop],
  );

  const onPointerDown = (clientX: number, clientY: number) => {
    setDragging(true);
    dragStart.current = { x: clientX, y: clientY, ox: crop.offsetX, oy: crop.offsetY };
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    if (!dragging || !dragStart.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    applyCrop((prev) => ({
      ...prev,
      offsetX: dragStart.current!.ox + dx,
      offsetY: dragStart.current!.oy + dy,
    }));
  };

  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const touchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const a = touches[0]!;
    const b = touches[1]!;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !imageSrc) return;

    const finish = () => {
      const dataUrl = exportCircularAvatar(img, crop);
      if (dataUrl) onConfirm(dataUrl);
    };

    if (img.naturalWidth > 0) {
      finish();
      return;
    }

    img.onload = finish;
    img.src = imageSrc;
  };

  if (!open || !imageSrc || typeof document === "undefined") return null;

  const img = imgRef.current;
  const draw =
    imageReady && img?.naturalWidth
      ? coverDrawSize(img.naturalWidth, img.naturalHeight, crop.zoom)
      : { drawW: VIEWPORT_SIZE, drawH: VIEWPORT_SIZE };
  const drawX = (VIEWPORT_SIZE - draw.drawW) / 2 + crop.offsetX;
  const drawY = (VIEWPORT_SIZE - draw.drawH) / 2 + crop.offsetY;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#0e0a06]"
      dir="rtl"
    >
      <header
        className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white active:scale-95"
          aria-label="إلغاء"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[14px] font-extrabold text-white/90">ضبط الصورة</p>
          <p className="text-[10px] text-white/45">اسحب للتحريك · كبّر أو صغّر للملاءمة</p>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#f0d78c]/45 bg-[#f0d78c]/15 text-[#f0d78c] active:scale-95"
          aria-label="تأكيد"
        >
          <Check className="h-5 w-5" />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div
          className="relative touch-none select-none"
          style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, touchAction: "none" }}
          onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              pinchStart.current = { dist: touchDistance(e.touches), zoom: crop.zoom };
              return;
            }
            onPointerDown(e.touches[0]!.clientX, e.touches[0]!.clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2 && pinchStart.current) {
              const dist = touchDistance(e.touches);
              if (pinchStart.current.dist > 0) {
                const ratio = dist / pinchStart.current.dist;
                setZoom(pinchStart.current.zoom * ratio);
              }
              e.preventDefault();
              return;
            }
            onPointerMove(e.touches[0]!.clientX, e.touches[0]!.clientY);
          }}
          onTouchEnd={() => {
            pinchStart.current = null;
            onPointerUp();
          }}
          onWheel={(e) => {
            e.preventDefault();
            applyCrop((prev) => ({
              ...prev,
              zoom: Math.min(
                MAX_ZOOM,
                Math.max(MIN_ZOOM, prev.zoom + (e.deltaY < 0 ? 0.06 : -0.06)),
              ),
            }));
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ background: "#1a1208" }}
          >
            <img
              ref={bindImageRef}
              src={imageSrc}
              alt=""
              draggable={false}
              onLoad={markImageReady}
              className="absolute max-w-none"
              style={{
                width: draw.drawW,
                height: draw.drawH,
                left: drawX,
                top: drawY,
                cursor: dragging ? "grabbing" : "grab",
              }}
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
              border: "3px solid rgba(240,215,140,0.85)",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-white/25"
          />
        </div>

        <p className="mt-4 text-[10px] font-bold text-[#f0d78c]/55">معاينة الشكل الدائري</p>
      </div>

      <div
        className="relative z-[10] shrink-0 space-y-3 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-black/45 px-3 py-3">
          <button
            type="button"
            onClick={() => setZoom(crop.zoom - 0.12)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f0d78c]/35 bg-[#f0d78c]/12 text-[#f0d78c] active:scale-95"
            aria-label="تصغير"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={crop.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="alpha-avatar-zoom-range h-2 flex-1 cursor-pointer appearance-none rounded-full"
            aria-label="مستوى التكبير"
          />
          <button
            type="button"
            onClick={() => setZoom(crop.zoom + 0.12)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f0d78c]/35 bg-[#f0d78c]/12 text-[#f0d78c] active:scale-95"
            aria-label="تكبير"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-2xl py-3.5 text-[13px] font-extrabold text-[#1a1208] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #f0d78c 0%, #d4af37 100%)",
            boxShadow: "0 8px 24px rgba(240,215,140,0.25)",
          }}
        >
          استخدام الصورة
        </button>
      </div>
      <style>{`
        .alpha-avatar-zoom-range {
          background: linear-gradient(90deg, rgba(240,215,140,0.35) 0%, rgba(240,215,140,0.85) 100%);
        }
        .alpha-avatar-zoom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          border: 2px solid #f0d78c;
          background: #fff8e8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }
        .alpha-avatar-zoom-range::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          border: 2px solid #f0d78c;
          background: #fff8e8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }
        .alpha-avatar-zoom-range::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: rgba(240,215,140,0.35);
        }
      `}</style>
    </div>,
    document.body,
  );
}
