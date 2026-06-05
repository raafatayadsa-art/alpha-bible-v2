import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, Search, MapPin, Navigation, Church, Mountain, Landmark,
  X, Info, Sparkles, Clock,
} from "lucide-react";
import {
  CHURCH_PLACES, KIND_LABEL, PLACE_STATS, mapsUrlFor, getRecentPlaceIds,
  formatDistance, findPlace, type ChurchPlace, type PlaceKind,
} from "@/data/church-places";
import heroChurch from "@/assets/home/hero-church-premium.jpg";

export const Route = createFileRoute("/church/directory")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكنائس والأديرة — ألفا" },
      { name: "description", content: "اكتشف الكنائس والأديرة والمزارات القبطية حولك." },
    ],
  }),
  component: DirectoryScreen,
});

/* ---------------- palette tokens ---------------- */
const IVORY = "#fbf6ec";
const CREAM = "#f3eadb";
const SKY = "rgba(140,180,220,";
const LAV = "rgba(170,150,210,";
const BORDER = "rgba(220,210,235,0.7)";
const TEXT = "#3a3258";
const SUB = "#6b658a";

const TABS: { key: "all" | PlaceKind; label: string; icon: any }[] = [
  { key: "all", label: "الكل", icon: Sparkles },
  { key: "church", label: "الكنائس", icon: Church },
  { key: "monastery", label: "الأديرة", icon: Mountain },
  { key: "landmark", label: "المزارات", icon: Landmark },
];

const KIND_TONE: Record<PlaceKind, { bg: string; color: string; ring: string }> = {
  church: { bg: `${SKY}0.16)`, color: "#2f5a8a", ring: `${SKY}0.35)` },
  monastery: { bg: `${LAV}0.20)`, color: "#5a3e8a", ring: `${LAV}0.4)` },
  landmark: { bg: "rgba(196,179,140,0.22)", color: "#7a5c1f", ring: "rgba(196,179,140,0.45)" },
};

/* ============================================================ */
export function DirectoryScreen() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => { setRecentIds(getRecentPlaceIds()); }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return CHURCH_PLACES.filter((p) => {
      if (tab !== "all" && p.kind !== tab) return false;
      if (!q) return true;
      return [p.name, p.type, p.city, p.region ?? "", p.country, p.priest ?? ""]
        .some((s) => s.includes(q));
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [query, tab]);

  const nearby = useMemo(
    () => [...CHURCH_PLACES].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 6),
    [],
  );

  const recent = recentIds
    .map((id) => findPlace(id))
    .filter((x): x is ChurchPlace => Boolean(x));

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24"
      style={{
        background:
          `radial-gradient(120% 80% at 50% 0%, #fbf6ec 0%, #f1ecf7 45%, #e8eef8 100%)`,
      }}
    >
      {/* ambient halos */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            `radial-gradient(60% 40% at 20% 10%, ${LAV}0.22), transparent 65%),` +
            `radial-gradient(70% 45% at 90% 30%, ${SKY}0.20), transparent 65%)`,
        }}
      />

      <Header query={query} hasQuery={!!query} />

      <main className="relative mx-auto w-full max-w-[440px] px-4 pt-3 space-y-5">
        {/* Hero */}
        <HeroCard />

        {/* Search */}
        <SearchBar value={query} onChange={setQuery} />

        {/* Tabs */}
        <Tabs active={tab} onChange={setTab} />

        {/* Recently viewed */}
        {recent.length > 0 && !query && tab === "all" ? (
          <SectionCarousel title="الكنائس التي زرتها مؤخراً" icon={Clock} places={recent} />
        ) : null}

        {/* Nearby */}
        {!query && tab === "all" ? (
          <SectionCarousel title="الكنائس القريبة منك" icon={MapPin} places={nearby} />
        ) : null}

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[14px] font-extrabold" style={{ color: TEXT }}>
              {query ? "نتائج البحث" : tab === "all" ? "كل المواقع" : TABS.find((t) => t.key === tab)?.label}
            </h2>
            <span className="text-[11px] font-bold" style={{ color: SUB }}>
              {filtered.length} نتيجة
            </span>
          </div>
          {filtered.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((p) => <PlaceCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ============================================================ */
function Header({ query, hasQuery }: { query: string; hasQuery: boolean }) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(251,246,236,0.9), rgba(241,236,247,0.78))",
        borderBottom: `1px solid ${BORDER}`,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
      }}
    >
      <div className="flex items-center justify-between px-4 pb-3">
        <Link
          to="/church"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/85 border text-[#3a3258] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(100,90,140,0.5)]"
          style={{ borderColor: BORDER }}
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-extrabold" style={{ color: TEXT }}>
          الكنائس والأديرة
        </h1>
        <div className="w-10" />
      </div>
      {hasQuery ? (
        <div className="px-4 pb-2 text-[11px] font-bold text-right" style={{ color: SUB }}>
          بحث: «{query}»
        </div>
      ) : null}
    </header>
  );
}

