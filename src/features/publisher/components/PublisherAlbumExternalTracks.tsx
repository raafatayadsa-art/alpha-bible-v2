import { useRef, useState } from "react";
import { LoaderCircle, Music, Plus, Trash2 } from "lucide-react";
import { MESSAGING_GLASS_INNER } from "@/components/alpha/messaging-ui";
import {
  mapPublisherUploadError,
  publisherAssetAccept,
  uploadPublisherAsset,
} from "../publisher-storage-api";

export type AlbumExternalTrack = {
  id: string;
  title: string;
  mediaUrl: string;
  fileName: string;
  durationSeconds: number | null;
};

type Props = {
  publisherId: string;
  tracks: AlbumExternalTrack[];
  onChange: (tracks: AlbumExternalTrack[]) => void;
  disabled?: boolean;
};

function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base || "ترنيمة";
}

async function readAudioDurationSec(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    };
    audio.onerror = () => resolve(null);
    audio.src = url;
  });
}

export function PublisherAlbumExternalTracks({ publisherId, tracks, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length || disabled || uploading) return;
    setError(null);
    setUploading(true);

    try {
      const { waitForAuthUserId } = await import("@/features/auth");
      const userId = await waitForAuthUserId();
      if (!userId) {
        setError("سجّل دخولك أولاً.");
        return;
      }

      const added: AlbumExternalTrack[] = [];
      for (const file of Array.from(files)) {
        const { publicUrl } = await uploadPublisherAsset({
          userId,
          scopeId: publisherId,
          file,
          assetKind: "audio",
          folder: "content",
        });
        const durationSeconds = await readAudioDurationSec(publicUrl);
        added.push({
          id: crypto.randomUUID(),
          title: titleFromFileName(file.name),
          mediaUrl: publicUrl,
          fileName: file.name,
          durationSeconds,
        });
      }
      onChange([...tracks, ...added]);
    } catch (err) {
      setError(mapPublisherUploadError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updateTrack = (id: string, patch: Partial<AlbumExternalTrack>) => {
    onChange(tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeTrack = (id: string) => {
    onChange(tracks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-3 text-right">
      <div className="rounded-[14px] border border-white/32 bg-white/42 px-3 py-2.5 backdrop-blur-sm">
        <p className="text-[11px] font-extrabold text-[#3a2a18]">رفع ترانيم الألبوم</p>
        <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-[#8a6a3a]">
          ارفع ملفات الصوت مباشرة — لا حاجة لإضافة ترانيم منفصلة أولاً. يمكنك اختيار عدة ملفات دفعة واحدة.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#efe2c4]/90 bg-white/70 py-3 text-[12px] font-extrabold text-[#3a2a18] shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        {uploading ? (
          <LoaderCircle className="h-4 w-4 animate-spin text-[#b8893a]" />
        ) : (
          <Plus className="h-4 w-4 text-[#b8893a]" />
        )}
        {uploading ? "جاري الرفع…" : "إضافة ملفات صوتية"}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={publisherAssetAccept("audio")}
        className="hidden"
        onChange={(e) => void uploadFiles(e.target.files)}
      />

      {tracks.length ? (
        <div className="max-h-[min(46vh,300px)] space-y-2 overflow-y-auto">
          {tracks.map((track, index) => (
            <div key={track.id} className={`${MESSAGING_GLASS_INNER} flex items-start gap-2 p-2.5`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/35 bg-white/50 text-[#b8893a]">
                <Music className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-extrabold text-[#8a6a3a]">#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTrack(track.id)}
                    className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#EF4444]"
                  >
                    <Trash2 className="h-3 w-3" />
                    حذف
                  </button>
                </div>
                <input
                  value={track.title}
                  onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                  className="w-full rounded-xl border border-[#efe2c4]/90 bg-white/75 px-2.5 py-2 text-[11px] font-bold text-[#3a2a18] outline-none focus:border-[#4fd4a8]/60 focus:ring-2 focus:ring-[#4fd4a8]/20"
                  placeholder="اسم الترنيمة"
                />
                <p className="truncate text-[9px] font-bold text-[#9a7e5a]">{track.fileName}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-[10px] font-bold text-[#9a7e5a]">لم تُرفع ترانيم بعد</p>
      )}

      {error ? <p className="text-center text-[10px] font-bold text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
