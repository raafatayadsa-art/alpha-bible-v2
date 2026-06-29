import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AlphaDatePicker, formatAlphaDateDisplay } from "@/components/controls";
import {
  PUBLISHER_CONTENT_KIND_LABELS,
  publisherContentMediaSpec,
  type PublisherContentItem,
  type PublisherContentKind,
} from "../types";
import { submitPublisherContent, updatePublisherContentItem } from "../publisher-api";
import { publisherSelectableAlbumHymns } from "../publisher-content-ui";
import { PublisherAlbumTracksPicker } from "./PublisherAlbumTracksPicker";
import { PublisherAssetUpload } from "./PublisherAssetUpload";
import { PublisherCopyrightConsent } from "./PublisherCopyrightConsent";
import {
  PUBLISHER_EMAIL_INPUT,
  PUBLISHER_PURPLE_BTN_BACK,
  PUBLISHER_PURPLE_BTN_SOLID,
  PUBLISHER_PURPLE_GRADIENT,
  PUBLISHER_SHEET_FOOTER_BORDER,
  PUBLISHER_SHEET_HEADER_BORDER,
  PUBLISHER_SHEET_OVERLAY,
  PUBLISHER_SHEET_PANEL,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

type Props = {
  open: boolean;
  publisherId: string;
  kind: PublisherContentKind;
  hymns: PublisherContentItem[];
  editItem?: PublisherContentItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function stepsForKind(kind: PublisherContentKind): string[] {
  if (kind === "article") return ["البيانات", "الإقرار", "تم"];
  if (kind === "album") return ["البيانات", "الغلاف", "الترانيم", "الإقرار", "تم"];
  return ["البيانات", "الغلاف", "الملف", "الإقرار", "تم"];
}

function stepKind(kind: PublisherContentKind, step: number): "meta" | "cover" | "media" | "tracks" | "consent" | "done" {
  const steps = stepsForKind(kind);
  const label = steps[step];
  if (label === "البيانات") return "meta";
  if (label === "الغلاف") return "cover";
  if (label === "الملف") return "media";
  if (label === "الترانيم") return "tracks";
  if (label === "الإقرار") return "consent";
  return "done";
}

export function PublisherContentWizard({
  open,
  publisherId,
  kind,
  hymns,
  editItem,
  onClose,
  onSuccess,
}: Props) {
  const steps = stepsForKind(kind);
  const isEdit = Boolean(editItem);
  const mediaSpec = useMemo(() => publisherContentMediaSpec(kind), [kind]);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaName, setMediaName] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [legalConsent, setLegalConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectableHymns = useMemo(() => publisherSelectableAlbumHymns(hymns), [hymns]);

  const selectedTracks = useMemo(
    () =>
      selectedIds.flatMap((id) => {
        const h = selectableHymns.find((x) => x.id === id);
        if (!h) return [];
        return [{ id: h.id, title: h.title, durationSeconds: h.durationSeconds, mediaUrl: h.mediaUrl }];
      }),
    [selectedIds, selectableHymns],
  );

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setTitle(editItem?.title ?? "");
    setDescription(editItem?.description ?? "");
    setReleaseDate(String(editItem?.payload?.releaseDate ?? ""));
    setCoverUrl(editItem?.coverUrl ?? null);
    setMediaUrl(editItem?.mediaUrl ?? null);
    setMediaName(null);
    setSelectedIds(Array.isArray(editItem?.payload?.trackIds) ? (editItem!.payload!.trackIds as string[]) : []);
    setLegalConsent(false);
    setError(null);
  }, [open, editItem]);

  const toggleHymn = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const current = stepKind(kind, step);

  const canNext = (() => {
    if (current === "meta") return title.trim().length >= 2;
    if (current === "cover") return true;
    if (current === "media") return !mediaSpec || Boolean(mediaUrl);
    if (current === "tracks") return selectedIds.length > 0;
    if (current === "consent") return legalConsent;
    return true;
  })();

  const submit = async () => {
    if (!legalConsent) {
      setError("يجب الموافقة على الشروط.");
      return;
    }
    if (mediaSpec && !mediaUrl && kind !== "album") {
      setError(`ارفع ${mediaSpec.label} قبل الإرسال.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload =
      kind === "album"
        ? {
            releaseDate: releaseDate || null,
            trackIds: selectedIds,
            tracks: selectedTracks,
          }
        : undefined;

    const firstMedia = kind === "album" ? (selectedTracks.find((t) => t.mediaUrl)?.mediaUrl ?? null) : mediaUrl;
    const totalDuration =
      kind === "album" ? selectedTracks.reduce((s, t) => s + (t.durationSeconds ?? 0), 0) : null;

    const result =
      isEdit && editItem
        ? await updatePublisherContentItem(editItem.id, {
            title,
            description,
            coverUrl: coverUrl ?? undefined,
            mediaUrl: firstMedia ?? undefined,
            durationSeconds: totalDuration,
            payload,
            visibility: "public",
            legalConsent: true,
          })
        : await submitPublisherContent(publisherId, {
            kind,
            title,
            description,
            coverUrl: coverUrl ?? undefined,
            mediaUrl: firstMedia ?? undefined,
            durationSeconds: totalDuration || null,
            legalConsent: true,
            visibility: "public",
            payload,
          });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? "تعذّر الإرسال.");
      return;
    }
    onSuccess(isEdit ? "تم إرسال التعديلات للمراجعة." : "تم إرسال المحتوى للمراجعة.");
    onClose();
  };

  if (!open) return null;

  const kindLabel = PUBLISHER_CONTENT_KIND_LABELS[kind];
  const titleText = isEdit ? `تعديل ${kindLabel}` : `إضافة ${kindLabel}`;

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
            <p className={PUBLISHER_TEXT_TITLE}>{titleText}</p>
            <p className={PUBLISHER_TEXT_ACCENT_CAPTION}>
              {steps[step]} · {step + 1}/{steps.length}
            </p>
          </div>
          <span className="w-9" />
        </div>

        <div className="flex shrink-0 gap-1 px-4 pt-3">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= step ? PUBLISHER_PURPLE_GRADIENT : "rgba(93,50,145,0.12)" }}
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {current === "meta" ? (
            <>
              <label className="block text-right">
                <span className={PUBLISHER_TEXT_ACCENT_CAPTION}>العنوان</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`mt-1 ${PUBLISHER_EMAIL_INPUT}`}
                />
              </label>
              <label className="block text-right">
                <span className={PUBLISHER_TEXT_ACCENT_CAPTION}>الوصف</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`mt-1 resize-none ${PUBLISHER_EMAIL_INPUT}`}
                />
              </label>
              {kind === "album" ? (
                <div className="text-right">
                  <span className={PUBLISHER_TEXT_ACCENT_CAPTION}>تاريخ الإصدار</span>
                  <AlphaDatePicker value={releaseDate} onChange={setReleaseDate} />
                  {releaseDate ? (
                    <p className={`mt-1 ${PUBLISHER_TEXT_SUB}`}>{formatAlphaDateDisplay(releaseDate)}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {current === "cover" ? (
            <PublisherAssetUpload
              label="صورة الغلاف"
              hint="اختياري — حتى 5 ميجابايت"
              assetKind="image"
              scopeId={publisherId}
              folder="content"
              value={coverUrl}
              onChange={(url) => setCoverUrl(url)}
              disabled={submitting}
            />
          ) : null}

          {current === "media" && mediaSpec ? (
            <PublisherAssetUpload
              label={mediaSpec.label}
              hint={mediaSpec.hint}
              assetKind={mediaSpec.assetKind}
              scopeId={publisherId}
              folder="content"
              value={mediaUrl}
              fileName={mediaName}
              onChange={(url, name) => {
                setMediaUrl(url);
                setMediaName(name ?? null);
              }}
              disabled={submitting}
            />
          ) : null}

          {current === "tracks" ? (
            <PublisherAlbumTracksPicker
              hymns={hymns}
              selectedIds={selectedIds}
              onToggle={toggleHymn}
              onSelectAll={() => setSelectedIds(selectableHymns.map((h) => h.id))}
              onClear={() => setSelectedIds([])}
            />
          ) : null}

          {current === "consent" ? (
            <PublisherCopyrightConsent checked={legalConsent} onChange={setLegalConsent} disabled={submitting} />
          ) : null}

          {current === "done" ? (
            <div className="space-y-3 py-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
              <p className={`${PUBLISHER_TEXT_TITLE} alpha-type-h2`}>
                {isEdit ? "تم حفظ التعديلات" : "تم إرسال المحتوى للمراجعة"}
              </p>
              <p className={PUBLISHER_TEXT_SUB}>سيظهر للجميع بعد اعتماد Alpha.</p>
            </div>
          ) : null}

          {error ? <p className="text-center alpha-type-desc font-bold text-red-600">{error}</p> : null}
        </div>

        <div className={`flex shrink-0 gap-2 ${PUBLISHER_SHEET_FOOTER_BORDER} px-4 py-3`}>
          {step > 0 && current !== "done" ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={PUBLISHER_PURPLE_BTN_BACK}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
          ) : null}
          {current !== "consent" && current !== "done" ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className={`${PUBLISHER_PURPLE_BTN_SOLID} flex-1 disabled:opacity-50`}
              style={{ background: PUBLISHER_PURPLE_GRADIENT }}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          {current === "consent" ? (
            <button
              type="button"
              disabled={!legalConsent || submitting}
              onClick={() => void submit()}
              className={`${PUBLISHER_PURPLE_BTN_SOLID} flex-1 disabled:opacity-50`}
              style={{ background: PUBLISHER_PURPLE_GRADIENT }}
            >
              {submitting ? "جاري الإرسال…" : isEdit ? "حفظ التعديلات" : "إرسال للمراجعة"}
            </button>
          ) : null}
          {current === "done" ? (
            <button
              type="button"
              onClick={onClose}
              className={`${PUBLISHER_PURPLE_BTN_SOLID} w-full`}
              style={{ background: PUBLISHER_PURPLE_GRADIENT }}
            >
              إغلاق
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
