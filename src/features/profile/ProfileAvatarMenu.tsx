import { useEffect, useRef } from "react";
import { Camera, Eye, X } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  avatarUrl: string;
  name: string;
  onClose: () => void;
  onView: () => void;
  onChange: () => void;
};

export function ProfileAvatarMenu({ open, avatarUrl, name, onClose, onView, onChange }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[22px] border border-white/12 bg-[#1a1208] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-[13px] font-extrabold text-white/90">الصورة الشخصية</p>
          <div className="w-9" aria-hidden />
        </div>

        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-[#f0d78c]/45">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-[#2a1f45] text-2xl font-extrabold text-[#f0d78c]">
              {name.charAt(0)}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onView();
              onClose();
            }}
            className="flex w-full items-center justify-end gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[12px] font-extrabold text-white/85 active:scale-[0.98]"
          >
            <Eye className="h-4 w-4 text-[#f0d78c]" />
            عرض الصورة
          </button>
          <button
            type="button"
            onClick={() => {
              onChange();
              onClose();
            }}
            className="flex w-full items-center justify-end gap-2 rounded-xl border border-[#f0d78c]/30 bg-[#f0d78c]/10 px-3 py-3 text-[12px] font-extrabold text-[#f0d78c] active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            تغيير الصورة
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProfileAvatarViewer({
  open,
  avatarUrl,
  name,
  onClose,
}: {
  open: boolean;
  avatarUrl: string;
  name: string;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-[max(env(safe-area-inset-top),16px)] grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white"
        aria-label="إغلاق"
      >
        <X className="h-5 w-5" />
      </button>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
    </div>,
    document.body,
  );
}

export function useAvatarFilePicker(onPick: (dataUrl: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") onPick(reader.result);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      }}
    />
  );

  return { openPicker, input };
}
