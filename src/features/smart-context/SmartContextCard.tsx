import { Link, useNavigate } from "@tanstack/react-router";
import { Bus, MapPin, QrCode, Radio, Sparkles } from "lucide-react";
import {
  HeroBadgeEmblem,
  HeroCompactLedgerCell,
  HeroLedgerStylesHost,
} from "@/components/home/hero-card-chrome";
import { cn } from "@/lib/utils";
import { readTripChannelLink } from "@/features/alpha-connect/trip-channel-links";
import type { SmartContextCard, SmartContextCta } from "./types";
import { useSmartContext } from "./useSmartContext";
import { isPathModuleEnabled, usePlatformModules } from "@/lib/platform-modules";

function isSmartContextCardAllowed(
  card: SmartContextCard,
  isModuleEnabled: (key: import("@/lib/platform-modules").PlatformModuleKey) => boolean,
): boolean {
  const churchKinds = new Set<SmartContextCard["kind"]>([
    "trip_companion",
    "trip_completed",
    "trip_upcoming",
    "trip_open",
    "event_upcoming",
    "prayer_urgent",
    "church_announcement",
  ]);
  if (churchKinds.has(card.kind) && !isModuleEnabled("community")) return false;
  if (card.kind === "connect_activity" && !isModuleEnabled("messaging")) return false;

  const ctas: SmartContextCta[] = [card.primaryCta, card.secondaryCta].filter(Boolean) as SmartContextCta[];
  return ctas.every((cta) => isPathModuleEnabled(cta.to, isModuleEnabled));
}

