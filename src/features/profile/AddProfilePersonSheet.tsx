import { lazy, Suspense, useEffect, useState } from "react";
import { LoaderCircle, ScanLine, Search, UserPlus, X } from "lucide-react";
import {
  loadPeopleDirectory,
  resolvePersonFromCode,
  searchPeople,
  type ResolvablePerson,
} from "./profile-people-resolve";
import {
  addProfileConnectLink,
  addProfileFamilyLink,
  type ProfileLinkedPerson,
} from "./profile-people-store";
import { upsertFamilyMember } from "@/features/church/trip-reservations/family-booking";
import { normalizeAlphaMemberCode } from "@/features/publisher/components/AlphaMemberScanSheet";

const AlphaMembershipQrScanner = lazy(() =>
  import("./AlphaMembershipQrScanner").then((mod) => ({
    default: mod.AlphaMembershipQrScanner,
  })),
);

const FAMILY_RELATIONS = ["زوج/زوجة", "ابن/ابنة", "أخ/أخت", "والد/والدة", "فرد عائلة"];

type Mode = "pick" | "search" | "scan";

type Props = {
  open: boolean;
  variant: "family" | "connect";
  onClose: () => void;
  onAdded: (person: ProfileLinkedPerson) => void;
};

export function AddProfilePersonSheet({ open, variant, onClose, onAdded }: Props) {
  const [mode, setMode] = useState<Mode>("pick");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [relation, setRelation] = useState(FAMILY_RELATIONS[0]!);
  const [suggestions, setSuggestions] = useState<ResolvablePerson[]>([]);
  const [results, setResults] = useState<ResolvablePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode("pick");
      setScannerOpen(false);
      setQuery("");
      setManualCode("");
      setError(null);
      setBusy(false);
      return;
    }
    setLoading(true);
    void loadPeopleDirectory()
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "search") return;
    const t = window.setTimeout(() => {
      void searchPeople(query).then(setResults);
    }, 220);
    return () => window.clearTimeout(t);
  }, [open, mode, query]);

  const commitPerson = async (person: ResolvablePerson, pickedRelation?: string) => {
    setBusy(true);
    setError(null);
    try {
      if (variant === "family") {
        const entry = addProfileFamilyLink({
          name: person.name,
          avatarUrl: person.avatarUrl,
          alphaId: person.alphaId,
          linkedUserId: person.linkedUserId,
          relation: pickedRelation ?? relation,
        });
        if (!entry) {
          setError("هذا الفرد مضاف بالفعل في العائلة.");
          return;
        }
        upsertFamilyMember({
          id: entry.id,
          name: entry.name,
          relation: entry.relation ?? relation,
          avatarUrl: entry.avatarUrl,
          alphaId: entry.alphaId,
          linkedUserId: entry.linkedUserId,
        });
        onAdded(entry);
        onClose();
        return;
      }

      const entry = addProfileConnectLink({
        name: person.name,
        avatarUrl: person.avatarUrl,
        alphaId: person.alphaId,
        linkedUserId: person.linkedUserId,
      });
      if (!entry) {
        setError("هذا الشخص مضاف بالفعل في قائمة التواصل.");
        return;
      }
      onAdded(entry);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleScanResolved = async (code: string) => {
    setScannerOpen(false);
    setBusy(true);
    setError(null);
    try {
      const person = await resolvePersonFromCode(code);
      if (!person) {
        setError("باركود غير معروف.");
        return;
      }
      await commitPerson(person);
    } finally {
      setBusy(false);
    }
  };

  const handleManualCode = async () => {
    const code = normalizeAlphaMemberCode(manualCode);
    if (!code) {
      setError("أدخل باركود أو Alpha ID صالح.");
      return;
    }
    await handleScanResolved(code);
  };

  if (!open) return null;

  const list = mode === "search" ? results : suggestions;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-[24px] border border-[#b8a0e8]/25 p-4"
          style={{
            background: "linear-gradient(155deg, #2a1a45 0%, #1a1028 100%)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/8 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[14px] font-extrabold text-white">
              {variant === "family" ? "إضافة فرد للعائلة" : "إضافة للتواصل"}
            </p>
            <span className="w-9" />
          </div>

          <div className="mb-3 flex gap-1.5 rounded-xl border border-white/10 bg-black/25 p-1">
            {(
              [
                ["pick", "اقتراحات"],
                ["search", "بحث"],
                ["scan", "باركود"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setError(null);
                  if (id === "scan") setScannerOpen(true);
                }}
                className={`flex-1 rounded-lg py-2 text-[10px] font-extrabold transition ${
                  mode === id ? "bg-[#8a6ec1]/35 text-white" : "text-white/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {variant === "family" ? (
            <div className="mb-3 flex flex-wrap justify-end gap-1">
              {FAMILY_RELATIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRelation(r)}
                  className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                    relation === r
                      ? "border-[#b8a0e8]/50 bg-[#8a6ec1]/25 text-white"
                      : "border-white/12 text-white/45"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : null}

          {mode === "search" ? (
            <label className="mb-3 block">
              <span className="mb-1 flex items-center justify-end gap-1 text-[10px] font-bold text-white/50">
                <Search className="h-3.5 w-3.5" />
                ابحث بالاسم أو Alpha ID
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اسم أو A-7KX92M"
                className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-[12px] font-semibold text-white outline-none focus:border-[#b8a0e8]/40"
              />
            </label>
          ) : null}

          {mode === "scan" && !scannerOpen ? (
            <div className="mb-3 space-y-2">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b8a0e8]/30 bg-[#8a6ec1]/15 py-3 text-[11px] font-extrabold text-[#d4c4f8]"
              >
                <ScanLine className="h-4 w-4" />
                فتح الكاميرا للمسح
              </button>
              <input
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setError(null);
                }}
                placeholder="أو ألصق Alpha ID"
                dir="ltr"
                className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-center text-[12px] font-bold text-white"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || busy}
                onClick={() => void handleManualCode()}
                className="w-full rounded-xl py-2.5 text-[11px] font-extrabold text-[#1a1028] disabled:opacity-45"
                style={{ background: "linear-gradient(135deg, #d4c4f8, #8a6ec1)" }}
              >
                تأكيد الباركود
              </button>
            </div>
          ) : null}

          {error ? <p className="mb-2 text-center text-[10px] font-bold text-rose-300">{error}</p> : null}

          {mode !== "scan" ? (
            <div className="max-h-[240px] overflow-y-auto [scrollbar-width:thin]">
              {loading ? (
                <div className="grid place-items-center py-8 text-white/50">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
              ) : list.length ? (
                <ul className="space-y-1.5">
                  {list.map((person) => (
                    <li key={`${person.alphaId}-${person.linkedUserId ?? person.name}`}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void commitPerson(person)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-black/20 px-2.5 py-2 text-right active:scale-[0.99] disabled:opacity-50"
                      >
                        <img
                          src={person.avatarUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full border border-white/15 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-extrabold text-white">{person.name}</p>
                          <p className="font-mono text-[9px] font-bold text-[#b8a0e8]/70" dir="ltr">
                            {person.alphaId}
                          </p>
                        </div>
                        <UserPlus className="h-4 w-4 shrink-0 text-[#b8a0e8]" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-[11px] text-white/40">لا توجد نتائج</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {scannerOpen ? (
        <Suspense fallback={null}>
          <AlphaMembershipQrScanner
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onResolved={(code) => void handleScanResolved(code)}
          />
        </Suspense>
      ) : null}
    </>
  );
}
