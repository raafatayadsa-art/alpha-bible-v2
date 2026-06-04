import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, BookOpen, HandHeart, ScrollText, Cross, CalendarHeart, Sparkles, ArrowLeft } from "lucide-react";
import { SAINTS } from "@/features/synaxarium/data";
import { FEASTS } from "@/features/feasts/data";
import { AGPEYA_PRAYERS } from "@/features/agpeya/data";
import { TODAY_KATAMEROS } from "@/features/katameros/data";

export const Route = createFileRoute("/search")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ابحث في Alpha Coptic" },
      { name: "description", content: "بحث موحّد في الكتاب المقدس، الأجبية، القطمارس، السنكسار، والمناسبات." },
    ],
  }),
  component: SearchHub,
});

// ---- text normalization for arabic search ----
function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

type Category = "bible" | "agpeya" | "katameros" | "synaxarium" | "feasts" | "meditations";
type Scope = "all" | Category;

const SCOPE_COLORS: Record<Scope, { color: string }> = {
  all:         { color: "#8a7558" },
  bible:       { color: "#caa15f" },
  agpeya:      { color: "#8a6ec1" },
  katameros:   { color: "#4a9e6e" },
  synaxarium:  { color: "#a85450" },
  feasts:      { color: "#c98a3c" },
  meditations: { color: "#5b8fd1" },
};

const SCOPES: { id: Scope; label: string; placeholder: string }[] = [
  { id: "all",        label: "الكل",         placeholder: "ابحث في كل شيء..." },
  { id: "bible",      label: "الكتاب",       placeholder: "ابحث في الكتاب المقدس..." },
  { id: "agpeya",     label: "الأجبية",      placeholder: "ابحث في الأجبية..." },
  { id: "katameros",  label: "القطمارس",     placeholder: "ابحث في القطمارس..." },
  { id: "synaxarium", label: "السنكسار",     placeholder: "ابحث في السنكسار..." },
  { id: "feasts",     label: "المناسبات",    placeholder: "ابحث في المناسبات..." },
  { id: "meditations",label: "التأملات",     placeholder: "ابحث في التأملات..." },
];

const POPULAR = ["يوحنا", "القيامة", "صلاة الشكر", "الأنبا أنطونيوس", "القديسة العذراء", "المزمور"];

const BIBLE_HINTS = [
  { title: "إنجيل يوحنا",   to: "/يوحنا" },
  { title: "إنجيل متى",     to: "/متى" },
  { title: "إنجيل مرقس",    to: "/مرقس" },
  { title: "إنجيل لوقا",    to: "/لوقا" },
  { title: "سفر المزامير",  to: "/المزامير" },
  { title: "سفر التكوين",   to: "/التكوين" },
  { title: "سفر الخروج",    to: "/الخروج" },
  { title: "سفر إشعياء",    to: "/إشعياء" },
  { title: "سفر الأمثال",   to: "/الأمثال" },
  { title: "سفر أعمال الرسل", to: "/أعمال" },
  { title: "رسالة رومية",   to: "/رومية" },
  { title: "سفر الرؤيا",    to: "/الرؤيا" },
];

const RECENT_KEY = "alpha:search:recent";

type Result = {
  id: string;
  category: Category;
  title: string;
  subtitle?: string;
  to: string;
};

