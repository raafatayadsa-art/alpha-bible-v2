import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, Search, MapPin, Navigation, Church,
  X, Info, Clock, UserPlus,
} from "lucide-react";
import {
  fetchApprovedChurches,
  getRecentChurchIds,
  directoryChurchImage,
  directoryChurchLocation,
  mapsUrlForChurch,
  type DirectoryChurch,
} from "@/features/church/churches-directory-api";
import { getActiveMembershipChurchId } from "@/features/church/church-membership-api";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";
import heroChurch from "@/assets/home/hero-church-premium.jpg";
import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";

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

const TABS = [{ key: "all" as const, label: "الكنائس", icon: Church }]; // kept for future filters

const KIND_TONE = {
  church: { bg: `${SKY}0.16)`, color: "#2f5a8a", ring: `${SKY}0.35)` },
};

/* ============================================================ */
export function DirectoryScreen() {
  const [query, setQuery] = useState("");
  const [churches, setChurches] = useState<DirectoryChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [memberChurchId, setMemberChurchId] = useState<string | null>(null);

  const loadChurches = useCallback(async () => {
    setLoading(true);
    const rows = await fetchApprovedChurches();
    setChurches(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadChurches();
    setRecentIds(getRecentChurchIds());
    void getActiveMembershipChurchId().then(setMemberChurchId);
    const onHub = () => void getActiveMembershipChurchId().then(setMemberChurchId);
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
    };
  }, [loadChurches]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return churches.filter((p) => {
      if (!q) return true;
      return [p.name, p.city ?? "", p.diocese ?? "", p.governorate ?? "", p.priestName ?? ""]
        .some((s) => s.includes(q));
    });
  }, [churches, query]);

  const recent = recentIds
    .map((id) => churches.find((c) => c.id === id))
    .filter((x): x is DirectoryChurch => Boolean(x));

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f4ead8] pb-24"
    >
      <Header query={query} hasQuery={!!query} />

      <main className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-3 space-y-5">
        <HeroCard count={churches.length} hasMembership={memberChurchId != null} />

        <SearchBar value={query} onChange={setQuery} />

        {!memberChurchId ? (
          <div
            className="rounded-2xl border px-4 py-3 text-right backdrop-blur-xl"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(232,248,240,0.85))",
              borderColor: "rgba(31,138,90,0.25)",
            }}
          >
            <div className="flex items-start gap-2">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-[#1f8a5a]" strokeWidth={2.4} />
              <p className="text-[12.5px] font-bold leading-relaxed text-[#3a3258]">
                اختر كنيستك واضغط «انضم للكنيسة» لربط حسابك وفتح لوحة كنيستك.
              </p>
            </div>
          </div>
        ) : null}

        {recent.length > 0 && !query ? (
          <SectionCarousel title="الكنائس التي زرتها مؤخراً" icon={Clock} churches={recent} />
        ) : null}

        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[14px] font-extrabold" style={{ color: TEXT }}>
              {query ? "نتائج البحث" : "الكنائس المعتمدة"}
            </h2>
            <span className="text-[11px] font-bold" style={{ color: SUB }}>
              {filtered.length.toLocaleString("ar-EG")} كنيسة
            </span>
          </div>
          {loading ? (
            <div className="rounded-3xl border p-8 text-center backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.75)", borderColor: BORDER }}>
              <p className="text-[12.5px] font-bold" style={{ color: SUB }}>جاري تحميل دليل الكنائس…</p>
            </div>
          ) : filtered.length === 0 ? (
            <Empty hasChurches={churches.length > 0} />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((p) => <PlaceCard key={p.id} church={p} />)}
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
          دليل الكنائس
        </h1>
        <AlphaNotificationButton />
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
function HeroCard({ count, hasMembership }: { count: number; hasMembership?: boolean }) {
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
          ابحث عن كنيسة معتمدة
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: SUB }}>
          {hasMembership ? "يمكنك تصفّح باقي الكنائس أو فتح كنيستك." : "الكنائس المعتمدة على منصة ألفا — انضم لكنيستك من البطاقة."}
        </p>

        <div className="mt-3">
          <StatChip icon={Church} label="كنيسة معتمدة" value={count} tint={`${SKY}0.20)`} ring={`${SKY}0.42)`} color="#2f5a8a" shadowColor="rgba(140,180,220,0.30)" />
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

function SectionCarousel({
  title, icon: Icon, churches,
}: { title: string; icon: typeof Church; churches: DirectoryChurch[] }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Icon className="h-4 w-4" style={{ color: "#5a4e8a" }} strokeWidth={2.4} />
        <h2 className="text-[13.5px] font-extrabold" style={{ color: TEXT }}>{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x snap-mandatory">
        {churches.map((p) => <MiniCard key={p.id} church={p} />)}
      </div>
    </section>
  );
}

function MiniCard({ church }: { church: DirectoryChurch }) {
  const tone = KIND_TONE.church;
  return (
    <Link
      to="/church/directory/$placeId"
      params={{ placeId: church.id }}
      className="snap-start shrink-0 w-[180px] rounded-2xl overflow-hidden border backdrop-blur-xl active:scale-[0.98] transition-transform"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 14px 30px -20px rgba(120,110,180,0.45), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="relative h-[100px] w-full">
        <img src={directoryChurchImage(church)} alt={church.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className="p-2.5 text-right">
        <h3 className="text-[12.5px] font-extrabold leading-tight line-clamp-2" style={{ color: TEXT }}>
          {church.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[9.5px] font-extrabold"
            style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.ring}` }}
          >
            كنيسة
          </span>
          <span className="text-[10px] font-bold truncate max-w-[90px]" style={{ color: SUB }}>
            {church.city ?? church.diocese ?? ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlaceCard({ church }: { church: DirectoryChurch }) {
  const tone = KIND_TONE.church;
  const location = directoryChurchLocation(church);
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
        <img src={directoryChurchImage(church)} alt={church.name} className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.45) 100%)" }}
        />
      </div>

      <div className="p-3.5 text-right">
        <h3 className="font-arabic-serif text-[15px] font-extrabold leading-tight" style={{ color: TEXT }}>
          {church.name}
        </h3>
        {church.priestName ? (
          <p className="mt-1 text-[11.5px] font-bold" style={{ color: tone.color }}>{church.priestName}</p>
        ) : null}
        {location ? (
          <div className="mt-1 flex items-center gap-1 text-[11.5px]" style={{ color: SUB }}>
            <MapPin className="h-3 w-3" strokeWidth={2.4} />
            <span className="truncate">{location}</span>
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          <JoinChurchButton churchId={church.id} churchName={church.name} compact />
          <div className="grid grid-cols-2 gap-2">
            <a
              href={mapsUrlForChurch(church)}
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
              params={{ placeId: church.id }}
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
      </div>
    </article>
  );
}

function Empty({ hasChurches }: { hasChurches?: boolean }) {
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
      <h3 className="text-[14px] font-extrabold mb-1" style={{ color: TEXT }}>
        {hasChurches ? "لا توجد نتائج" : "لا توجد كنائس معتمدة بعد"}
      </h3>
      <p className="text-[12px]" style={{ color: SUB }}>
        {hasChurches ? "جرّب اسمًا أو مدينة أخرى." : "ستظهر الكنائس المعتمدة هنا تلقائياً بعد الموافقة عليها."}
      </p>
    </div>
  );
}