function ContextCtaLink({
  cta,
  accent,
  className,
}: {
  cta: SmartContextCta;
  accent: string;
  className?: string;
}) {
  if (cta.to === "/church/post/$id" && "params" in cta) {
    return (
      <Link
        to={cta.to}
        params={cta.params}
        className={className}
      >
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  if (cta.to === "/$book/$chapter" && "params" in cta) {
    return (
      <Link
        to={cta.to}
        params={cta.params}
        search={cta.search ?? {}}
        className={className}
      >
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  if (cta.to === "/bible/journey") {
    return (
      <Link to={cta.to} search={cta.search ?? {}} className={className}>
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  if (cta.to === "/prayer-requests") {
    return (
      <Link to={cta.to} className={className}>
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  if (cta.to === "/alpha-connect") {
    return (
      <Link
        to={cta.to}
        search={{
          tab: cta.search?.tab as "channels" | undefined,
          channel: cta.search?.channel,
        }}
        className={className}
      >
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  if (cta.to === "/church") {
    return (
      <Link to={cta.to} className={className}>
        <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
      </Link>
    );
  }
  return (
    <a href={cta.to} className={className}>
      <HeroCompactLedgerCell label={cta.label} accent={accent} className="min-w-[108px]" />
    </a>
  );
}

function ProgressStrip({ percent, accent, spiritual = false }: { percent: number; accent: string; spiritual?: boolean }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={cn(
        "relative h-[5px] w-full overflow-hidden rounded-full",
        spiritual ? "bg-white/10" : "bg-[#c79356]/15",
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 right-0 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: `linear-gradient(270deg, ${accent}, #f0d78c)`,
          boxShadow: `0 0 12px ${accent}88`,
        }}
      />
    </div>
  );
}

function TripCompanionBody({ card }: { card: SmartContextCard }) {
  const trip = card.trip!;
  const navigate = useNavigate();
  const { isModuleEnabled } = usePlatformModules();
  const messagingOn = isModuleEnabled("messaging");

  return (
    <>
      <div className="mt-1 space-y-1 text-right">
        <p className="font-arabic-serif text-[13px] font-extrabold leading-snug text-white line-clamp-1">
          {trip.tripTitle}
        </p>
        {trip.etaLabel ? (
          <p className="text-[11px] font-bold text-white/78">{trip.etaLabel}</p>
        ) : null}
        {trip.nextStop && (trip.phase === "arrived" || trip.phase === "activity_next") ? (
          <p className="text-[10.5px] font-medium text-white/65 line-clamp-2">
            النشاط القادم: {trip.nextStop}
          </p>
        ) : trip.nextStop ? (
          <p className="text-[10.5px] font-medium text-white/65 line-clamp-1">
            المحطة: {trip.nextStop}
          </p>
        ) : null}
        {trip.announcement ? (
          <p className="text-[10px] leading-snug text-white/55 line-clamp-1">
            آخر إعلان: {trip.announcement}
          </p>
        ) : null}
      </div>

      <div className="mt-2">
        <ProgressStrip percent={trip.progressPercent} accent={trip.accent} spiritual />
      </div>

      <div className="pointer-events-auto relative z-20 mt-2 flex items-center justify-end gap-2">
        {messagingOn ? (
        <button
          type="button"
          onClick={() =>
          navigate({
            to: "/alpha-connect",
            search: {
              tab: "channels",
              channel: trip.postId
                ? (readTripChannelLink(trip.postId)?.tripChannelId ?? undefined)
                : undefined,
            },
          })
        }
          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-black/30 px-2.5 py-1.5 text-[10px] font-bold text-white/85 active:scale-95"
        >
          <Radio className="h-3.5 w-3.5" />
          {trip.channelLabel ?? "القناة"}
        </button>
        ) : null}
        <button
          type="button"
          onClick={() => navigate({ to: "/church/post/$id", params: { id: trip.postId } })}
          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-black/30 px-2.5 py-1.5 text-[10px] font-bold text-white/85 active:scale-95"
        >
          <QrCode className="h-3.5 w-3.5" />
          QR الحجز
        </button>
        <ContextCtaLink cta={card.primaryCta} accent={card.accent} />
      </div>
    </>
  );
}

function TripCompletedBody({ card }: { card: SmartContextCard }) {
  const done = card.tripCompleted!;
  return (
    <>
      <div className="mt-1 grid grid-cols-2 gap-2 text-right">
        <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-2">
          <p className="text-[9px] font-bold text-white/50">المشاركون</p>
          <p className="text-[14px] font-extrabold tabular-nums text-white">{done.participantCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-2">
          <p className="text-[9px] font-bold text-white/50">الحضور</p>
          <p className="text-[12px] font-extrabold text-white">{done.attendanceStatus}</p>
        </div>
      </div>
      <p className="mt-2 text-[10.5px] font-medium text-white/65">{done.tripDate}</p>
      <div className="pointer-events-auto relative z-20 mt-2 flex justify-end">
        <ContextCtaLink cta={card.primaryCta} accent={card.accent} />
      </div>
    </>
  );
}

function StandardBody({ card }: { card: SmartContextCard }) {
  return (
    <>
      {typeof card.progressPercent === "number" && card.progressPercent > 0 ? (
        <div className="mt-2">
          <ProgressStrip percent={card.progressPercent} accent={card.accent} spiritual />
        </div>
      ) : null}
      <div className="pointer-events-auto relative z-20 mt-2 flex justify-end gap-2">
        {card.secondaryCta ? <ContextCtaLink cta={card.secondaryCta} accent={card.accent} /> : null}
        <ContextCtaLink cta={card.primaryCta} accent={card.accent} />
      </div>
    </>
  );
}

function SmartContextCardView({ card }: { card: SmartContextCard }) {
  const isTrip = card.kind === "trip_companion";
  const isDone = card.kind === "trip_completed";
  const heightClass = isTrip ? "min-h-[176px]" : isDone ? "min-h-[156px]" : "h-[128px]";

  const leadingIcon =
    card.kind === "trip_companion"
      ? card.trip?.phase === "arrived" || card.trip?.phase === "activity_next"
        ? MapPin
        : Bus
      : card.kind === "spiritual_suggest"
        ? Sparkles
        : null;

  const Leading = leadingIcon;

  return (
    <article
      className={cn(
        "group relative w-full overflow-hidden rounded-[22px] border",
        heightClass,
      )}
      style={{
        borderColor: `${card.accent}44`,
        background: "#030208",
        boxShadow: `0 16px 36px -14px rgba(0,0,0,0.72), 0 0 0 1px ${card.accent}18, 0 0 28px ${card.accent}14`,
      }}
    >
      <HeroLedgerStylesHost />

      {card.image ? (
        <img
          src={card.image}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.38) saturate(1.1)" }}
        />
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(ellipse 75% 60% at 80% 20%, ${card.accent}66 0%, transparent 68%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-3 py-2.5">
        <div className="flex items-start gap-2.5">
          {Leading ? (
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/15 bg-black/30"
              style={{ boxShadow: `0 0 16px ${card.accent}33` }}
            >
              <Leading className="h-5 w-5 text-white/90" strokeWidth={2} />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 text-right">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <div
                className="inline-flex rounded-full border px-2 py-0.5 backdrop-blur-md"
                style={{ borderColor: `${card.accent}55`, background: "rgba(0,0,0,0.35)" }}
              >
                <HeroBadgeEmblem label={card.badge} compact />
              </div>
            </div>
            <h3
              className="mt-1 font-arabic-serif text-[15px] font-extrabold leading-tight text-white line-clamp-1"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75)" }}
            >
              {card.title}
            </h3>
            {!isTrip && !isDone ? (
              <p className="mt-0.5 text-[10.5px] font-medium leading-snug text-white/72 line-clamp-2">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {isTrip ? <TripCompanionBody card={card} /> : null}
        {isDone ? <TripCompletedBody card={card} /> : null}
        {!isTrip && !isDone ? <StandardBody card={card} /> : null}
      </div>
    </article>
  );
}

export function SmartContextCard() {
  const { card, isLoading } = useSmartContext();
  const { isModuleEnabled } = usePlatformModules();

  if (isLoading) {
    return (
      <div
        className="h-[128px] animate-pulse rounded-[22px] border border-[#efe2c4]/30 bg-[#f4ead8]/40"
        aria-hidden
      />
    );
  }

  if (!card) return null;
  if (!isSmartContextCardAllowed(card, isModuleEnabled)) return null;

  return <SmartContextCardView card={card} />;
}
