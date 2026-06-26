/** ALPHA-082 — Smart Context Card kinds & payloads */

export type SmartContextKind =
  | "trip_companion"
  | "trip_completed"
  | "trip_upcoming"
  | "trip_open"
  | "event_upcoming"
  | "prayer_urgent"
  | "church_announcement"
  | "continue_reading"
  | "connect_activity"
  | "spiritual_suggest";

export type TripLivePhase =
  | "pre_departure"
  | "en_route"
  | "arrived"
  | "activity_next"
  | "departing"
  | "completed";

export type TripCompanionPayload = {
  postId: string;
  tripTitle: string;
  phase: TripLivePhase;
  statusLine: string;
  nextStop?: string;
  etaLabel?: string;
  announcement?: string;
  progressPercent: number;
  channelLabel?: string;
  image?: string;
  accent: string;
};

export type TripCompletedPayload = {
  postId: string;
  tripTitle: string;
  tripDate: string;
  participantCount: number;
  attendanceStatus: string;
  accent: string;
  image?: string;
};

export type SmartContextCta =
  | { label: string; to: "/church/post/$id"; params: { id: string } }
  | { label: string; to: "/$book/$chapter"; params: { book: string; chapter: string }; search?: { verse?: string } }
  | { label: string; to: "/bible/journey"; search?: { from?: string } }
  | { label: string; to: "/prayer-requests" }
  | { label: string; to: "/alpha-connect"; search?: { tab?: string; channel?: string } }
  | { label: string; to: "/church" }
  | { label: string; to: string };

export type SmartContextCard = {
  kind: SmartContextKind;
  priority: number;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
  image?: string;
  primaryCta: SmartContextCta;
  secondaryCta?: SmartContextCta;
  trip?: TripCompanionPayload;
  tripCompleted?: TripCompletedPayload;
  progressPercent?: number;
  meta?: Record<string, string | number>;
};

export type SmartContextInput = {
  posts: import("@/data/church-posts").ChurchPost[];
  prayerUrgentCount: number;
  topPrayerTitle?: string;
  continueReference?: string;
  continueProgress?: number;
  continueBook?: string;
  continueChapter?: number;
  connectActivityLine?: string;
  connectHasActivity?: boolean;
  unreadMessages?: number;
  bibleJourneyPercent?: number;
};
