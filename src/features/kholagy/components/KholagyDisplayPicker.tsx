import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGrid } from "lucide-react";
import { MESSAGING_GLASS_SHELL } from "@/components/alpha/messaging-ui";
import { cn } from "@/lib/utils";
import {
  KHOLAGY_DISPLAY_MODES,
  type KholagyDisplayMode,
} from "../kholagy-display";

function KholagyDisplaySheet({
  open,
  mode,
  onClose,
  onConfirm,
  onDraftChange,
}: {
  open: boolean;
  mode: KholagyDisplayMode;
  onClose: () => void;
  onConfirm: () => void;
  onDraftChange: (mode: KholagyDisplayMode) => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{`
        @keyframes alphaDateSheetIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center px-4"
        dir="rtl"
      >
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute inset-0 bg-black/28 backdrop-blur-[3px] animate-in fade-in duration-200"
        />
        <div
          role="dialog"
          aria-modal
          aria-label="اختر طريقة العرض"
          className={cn("relative z-[1] w-full max-w-[320px] overflow-hidden", MESSAGING_GLASS_SHELL)}
          style={{ animation: "alphaDateSheetIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-12 items-center justify-center px-4 pt-1">
            <p className="text-[14px] font-bold text-[#1F2937]">طريقة العرض</p>
            <button
              type="button"
              onClick={onConfirm}
              className="absolute inset-y-0 start-4 flex items-center pt-0.5 text-[16px] font-bold text-[#166534] transition-colors hover:text-[#14532D] active:text-[#0F3D22]"
            >
              تم
            </button>
            <button
              type="button"
              onClick={onClose}
              className="absolute inset-y-0 end-4 flex items-center pt-0.5 text-[14px] font-semibold text-[#EF4444]"
            >
              إلغاء
            </button>
          </div>

          <div className="mx-2.5 mb-3 mt-1 overflow-hidden rounded-[14px] border border-white/32 bg-white/42 px-2.5 py-3 backdrop-blur-sm">
            <p className="mb-3 text-center text-[11px] font-semibold text-[#6a5488]">
              العربي يمين · القبطي وسط · الإنجليزي يسار
            </p>
            <div className="grid grid-cols-2 gap-2">
              {KHOLAGY_DISPLAY_MODES.map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onDraftChange(item.id)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2.5 text-center text-[12px] font-bold transition-all active:scale-[0.98]",
                      active
                        ? "border-[#8a6ec1] bg-gradient-to-br from-[#8a6ec1] to-[#5a3d92] text-white shadow-[0_6px_16px_-8px_rgba(122,92,176,0.55)]"
                        : "border-[#c4b0e8]/35 bg-white/72 text-[#3a2560]",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function KholagyDisplayPicker({
  mode,
  onChange,
  dark,
  open,
  onOpenChange,
  compactIcon = false,
  className,
}: {
  mode: KholagyDisplayMode;
  onChange: (mode: KholagyDisplayMode) => void;
  dark: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compactIcon?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(mode);
  const current = KHOLAGY_DISPLAY_MODES.find((m) => m.id === mode);

  useEffect(() => {
    if (open) setDraft(mode);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const openSheet = () => onOpenChange(true);
  const closeSheet = () => onOpenChange(false);
  const confirmSheet = () => {
    onChange(draft);
    onOpenChange(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="طريقة العرض"
        aria-expanded={open}
        onClick={openSheet}
        className={cn(
          compactIcon
            ? className
            : cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-bold active:scale-95",
                dark
                  ? "border-[#c4b0ff]/30 bg-[#7a5cb0]/25 text-[#e8dcff]"
                  : "border-[#8a6ec1]/35 bg-[#8a6ec1]/10 text-[#5a3d92]",
              ),
        )}
      >
        <LayoutGrid className={compactIcon ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {!compactIcon ? <span>{current?.short ?? "عرض"}</span> : null}
      </button>

      <KholagyDisplaySheet
        open={open}
        mode={draft}
        onClose={closeSheet}
        onConfirm={confirmSheet}
        onDraftChange={setDraft}
      />
    </>
  );
}
