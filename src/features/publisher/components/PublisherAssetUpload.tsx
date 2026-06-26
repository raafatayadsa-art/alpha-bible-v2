import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Music, FileText, Video, X } from "lucide-react";
import {
  mapPublisherUploadError,
  publisherAssetAccept,
  type PublisherAssetKind,
  uploadPublisherAsset,
} from "../publisher-storage-api";

type Props = {
  label: string;
  hint?: string;
  assetKind: PublisherAssetKind;
  scopeId: string;
  folder?: "profile" | "content" | "apply";
  value: string | null;
  fileName?: string | null;
  onChange: (publicUrl: string | null, fileName?: string | null) => void;
  disabled?: boolean;
};

export function PublisherAssetUpload({
  label,
  hint,
  assetKind,
  scopeId,
  folder = "content",
  value,
  fileName,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async (file: File | undefined) => {
    if (!file || disabled || uploading) return;
    setError(null);
    setUploading(true);
    try {
      const { waitForAuthUserId } = await import("@/features/auth");
      const userId = await waitForAuthUserId();
      if (!userId) {
        setError("سجّل دخولك أولاً.");
        return;
      }
      const { publicUrl } = await uploadPublisherAsset({
        userId,
        scopeId,
        file,
        assetKind,
        folder,
      });
      onChange(publicUrl, file.name);
    } catch (err) {
      setError(mapPublisherUploadError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const icon =
    assetKind === "image" ? (
      <ImagePlus className="h-5 w-5" />
    ) : assetKind === "audio" ? (
      <Music className="h-5 w-5" />
    ) : assetKind === "video" ? (
      <Video className="h-5 w-5" />
    ) : (
      <FileText className="h-5 w-5" />
    );

  const isImage = assetKind === "image";

  return (
    <div className="block text-right">
      <span className="mb-1 block text-[10px] font-extrabold text-[#6b658a]">{label}</span>
      <div className="flex items-start gap-3">
        <label
          className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-[rgba(93,50,145,0.35)] bg-white text-[#5D3291] overflow-hidden ${
            isImage ? "h-[78px] w-[78px]" : "min-h-[52px] min-w-[120px] px-3 py-2"
          } ${disabled || uploading ? "opacity-60 pointer-events-none" : "cursor-pointer active:scale-95"}`}
        >
          {uploading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : isImage && value ? (
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="inline-flex flex-col items-center gap-1 text-[10px] font-extrabold">
              {icon}
              {!isImage ? "رفع ملف" : null}
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={publisherAssetAccept(assetKind)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={disabled || uploading}
            onChange={(e) => void pickFile(e.target.files?.[0])}
          />
        </label>

        <div className="min-w-0 flex-1">
          {hint ? <p className="text-[10px] font-bold leading-relaxed text-[#6b658a]">{hint}</p> : null}
          {fileName && !isImage ? (
            <p className="mt-1 truncate text-[11px] font-extrabold text-[#3a3258]">{fileName}</p>
          ) : null}
          {value ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange(null, null)}
              className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#a8344f]"
            >
              <X className="h-3 w-3" />
              إزالة الملف
            </button>
          ) : (
            <p className="mt-1 text-[10px] font-bold text-[#8a84a8]">لم يُرفع ملف بعد</p>
          )}
          {error ? <p className="mt-1 text-[10px] font-bold text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
