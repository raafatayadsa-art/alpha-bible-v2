/** Domain 10 table row shapes (ALPHA-121 P7–P8 reference types) */

export type TripPrayerRequestRow = {
  id: string;
  trip_id: string;
  user_id: string | null;
  author_name: string;
  body: string;
  reactions: number;
  shared_with_organizer: boolean;
  created_at: string;
};

export type TripParticipationCertificateRow = {
  id: string;
  trip_id: string;
  user_id: string;
  post_id: string;
  event_title: string;
  event_date: string | null;
  organizer_name: string;
  verify_qr: string;
  issued_at: string;
};

export type TripCompanionGroupRow = {
  id: string;
  trip_id: string;
  label: string;
  kind: "room" | "seat" | "housing";
  registration_ids: string[];
  created_at: string;
};

export type OfferNextWaitlistSeatArgs = {
  p_trip_id: string;
  p_freed_seats?: number;
  p_hold_ms?: number;
};

export type TripPilgrimagePassportEntryRow = {
  id: string;
  user_id: string;
  trip_id: string | null;
  post_id: string | null;
  kind: "monastery" | "conference" | "trip" | "retreat" | "event";
  title: string;
  completed_at: string;
  created_at: string;
};

export type TripMemoryAlbumRow = {
  id: string;
  trip_id: string;
  post_id: string;
  photos: string[];
  videos: string[];
  highlights: string[];
  created_at: string;
};

export type TripEmergencyContactRow = {
  id: string;
  trip_id: string;
  user_id: string | null;
  registration_id: string;
  booking_id: string | null;
  name: string;
  phone: string;
  relation: string;
  created_at: string;
  updated_at: string;
};

export type TripTimelineEventRow = {
  id: string;
  trip_id: string;
  post_id: string;
  kind: "departure" | "arrival" | "stop" | "activity" | "photo";
  title: string;
  at: string;
  media_url: string | null;
  created_at: string;
};

export type TripOrganizerTrustStatsRow = {
  organizer_user_id: string;
  trips_completed: number;
  attendance_rate: number;
  cancellation_rate: number;
  commitment_score: number;
  updated_at: string;
};

/** Domain 10 tables added across ALPHA-121 P7–P10 */
export type Domain10TableName =
  | "trip_prayer_requests"
  | "trip_participation_certificates"
  | "trip_companion_groups"
  | "trip_pilgrimage_passport_entries"
  | "trip_memory_albums"
  | "trip_emergency_contacts"
  | "trip_timeline_events"
  | "trip_organizer_trust_stats"
  | "waiting_lists";
