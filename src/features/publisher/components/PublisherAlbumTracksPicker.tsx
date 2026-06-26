import type { PublisherContentItem } from "../types";
import { PUBLISHER_CONTENT_STATUS_LABELS } from "../types";
import { publisherSelectableAlbumHymns } from "../publisher-content-ui";

type Props = {
  hymns: PublisherContentItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export function PublisherAlbumTracksPicker({
  hymns,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
}: Props) {
  const selectable = publisherSelectableAlbumHymns(hymns);

  if (!selectable.length) {
    return (
      <p className="py-6 text-center text-[11px] font-bold text-[#6b658a]">
        أضف ترانيم من «إضافة ترنيمة» أولاً — يمكنك تضمينها في الألبوم حتى أثناء المراجعة.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-right text-[10px] font-bold text-[#6b658a]">
          اختر ترنيمة أو أكثر ({selectedIds.length} / {selectable.length})
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-lg border border-[#5D3291]/20 bg-white px-2 py-1 text-[9px] font-extrabold text-[#5D3291]"
          >
            تحديد الكل
          </button>
          {selectedIds.length ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-[rgba(93,50,145,0.12)] px-2 py-1 text-[9px] font-extrabold text-[#6b658a]"
            >
              إلغاء
            </button>
          ) : null}
        </div>
      </div>
      <div className="max-h-[min(50vh,320px)] space-y-1.5 overflow-y-auto">
        {selectable.map((h) => (
          <label
            key={h.id}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 transition ${
              selectedIds.includes(h.id)
                ? "border-[#5D3291]/35 bg-[#5D3291]/6"
                : "border-[rgba(93,50,145,0.1)] bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(h.id)}
              onChange={() => onToggle(h.id)}
              className="h-4 w-4 shrink-0 accent-[#5D3291]"
            />
            <span className="min-w-0 flex-1 text-right">
              <span className="block truncate text-[11px] font-extrabold text-[#3a3258]">{h.title}</span>
              <span className="block text-[9px] font-bold text-[#8a84a8]">
                {PUBLISHER_CONTENT_STATUS_LABELS[h.status]}
                {h.mediaUrl ? " · ملف صوتي" : " · بدون ملف"}
              </span>
            </span>
          </label>
        ))}
      </div>
    </>
  );
}
