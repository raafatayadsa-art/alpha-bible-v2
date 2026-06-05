import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ChevronLeft, MapPin, Navigation, Phone, Mail, Globe, Radio,
  Crown, CalendarDays, Sparkles, BookOpen, Users,
} from "lucide-react";
import {
  findPlace, mapsUrlFor, pushRecentPlace, formatDistance, KIND_LABEL,
  type ChurchPlace, type ServiceTime,
} from "@/data/church-places";

export const Route = createFileRoute("/church/directory/$placeId")({
  ssr: false,
  head: ({ params }) => {
    const p = findPlace(params.placeId);
    return {
      meta: [
        { title: p ? `${p.name} — ألفا` : "تفاصيل — ألفا" },
        { name: "description", content: p?.description ?? "تفاصيل الكنيسة" },
      ],
    };
  },
  loader: ({ params }) => {
    const place = findPlace(params.placeId);
    if (!place) throw notFound();
    return { place };
  },
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-[#fbf6ec] text-center p-6">
      <div>
        <p className="text-[15px] font-extrabold text-[#3a3258] mb-2">لم نجد هذا الموقع</p>
        <Link to="/church/directory" className="text-[12px] font-bold text-[#5a3e8a] underline">
          العودة إلى الدليل
        </Link>
      </div>
    </div>
  ),
  component: PlaceDetailsScreen,
});

const SKY = "rgba(140,180,220,";
const LAV = "rgba(170,150,210,";
const BORDER = "rgba(220,210,235,0.7)";
const TEXT = "#3a3258";
const SUB = "#6b658a";

