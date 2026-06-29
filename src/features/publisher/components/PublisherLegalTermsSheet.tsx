import { useEffect } from "react";
import { X } from "lucide-react";
import {
  PUBLISHER_LEGAL_TERMS_SECTIONS,
  PUBLISHER_LEGAL_TERMS_TITLE,
  PUBLISHER_LEGAL_TERMS_TITLE_EN,
} from "../publisher-legal-terms";
import { PUBLISHER_LEGAL_POLICY_VERSION } from "../publisher-legal";
import {
  PUBLISHER_LEGAL_BODY,
  PUBLISHER_PURPLE_BTN_SOLID,
  PUBLISHER_PURPLE_GRADIENT,
  PUBLISHER_SHEET_HEADER_BORDER,
  PUBLISHER_SHEET_FOOTER_BORDER,
  PUBLISHER_SHEET_OVERLAY,
  PUBLISHER_SHEET_PANEL,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

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
    <div className={PUBLISHER_SHEET_OVERLAY} onClick={onClose}>
      <div className={PUBLISHER_SHEET_PANEL} onClick={(e) => e.stopPropagation()}>
        <div
          className={`flex shrink-0 items-center justify-between gap-2 px-4 py-3 ${PUBLISHER_SHEET_HEADER_BORDER}`}
        >
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
            <X className={`h-4 w-4 ${PUBLISHER_TEXT_TITLE}`} />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className={`uppercase tracking-wide ${PUBLISHER_TEXT_MUTED}`} dir="ltr">
              {PUBLISHER_LEGAL_TERMS_TITLE_EN}
            </p>
            <p className={PUBLISHER_TEXT_TITLE}>{PUBLISHER_LEGAL_TERMS_TITLE}</p>
            <p className={PUBLISHER_TEXT_ACCENT_CAPTION}>
              آخر تحديث: Version {PUBLISHER_LEGAL_POLICY_VERSION}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {PUBLISHER_LEGAL_TERMS_SECTIONS.map((section) => (
            <section key={section.id} className="text-right">
              <h3 className={PUBLISHER_TEXT_ACCENT_CAPTION}>{section.title}</h3>
              {section.intro ? <p className={`mt-1 ${PUBLISHER_LEGAL_BODY}`}>{section.intro}</p> : null}
              {section.paragraphs?.map((p) => (
                <p key={p} className={`mt-1 ${PUBLISHER_LEGAL_BODY}`}>
                  {p}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className={`mt-1.5 list-disc space-y-0.5 pr-4 ${PUBLISHER_TEXT_SUB}`}>
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {section.bulletsPositive?.length ? (
                <ul className={`mt-1.5 space-y-1 pr-1 ${PUBLISHER_LEGAL_BODY}`}>
                  {section.bulletsPositive.map((b) => (
                    <li key={b} className="flex items-start justify-end gap-1.5">
                      <span>{b}</span>
                      <span className="text-emerald-600">✓</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.bulletsNegative?.length ? (
                <ul className={`mt-1.5 space-y-1 pr-1 ${PUBLISHER_LEGAL_BODY}`}>
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

        <div className={`shrink-0 px-4 py-3 ${PUBLISHER_SHEET_FOOTER_BORDER}`}>
          <button
            type="button"
            onClick={onClose}
            className={PUBLISHER_PURPLE_BTN_SOLID}
            style={{ background: PUBLISHER_PURPLE_GRADIENT }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
