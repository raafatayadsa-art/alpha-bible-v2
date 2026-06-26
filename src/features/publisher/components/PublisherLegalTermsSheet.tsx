import { useEffect } from "react";
import { X } from "lucide-react";
import {
  PUBLISHER_LEGAL_TERMS_SECTIONS,
  PUBLISHER_LEGAL_TERMS_TITLE,
  PUBLISHER_LEGAL_TERMS_TITLE_EN,
} from "../publisher-legal-terms";
import { PUBLISHER_LEGAL_POLICY_VERSION } from "../publisher-legal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PublisherLegalTermsSheet({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-[#fbf7f0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[rgba(93,50,145,0.1)] px-4 py-3">
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
            <X className="h-4 w-4 text-[#3a3258]" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#8a84a8]" dir="ltr">
              {PUBLISHER_LEGAL_TERMS_TITLE_EN}
            </p>
            <p className="text-[13px] font-extrabold text-[#3a3258]">{PUBLISHER_LEGAL_TERMS_TITLE}</p>
            <p className="text-[10px] font-bold text-[#5D3291]">آخر تحديث: Version {PUBLISHER_LEGAL_POLICY_VERSION}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {PUBLISHER_LEGAL_TERMS_SECTIONS.map((section) => (
            <section key={section.id} className="text-right">
              <h3 className="text-[12px] font-extrabold text-[#5D3291]">{section.title}</h3>
              {section.intro ? (
                <p className="mt-1 text-[11px] font-bold leading-relaxed text-[#4a4568]">{section.intro}</p>
              ) : null}
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-1 text-[11px] font-bold leading-relaxed text-[#4a4568]">
                  {p}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-1.5 list-disc space-y-0.5 pr-4 text-[10px] font-bold text-[#6b658a]">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {section.bulletsPositive?.length ? (
                <ul className="mt-1.5 space-y-1 pr-1 text-[10px] font-bold text-[#4a4568]">
                  {section.bulletsPositive.map((b) => (
                    <li key={b} className="flex items-start justify-end gap-1.5">
                      <span>{b}</span>
                      <span className="text-emerald-600">✓</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.bulletsNegative?.length ? (
                <ul className="mt-1.5 space-y-1 pr-1 text-[10px] font-bold text-[#4a4568]">
                  {section.bulletsNegative.map((b) => (
                    <li key={b} className="flex items-start justify-end gap-1.5">
                      <span>{b}</span>
                      <span className="text-red-600">✕</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="shrink-0 border-t border-[rgba(93,50,145,0.1)] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full py-2.5 text-[12px] font-extrabold text-white"
            style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