function PlaceDetailsScreen() {
  const data = Route.useLoaderData() as { place: ChurchPlace };
  const place = data.place;

  useEffect(() => { pushRecentPlace(place.id); }, [place.id]);

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-[calc(env(safe-area-inset-bottom,0px)+96px)]"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #fbf6ec 0%, #f1ecf7 45%, #e8eef8 100%)" }}
    >
      <Hero place={place} />

      <main className="relative mx-auto w-full max-w-[440px] px-4 -mt-8 space-y-4">
        {/* Identity card */}
        <Card>
          <div className="text-right">
            <p className="text-[11.5px] font-extrabold" style={{ color: "#5a3e8a" }}>{place.type}</p>
            <h1 className="font-arabic-serif text-[20px] font-extrabold leading-tight mt-0.5" style={{ color: TEXT }}>
              {place.name}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: SUB }}>
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
              <span>{[place.city, place.region, place.country].filter(Boolean).join(" — ")}</span>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: TEXT }}>
              {place.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Chip label={KIND_LABEL[place.kind]} tone="lav" />
              <Chip label={`${place.countryFlag} ${place.country}`} tone="sky" />
              <Chip label={`تبعد ${formatDistance(place.distanceKm)}`} tone="sand" />
              {place.liveStream ? <Chip label="بث مباشر متاح" tone="rose" /> : null}
            </div>
          </div>
        </Card>

        {/* Priest */}
        {place.priest ? (
          <Card>
            <Row icon={Crown} label="الكاهن المسؤول" value={place.priest} />
          </Card>
        ) : null}

        {/* Contact */}
        {(place.phone || place.email || place.website) ? (
          <Card title="معلومات التواصل" icon={Sparkles}>
            <div className="space-y-2">
              {place.phone ? (
                <ActionRow href={`tel:${place.phone}`} icon={Phone} label="اتصال" value={place.phone} />
              ) : null}
              {place.email ? (
                <ActionRow href={`mailto:${place.email}`} icon={Mail} label="البريد" value={place.email} />
              ) : null}
              {place.website ? (
                <ActionRow href={place.website} target="_blank" icon={Globe} label="الموقع" value={place.website.replace(/^https?:\/\//, "")} />
              ) : null}
            </div>
          </Card>
        ) : null}

        {/* Address */}
        <Card title="العنوان" icon={MapPin}>
          <p className="text-[12.5px] leading-relaxed text-right" style={{ color: TEXT }}>
            {place.address}
          </p>
        </Card>

        {/* Schedules */}
        {place.serviceTimes && place.serviceTimes.length > 0 ? (
          <Schedule title="مواعيد الخدمات" icon={BookOpen} items={place.serviceTimes} />
        ) : null}
        {place.liturgy && place.liturgy.length > 0 ? (
          <Schedule title="القداسات" icon={Sparkles} items={place.liturgy} />
        ) : null}
        {place.meetings && place.meetings.length > 0 ? (
          <Schedule title="الاجتماعات" icon={Users} items={place.meetings} />
        ) : null}

        {place.liveStream ? (
          <Card title="البث المباشر" icon={Radio}>
            <p className="text-[12px]" style={{ color: SUB }}>
              يتم بث القداسات والمناسبات الكبرى مباشرة عبر القنوات الرسمية للكنيسة.
            </p>
          </Card>
        ) : null}
      </main>

      {/* Sticky maps CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 backdrop-blur-xl px-4 py-3"
        style={{
          background: "linear-gradient(180deg, rgba(251,246,236,0.6), rgba(241,236,247,0.95))",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div className="mx-auto max-w-[440px]">
          <a
            href={mapsUrlFor(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 h-12 rounded-full text-[13px] font-extrabold text-white active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(160deg, #5a8ed2, #2f5a8a)",
              boxShadow: "0 18px 36px -16px rgba(47,90,138,0.7)",
            }}
          >
            <Navigation className="h-4 w-4" strokeWidth={2.4} />
            فتح في خرائط Google
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Hero({ place }: { place: ChurchPlace }) {
  return (
    <header className="relative">
      <div className="relative h-[260px] w-full overflow-hidden">
        <img src={place.image} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(251,246,236,0.85) 100%)",
          }}
        />
        <Link
          to="/church/directory"
          aria-label="رجوع"
          className="absolute top-[calc(env(safe-area-inset-top,0px)+10px)] right-4 inline-grid h-10 w-10 place-items-center rounded-full bg-white/90 border text-[#3a3258] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(0,0,0,0.5)]"
          style={{ borderColor: BORDER }}
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <span
          className="absolute top-[calc(env(safe-area-inset-top,0px)+12px)] left-4 inline-flex items-center gap-1 px-2.5 h-[26px] rounded-full text-[11px] font-extrabold backdrop-blur-md text-white"
          style={{ background: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span className="text-[13px] leading-none">{place.countryFlag}</span>
          {place.country}
        </span>
      </div>
    </header>
  );
}

function Card({ title, icon: Icon, children }: { title?: string; icon?: any; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[22px] border backdrop-blur-xl p-3.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 18px 34px -22px rgba(120,110,180,0.45), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {title ? (
        <div className="flex items-center gap-1.5 mb-2.5">
          {Icon ? <Icon className="h-4 w-4" style={{ color: "#5a3e8a" }} strokeWidth={2.4} /> : null}
          <h2 className="text-[13px] font-extrabold" style={{ color: TEXT }}>{title}</h2>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-2xl grid place-items-center"
        style={{ background: `${LAV}0.18)`, color: "#5a3e8a", border: `1px solid ${LAV}0.4)` }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className="text-[10.5px] font-extrabold" style={{ color: SUB }}>{label}</p>
        <p className="text-[13px] font-extrabold leading-tight" style={{ color: TEXT }}>{value}</p>
      </div>
    </div>
  );
}

function ActionRow({
  href, target, icon: Icon, label, value,
}: { href: string; target?: string; icon: any; label: string; value: string }) {
  return (
    <a
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-2xl px-2.5 py-2 active:scale-[0.99] transition-transform"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: `1px solid ${BORDER}`,
      }}
    >
      <div
        className="h-9 w-9 rounded-xl grid place-items-center"
        style={{ background: `${SKY}0.18)`, color: "#2f5a8a", border: `1px solid ${SKY}0.4)` }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className="text-[10.5px] font-extrabold" style={{ color: SUB }}>{label}</p>
        <p className="text-[12.5px] font-extrabold leading-tight truncate" style={{ color: TEXT }}>{value}</p>
      </div>
    </a>
  );
}

function Schedule({
  title, icon, items,
}: { title: string; icon: any; items: ServiceTime[] }) {
  return (
    <Card title={title} icon={icon}>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{
              background: `linear-gradient(160deg, rgba(255,255,255,0.85), ${LAV}0.10))`,
              border: `1px solid ${BORDER}`,
            }}
          >
            <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold" style={{ color: TEXT }}>
              <CalendarDays className="h-3.5 w-3.5" style={{ color: "#5a3e8a" }} strokeWidth={2.4} />
              {s.label}
            </span>
            <span className="text-[11.5px] font-extrabold" style={{ color: "#2f5a8a" }}>{s.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Chip({ label, tone }: { label: string; tone: "lav" | "sky" | "sand" | "rose" }) {
  const tones = {
    lav: { bg: `${LAV}0.20)`, color: "#5a3e8a", ring: `${LAV}0.45)` },
    sky: { bg: `${SKY}0.18)`, color: "#2f5a8a", ring: `${SKY}0.4)` },
    sand: { bg: "rgba(196,179,140,0.22)", color: "#7a5c1f", ring: "rgba(196,179,140,0.45)" },
    rose: { bg: "rgba(220,160,180,0.22)", color: "#8a3e5a", ring: "rgba(220,160,180,0.45)" },
  }[tone];
  return (
    <span
      className="inline-flex items-center px-2.5 h-[22px] rounded-full text-[10.5px] font-extrabold"
      style={{ background: tones.bg, color: tones.color, border: `1px solid ${tones.ring}` }}
    >
      {label}
    </span>
  );
}
