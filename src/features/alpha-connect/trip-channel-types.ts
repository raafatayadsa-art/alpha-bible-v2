/** ALPHA-083 — Dual channel trip communication types */

export type TripOrganizerRole =
  | "owner"
  | "organizer"
  | "assistant"
  | "bus_lead"
  | "attendance_lead"
  | "housing_lead";

export type TripOrganizerPermission =
  | "scan_qr"
  | "check_in"
  | "track_arrival"
  | "manage_bus"
  | "update_bus_status"
  | "manage_rooms"
  | "assign_beds"
  | "approve_bookings"
  | "send_announcements"
  | "manage_participants"
  | "send_internal_alert";

export type TripChannelLink = {
  postId: string;
  churchId: string;
  tripChannelId: string;
  organizerChannelId: string;
  createdAt: string;
  createdBy: string;
  archivedAt?: string;
};

export type TripOrganizerAssignment = {
  postId: string;
  userId: string;
  role: TripOrganizerRole;
  assignedAt: number;
};

export type TripLiveOperations = {
  postId: string;
  checkedIn: number;
  absent: number;
  late: number;
  lastCheckInAt?: string;
  busStatus: string;
  housingStatus: string;
  adminAlerts: TripInternalAlert[];
  updatedAt: number;
};

export type TripInternalAlert = {
  id: string;
  postId: string;
  message: string;
  createdAt: number;
  createdBy: string;
  createdByName: string;
};

export const TRIP_ORGANIZER_PERMISSIONS: Record<TripOrganizerRole, TripOrganizerPermission[]> = {
  owner: [
    "scan_qr",
    "check_in",
    "track_arrival",
    "manage_bus",
    "update_bus_status",
    "manage_rooms",
    "assign_beds",
    "approve_bookings",
    "send_announcements",
    "manage_participants",
    "send_internal_alert",
  ],
  organizer: [
    "scan_qr",
    "check_in",
    "track_arrival",
    "manage_bus",
    "update_bus_status",
    "approve_bookings",
    "send_announcements",
    "manage_participants",
    "send_internal_alert",
  ],
  assistant: ["approve_bookings", "send_announcements", "manage_participants", "send_internal_alert"],
  bus_lead: ["manage_bus", "update_bus_status", "send_internal_alert"],
  attendance_lead: ["scan_qr", "check_in", "track_arrival", "send_internal_alert"],
  housing_lead: ["manage_rooms", "assign_beds", "send_internal_alert"],
};
