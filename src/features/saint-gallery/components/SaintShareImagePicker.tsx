import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { alphaShareText } from "@/lib/alpha-share-brand";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type SaintShareImagePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saintName: string;
  saintSummary: string;
  images: string[];
  initialIndex?: number;
};

export function SaintShareImagePicker({
  open,
  onOpenChange,
  saintName,
  saintSummary,
  images,
  initialIndex = 0,
}: SaintShareImagePickerProps) {
  const [selected, setSelected] = useState(initialIndex);

  useEffect(() => {
    if (open) setSelected(initialIndex);
  }, [open, initialIndex]);

  const onShare = async () => {
    const imageSrc = images[selected] ?? images[0];
    const payload = {
      title: saintName,
      body: saintSummary,
      meta: "قديس اليوم · Alpha",
      imageSrc,
      accent: "#b8893a",
    };
    const text = alphaShareText(payload);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: saintName, text });
        onOpenChange(false);
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#fbf3e1] border-[#efe2c4]" dir="rtl">
        <DrawerHeader className="text-right">
          <DrawerTitle className="font-arabic-serif text-[17px] text-[#3a2a18]">اختر صورة المشاركة</DrawerTitle>
          <DrawerDescription className="text-[12px] text-[#6a543a]">بطاقة مشاركة {saintName}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-2 max-h-[42vh] overflow-y-auto">
          {images.map((url, i) => (
            <label
              key={`${url}-${i}`}
              className={`flex items-center gap-3 rounded-2xl border p-2 cursor-pointer transition-colors ${
                selected === i ? "border-[#6a4ab5] bg-white" : "border-[#efe2c4] bg-white/70"
              }`}
            >
              <input
                type="radio"
                name="share-image"
                checked={selected === i}
                onChange={() => setSelected(i)}
                className="accent-[#6a4ab5]"
              />
              <img src={url} alt="" className="h-14 w-14 rounded-xl object-cover border border-[#ead9b1]" />
              <span className="text-[12px] font-bold text-[#3a2a18]">
                {i === initialIndex ? "الصورة الحالية" : `صورة ${i + 1}`}
              </span>
            </label>
          ))}
        </div>

        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void onShare()}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white text-[13px] font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Share2 className="h-4 w-4" /> مشاركة
          </button>
          <DrawerClose asChild>
            <button type="button" className="h-11 px-5 rounded-2xl bg-white/85 border border-[#efe2c4] text-[13px] font-bold text-[#3a2a18]">
              إلغاء
            </button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
