import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { checkSaintGalleryBackendReady, submitSaintGalleryImage, saintGalleryQueryKeys } from "../gallery-api";

type SaintGalleryUploadSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saintId: string;
  saintName: string;
  onSubmitted?: () => void;
};

export function SaintGalleryUploadSheet({
  open,
  onOpenChange,
  saintId,
  saintName,
  onSubmitted,
}: SaintGalleryUploadSheetProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void checkSaintGalleryBackendReady().then((result) => {
      if (cancelled) return;
      setBackendReady(result.ready);
      if (!result.ready && result.error) setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const reset = () => {
    setTitle("");
    setNote("");
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickFile = (picked: File | null) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة");
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError("الحد الأقصى 5 ميجابايت");
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setError(null);
  };

  const onSubmit = async () => {
    if (!file) {
      setError("اختر صورة أولاً");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitSaintGalleryImage({
        saintId,
        file,
        title,
        note,
      });
      if (!result) {
        setError("تعذّر رفع الصورة. تأكد من تسجيل الدخول.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: saintGalleryQueryKeys.mine("current") });
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الرفع");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DrawerContent className="bg-[#fbf3e1] border-[#efe2c4]" dir="rtl">
        <DrawerHeader className="text-right">
          <DrawerTitle className="font-arabic-serif text-[17px] text-[#3a2a18]">إضافة صورة</DrawerTitle>
          <DrawerDescription className="text-[12px] text-[#6a543a]">
            مساهمة لـ {saintName} · 🟡 ستُراجع قبل الاعتماد
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-44 rounded-2xl border-2 border-dashed border-[#d8c08a] bg-white/70 overflow-hidden active:scale-[0.99] transition-transform"
          >
            {preview ? (
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center gap-2 text-[#6a543a]">
                <ImagePlus className="h-8 w-8 text-[#b8893a]" />
                <span className="text-[12px] font-bold">اختر صورة</span>
              </span>
            )}
          </button>

          <label className="block">
            <span className="text-[11px] font-bold text-[#6a543a]">عنوان (اختياري)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-[#efe2c4] bg-white/85 px-3 text-[13px] text-[#3a2a18] outline-none focus:border-[#b8893a]"
              placeholder="مثال: أيقونة من كنيسة مارمرقس"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold text-[#6a543a]">ملاحظة (اختياري)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-[#efe2c4] bg-white/85 px-3 py-2 text-[13px] text-[#3a2a18] outline-none focus:border-[#b8893a] resize-none"
              placeholder="أي تفاصيل تساعد فريق المراجعة"
            />
          </label>

          {error ? <p className="text-[12px] font-bold text-[#b54545]">{error}</p> : null}
        </div>

        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 flex gap-2">
          <button
            type="button"
            disabled={busy || !backendReady}
            onClick={() => void onSubmit()}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white text-[13px] font-extrabold disabled:opacity-60 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            رفع للمراجعة
          </button>
          <DrawerClose asChild>
            <button
              type="button"
              className="h-11 px-5 rounded-2xl bg-white/85 border border-[#efe2c4] text-[13px] font-bold text-[#3a2a18]"
            >
              إلغاء
            </button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