/* ============================================================ */
function HeroCard() {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl shadow-[0_24px_50px_-24px_rgba(120,110,180,0.45),inset_0_1px_0_rgba(255,255,255,0.9)]"
      style={{ borderColor: BORDER, background: `linear-gradient(160deg, ${IVORY}, #efeaf6)` }}
    >
      <div className="relative h-[140px] w-full overflow-hidden">
        <img src={heroChurch} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              `linear-gradient(180deg, rgba(251,246,236,0.15) 0%, rgba(251,246,236,0.75) 80%, rgba(251,246,236,0.95) 100%),` +
              `radial-gradient(50% 50% at 70% 30%, ${LAV}0.35), transparent 65%)`,
          }}
        />
      </div>
      <div className="px-4 pt-1 pb-4 text-right">
        <h2 className="font-arabic-serif text-[18px] font-extrabold leading-tight" style={{ color: TEXT }}>
          ابحث عن كنيسة أو دير
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: SUB }}>
          اكتشف الكنائس والأديرة والمزارات القبطية
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip icon={Church} label="كنيسة" value={PLACE_STATS.churches} tint={`${SKY}0.20)`} ring={`${SKY}0.42)`} color="#2f5a8a" shadowColor="rgba(140,180,220,0.30)" />
          <StatChip icon={Mountain} label="دير" value={PLACE_STATS.monasteries} tint={`${LAV}0.24)`} ring={`${LAV}0.48)`} color="#5a3e8a" shadowColor="rgba(170,150,210,0.30)" />
          <StatChip icon={Landmark} label="مزار" value={PLACE_STATS.landmarks} tint="rgba(196,179,140,0.24)" ring="rgba(196,179,140,0.48)" color="#7a5c1f" shadowColor="rgba(196,179,140,0.30)" />
        </div>
      </div>
    </section>
  );
}

function StatChip({ icon: Icon, label, value, tint, ring, color, shadowColor }: {
  icon: any; label: string; value: number; tint: string; ring: string; color: string; shadowColor: string;
}) {
  return (
    <div
      className="relative rounded-[22px] px-2 py-3 text-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,0.55) 0%, ${tint} 100%)`,
        border: `1px solid ${ring}`,
        boxShadow: `0 12px 32px -12px ${shadowColor}, 0 4px 8px -4px ${shadowColor}, inset 0 1px 1px rgba(255,255,255,0.85), inset 0 -1px 1px rgba(255,255,255,0.3)`,
      }}
    >
      {/* Soft top highlight */}
      <div 
        className="pointer-events-none absolute inset-x-4 top-[1px] h-[1px] rounded-full" 
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }} 
      />
      
      {/* 3D depth: subtle inner bottom shadow */}
      <div 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] rounded-b-[22px]" 
        style={{ background: `linear-gradient(180deg, transparent, ${shadowColor})`, opacity: 0.06 }} 
      />
      
      {/* Icon container with glass */}
      <div 
        className="relative mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-[14px]"
        style={{ 
          background: `linear-gradient(135deg, rgba(255,255,255,0.6), ${tint})`,
          border: `1px solid ${ring}`,
          boxShadow: `0 4px 12px -6px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.8)`,
        }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color }} strokeWidth={2} />
      </div>
      
      {/* Large number */}
      <div className="text-[24px] font-extrabold leading-none tracking-tight" style={{ color }}>
        {value}
      </div>
      
      {/* Label */}
      <div className="mt-1.5 text-[11px] font-bold" style={{ color: SUB }}>
        {label}
      </div>
    </div>
  );
}

