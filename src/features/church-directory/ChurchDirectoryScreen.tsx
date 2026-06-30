import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, Search, X, Map, List, LocateFixed, SlidersHorizontal, Moon, Sun
} from "lucide-react";
import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";
import { ChurchDirectoryMapGate } from "./components/ChurchDirectoryMapGate";
import { ChurchDirectoryListView } from "./components/ChurchDirectoryListView";
import { ChurchDirectoryFloatingCard } from "./components/ChurchDirectoryFloatingCard";
import {
  EMPTY_DIRECTORY_FILTERS,
  useChurchDirectoryFacets,
  useChurchDirectorySearch,
  useCitiesForGovernorate,
  useUserGeoLocation,
} from "./useChurchDirectorySearch";
import { mapPinToDirectoryRow, useChurchDirectoryMapPins } from "./useChurchDirectoryMapPins";
import { ChurchDirectoryMapLegend } from "./components/ChurchDirectoryMapLegend";
import { filterChurchDirectoryByFilters } from "./directory-search";
import type { ChurchDirectoryFilterState, ChurchDirectoryMapPin, ChurchDirectoryRow, DirectoryViewMode } from "./types";
import { CHURCH_DIR } from "./tokens";

type PillKey = "all" | "nearby" | "verified" | "governorate" | "city" | "saint";

