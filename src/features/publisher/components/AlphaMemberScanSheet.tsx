import { useEffect, useState } from "react";
import { LoaderCircle, ScanLine, X } from "lucide-react";
import { parseAlphaDeepLink } from "@/features/identity/alpha-identity";

type Props = {
  open: boolean;
  onClose: () => void;
  onResolved: (alphaCode: string) => void;
};

/** Extract Alpha member code from QR text or manual entry. */
export function normalizeAlphaMemberCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const link = parseAlphaDeepLink(trimmed);
  if (link && (link.kind === "id" || link.kind === "member")) {
    return link.code.toUpperCase();
  }

  const plain = trimmed.match(/^(ALPHA-[A-Z0-9-]+|A-[A-Z0-9]+)$/i);
  if (plain) return plain[1]!.toUpperCase();

  return null;
}

export function AlphaMemberScanSheet({ open, onClose, onResolved }: Props) {
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setManual("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    setError(null);
    const code = normalizeAlphaMemberCode(manual);
    if (!code) {
      setError("أدخل باركود عضو صالح (A-… أو ALPHA-…).");
      return;
    }
    setBusy(true);
    onResolved(code);
    setBusy(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[22px] border border-[rgba(93,50,145,0.14)] bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border">
            <X className="h-4 w-4 text-[#3a3258]" />
          </button>
          <p className="text-[13px] font-extrabold text-[#3a3258]">مسح باركود العضو</p>
          <span className="w-9" />
        </div>

        <div className="relative mx-auto mb-3 flex aspect-square w-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#5D3291]/35 bg-[#f5f2ed]">
          <ScanLine className="h-10 w-10 text-[#5D3291]/70" />
          <p className="mt-2 px-3 text-center text-[9px] font-bold text-[#6b658a]">
            وجّه الكاميرا نحو باركود بطاقة العضوية
          </p>
          <p className="mt-1 text-[8px] font-bold text-[#9a94b8]">الكاميرا — قريباً</p>
        </div>

        <label className="block text-right">
          <span className="mb-1 block text-[10px] font-extrabold text-[#6b658a]">أو ألصق الكود يدوياً</span>
          <input
            value={manual}
            onChange={(e) => {
              setManual(e.target.value);
              setError(null);
            }}
            placeholder="A-7KX92M أو ALPHA-042817"
            dir="ltr"
            className="w-full rounded-xl border px-3 py-2.5 text-[12px] font-bold"
          />
        </label>

        {error ? <p className="mt-2 text-center text-[10px] font-bold text-[#a8344f]">{error}</p> : null}

        <button
          type="button"
          disabled={busy || !manual.trim()}
          onClick={submit}
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full py-2.5 text-[12px] font-extrabold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
          تأكيد العضو
        </button>
      </div>
    </div>
  );
}
