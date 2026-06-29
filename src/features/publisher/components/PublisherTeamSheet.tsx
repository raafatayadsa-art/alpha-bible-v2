import { useState } from "react";
import { LoaderCircle, ScanLine, UserPlus, X } from "lucide-react";
import { PUBLISHER_TEAM_PERMISSION_LABELS } from "../types";
import {
  addPublisherTeamMember,
  addPublisherTeamMemberByAlphaId,
} from "../publisher-team-api";
import { AlphaMemberScanSheet } from "./AlphaMemberScanSheet";
import {
  PUBLISHER_DIVIDER,
  PUBLISHER_EMAIL_INPUT,
  PUBLISHER_INNER_CARD,
  PUBLISHER_PERM_ROW,
  PUBLISHER_PURPLE_BTN_SOLID,
  PUBLISHER_PURPLE_GRADIENT,
  PUBLISHER_SHEET_FOOTER_BORDER,
  PUBLISHER_SHEET_HEADER_BORDER,
  PUBLISHER_SHEET_OVERLAY,
  PUBLISHER_SHEET_PANEL,
  PUBLISHER_TEXT_ACCENT_CAPTION,
  PUBLISHER_TEXT_ERROR,
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

type DraftPerms = {
  canEditProfile: boolean;
  canManageContent: boolean;
  canSubmitPublication: boolean;
  canManageTeam: boolean;
};

const DEFAULT_DRAFT: DraftPerms = {
  canEditProfile: false,
  canManageContent: true,
  canSubmitPublication: false,
  canManageTeam: false,
};

type Props = {
  open: boolean;
  publisherId: string;
  onClose: () => void;
  onAdded: (message: string) => void;
};

export function PublisherTeamSheet({ open, publisherId, onClose, onAdded }: Props) {
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState<DraftPerms>(DEFAULT_DRAFT);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  if (!open) return null;

  const reset = () => {
    setEmail("");
    setDraft(DEFAULT_DRAFT);
    setFeedback(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const addMemberByEmail = async () => {
    if (!email.trim()) return;
    setSaving(true);
    setFeedback(null);
    const result = await addPublisherTeamMember(publisherId, { email, ...draft });
    setSaving(false);
    if (result.ok) {
      onAdded("تمت إضافة المساعد.");
      close();
    } else {
      setFeedback(result.message ?? "تعذّر الإضافة.");
    }
  };

  const addMemberByBarcode = async (alphaCode: string) => {
    setSaving(true);
    setFeedback(null);
    const result = await addPublisherTeamMemberByAlphaId(publisherId, alphaCode, draft);
    setSaving(false);
    setScanOpen(false);
    if (result.ok) {
      onAdded("تمت إضافة المساعد عبر الباركود.");
      close();
    } else {
      setFeedback(result.message ?? "تعذّر الإضافة.");
    }
  };

  return (
    <>
      <div className={PUBLISHER_SHEET_OVERLAY}>
        <div
          className={PUBLISHER_SHEET_PANEL}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`flex shrink-0 items-center justify-between ${PUBLISHER_SHEET_HEADER_BORDER} px-4 py-3`}>
            <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
              <X className="h-4 w-4" />
            </button>
            <div className="text-right">
              <p className={PUBLISHER_TEXT_TITLE}>إضافة مساعد</p>
              <p className={PUBLISHER_TEXT_SUB}>امسح الباركود أو أضف بالبريد</p>
            </div>
            <span className="w-9" />
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              disabled={saving}
              className={`${PUBLISHER_PURPLE_BTN_SOLID} rounded-2xl py-3`}
              style={{ background: PUBLISHER_PURPLE_GRADIENT }}
            >
              <ScanLine className="h-4 w-4" />
              مسح باركود العضو
            </button>

            <div className="flex items-center gap-2">
              <div className={PUBLISHER_DIVIDER} />
              <span className={PUBLISHER_TEXT_MUTED}>أو بالبريد</span>
              <div className={PUBLISHER_DIVIDER} />
            </div>

            <label className="block text-right">
              <span className={`mb-1 block ${PUBLISHER_TEXT_ACCENT_CAPTION}`}>بريد المساعد في ألفا</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className={PUBLISHER_EMAIL_INPUT}
                dir="ltr"
              />
            </label>

            <PermissionToggles
              values={draft}
              disabled={saving}
              onToggle={(key, value) => setDraft((d) => ({ ...d, [key]: value }))}
            />

            {feedback ? <p className={PUBLISHER_TEXT_ERROR}>{feedback}</p> : null}
          </div>

          <div className={`shrink-0 ${PUBLISHER_SHEET_FOOTER_BORDER} px-4 py-3`}>
            <button
              type="button"
              onClick={() => void addMemberByEmail()}
              disabled={saving || !email.trim()}
              className={PUBLISHER_PURPLE_BTN_SOLID}
              style={{ background: PUBLISHER_PURPLE_GRADIENT }}
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {saving ? "جاري الإضافة…" : "إضافة المساعد"}
            </button>
          </div>
        </div>
      </div>

      <AlphaMemberScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResolved={(code) => void addMemberByBarcode(code)}
      />
    </>
  );
}

function PermissionToggles({
  values,
  onToggle,
  disabled,
}: {
  values: DraftPerms;
  onToggle: (key: keyof DraftPerms, value: boolean) => void;
  disabled?: boolean;
}) {
  const keys = Object.keys(PUBLISHER_TEAM_PERMISSION_LABELS) as (keyof DraftPerms)[];

  return (
    <div className={PUBLISHER_INNER_CARD}>
      <p className={`mb-2 text-right ${PUBLISHER_TEXT_ACCENT_CAPTION}`}>صلاحيات المساعد</p>
      <div className="grid grid-cols-1 gap-1.5">
        {keys.map((key) => (
          <label
            key={key}
            className={PUBLISHER_PERM_ROW}
          >
            <input
              type="checkbox"
              checked={values[key]}
              disabled={disabled}
              onChange={(e) => onToggle(key, e.target.checked)}
              className="h-4 w-4 accent-[#5D3291]"
            />
            <span className={`flex-1 text-right ${PUBLISHER_TEXT_TITLE} text-[10px]`}>
              {PUBLISHER_TEAM_PERMISSION_LABELS[key]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
