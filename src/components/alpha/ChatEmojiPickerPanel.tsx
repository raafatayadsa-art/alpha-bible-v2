import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { X } from "lucide-react";

export function ChatEmojiPickerPanel({
  onPick,
  onClose,
  composerBottom,
  embedded = false,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
  composerBottom: number;
  embedded?: boolean;
}) {
  const handlePick = (data: EmojiClickData) => {
    onPick(data.emoji);
  };

  if (embedded) {
    return (
        <div
          className={`${embedded ? "absolute" : "fixed"} inset-0 z-[120] bg-black/45 backdrop-blur-[3px]`}
          onClick={onClose}
        >
          <div
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[var(--alpha-content-narrow-width)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div dir="rtl" className="glass-strong overflow-hidden rounded-t-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.45)]">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 pb-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-[14px] font-bold text-neon-green active:scale-95"
              >
                تم
              </button>
              <p className="text-[15px] font-bold text-neon-green">الإيموجي</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="glass flex size-9 items-center justify-center rounded-full text-muted-foreground active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="[&_.EmojiPickerReact]:!w-full [&_.EmojiPickerReact]:!border-0">
              <EmojiPicker
                onEmojiClick={handlePick}
                theme={Theme.DARK}
                width="100%"
                height={300}
                searchPlaceholder="ابحث…"
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis
              />
            </div>
            <div className="pb-[max(env(safe-area-inset-bottom),8px)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/28 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 w-[92%] max-w-[320px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-white/20 bg-white/96 shadow-[0_24px_64px_rgba(0,0,0,0.18)] backdrop-blur-3xl"
        style={{ bottom: composerBottom + 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div dir="rtl" className="border-b border-[#E5E7EB]/80 px-4 py-2.5 text-center text-[13px] font-bold text-[#1F2937]">
          الإيموجي
        </div>
        <div className="[&_.EmojiPickerReact]:!w-full [&_.EmojiPickerReact]:!border-0">
          <EmojiPicker
            onEmojiClick={handlePick}
            theme={Theme.LIGHT}
            width="100%"
            height={300}
            searchPlaceholder="ابحث…"
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis
          />
        </div>
      </div>
    </div>
  );
}
