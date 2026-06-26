import { useEffect } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import {
  PUBLISHER_CONTENT_KIND_LABELS,
  PUBLISHER_CONTENT_VISIBILITY_LABELS,
  publisherContentMediaSpec,
} from "@/features/publisher";
import { MC } from "./platform-store";
import type { ContentReviewRow } from "./content-review-api";

type Props = {
  row: ContentReviewRow | null;
  acting?: boolean;
  onClose: () => void;
  onDecide: (status: "approved" | "rejected" | "needs_changes") => void;
};

function inferMediaKind(url: string, contentKind: ContentReviewRow["contentKind"]): "audio" | "video" | "pdf" | "image" | null {
  const spec = publisherContentMediaSpec(contentKind);
  if (spec) return spec.assetKind === "pdf" ? "pdf" : spec.assetKind;

  const lower = url.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|mov|webm|m4v)$/.test(lower)) return "video";
  if (/\.pdf$/.test(lower)) return "pdf";
  if (/\.(mp3|m4a|ogg|wav|aac)$/.test(lower)) return "audio";
  if (/\.(jpe?g|png|webp|gif)$/.test(lower)) return "image";
  return null;
}

export function ContentReviewPreviewSheet({ row, acting, onClose, onDecide }: Props) {
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, onClose]);

  if (!row) return null;

  const mediaKind = row.mediaUrl ? inferMediaKind(row.mediaUrl, row.contentKind) : null;
  const articleBody =
    typeof row.payload?.body === "string"
      ? row.payload.body
      : typeof row.payload?.text === "string"
        ? row.payload.text
        : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[18px] border"
        style={{ background: MC.midnight, borderColor: MC.panelBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
          style={{ borderColor: MC.panelBorder }}
        >
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: MC.panelBorder }}>
            <X className="h-4 w-4" style={{ color: MC.muted }} />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[13px] font-extrabold" style={{ color: MC.white }}>
              {row.title}
            </p>
            <p className="text-[10px] font-bold" style={{ color: MC.muted }}>
              {PUBLISHER_CONTENT_KIND_LABELS[row.contentKind]} · {row.publisherName}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {row.coverUrl ? (
            <img
              src={row.coverUrl}
              alt=""
              className="mx-auto max-h-44 w-full rounded-[14px] border object-cover"
              style={{ borderColor: MC.panelBorder }}
            />
          ) : null}

          {row.description ? (
            <p className="text-right text-[11px] font-bold leading-relaxed" style={{ color: MC.cyan }}>
              {row.description}
            </p>
          ) : null}

          {articleBody ? (
            <div
              className="rounded-[14px] border px-3 py-2.5 text-right text-[11px] font-bold leading-relaxed whitespace-pre-wrap"
              style={{ borderColor: MC.panelBorder, background: MC.panel, color: MC.white }}
            >
              {articleBody}
            </div>
          ) : null}

          {row.mediaUrl ? (
            <div className="space-y-2">
              {mediaKind === "audio" ? (
                <audio controls preload="metadata" className="w-full" src={row.mediaUrl} />
              ) : null}
              {mediaKind === "video" ? (
                <video controls preload="metadata" className="max-h-52 w-full rounded-[14px] border" style={{ borderColor: MC.panelBorder }} src={row.mediaUrl} />
              ) : null}
              {mediaKind === "pdf" ? (
                <iframe
                  title={row.title}
                  src={row.mediaUrl}
                  className="h-64 w-full rounded-[14px] border"
                  style={{ borderColor: MC.panelBorder }}
                />
              ) : null}
              {mediaKind === "image" ? (
                <img src={row.mediaUrl} alt="" className="max-h-64 w-full rounded-[14px] border object-contain" style={{ borderColor: MC.panelBorder }} />
              ) : null}
              {!mediaKind ? (
                <p className="text-center text-[10px] font-bold" style={{ color: MC.muted }}>
                  نوع الملف غير معروف — افتح الرابط للمعاينة.
                </p>
              ) : null}
              <a
                href={row.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border py-2 text-[10px] font-extrabold"
                style={{ borderColor: `${MC.cyan}44`, color: MC.cyan }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                فتح الملف في تبويب جديد
              </a>
            </div>
          ) : (
            <p className="py-4 text-center text-[10px] font-bold" style={{ color: MC.muted }}>
              لا يوجد ملف مرفوع — راجع العنوان والوصف فقط.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-right text-[9px] font-bold" style={{ color: MC.muted }}>
            <span>الظهور: {PUBLISHER_CONTENT_VISIBILITY_LABELS[row.visibility]}</span>
            <span>التنزيل: {row.allowDownload ? "مسموح" : "غير مسموح"}</span>
            {row.durationSeconds ? <span>المدة: {row.durationSeconds} ث</span> : null}
          </div>
        </div>

        <div
          className="shrink-0 border-t px-4 py-3"
          style={{ borderColor: MC.panelBorder }}
        >
          {acting ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: MC.purple }} />
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onDecide("approved")}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[10px] font-extrabold text-emerald-300"
                style={{ background: "rgba(74,143,110,0.18)" }}
              >
                <Check className="h-3.5 w-3.5" />
                قبول
              </button>
              <button
                type="button"
                onClick={() => onDecide("needs_changes")}
                className="inline-flex flex-1 items-center justify-center rounded-full py-2 text-[10px] font-extrabold text-amber-300"
                style={{ background: "rgba(196,165,116,0.15)" }}
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={() => onDecide("rejected")}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[10px] font-extrabold text-red-300"
                style={{ background: "rgba(184,92,88,0.18)" }}
              >
                <X className="h-3.5 w-3.5" />
                رفض
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