export function ChurchDirectoryScreen() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<DirectoryViewMode>("list");
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [mapFailed, setMapFailed] = useState(false);
  const [selected, setSelected] = useState<ChurchDirectoryRow | null>(null);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<ChurchDirectoryFilterState>(EMPTY_DIRECTORY_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [activePill, setActivePill] = useState<PillKey>("all");
  const [locateClicked, setLocateClicked] = useState(false);

  const { coords, denied, refresh: refreshLocation } = useUserGeoLocation();
  const { data: facets } = useChurchDirectoryFacets();
  const { data: scopedCities = [] } = useCitiesForGovernorate(filters.governorate);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: draftQuery }));
    }, 280);
    return () => window.clearTimeout(t);
  }, [draftQuery]);

  const userLat = coords?.lat ?? null;
  const userLng = coords?.lng ?? null;

  const {
    rows,
    totalCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useChurchDirectorySearch(filters, userLat, userLng);

  const { data: mapPins = [] } = useChurchDirectoryMapPins();

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selected?.id) ?? selected,
    [rows, selected],
  );

  const applyPill = (pill: PillKey) => {
    setActivePill(pill);
    if (pill === "all") {
      setFilters({ ...EMPTY_DIRECTORY_FILTERS, query: draftQuery });
      return;
    }
    if (pill === "nearby") {
      setFilters({ ...EMPTY_DIRECTORY_FILTERS, query: draftQuery, nearbyOnly: true });
      if (!coords) refreshLocation();
      return;
    }
    if (pill === "verified") {
      setFilters({ ...EMPTY_DIRECTORY_FILTERS, query: draftQuery, verifiedOnly: true });
      return;
    }
    setFilterSheetOpen(true);
  };

  const onSelect = useCallback(
    (row: ChurchDirectoryRow) => {
      void navigate({ to: "/church/directory/$placeId", params: { placeId: row.id } });
    },
    [navigate],
  );

  const onMapSelect = useCallback((pin: ChurchDirectoryMapPin) => {
    setSelected(mapPinToDirectoryRow(pin));
  }, []);

  const governorateOptions = facets?.governorates ?? [];
  const cityOptions = filters.governorate.trim() ? scopedCities : (facets?.cities ?? []);

  const displayRows = rows;

  const filteredMapPins = useMemo(() => {
    return mapPins.filter((pin) => {
      const row = mapPinToDirectoryRow(pin);
      return filterChurchDirectoryByFilters([row], {
        query: filters.query,
        governorate: filters.governorate,
        city: filters.city,
        patronSaint: filters.patronSaint,
        verifiedOnly: filters.verifiedOnly,
      }).length > 0;
    });
  }, [mapPins, filters]);

  return (
    <div dir="rtl" className="relative h-[100dvh] overflow-hidden" style={{ background: CHURCH_DIR.beigeDeep }}>
      {/* Map layer — client-only lazy load */}
      {!mapFailed ? (
        <div className={`absolute inset-0 ${viewMode === "list" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <ChurchDirectoryMapGate
            key={mapTheme}
            className="h-full w-full"
            churches={filteredMapPins}
            selectedId={selected?.id ?? null}
            userLat={userLat}
            userLng={userLng}
            onSelect={onMapSelect}
            mapTheme={mapTheme}
            onMapError={() => {
              setMapFailed(true);
              setViewMode("list");
            }}
          />
        </div>
      ) : null}

      {/* List layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${viewMode === "list" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: CHURCH_DIR.beigeDeep }}
      >
        <ChurchDirectoryListView
          rows={displayRows}
          selectedId={selected?.id ?? null}
          totalCount={draftQuery.trim() ? displayRows.length : totalCount}
          loading={isLoading}
          hasMore={Boolean(hasNextPage)}
          loadingMore={isFetchingNextPage}
          onSelect={onSelect}
          onLoadMore={() => void fetchNextPage()}
          topPadding={viewMode === "list" ? 210 : 60}
        />
      </div>

      {/* Top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2.5 px-3 pt-[max(env(safe-area-inset-top),10px)]">
        <div className="pointer-events-auto flex items-center justify-between gap-2">
          <Link
            to="/church"
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border backdrop-blur-xl active:scale-95"
            style={{ background: CHURCH_DIR.glass, borderColor: CHURCH_DIR.border, color: CHURCH_DIR.text }}
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2.2} />
          </Link>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] opacity-60" style={{ color: viewMode === "map" ? CHURCH_DIR.gold : CHURCH_DIR.purple }}>
              Ⲁ Ⲱ
            </p>
            <h1
              className="text-[15px] font-extrabold"
              style={{
                color: viewMode === "map" ? CHURCH_DIR.gold : CHURCH_DIR.text,
                textShadow: viewMode === "map" ? "0 0 12px rgba(212, 175, 55, 0.6)" : undefined,
              }}
            >
              دليل الكنائس
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "map" && (
              <button
                type="button"
                onClick={() => setMapTheme((t) => (t === "light" ? "dark" : "light"))}
                className="grid h-10 w-10 place-items-center rounded-full border backdrop-blur-xl active:scale-95"
                style={{ background: CHURCH_DIR.glass, borderColor: CHURCH_DIR.border, color: CHURCH_DIR.text }}
                aria-label="تبديل المظهر"
              >
                {mapTheme === "light" ? <Moon className="h-4 w-4" strokeWidth={2.2} /> : <Sun className="h-4 w-4" strokeWidth={2.2} />}
              </button>
            )}
            <AlphaNotificationButton />
          </div>
        </div>

        <div
          className="pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out max-h-[200px] opacity-100"
        >
          <div
            className="rounded-[22px] border backdrop-blur-2xl px-3 py-2.5"
            style={{ background: CHURCH_DIR.glass, borderColor: CHURCH_DIR.border, boxShadow: "0 16px 40px -24px rgba(93,50,145,0.35)" }}
          >
            <div className="relative">
              <Search className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: CHURCH_DIR.sub }} strokeWidth={2.4} />
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="ابحث عن كنيسة أو مدينة أو محافظة أو قديس"
                className="h-11 w-full rounded-2xl bg-transparent pr-8 pl-20 text-[13px] font-bold outline-none"
                style={{ color: CHURCH_DIR.text }}
              />
              <div className="absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {draftQuery ? (
                  <button type="button" onClick={() => setDraftQuery("")} aria-label="مسح" className="grid h-8 w-8 place-items-center rounded-full">
                    <X className="h-3.5 w-3.5" style={{ color: CHURCH_DIR.sub }} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(true)}
                  aria-label="فلاتر"
                  className="grid h-8 w-8 place-items-center rounded-full border"
                  style={{ borderColor: CHURCH_DIR.border, color: CHURCH_DIR.purple }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.3} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <FilterPill label={`الكل (${facets?.totalCount ?? "…"})`} active={activePill === "all"} onClick={() => applyPill("all")} />
              <FilterPill label="القريبة مني" active={activePill === "nearby"} onClick={() => applyPill("nearby")} />
              <FilterPill label={`الموثقة (${facets?.verifiedCount ?? 0})`} active={activePill === "verified"} onClick={() => applyPill("verified")} />
              <FilterPill label="المحافظة" active={activePill === "governorate"} onClick={() => applyPill("governorate")} />
              <FilterPill label="المدينة" active={activePill === "city"} onClick={() => applyPill("city")} />
              <FilterPill label="القديس" active={activePill === "saint"} onClick={() => applyPill("saint")} />
            </div>
          </div>
        </div>

        {/* The arrow is removed as requested */}
      </div>

      {/* Location refresh */}
      {!coords && !locateClicked && (
        <>
          <button
            type="button"
            onClick={() => {
              setLocateClicked(true);
              refreshLocation();
            }}
            className="pointer-events-auto absolute left-3 z-[500] grid h-11 w-11 place-items-center rounded-full border backdrop-blur-xl active:scale-95"
            style={{
              bottom: selectedRow && viewMode === "map" ? "calc(env(safe-area-inset-bottom) + 220px)" : "calc(env(safe-area-inset-bottom) + 96px)",
              background: CHURCH_DIR.glass,
              borderColor: CHURCH_DIR.border,
              color: CHURCH_DIR.purple,
            }}
            aria-label="تحديث موقعي"
          >
            <LocateFixed className="h-5 w-5" strokeWidth={2.2} />
          </button>

          {denied && (
            <p
              className="pointer-events-none absolute left-14 z-[500] max-w-[160px] rounded-xl px-2 py-1 text-[10px] font-bold backdrop-blur-md transition-opacity duration-300"
              style={{
                bottom: selectedRow && viewMode === "map" ? "calc(env(safe-area-inset-bottom) + 228px)" : "calc(env(safe-area-inset-bottom) + 104px)",
                background: "rgba(255,255,255,0.85)",
                color: CHURCH_DIR.sub,
              }}
            >
              فعّل الموقع لاكتشاف الأقرب
            </p>
          )}
        </>
      )}

      {viewMode === "map" && !mapFailed ? (
        <ChurchDirectoryMapLegend pinCount={filteredMapPins.length} />
      ) : null}

      {/* Floating card on map */}
      {viewMode === "map" && selectedRow ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-[500]">
          <ChurchDirectoryFloatingCard church={selectedRow} onClose={() => setSelected(null)} />
        </div>
      ) : null}

      {/* View toggle */}
      <div
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-[500] border-t backdrop-blur-2xl px-4 py-2.5"
        style={{
          borderColor: CHURCH_DIR.border,
          background: "rgba(245,242,237,0.92)",
          paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
        }}
      >
        <div className="mx-auto flex max-w-md gap-2 rounded-full border p-1" style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.65)" }}>
          <ViewToggleButton icon={Map} label="الخريطة" active={viewMode === "map"} disabled={mapFailed} onClick={() => !mapFailed && setViewMode("map")} />
          <ViewToggleButton icon={List} label="القائمة" active={viewMode === "list"} onClick={() => setViewMode("list")} />
        </div>
        <p className="mt-1.5 text-center text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
          {viewMode === "map"
            ? `${filteredMapPins.length.toLocaleString("ar-EG")} كنيسة على الخريطة · Alpha Control`
            : `${totalCount.toLocaleString("ar-EG")} كنيسة · ${rows.length.toLocaleString("ar-EG")} محمّلة`}
        </p>
      </div>

      {/* Advanced filter sheet */}
      {filterSheetOpen ? (
        <div className="absolute inset-0 z-[600] flex items-end bg-black/25 backdrop-blur-[2px]" onClick={() => setFilterSheetOpen(false)}>
          <div
            className="w-full rounded-t-[28px] border p-4 pb-[max(env(safe-area-inset-bottom),16px)]"
            style={{ background: CHURCH_DIR.beige, borderColor: CHURCH_DIR.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-center text-[14px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
              تصفية متقدمة
            </h3>
            <FilterField
              label="المحافظة"
              value={filters.governorate}
              options={governorateOptions}
              onChange={(v) => setFilters((p) => ({ ...p, governorate: v, city: "" }))}
            />
            <FilterField
              label="المدينة"
              value={filters.city}
              options={cityOptions}
              onChange={(v) => setFilters((p) => ({ ...p, city: v }))}
            />
            <FilterField
              label="القديس الشفيع"
              value={filters.patronSaint}
              options={facets?.patronSaints ?? []}
              onChange={(v) => setFilters((p) => ({ ...p, patronSaint: v }))}
            />
            <button
              type="button"
              onClick={() => {
                setFilterSheetOpen(false);
                void refetch();
              }}
              className="mt-4 h-12 w-full rounded-full text-[13px] font-extrabold text-white active:scale-[0.99]"
              style={{ background: `linear-gradient(160deg, #7b4cb8, ${CHURCH_DIR.purple})` }}
            >
              عرض النتائج ({totalCount.toLocaleString("ar-EG")})
            </button>
          </div>
        </div>
      ) : null}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-all active:scale-95"
      style={{
        background: active ? CHURCH_DIR.purple : "rgba(255,255,255,0.72)",
        borderColor: active ? CHURCH_DIR.purple : CHURCH_DIR.border,
        color: active ? "#F5F2ED" : CHURCH_DIR.text,
        boxShadow: active ? `0 8px 20px -10px ${CHURCH_DIR.purpleGlow}` : undefined,
      }}
    >
      {label}
    </button>
  );
}

function ViewToggleButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: typeof Map;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold transition-all disabled:opacity-40"
      style={{
        background: active ? CHURCH_DIR.purple : "transparent",
        color: active ? "#F5F2ED" : CHURCH_DIR.text,
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}

function FilterField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="mb-2 block text-right">
      <span className="mb-1 block text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border bg-white/85 px-3 text-[12px] font-bold outline-none"
        style={{ borderColor: CHURCH_DIR.border, color: CHURCH_DIR.text }}
      >
        <option value="">الكل</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
