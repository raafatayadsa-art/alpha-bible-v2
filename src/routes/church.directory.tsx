import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, Search, MapPin, Navigation, Church, Mountain, Landmark, X } from "lucide-react";
import {
  CHURCH_PLACES, KIND_LABEL, mapsUrlFor, type ChurchPlace, type PlaceKind,
} from "@/data/church-places";

export const Route = createFileRoute("/church/directory")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "دليل الكنائس والأديرة — ألفا" },
      { name: "description", content: "دليل شامل للكنائس، الأديرة، والمعالم المسيحية القريبة منك." },
    ],
  }),
  component: DirectoryScreen,
});

const TABS: { key: "all" | PlaceKind; label: string; icon: any }[] = [
  { key: "all", label: "الكل", icon: MapPin },
  { key: "church", label: "كنائس", icon: Church },
  { key: "monastery", label: "أديرة", icon: Mountain },
  { key: "landmark", label: "معالم", icon: Landmark },
];

const KIND_TONE: Record<PlaceKind, { bg: string; color: string; ring: string }> = {
  church: { bg: "rgba(199,147,86,0.16)", color: "#8a5a1f", ring: "rgba(199,147,86,0.35)" },
  monastery: { bg: "rgba(168,109,194,0.16)", color: "#6b3a8a", ring: "rgba(168,109,194,0.35)" },
  landmark: { bg: "rgba(64,124,196,0.14)", color: "#1e4d8a", ring: "rgba(64,124,196,0.30)" },
};

function DirectoryScreen() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim();
    return CHURCH_PLACES.filter((p) => {
      if (tab !== "all" && p.kind !== tab) return false;
      if (!q) return true;
      return p.name.includes(q) || p.city.includes(q);
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [query, tab]);

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #fff8ec 0%, #faeed4 45%, #f3e0b8 100%)",
      }}
    >
      <header
        className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#efe2c4]/70"
        style={{
          background: "linear-gradient(180deg, rgba(255,248,236,0.92), rgba(250,238,212,0.85))",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        }}
      >
        <div className="flex items-center justify-between px-4 pb-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">دليل الكنائس والأديرة</h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a7d4e]" strokeWidth={2.4} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن كنيسة، دير، أو معلم…"
              className="w-full h-11 pr-10 pl-10 rounded-full bg-white/85 border border-[#efe2c4] text-[13px] font-bold text-[#3a2a18] placeholder:text-[#a98a55] placeholder:font-medium outline-none focus:border-[#c79356] shadow-[0_8px_20px_-14px_rgba(120,80,30,0.4)]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full bg-[#f5e6c8] text-[#7a5a30] active:scale-90"
                aria-label="مسح البحث"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.6} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          {TABS.map((t) => {
            const active = t.key === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold border transition-all " +
                  (active
                    ? "bg-[#3a2a18] text-white border-[#3a2a18] shadow-[0_8px_18px_-10px_rgba(58,42,24,0.6)]"
                    : "bg-white/70 text-[#5a4626] border-[#efe2c4] active:scale-95")
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 pt-4">
        <div className="text-[11px] font-bold text-[#7a5a30] mb-2.5 text-right">
          {filtered.length} نتيجة
        </div>
        {filtered.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((p) => <PlaceCard key={p.id} p={p} />)}
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function PlaceCard({ p }: { p: ChurchPlace }) {
  const tone = KIND_TONE[p.kind];
  return (
    <a
      href={mapsUrlFor(p)}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden bg-white/85 border border-[#efe2c4]/80 backdrop-blur-xl shadow-[0_14px_30px_-20px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.99] transition-transform"
    >
      <div className="flex gap-3 p-2.5">
        <div className="relative h-[88px] w-[110px] shrink-0 rounded-xl overflow-hidden border border-white/70">
          <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span
            className="absolute top-1.5 right-1.5 inline-flex items-center px-2 h-[18px] rounded-full text-[9px] font-extrabold backdrop-blur-md"
            style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.ring}` }}
          >
            {KIND_LABEL[p.kind]}
          </span>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-[13.5px] font-extrabold text-[#2a1d10] leading-tight mb-1 line-clamp-2">
            {p.name}
          </h3>
          <div className="flex items-center gap-1 text-[11.5px] text-[#6b5436] mb-2">
            <MapPin className="h-3 w-3 text-[#c79356]" strokeWidth={2.4} />
            <span className="truncate">{p.city}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-[#faeed4] border border-[#efe2c4] text-[10.5px] font-extrabold text-[#7a5a30]">
              <Navigation className="h-3 w-3" strokeWidth={2.4} />
              {p.distanceKm < 1
                ? `${Math.round(p.distanceKm * 1000)} م`
                : `${p.distanceKm.toFixed(1)} كم`}
            </span>
            <span className="text-[10.5px] font-extrabold text-[#8a5a1f]">فتح في الخرائط ←</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function Empty() {
  return (
    <div className="rounded-3xl border border-[#efe2c4]/70 bg-white/70 backdrop-blur-xl p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl grid place-items-center bg-[#faeed4] border border-[#efe2c4] text-[#8a5a1f] mb-3">
        <Search className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="text-[14px] font-extrabold text-[#3a2a18] mb-1">لا توجد نتائج</h3>
      <p className="text-[12px] text-[#6b5436]">جرّب كلمة بحث أخرى أو غيّر التصنيف.</p>
    </div>
  );
}