function searchAll(q: string): Result[] {
  const nq = norm(q);
  if (!nq) return [];
  const out: Result[] = [];

  // Bible (book hints only — actual verse search lives inside /bible)
  for (const b of BIBLE_HINTS) {
    if (norm(b.title).includes(nq)) {
      out.push({ id: `b:${b.title}`, category: "bible", title: b.title, subtitle: "اقرأ الأصحاحات", to: b.to });
    }
  }

  // Agpeya
  for (const p of AGPEYA_PRAYERS) {
    const hay = norm(`${p.title} ${p.subtitle ?? ""} ${p.description ?? ""}`);
    if (hay.includes(nq)) {
      out.push({
        id: `a:${p.id}`,
        category: "agpeya",
        title: p.title,
        subtitle: p.subtitle ?? p.description,
        to: `/agpeya/${p.id}`,
      });
    }
  }

  // Katameros (today's readings)
  for (const r of TODAY_KATAMEROS.readings) {
    const hay = norm(`${r.title} ${r.reference ?? ""} ${r.body ?? ""}`);
    if (hay.includes(nq)) {
      out.push({
        id: `k:${r.id}`,
        category: "katameros",
        title: r.title,
        subtitle: r.reference,
        to: "/katameros",
      });
    }
  }

  // Synaxarium (saints)
  for (const s of SAINTS) {
    const hay = norm(`${s.name} ${s.title} ${s.summary ?? ""} ${s.bio ?? ""}`);
    if (hay.includes(nq)) {
      out.push({
        id: `s:${s.id}`,
        category: "synaxarium",
        title: s.name,
        subtitle: s.title,
        to: `/synaxarium/${s.id}`,
      });
    }
  }

  // Feasts
  for (const f of FEASTS) {
    const hay = norm(`${f.title} ${f.subtitle} ${f.description ?? ""}`);
    if (hay.includes(nq)) {
      out.push({
        id: `f:${f.id}`,
        category: "feasts",
        title: f.title,
        subtitle: f.subtitle,
        to: `/feasts/${f.id}`,
      });
    }
  }

  return out.slice(0, 60);
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  const t = q.trim();
  if (!t) return;
  try {
    const cur = loadRecent().filter((x) => x !== t);
    const next = [t, ...cur].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

const CATEGORY_META: Record<Category, { label: string; icon: typeof BookOpen; iconBg: string }> = {
  bible:      { label: "الكتاب المقدس", icon: BookOpen,      iconBg: "bg-[#caa15f]" },
  agpeya:     { label: "الأجبية",        icon: HandHeart,     iconBg: "bg-[#6c9a72]" },
  katameros:  { label: "القطمارس",       icon: ScrollText,    iconBg: "bg-[#8a6ec1]" },
  synaxarium: { label: "السنكسار",       icon: Cross,         iconBg: "bg-[#c97a3c]" },
  feasts:     { label: "المناسبات",      icon: CalendarHeart, iconBg: "bg-[#c95680]" },
  meditations:{ label: "التأملات",       icon: Sparkles,      iconBg: "bg-[#5b8fd1]" },
};

function SearchHub() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const all = searchAll(query);
    return scope === "all" ? all : all.filter((r) => r.category === scope);
  }, [query, scope]);

  const grouped = useMemo(() => {
    const map = new Map<Category, Result[]>();
    for (const r of results) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, [results]);

  const onPickRecent = (t: string) => {
    setQuery(t);
    inputRef.current?.focus();
  };

  const commitRecent = () => {
    if (query.trim()) {
      pushRecent(query);
      setRecent(loadRecent());
    }
  };

  const activeScope = SCOPES.find((s) => s.id === scope) ?? SCOPES[0];

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF8F3] text-[#3a2a18] pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-xl bg-[#FAF8F3]/85 border-b border-[#ead9b1]/60"
        style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}
      >
        <div className="mx-auto max-w-[520px] px-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/home" })}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/85 border border-[#ead9b1] shadow-[0_6px_16px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition-transform"
              aria-label="رجوع"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
            <h1 className="font-arabic-serif text-[18px] font-extrabold">ابحث في Alpha Coptic</h1>
            <span className="w-10" />
          </div>

          {/* Premium glass search field */}
          <div
            className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#ead9b1] px-4 h-14 shadow-[0_14px_32px_-18px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] animate-fade-in"
          >
            <Search className="h-5 w-5 text-[#8a6322] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={commitRecent}
              placeholder={activeScope.placeholder}
              className="flex-1 bg-transparent outline-none text-[15px] font-bold placeholder:font-normal placeholder:text-[#b89c70]"
              dir="rtl"
            />
            {query && (
              <button
                type="button"
                aria-label="مسح"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="grid h-7 w-7 place-items-center rounded-full bg-[#f6ecd4] text-[#5b3a18] active:scale-90 transition-transform"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Compact scope selector */}
          <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 w-max">
              {SCOPES.map((s) => {
                const active = s.id === scope;
                const col = SCOPE_COLORS[s.id];
                const c = col.color;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id)}
                    className={
                      "relative px-3 h-7 rounded-full text-[12px] font-bold whitespace-nowrap border backdrop-blur-md transition-all duration-300 ease-out active:scale-95 " +
                      (active ? "shadow-sm" : "")
                    }
                    style={{
                      color: c,
                      backgroundColor: active ? `${c}22` : `${c}14`,
                      borderColor: active ? `${c}55` : `${c}22`,
                      boxShadow: active ? `0 0 14px -3px ${c}45` : undefined,
                    }}
                  >
                    <span className={active ? "relative z-10" : ""}>{s.label}</span>
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full opacity-25 blur-[1px] -z-10"
                        style={{ backgroundColor: c }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-4 pt-5">
        {!query.trim() ? (
          <BeforeSearch
            recent={recent}
            onPickRecent={onPickRecent}
            onClearRecent={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
          />
        ) : results.length === 0 ? (
          <EmptyState />
        ) : (
          <ResultsView grouped={grouped} onCommit={commitRecent} />
        )}
      </main>
    </div>
  );
}


function BeforeSearch({
  recent,
  onPickRecent,
  onClearRecent,
}: {
  recent: string[];
  onPickRecent: (t: string) => void;
  onClearRecent: () => void;
}) {
  return (
    <div className="space-y-7 animate-fade-in">
      {/* Categories removed — scope is selected via top chips */}


      {/* Recent */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-extrabold tracking-[0.2em] text-[#8a6322]">آخر عمليات البحث</h2>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-[11px] font-bold text-[#8a7558] active:scale-95 transition-transform"
            >
              مسح
            </button>
          </div>
          <ul className="rounded-2xl bg-white/85 border border-[#ead9b1] overflow-hidden divide-y divide-[#ead9b1]/60">
            {recent.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onPickRecent(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-[#fbf3e1] transition-colors"
                >
                  <Search className="h-4 w-4 text-[#8a6322]" />
                  <span className="text-[14px] font-bold">{t}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Popular */}
      <section>
        <h2 className="text-[12px] font-extrabold tracking-[0.2em] text-[#8a6322] mb-3">الأكثر بحثاً</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPickRecent(p)}
              className="px-4 py-2 rounded-full bg-gradient-to-br from-[#fff7e3] to-[#f6ecd4] border border-[#e6d2a6] text-[13px] font-bold text-[#5b3a18] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-95 transition-transform"
            >
              {p}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultsView({
  grouped,
  onCommit,
}: {
  grouped: Map<Category, Result[]>;
  onCommit: () => void;
}) {
  const order: Category[] = ["bible", "synaxarium", "katameros", "agpeya", "feasts", "meditations"];
  return (
    <div className="space-y-6 animate-fade-in">
      {order
        .filter((c) => grouped.has(c))
        .map((c) => {
          const meta = CATEGORY_META[c];
          const list = grouped.get(c)!;
          return (
            <section key={c}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`grid h-7 w-7 place-items-center rounded-xl text-white ${meta.iconBg}`}>
                  <meta.icon className="h-3.5 w-3.5" />
                </span>
                <h2 className="font-arabic-serif text-[15px] font-extrabold">{meta.label}</h2>
                <span className="text-[11px] font-bold text-[#8a7558]">{list.length}</span>
              </div>
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={r.to as any}
                      onClick={onCommit}
                      className="block rounded-2xl bg-white/90 border border-[#ead9b1] px-4 py-3 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.4),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.99] transition-transform"
                    >
                      <div className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] line-clamp-1">
                        {r.title}
                      </div>
                      {r.subtitle && (
                        <div className="text-[12px] text-[#7a5a35] mt-0.5 line-clamp-2 leading-relaxed">
                          {r.subtitle}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 text-center animate-fade-in">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/85 border border-[#ead9b1] shadow-[0_10px_24px_-16px_rgba(120,80,30,0.45)]">
        <Search className="h-7 w-7 text-[#8a6322]" />
      </div>
      <p className="mt-4 font-arabic-serif text-[16px] font-extrabold">لا توجد نتائج</p>
      <p className="mt-1 text-[13px] text-[#7a5a35]">جرّب كلمة بحث أخرى.</p>
    </div>
  );
}
