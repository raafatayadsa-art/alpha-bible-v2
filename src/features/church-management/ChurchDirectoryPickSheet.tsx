import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { fetchChurchDirectoryAll } from "@/features/church-directory/api";
import { filterChurchDirectoryRows } from "@/features/church-directory/directory-search";
import { EMPTY_DIRECTORY_FILTERS } from "@/features/church-directory/useChurchDirectorySearch";
import type { ChurchDirectoryRow } from "@/features/church-directory/types";
import { cn } from "@/lib/utils";
import { googleMapsUrl } from "./church-location";
import type { LocationValue } from "./ChurchLocationPicker";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (value: LocationValue & { churchName?: string }) => void;
};

export function ChurchDirectoryPickSheet({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [allRows, setAllRows] = useState<ChurchDirectoryRow[]>([]);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchChurchDirectoryAll(EMPTY_DIRECTORY_FILTERS, { requireCoords: true });
      setAllRows(rows);
      if (rows.length === 0) {
        setLoadError("تعذّر تحميل دليل الكنائس. تحقق من الاتصال وحاول مرة أخرى.");
      }
    } catch {
      setAllRows([]);
      setLoadError("تعذّر تحميل دليل الكنائس. تحقق من الاتصال وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    void loadDirectory();
  }, [open, loadDirectory]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rows = useMemo(() => filterChurchDirectoryRows(allRows, query), [allRows, query]);

  const pick = (church: ChurchDirectoryRow) => {
    if (church.lat == null || church.lng == null) return;
    const label = [church.name, church.city, church.governorate].filter(Boolean).join(" · ");
    onSelect({
      latitude: church.lat,
      longitude: church.lng,
      locationLabel: label,
      mapLocation: googleMapsUrl(church.lat, church.lng),
      churchName: church.name,
      city: church.city ?? undefined,
      governorate: church.governorate ?? undefined,
    });
    onClose();
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10080] flex items-end justify-center" dir="rtl">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-[#050508]/55 backdrop-blur-[5px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="دليل الكنائس"
        className="relative z-[1] flex max-h-[min(78dvh,560px)] w-full max-w-[var(--alpha-content-narrow-width)] flex-col overflow-hidden rounded-t-[24px] border border-[#efe2c4]/80 bg-[#fbf7f0]/96 shadow-[0_-20px_56px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#efe2c4]/70 px-4 py-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/80 text-[#6a543a] active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[14px] font-extrabold text-[#3a2a18]">دليل الكنائس</p>
            <p className="text-[10px] font-semibold text-[#9a7e5a]">
              {loading
                ? "جاري تحميل الدليل…"
                : `${rows.length.toLocaleString("ar-EG")} كنيسة — ابحث بالاسم أو المدينة أو المحافظة`}
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7e5a]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الكنيسة أو المدينة أو المحافظة..."
              className="w-full rounded-xl border border-[#efe2c4] bg-white/85 py-2.5 pl-3 pr-9 text-[12px] font-bold text-[#3a2a18] outline-none placeholder:text-[#b8a48a]"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
            </div>
          ) : loadError ? (
            <div className="py-8 text-center">
              <p className="text-[12px] font-semibold text-[#9a7e5a]">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadDirectory()}
                className="mt-3 text-[12px] font-extrabold text-[#7C3AED] underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-[12px] font-semibold text-[#9a7e5a]">
              لا توجد نتائج — جرّب بحثاً آخر
            </p>
          ) : (
            <ul className="space-y-1.5">
              {rows.map((church) => (
                <li key={church.id}>
                  <button
                    type="button"
                    onClick={() => pick(church)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-2xl border border-[#efe2c4]/80 bg-white/72 px-3 py-2.5 text-right",
                      "active:scale-[0.99] transition-transform",
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-[#7C3AED]" strokeWidth={2.2} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-extrabold text-[#3a2a18]">{church.name}</p>
                      <p className="truncate text-[10px] font-semibold text-[#9a7e5a]">
                        {[church.city, church.governorate].filter(Boolean).join(" · ") || "موقع على الخريطة"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
