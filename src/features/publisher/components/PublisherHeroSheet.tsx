import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, LoaderCircle, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import {
  PUBLISHER_CONTENT_KIND_LABELS,
  PUBLISHER_CONTENT_STATUS_LABELS,
  type PublisherContentItem,
  type PublisherRecord,
} from "../types";
import { updatePublisherHeroCards } from "../publisher-api";
import { contentHasPlayableMedia } from "../publisher-content-payload";
import { isHeroEligibleContent } from "../publisher-public-content";
import cardChurch from "@/assets/home/card-church.jpg";
import {
  PUBLISHER_ACCENT_ICON_SM,
  PUBLISHER_INNER_CARD,
  PUBLISHER_MOVE_BTN,
  PUBLISHER_PURPLE_BTN_SOLID,
  PUBLISHER_PURPLE_GRADIENT,
  PUBLISHER_ROW_BTN,
  PUBLISHER_SHEET_FOOTER_BORDER,
  PUBLISHER_SHEET_HEADER_BORDER,
  PUBLISHER_SHEET_OVERLAY,
  PUBLISHER_SHEET_PANEL,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_FEEDBACK,
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

type Props = {
  open: boolean;
  publisher: PublisherRecord;
  content: PublisherContentItem[];
  onClose: () => void;
  onSaved: (heroContentIds: string[]) => void;
};

export function PublisherHeroSheet({ open, publisher, content, onClose, onSaved }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(publisher.heroContentIds ?? []);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedIds(publisher.heroContentIds ?? []);
      setFeedback(null);
    }
  }, [open, publisher.heroContentIds]);

  const eligible = useMemo(
    () => content.filter((item) => isHeroEligibleContent(item, content)),
    [content],
  );

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => content.find((c) => c.id === id))
        .filter((c): c is PublisherContentItem => Boolean(c)),
    [selectedIds, content],
  );

  const available = useMemo(
    () => eligible.filter((item) => !selectedIds.includes(item.id)),
    [eligible, selectedIds],
  );

  if (!open) return null;

  const addItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeItem = (id: string) => {
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    const result = await updatePublisherHeroCards(publisher.id, selectedIds);
    setSaving(false);
    if (result.ok) {
      onSaved(selectedIds);
      setFeedback("تم حفظ كروت الهيرو.");
      setTimeout(() => onClose(), 600);
    } else {
      setFeedback(result.message ?? "تعذّر الحفظ.");
    }
  };

  return (
    <div className={PUBLISHER_SHEET_OVERLAY}>
      <div
        className={PUBLISHER_SHEET_PANEL}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex shrink-0 items-center justify-between ${PUBLISHER_SHEET_HEADER_BORDER} px-4 py-3`}>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
            <X className="h-4 w-4" />
          </button>
          <div className="text-right">
            <p className={PUBLISHER_TEXT_TITLE}>كروت الهيرو</p>
            <p className={PUBLISHER_TEXT_SUB}>رتّب ما يظهر في أعلى صفحتك — بدون حد أقصى</p>
          </div>
          <span className="w-9" />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className={PUBLISHER_INNER_CARD}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={PUBLISHER_TEXT_MUTED}>{selectedItems.length} كارت</span>
              <p className={PUBLISHER_TEXT_ACCENT_CAPTION}>الترتيب الحالي</p>
            </div>
            {selectedItems.length ? (
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <HeroPickRow
                    key={item.id}
                    item={item}
                    content={content}
                    index={index}
                    total={selectedItems.length}
                    onMoveUp={() => moveItem(index, -1)}
                    onMoveDown={() => moveItem(index, 1)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            ) : (
              <p className={`py-4 text-center ${PUBLISHER_TEXT_SUB}`}>
                لم تُحدَّد كروت بعد — سيتم اختيارها تلقائياً من المحتوى.
              </p>
            )}
          </div>

          <div className={PUBLISHER_INNER_CARD}>
            <p className={`mb-2 text-right ${PUBLISHER_TEXT_ACCENT_CAPTION}`}>إضافة من محتواك</p>
            {available.length ? (
              <div className="space-y-2">
                {available.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(item.id)}
                    className={PUBLISHER_ROW_BTN}
                  >
                    <span className={PUBLISHER_ACCENT_ICON_SM}>
                      <Plus className="h-4 w-4" />
                    </span>
                    <HeroItemMeta item={item} content={content} />
                  </button>
                ))}
              </div>
            ) : (
              <p className={`py-3 text-center ${PUBLISHER_TEXT_SUB}`}>
                {eligible.length ? "كل المحتوى المؤهل مضاف بالفعل." : "أضف ترانيم أو ألبومات بغلاف أو ملف صوتي أولاً."}
              </p>
            )}
          </div>

          {feedback ? <p className={PUBLISHER_TEXT_FEEDBACK}>{feedback}</p> : null}
        </div>

        <div className={`shrink-0 ${PUBLISHER_SHEET_FOOTER_BORDER} px-4 py-3`}>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className={PUBLISHER_PURPLE_BTN_SOLID}
            style={{ background: PUBLISHER_PURPLE_GRADIENT }}
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "جاري الحفظ…" : "حفظ كروت الهيرو"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroPickRow({
  item,
  content,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  item: PublisherContentItem;
  content: PublisherContentItem[];
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const cover = item.coverUrl?.trim() || cardChurch;
  const playable = contentHasPlayableMedia(item, content);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[rgba(93,50,145,0.12)] bg-white px-2 py-2">
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label="تحريك لأعلى"
          className={PUBLISHER_MOVE_BTN}
        >
          <ArrowUp className="h-3.5 w-3.5 text-[var(--alpha-publisher-purple)]" />
        </button>
        <button
          type="button"
          disabled={index >= total - 1}
          onClick={onMoveDown}
          aria-label="تحريك لأسفل"
          className={PUBLISHER_MOVE_BTN}
        >
          <ArrowDown className="h-3.5 w-3.5 text-[var(--alpha-publisher-purple)]" />
        </button>
      </div>
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--gold)]/20">
        <img src={cover} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <HeroItemMeta item={item} content={content} compact />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="إزالة"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {playable ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

function HeroItemMeta({
  item,
  content,
  compact,
}: {
  item: PublisherContentItem;
  content: PublisherContentItem[];
  compact?: boolean;
}) {
  const playable = contentHasPlayableMedia(item, content);
  return (
    <>
      <p className={`truncate font-extrabold ${PUBLISHER_TEXT_TITLE} ${compact ? "text-[11px]" : ""}`}>{item.title}</p>
      <p className={`${PUBLISHER_TEXT_SUB} ${compact ? "text-[9px]" : ""}`}>
        {PUBLISHER_CONTENT_KIND_LABELS[item.contentKind]}
        {" · "}
        {PUBLISHER_CONTENT_STATUS_LABELS[item.status]}
        {playable ? " · قابل للتشغيل" : " · عرض فقط"}
      </p>
    </>
  );
}
