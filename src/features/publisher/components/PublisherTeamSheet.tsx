import { useState } from "react";
import { LoaderCircle, ScanLine, UserPlus, X } from "lucide-react";
import { PUBLISHER_TEAM_PERMISSION_LABELS } from "../types";
import {
  addPublisherTeamMember,
  addPublisherTeamMemberByAlphaId,
} from "../publisher-team-api";
import { AlphaMemberScanSheet } from "./AlphaMemberScanSheet";

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
      <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center">
        <div
          className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-[#fbf7f0]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[rgba(93,50,145,0.1)] px-4 py-3">
            <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full border bg-white">
              <X className="h-4 w-4" />
            </button>
            <div className="text-right">
              <p className="text-[13px] font-extrabold text-[#3a3258]">إضافة مساعد</p>
              <p className="text-[10px] font-bold text-[#6b658a]">امسح الباركود أو أضف بالبريد</p>
            </div>
            <span className="w-9" />
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[12px] font-extrabold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
            >
              <ScanLine className="h-4 w-4" />
              مسح باركود العضو
            </button>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-[rgba(93,50,145,0.12)]" />
              <span className="text-[9px] font-bold text-[#8a84a8]">أو بالبريد</span>
              <div className="h-px flex-1 bg-[rgba(93,50,145,0.12)]" />
            </div>

            <label className="block text-right">
              <span className="mb-1 block text-[10px] font-extrabold text-[#5D3291]">بريد المساعد في ألفا</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-2xl border border-[rgba(93,50,145,0.14)] bg-white px-3 py-2.5 text-[12px] font-bold text-[#3a3258]"
                dir="ltr"
              />
            </label>

            <PermissionToggles
              values={draft}
              disabled={saving}
              onToggle={(key, value) => setDraft((d) => ({ ...d, [key]: value }))}
            />

            {feedback ? <p className="text-center text-[11px] font-bold text-[#a8344f]">{feedback}</p> : null}
          </div>

          <div className="shrink-0 border-t border-[rgba(93,50,145,0.1)] px-4 py-3">
            <button
              type="button"
              onClick={() => void addMemberByEmail()}
              disabled={saving || !email.trim()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
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
    <div className="rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/90 p-2">
      <p className="mb-2 text-right text-[10px] font-extrabold text-[#5D3291]">صلاحيات المساعد</p>
      <div className="grid grid-cols-1 gap-1.5">
        {keys.map((key) => (
          <label
            key={key}
            className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(93,50,145,0.08)] bg-[#faf8fc] px-2.5 py-2"
          >
            <input
              type="checkbox"
              checked={values[key]}
              disabled={disabled}
              onChange={(e) => onToggle(key, e.target.checked)}
              className="h-4 w-4 accent-[#5D3291]"
            />
            <span className="flex-1 text-right text-[10px] font-extrabold text-[#3a3258]">
              {PUBLISHER_TEAM_PERMISSION_LABELS[key]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
