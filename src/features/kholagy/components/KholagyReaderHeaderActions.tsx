import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KholagyDisplayMode } from "../kholagy-display";
import { KholagyDisplayPicker } from "./KholagyDisplayPicker";

export function KholagyReaderHeaderActions({
  dark,
  displayMode,
  onDisplayModeChange,
  displayPickerOpen,
  onDisplayPickerOpenChange,
  onShare,
}: {
  dark: boolean;
  displayMode: KholagyDisplayMode;
  onDisplayModeChange: (mode: KholagyDisplayMode) => void;
  displayPickerOpen: boolean;
  onDisplayPickerOpenChange: (open: boolean) => void;
  onShare: () => void;
}) {
  const iconBtn = cn(
    "grid h-10 w-10 place-items-center rounded-full border active:scale-95",
    dark
      ? "border-white/15 bg-white/5 text-[#c4b0ff]"
      : "border-[#c4b0e8]/45 bg-white/70 text-[#5a3d92]",
  );

  return (
    <div className="relative z-10 flex flex-col items-center gap-1">
      <button type="button" aria-label="مشاركة" onClick={onShare} className={iconBtn}>
        <Share2 className="h-4 w-4" />
      </button>
      <KholagyDisplayPicker
        mode={displayMode}
        onChange={onDisplayModeChange}
        dark={dark}
        open={displayPickerOpen}
        onOpenChange={onDisplayPickerOpenChange}
        compactIcon
        className={iconBtn}
      />
    </div>
  );
}
