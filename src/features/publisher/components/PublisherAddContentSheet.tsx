import { createPortal } from "react-dom";
import { Disc3, Mic, Plus, Video } from "lucide-react";
import { MESSAGING_GLASS_INNER, MESSAGING_GLASS_SHELL } from "@/components/alpha/messaging-ui";
import { cn } from "@/lib/utils";
import {
  PUBLISHER_GLASS_SHEET_BACKDROP,
  PUBLISHER_GLASS_SHEET_OVERLAY,
} from "./publisher-glass-chrome";

export type AddContentChoice = "album" | "hymn" | "video" | "book" | "other";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: AddContentChoice) => void;
};

const OPTIONS: { id: AddContentChoice; label: string; hint: string; icon: typeof Disc3 }[] = [
  { id: "album", label: "إضافة ألبوم", hint: "رفع عدة ترانيم دفعة واحدة", icon: Disc3 },
  { id: "hymn", label: "إضافة ترنيمة", hint: "ملف صوتي واحد", icon: Mic },
  { id: "video", label: "إضافة فيديو", hint: "محاضرة أو فيديو", icon: Video },
  { id: "book", label: "إضافة كتاب", hint: "PDF أو كتاب", icon: Plus },
];

export function PublisherAddContentSheet({ open, onClose, onSelect }: Props) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(PUBLISHER_GLASS_SHEET_OVERLAY, "z-[65]")}
      dir="rtl"
      style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 24px), 32px)" }}
    >
      <button type="button" aria-label="إغلاق" onClick={onClose} className={PUBLISHER_GLASS_SHEET_BACKDROP} />
      <div className={cn("relative z-[1] w-full max-w-[360px] overflow-hidden", MESSAGING_GLASS_SHELL)}>
        <div className="relative flex h-12 items-center justify-center border-b border-white/25 px-4">
          <p className="text-[14px] font-bold text-[#1F2937]">إضافة محتوى</p>
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 flex items-center text-[14px] font-semibold text-[#EF4444]"
          >
            إلغاء
          </button>
        </div>

        <div className="space-y-2 p-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  onClose();
                }}
                className={cn(
                  MESSAGING_GLASS_INNER,
                  "flex w-full items-center gap-3 px-3 py-3 text-right transition active:scale-[0.99]",
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-white/40 bg-white/55 text-[#b8893a]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-extrabold text-[#1F2937]">{opt.label}</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#8a6a3a]">{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
