/**
 * ALPHA-087 → ALPHA-098 — Roadmap types & feature flags (v0 scaffolding).
 * Full implementations deferred; each module will live under trip-reservations/ or alpha-connect/.
 */

export const TRIP_FEATURE_FLAGS = {
  /** ALPHA-085 */ smartWaitlist: true,
  /** ALPHA-086 */ familyBooking: true,
  /** ALPHA-087 */ busManagement: true,
  /** ALPHA-088 */ tripPrayerRequests: true,
  /** ALPHA-089 */ participationCertificates: true,
  /** ALPHA-090 */ tripMemoryAlbum: true,
  /** ALPHA-091 */ tripTimelineReplay: true,
  /** ALPHA-092 */ geoCheckIn: true,
  /** ALPHA-093 */ organizerTrustDashboard: true,
  /** ALPHA-094 */ emergencyContact: true,
  /** ALPHA-095 */ tripWallet: true,
  /** ALPHA-096 */ companionMatching: true,
  /** ALPHA-097 */ pilgrimagePassport: true,
  /** ALPHA-098 */ tripCommandCenter: true,
} as const;

export type TripFeatureId = keyof typeof TRIP_FEATURE_FLAGS;

/** ALPHA-087 — Bus */
export type TripBus = {
  id: string;
  postId: string;
  label: string;
  capacity: number;
  supervisorUserId?: string;
  supervisorName?: string;
  status: "idle" | "boarding" | "en_route" | "arrived";
};

/** ALPHA-088 — Trip prayer requests (extends church prayer flow) */
export type TripPrayerRequest = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  reactions: number;
  sharedWithOrganizer: boolean;
};

/** ALPHA-089 — Digital certificate */
export type ParticipationCertificate = {
  id: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  verifyQr: string;
};

/** ALPHA-090 / 091 — Post-trip archive */
export type TripMemoryAlbum = {
  postId: string;
  photos: string[];
  videos: string[];
  highlights: string[];
};

export type TripTimelineEvent = {
  id: string;
  postId: string;
  at: string;
  kind: "departure" | "arrival" | "stop" | "activity" | "photo";
  title: string;
  mediaUrl?: string;
};

/** ALPHA-092 — Geo check-in */
export type GeoCheckInZone = {
  postId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

/** ALPHA-093 — Organizer trust metrics */
export type OrganizerTrustStats = {
  organizerUserId: string;
  tripsCompleted: number;
  attendanceRate: number;
  cancellationRate: number;
  commitmentScore: number;
};

/** ALPHA-094 — Emergency contact per booking */
export type EmergencyContact = {
  registrationId: string;
  name: string;
  phone: string;
  relation: string;
};

/** ALPHA-095 — Trip wallet */
export type TripPaymentLedger = {
  registrationId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  payments: { at: string; amount: number; note?: string }[];
};

/** ALPHA-097 — Pilgrimage passport (lifetime spiritual log) */
export type PilgrimagePassportEntry = {
  id: string;
  userId: string;
  kind: "monastery" | "conference" | "trip" | "retreat" | "event";
  title: string;
  completedAt: string;
};
