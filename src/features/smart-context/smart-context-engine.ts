import type { ChurchPost } from "@/data/church-posts";
import { isTripPostPublished } from "@/features/church/trip-organizer";
import { POST_TYPE_META } from "@/data/church-posts";
import { myRegistration, countParticipants } from "@/features/church/post-registrations";
import { readTripChannelLink } from "@/features/alpha-connect/trip-channel-links";
import { ensureTripChannelsForPost } from "@/features/alpha-connect/provision-trip-channels";
import type { SmartContextCard, SmartContextInput } from "./types";
import {
  formatEtaMinutes,
  isTripCompletionVisible,
  readTripLiveSnapshot,
  seedRegisteredTripSnapshot,
  tripPhaseStatusLine,
} from "./trip-live-store";

const PRIORITY = {
  trip_companion: 1000,
  trip_completed: 920,
  trip_upcoming: 860,
  trip_open: 820,
  event_upcoming: 720,
  prayer_urgent: 680,
  church_announcement: 620,
  continue_reading: 540,
  connect_activity: 460,
  spiritual_suggest: 320,
} as const;

function tripAccent() {
  return POST_TYPE_META.trip.tone;
}

function extractDestination(post: ChurchPost): string {
  return post.details?.places?.trim() || post.title.replace(/^رحلة\s+/, "").trim();
}

function buildTripCompanion(post: ChurchPost, live = readTripLiveSnapshot(post.id)): SmartContextCard | null {
  const mine = myRegistration(post.id, "trip");
  if (!mine) return null;

  const snapshot =
    live ??
    seedRegisteredTripSnapshot({
      postId: post.id,
      destination: extractDestination(post),
      announcement: post.excerpt,
    });

  if (snapshot.phase === "completed" && isTripCompletionVisible(snapshot)) {
    return buildTripCompleted(post, snapshot);
  }

  const phase = snapshot.phase === "completed" ? "en_route" : snapshot.phase;
  const link = readTripChannelLink(post.id) ?? ensureTripChannelsForPost({ post, churchId: "local" });
  const statusEmoji =
    phase === "arrived" || phase === "activity_next"
      ? "📍"
      : phase === "en_route" || phase === "departing"
        ? "🚍"
        : "⏳";

  return {
    kind: "trip_companion",
    priority: PRIORITY.trip_companion,
    badge: "رحلة نشطة",
    title: `${statusEmoji} ${tripPhaseStatusLine(phase)}`,
    subtitle: post.title,
    accent: tripAccent(),
    image: post.image,
    primaryCta: { label: "تفاصيل الرحلة", to: "/church/post/$id", params: { id: post.id } },
    secondaryCta: link
      ? {
          label: "قناة الرحلة",
          to: "/alpha-connect",
          search: { tab: "channels", channel: link.tripChannelId },
        }
      : undefined,
    progressPercent: snapshot.progressPercent,
    trip: {
      postId: post.id,
      tripTitle: post.title,
      phase,
      statusLine: tripPhaseStatusLine(phase),
      nextStop: snapshot.nextStop ?? extractDestination(post),
      etaLabel: formatEtaMinutes(snapshot.etaMinutes),
      announcement: snapshot.announcement ?? post.excerpt,
      progressPercent: snapshot.progressPercent,
      channelLabel: "قناة الرحلة",
      image: post.image,
      accent: tripAccent(),
    },
  };
}

function buildTripCompleted(post: ChurchPost, snapshot?: ReturnType<typeof readTripLiveSnapshot>): SmartContextCard {
  const participants = countParticipants(post.id, "trip");
  return {
    kind: "trip_completed",
    priority: PRIORITY.trip_completed,
    badge: "اكتملت",
    title: "✅ تم إكمال الرحلة",
    subtitle: "تمت إضافة الرحلة إلى سجلك الشخصي",
    accent: tripAccent(),
    image: post.image,
    primaryCta: { label: "عرض السجل", to: "/church/post/$id", params: { id: post.id } },
    progressPercent: 100,
    tripCompleted: {
      postId: post.id,
      tripTitle: post.title,
      tripDate: post.details?.date ?? post.date,
      participantCount: participants,
      attendanceStatus: myRegistration(post.id, "trip") ? "حضرت" : "مسجّل",
      accent: tripAccent(),
      image: post.image,
    },
    meta: { participants, progress: snapshot?.progressPercent ?? 100 },
  };
}

function buildTripUpcoming(post: ChurchPost): SmartContextCard {
  ensureTripChannelsForPost({ post, churchId: "local" });
  const mine = myRegistration(post.id, "trip");
  return {
    kind: mine ? "trip_upcoming" : "trip_open",
    priority: mine ? PRIORITY.trip_upcoming : PRIORITY.trip_open,
    badge: mine ? "حجزك" : "رحلة قادمة",
    title: post.title,
    subtitle: mine
      ? `محجوز ${mine.seats} مكان · ${post.excerpt}`
      : post.excerpt,
    accent: tripAccent(),
    image: post.image,
    primaryCta: { label: mine ? "عرض الحجز" : "احجز الآن", to: "/church/post/$id", params: { id: post.id } },
    progressPercent: mine ? 12 : 0,
  };
}

