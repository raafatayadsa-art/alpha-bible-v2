import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AlphaDatePicker, formatAlphaDateDisplay } from "@/components/controls";
import type { PublisherAlbumTrackRef } from "../publisher-content-payload";
import { submitPublisherContent } from "../publisher-api";
import { PublisherAlbumExternalTracks, type AlbumExternalTrack } from "./PublisherAlbumExternalTracks";
import { PublisherAssetUpload } from "./PublisherAssetUpload";
import { PublisherCopyrightConsent } from "./PublisherCopyrightConsent";
import {
  PUBLISHER_GLASS_INPUT,
  PUBLISHER_GLASS_LABEL,
  PUBLISHER_GLASS_SHEET_BACKDROP,
  PUBLISHER_GLASS_SHEET_OVERLAY,
  publisherGlassSheetPanel,
} from "./publisher-glass-chrome";

type Props = {
  open: boolean;
  publisherId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const STEPS = ["البيانات", "الغلاف", "الترانيم", "الإقرار", "تم"];

export function PublisherAlbumWizard({ open, publisherId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [externalTracks, setExternalTracks] = useState<AlbumExternalTrack[]>([]);
  const [legalConsent, setLegalConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payloadTracks: PublisherAlbumTrackRef[] = useMemo(
    () =>
      externalTracks.map((t) => ({
        id: t.id,
        title: t.title.trim() || t.fileName,
        mediaUrl: t.mediaUrl,
        durationSeconds: t.durationSeconds,
      })),
    [externalTracks],
  );

  const reset = () => {
    setStep(0);
    setTitle("");
    setDescription("");
    setReleaseDate("");
    setCoverUrl(null);
    setExternalTracks([]);
    setLegalConsent(false);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!legalConsent) {
      setError("يجب الموافقة على الشروط.");
      return;
    }
    if (!payloadTracks.length) {
      setError("أضف ترنيمة واحدة على الأقل.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const firstMedia = payloadTracks.find((t) => t.mediaUrl)?.mediaUrl ?? null;
    const totalDuration = payloadTracks.reduce((s, t) => s + (t.durationSeconds ?? 0), 0);
    const result = await submitPublisherContent(publisherId, {
      kind: "album",
      title,
      description,
      coverUrl: coverUrl ?? undefined,
      mediaUrl: firstMedia ?? undefined,
      durationSeconds: totalDuration || null,
      legalConsent: true,
      visibility: "public",
      payload: {
        releaseDate: releaseDate || null,
        trackIds: payloadTracks.map((t) => t.id),
        tracks: payloadTracks,
        source: "external_upload",
      },
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? "تعذّر الإرسال.");
      return;
    }
    setStep(4);
    onSuccess();
  };

  if (!open) return null;

  const canNext =
    (step === 0 && title.trim().length >= 2) ||
    step === 1 ||
    (step === 2 && externalTracks.length > 0 && payloadTracks.every((t) => t.mediaUrl)) ||
    (step === 3 && legalConsent);

  return (
    <div className={PUBLISHER_GLASS_SHEET_OVERLAY} dir="rtl">
      <button type="button" aria-label="إغلاق" onClick={close} className={PUBLISHER_GLASS_SHEET_BACKDROP} />
      <div className={publisherGlassSheetPanel()} onClick={(e) => e.stopPropagation()}>
        <div className="relative flex h-12 shrink-0 items-center justify-center border-b border-white/25 px-4">
          <button
            type="button"
            onClick={close}
            className="absolute end-3 grid h-8 w-8 place-items-center rounded-full border border-white/35 bg-white/50 text-[#3a2a18]"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[14px] font-bold text-[#1F2937]">إضافة ألبوم جديد</p>
            <p className="text-[10px] font-bold text-[#8a6a3a]">
              {STEPS[step]} · {step + 1}/{STEPS.length}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1 px-4 pt-3">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                background:
                  i <= step
                    ? "linear-gradient(90deg, #d4a857, #b8893a)"
                    : "rgba(184,137,58,0.18)",
              }}
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {step === 0 ? (
            <>
              <label className="block text-right">
                <span className={PUBLISHER_GLASS_LABEL}>اسم الألبوم</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`mt-1 ${PUBLISHER_GLASS_INPUT}`}
                />
              </label>
              <label className="block text-right">
                <span className={PUBLISHER_GLASS_LABEL}>الوصف</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`mt-1 resize-none ${PUBLISHER_GLASS_INPUT}`}
                />
              </label>
              <div className="text-right">
                <span className={PUBLISHER_GLASS_LABEL}>تاريخ الإصدار</span>
                <div className="mt-1">
                  <AlphaDatePicker value={releaseDate} onChange={setReleaseDate} title="تاريخ الإصدار" />
                </div>
                {releaseDate ? (
                  <p className="mt-1 text-[10px] font-bold text-[#9a7e5a]">{formatAlphaDateDisplay(releaseDate)}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <PublisherAssetUpload
              label="غلاف الألبوم"
              hint="صورة مربّعة أو عمودية — حتى 5 ميجابايت"
              assetKind="image"
              scopeId={publisherId}
              folder="content"
              value={coverUrl}
              onChange={(url) => setCoverUrl(url)}
            />
          ) : null}

          {step === 2 ? (
            <PublisherAlbumExternalTracks
              publisherId={publisherId}
              tracks={externalTracks}
              onChange={setExternalTracks}
              disabled={submitting}
            />
          ) : null}

          {step === 3 ? (
            <PublisherCopyrightConsent checked={legalConsent} onChange={setLegalConsent} disabled={submitting} />
          ) : null}

          {step === 4 ? (
            <div className="space-y-3 py-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-[#166534]" />
              <p className="text-[15px] font-extrabold text-[#1F2937]">تم إرسال الألبوم للمراجعة</p>
              <p className="text-[11px] font-bold text-[#8a6a3a]">
                {payloadTracks.length} ترنيمة · سيظهر بعد اعتماد Alpha.
              </p>
            </div>
          ) : null}

          {error ? <p className="text-center text-[11px] font-bold text-[#EF4444]">{error}</p> : null}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-white/25 px-4 py-3">
          {step > 0 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[#efe2c4]/90 bg-white/65 py-2.5 text-[12px] font-extrabold text-[#3a2a18] backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[#efe2c4]/80 bg-gradient-to-b from-[#f5e6c8] to-[#e8c878] py-2.5 text-[12px] font-extrabold text-[#3a2a18] shadow-[0_4px_14px_rgba(184,137,58,0.22)] disabled:opacity-50"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          {step === 3 ? (
            <button
              type="button"
              disabled={!legalConsent || submitting}
              onClick={() => void submit()}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[#efe2c4]/80 bg-gradient-to-b from-[#f5e6c8] to-[#e8c878] py-2.5 text-[12px] font-extrabold text-[#3a2a18] shadow-[0_4px_14px_rgba(184,137,58,0.22)] disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال…" : "إرسال للمراجعة"}
            </button>
          ) : null}
          {step === 4 ? (
            <button
              type="button"
              onClick={close}
              className="w-full rounded-full border border-[#efe2c4]/80 bg-gradient-to-b from-[#f5e6c8] to-[#e8c878] py-2.5 text-[12px] font-extrabold text-[#3a2a18]"
            >
              إغلاق
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