/* ============================================================ */
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="relative rounded-2xl backdrop-blur-xl"
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,0.85), rgba(241,236,247,0.7))`,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 14px 30px -20px rgba(120,110,180,0.45), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: SUB }} strokeWidth={2.4} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث: مارجرجس، الأنبا بيشوي، الرياض…"
        className="w-full h-12 pr-11 pl-11 bg-transparent rounded-2xl text-[13px] font-bold outline-none placeholder:font-medium"
        style={{ color: TEXT }}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="مسح"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white/80 border active:scale-90"
          style={{ borderColor: BORDER, color: SUB }}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
      ) : null}
    </div>
  );
}

/* ============================================================ */
function Tabs({
  active, onChange,
}: { active: (typeof TABS)[number]["key"]; onChange: (k: any) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
      {TABS.map((t) => {
        const on = t.key === active;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              "shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-extrabold border backdrop-blur-md transition-all " +
              (on ? "text-white" : "active:scale-95")
            }
            style={
              on
                ? { background: "linear-gradient(160deg, #5a4e8a, #3a3258)", borderColor: "transparent", boxShadow: "0 10px 22px -12px rgba(90,78,138,0.6)" }
                : { background: "rgba(255,255,255,0.75)", borderColor: BORDER, color: TEXT }
            }
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ */
function SectionCarousel({
  title, icon: Icon, places,
}: { title: string; icon: any; places: ChurchPlace[] }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Icon className="h-4 w-4" style={{ color: "#5a4e8a" }} strokeWidth={2.4} />
        <h2 className="text-[13.5px] font-extrabold" style={{ color: TEXT }}>{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x snap-mandatory">
        {places.map((p) => <MiniCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

function MiniCard({ p }: { p: ChurchPlace }) {
  const tone = KIND_TONE[p.kind];
  return (
    <Link
      to="/church/directory/$placeId"
      params={{ placeId: p.id }}
      className="snap-start shrink-0 w-[180px] rounded-2xl overflow-hidden border backdrop-blur-xl active:scale-[0.98] transition-transform"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 14px 30px -20px rgba(120,110,180,0.45), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="relative h-[100px] w-full">
        <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 h-[20px] rounded-full text-[10px] font-extrabold backdrop-blur-md text-white"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          {p.countryFlag} {p.country}
        </span>
      </div>
      <div className="p-2.5 text-right">
        <h3 className="text-[12.5px] font-extrabold leading-tight line-clamp-2" style={{ color: TEXT }}>
          {p.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[9.5px] font-extrabold"
            style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.ring}` }}
          >
            {KIND_LABEL[p.kind]}
          </span>
          <span className="text-[10px] font-bold" style={{ color: SUB }}>
            {formatDistance(p.distanceKm)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================ */
function PlaceCard({ p }: { p: ChurchPlace }) {
  const tone = KIND_TONE[p.kind];
  return (
    <article
      className="rounded-[24px] overflow-hidden border backdrop-blur-xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 20px 40px -24px rgba(120,110,180,0.5), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div className="relative h-[150px] w-full">
        <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.45) 100%)" }}
        />
        {/* Country badge */}
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 h-[24px] rounded-full text-[11px] font-extrabold backdrop-blur-md text-white"
          style={{ background: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span className="text-[13px] leading-none">{p.countryFlag}</span>
          {p.country}
        </span>
        {/* Kind */}
        <span
          className="absolute top-3 left-3 inline-flex items-center px-2.5 h-[24px] rounded-full text-[10.5px] font-extrabold backdrop-blur-md"
          style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.ring}` }}
        >
          {KIND_LABEL[p.kind]}
        </span>
        {/* Distance */}
        <span
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 h-[24px] rounded-full text-[10.5px] font-extrabold text-white backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <MapPin className="h-3 w-3" strokeWidth={2.6} />
          تبعد {formatDistance(p.distanceKm)}
        </span>
      </div>

      <div className="p-3.5 text-right">
        <h3 className="font-arabic-serif text-[15px] font-extrabold leading-tight" style={{ color: TEXT }}>
          {p.name}
        </h3>
        <p className="mt-1 text-[11.5px] font-bold" style={{ color: tone.color }}>{p.type}</p>
        <div className="mt-1 flex items-center gap-1 text-[11.5px]" style={{ color: SUB }}>
          <MapPin className="h-3 w-3" strokeWidth={2.4} />
          <span className="truncate">{[p.city, p.region].filter(Boolean).join(" — ")}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={mapsUrlFor(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-[12px] font-extrabold text-white active:scale-[0.98] transition-transform"
            style={{
              background: `linear-gradient(160deg, ${SKY}0.95), #2f5a8a)`,
              boxShadow: `0 12px 24px -14px ${SKY}0.9)`,
            }}
          >
            <Navigation className="h-3.5 w-3.5" strokeWidth={2.4} />
            الاتجاهات
          </a>
          <Link
            to="/church/directory/$placeId"
            params={{ placeId: p.id }}
            className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-[12px] font-extrabold active:scale-[0.98] transition-transform border"
            style={{
              background: `linear-gradient(160deg, rgba(255,255,255,0.95), ${LAV}0.18))`,
              borderColor: `${LAV}0.5)`,
              color: "#5a3e8a",
            }}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.4} />
            التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}

function Empty() {
  return (
    <div
      className="rounded-3xl border p-10 text-center backdrop-blur-xl"
      style={{ background: "rgba(255,255,255,0.75)", borderColor: BORDER }}
    >
      <div
        className="mx-auto h-14 w-14 rounded-2xl grid place-items-center mb-3"
        style={{ background: `${LAV}0.2)`, color: "#5a3e8a", border: `1px solid ${LAV}0.4)` }}
      >
        <Search className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="text-[14px] font-extrabold mb-1" style={{ color: TEXT }}>لا توجد نتائج</h3>
      <p className="text-[12px]" style={{ color: SUB }}>جرّب اسمًا، مدينة، أو دولة أخرى.</p>
    </div>
  );
}