function buildEventCard(post: ChurchPost): SmartContextCard {
  const meta = POST_TYPE_META[post.type] ?? POST_TYPE_META.event;
  return {
    kind: "event_upcoming",
    priority: PRIORITY.event_upcoming,
    badge: meta.label,
    title: post.title,
    subtitle: [post.details?.date, post.details?.time, post.details?.place].filter(Boolean).join(" · ") || post.excerpt,
    accent: meta.tone,
    image: post.image,
    primaryCta: { label: "التفاصيل", to: "/church/post/$id", params: { id: post.id } },
  };
}

function buildAnnouncementCard(post: ChurchPost): SmartContextCard {
  const meta = POST_TYPE_META[post.type] ?? POST_TYPE_META.announcement;
  return {
    kind: "church_announcement",
    priority: PRIORITY.church_announcement,
    badge: "إعلان",
    title: post.title,
    subtitle: post.excerpt,
    accent: meta.tone,
    image: post.image,
    primaryCta: { label: "اقرأ المزيد", to: "/church/post/$id", params: { id: post.id } },
  };
}

function buildPrayerCard(input: SmartContextInput): SmartContextCard {
  return {
    kind: "prayer_urgent",
    priority: PRIORITY.prayer_urgent,
    badge: "طلب صلاة",
    title: input.topPrayerTitle ?? "طلبات صلاة جديدة",
    subtitle:
      input.prayerUrgentCount === 1
        ? "طلب عاجل يحتاج صلواتك"
        : `${input.prayerUrgentCount} طلبات تحتاج صلواتك`,
    accent: "#8a6ec1",
    primaryCta: { label: "صلِّ معهم", to: "/prayer-requests" },
    meta: { count: input.prayerUrgentCount },
  };
}

function buildContinueReading(input: SmartContextInput): SmartContextCard | null {
  if (!input.continueBook || !input.continueChapter) return null;
  return {
    kind: "continue_reading",
    priority: PRIORITY.continue_reading,
    badge: "قراءة",
    title: input.continueReference ?? "تابع القراءة",
    subtitle: `أنجزت ${Math.round(input.continueProgress ?? 0)}% من الإصحاح`,
    accent: "#7a5cb0",
    primaryCta: {
      label: "متابعة القراءة",
      to: "/$book/$chapter",
      params: { book: input.continueBook, chapter: String(input.continueChapter) },
      search: {},
    },
    progressPercent: input.continueProgress,
  };
}

function buildConnectCard(input: SmartContextInput): SmartContextCard | null {
  if (!input.connectHasActivity) return null;
  return {
    kind: "connect_activity",
    priority: PRIORITY.connect_activity,
    badge: "ألفا كونكت",
    title: "نشاط جديد",
    subtitle: input.connectActivityLine ?? "رسائل أو مكالمات بانتظارك",
    accent: "#e7c97a",
    primaryCta: { label: "افتح كونكت", to: "/alpha-connect", search: {} },
    meta: { unread: input.unreadMessages ?? 0 },
  };
}

function buildSpiritualSuggest(input: SmartContextInput): SmartContextCard {
  const pct = input.bibleJourneyPercent ?? 0;
  return {
    kind: "spiritual_suggest",
    priority: PRIORITY.spiritual_suggest,
    badge: "رحلتك",
    title: pct > 0 ? "رحلتك مع الكتاب" : "ابدأ رحلتك الروحية",
    subtitle: pct > 0 ? `أنجزت ${pct}% من الكتاب المقدس` : "تقدّم هادئ بدون ازدحام",
    accent: "#c79356",
    primaryCta: { label: pct > 0 ? "رحلتي" : "ابدأ الآن", to: "/bible/journey", search: { from: "home" } },
    progressPercent: pct,
  };
}

function isTripPost(post: ChurchPost) {
  return post.type === "trip" && isTripPostPublished(post);
}

function isEventPost(post: ChurchPost) {
  return post.type === "event" || post.type === "meeting" || post.type === "liturgy";
}

export function buildSmartContextCandidates(input: SmartContextInput): SmartContextCard[] {
  const candidates: SmartContextCard[] = [];
  const trips = input.posts.filter(isTripPost);

  for (const post of trips) {
    const live = readTripLiveSnapshot(post.id);
    if (live?.phase === "completed" && isTripCompletionVisible(live)) {
      candidates.push(buildTripCompleted(post, live));
      continue;
    }
    const companion = buildTripCompanion(post, live);
    if (companion) {
      candidates.push(companion);
      continue;
    }
    candidates.push(buildTripUpcoming(post));
  }

  for (const post of input.posts.filter(isEventPost)) {
    candidates.push(buildEventCard(post));
  }

  const pinned = input.posts.find((p) => p.type === "announcement" && p.pinned);
  if (pinned) candidates.push(buildAnnouncementCard(pinned));

  if (input.prayerUrgentCount > 0) {
    candidates.push(buildPrayerCard(input));
  }

  const reading = buildContinueReading(input);
  if (reading) candidates.push(reading);

  const connect = buildConnectCard(input);
  if (connect) candidates.push(connect);

  candidates.push(buildSpiritualSuggest(input));

  return candidates.sort((a, b) => b.priority - a.priority);
}

export function pickSmartContextCard(input: SmartContextInput): SmartContextCard | null {
  const ranked = buildSmartContextCandidates(input);
  return ranked[0] ?? null;
}
