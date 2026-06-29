import { supabase } from "@/integrations/supabase/client";
import { resolveTripPostContext } from "./trip-post-context";

/** null = unknown, false = Domain 10 tables/RPC unavailable */
let domain10RemoteAvailable: boolean | null = null;

export function isDomain10RemoteAvailable(): boolean | null {
  return domain10RemoteAvailable;
}

export function isMissingDomain10Error(
  error: { code?: string; message?: string; status?: number } | null,
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.status === 404 ||
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    msg.includes("could not find the function") ||
    msg.includes("schema cache") ||
      (msg.includes("does not exist") &&
        (msg.includes("trips") ||
          msg.includes("waiting_lists") ||
          msg.includes("trip_bookings") ||
          msg.includes("buses") ||
          msg.includes("bus_assignments") ||
          msg.includes("check_ins") ||
          msg.includes("trip_payments") ||
          msg.includes("trip_prayer_requests") ||
          msg.includes("trip_participation_certificates") ||
          msg.includes("trip_companion_groups") ||
          msg.includes("trip_pilgrimage_passport_entries") ||
          msg.includes("trip_memory_albums") ||
          msg.includes("trip_emergency_contacts") ||
          msg.includes("trip_timeline_events") ||
          msg.includes("trip_organizer_trust_stats") ||
          msg.includes("offer_next_waitlist_seat") ||
          msg.includes("ensure_trip_for_post")))
  );
}

export function markDomain10Unavailable() {
  domain10RemoteAvailable = false;
}

export function markDomain10Available() {
  domain10RemoteAvailable = true;
}

export async function fetchTripIdByPostId(postId: string): Promise<string | null> {
  const { data, error } = await supabase.from("trips").select("id").eq("post_id", postId).maybeSingle();
  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function ensureTripIdForPost(opts: {
  postId: string;
  title?: string;
  churchId?: number | null;
  organizerUserId?: string | null;
}): Promise<string | null> {
  const existing = await fetchTripIdByPostId(opts.postId);
  const ctx = await resolveTripPostContext(opts.postId);
  const title = opts.title ?? ctx?.title ?? "رحلة";
  const churchId = opts.churchId ?? ctx?.churchId ?? null;
  const organizerUserId = opts.organizerUserId ?? ctx?.organizerUserId ?? null;

  if (existing && !churchId && !organizerUserId) return existing;

  const { data, error } = await supabase.rpc("ensure_trip_for_post", {
    p_post_id: opts.postId,
    p_title: title,
    p_church_id: churchId,
    p_organizer_user_id: organizerUserId,
  });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return existing;
  }

  markDomain10Available();
  return data ? String(data) : existing;
}

export async function mirrorTripBookingFromRegistration(opts: {
  postId: string;
  userId: string;
  userName: string;
  seats: number;
  status: "registered" | "confirmed" | "cancelled";
  title?: string;
  churchId?: number | null;
  organizerUserId?: string | null;
}): Promise<void> {
  if (domain10RemoteAvailable === false) return;
  if (!opts.userId || opts.status === "cancelled") {
    if (opts.status === "cancelled") {
      const tripId = await fetchTripIdByPostId(opts.postId);
      if (!tripId) return;
      await supabase
        .from("trip_bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("trip_id", tripId)
        .eq("user_id", opts.userId);
    }
    return;
  }

  const tripId = await ensureTripIdForPost({
    postId: opts.postId,
    title: opts.title,
    churchId: opts.churchId,
    organizerUserId: opts.organizerUserId,
  });
  if (!tripId) return;

  const bookingStatus =
    opts.status === "confirmed" ? "confirmed" : opts.status === "cancelled" ? "cancelled" : "registered";

  const { data: existing, error: readError } = await supabase
    .from("trip_bookings")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", opts.userId)
    .maybeSingle();

  if (readError) {
    if (isMissingDomain10Error(readError)) markDomain10Unavailable();
    return;
  }

  const payload = {
    trip_id: tripId,
    user_id: opts.userId,
    user_name: opts.userName,
    seats: opts.seats,
    status: bookingStatus,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing?.id
    ? await supabase.from("trip_bookings").update(payload).eq("id", existing.id)
    : await supabase.from("trip_bookings").insert({ ...payload, registered_at: new Date().toISOString() });

  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
  else if (!error) markDomain10Available();
}

export async function fetchTripBookingId(opts: {
  postId: string;
  userId: string;
}): Promise<string | null> {
  if (domain10RemoteAvailable === false || !opts.userId) return null;
  const tripId = await fetchTripIdByPostId(opts.postId);
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_bookings")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", opts.userId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function persistTripGeoZone(zone: {
  postId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}): Promise<void> {
  if (domain10RemoteAvailable === false) return;
  const tripId = await ensureTripIdForPost({ postId: zone.postId, title: "رحلة" });
  if (!tripId) return;

  const { error } = await supabase
    .from("trips")
    .update({
      check_in_lat: zone.lat,
      check_in_lng: zone.lng,
      check_in_radius_m: zone.radiusMeters,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tripId);

  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
  else if (!error) markDomain10Available();
}

export async function fetchTripGeoZone(
  postId: string,
): Promise<{ lat: number; lng: number; radiusMeters: number } | null> {
  if (domain10RemoteAvailable === false) return null;
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trips")
    .select("check_in_lat, check_in_lng, check_in_radius_m")
    .eq("id", tripId)
    .maybeSingle();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  if (data?.check_in_lat == null || data.check_in_lng == null || data.check_in_radius_m == null) return null;
  markDomain10Available();
  return {
    lat: Number(data.check_in_lat),
    lng: Number(data.check_in_lng),
    radiusMeters: Number(data.check_in_radius_m),
  };
}

export async function insertTripCheckIn(opts: {
  postId: string;
  userId: string;
  bookingId?: string | null;
  lat: number;
  lng: number;
}): Promise<boolean> {
  if (domain10RemoteAvailable === false || !opts.userId) return false;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: "رحلة" });
  if (!tripId) return false;

  const bookingId =
    opts.bookingId ?? (await fetchTripBookingId({ postId: opts.postId, userId: opts.userId }));

  const { error } = await supabase.from("check_ins").insert({
    trip_id: tripId,
    booking_id: bookingId,
    user_id: opts.userId,
    lat: opts.lat,
    lng: opts.lng,
    method: "geo",
  });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }

  markDomain10Available();
  await supabase.from("attendance_logs").insert({
    trip_id: tripId,
    booking_id: bookingId,
    event_kind: "checked_in",
    note: "geo check-in",
  });

  return true;
}

export async function fetchTripWalletLedger(opts: {
  postId: string;
  userId: string;
  registrationId: string;
}): Promise<{
  registrationId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  payments: { at: string; amount: number; note?: string }[];
} | null> {
  if (isDomain10RemoteAvailable() === false || !opts.userId) return null;

  const bookingId = await fetchTripBookingId({ postId: opts.postId, userId: opts.userId });
  if (!bookingId) return null;

  const { data, error } = await supabase
    .from("trip_payments")
    .select("amount, currency, status, note, paid_at, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  if (!data?.length) return null;

  const pending = data.find((r) => r.status === "pending");
  const paidRows = data.filter((r) => r.status === "paid");
  const amountDue = pending ? Number(pending.amount) : paidRows.reduce((s, r) => s + Number(r.amount), 0);
  const amountPaid = paidRows.reduce((s, r) => s + Number(r.amount), 0);

  return {
    registrationId: opts.registrationId,
    amountDue,
    amountPaid,
    currency: String(pending?.currency ?? paidRows[0]?.currency ?? "EGP"),
    payments: paidRows.map((r) => ({
      at: String(r.paid_at ?? r.created_at),
      amount: Number(r.amount),
      note: r.note ? String(r.note) : undefined,
    })),
  };
}

export async function persistTripWalletInit(opts: {
  postId: string;
  registrationId: string;
  userId: string;
  amountDue: number;
  currency?: string;
}): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  const bookingId = await fetchTripBookingId({ postId: opts.postId, userId: opts.userId });
  if (!bookingId) return;

  const { data: existing } = await supabase
    .from("trip_payments")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing?.id) return;

  const { error } = await supabase.from("trip_payments").insert({
    booking_id: bookingId,
    amount: opts.amountDue,
    currency: opts.currency ?? "EGP",
    status: "pending",
    note: "amount due",
  });

  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
  else if (!error) markDomain10Available();
}

export async function persistTripPaymentRemote(opts: {
  postId: string;
  userId: string;
  amount: number;
  note?: string;
}): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  const bookingId = await fetchTripBookingId({ postId: opts.postId, userId: opts.userId });
  if (!bookingId) return;

  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
  else if (!error) markDomain10Available();
}

export async function fetchTripPrayerRequests(postId: string): Promise<
  {
    id: string;
    authorName: string;
    body: string;
    reactions: number;
    sharedWithOrganizer: boolean;
  }[]
> {
  if (isDomain10RemoteAvailable() === false) return [];
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return [];

  const { data, error } = await supabase
    .from("trip_prayer_requests")
    .select("id, author_name, body, reactions, shared_with_organizer")
    .eq("trip_id", tripId)
    .order("reactions", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return [];
  }
  markDomain10Available();
  return (data ?? []).map((r) => ({
    id: String(r.id),
    authorName: String(r.author_name),
    body: String(r.body),
    reactions: Number(r.reactions) || 0,
    sharedWithOrganizer: Boolean(r.shared_with_organizer),
  }));
}

export async function insertTripPrayerRequestRemote(opts: {
  postId: string;
  userId: string;
  authorName: string;
  body: string;
  sharedWithOrganizer: boolean;
}): Promise<string | null> {
  if (isDomain10RemoteAvailable() === false || !opts.userId) return null;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: "رحلة" });
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_prayer_requests")
    .insert({
      trip_id: tripId,
      user_id: opts.userId,
      author_name: opts.authorName,
      body: opts.body.trim(),
      shared_with_organizer: opts.sharedWithOrganizer,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function incrementTripPrayerReactionRemote(id: string, nextCount: number): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false || !/^[0-9a-f-]{36}$/i.test(id)) return false;

  const { error } = await supabase
    .from("trip_prayer_requests")
    .update({ reactions: nextCount })
    .eq("id", id);

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}

export async function persistOrganizerTripPayment(opts: {
  postId: string;
  targetUserId: string;
  amount: number;
  note?: string;
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false || !opts.targetUserId || opts.amount <= 0) return false;
  const bookingId = await fetchTripBookingId({ postId: opts.postId, userId: opts.targetUserId });
  if (!bookingId) return false;

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}

export async function offerNextWaitlistSeatRemote(opts: {
  postId: string;
  freedSeats: number;
  holdMs?: number;
}): Promise<{
  id: string;
  userId: string;
  userName: string;
  seats: number;
  status: string;
  createdAt: string;
  offeredAt?: string;
  offerExpiresAt?: string;
} | null> {
  if (isDomain10RemoteAvailable() === false) return null;
  const tripId = await fetchTripIdByPostId(opts.postId);
  if (!tripId) return null;

  const { data, error } = await supabase.rpc("offer_next_waitlist_seat", {
    p_trip_id: tripId,
    p_freed_seats: opts.freedSeats,
    p_hold_ms: opts.holdMs ?? 1_800_000,
  });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  if (!data) return null;

  markDomain10Available();
  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: String(row.user_name),
    seats: Number(row.seats) || 1,
    status: String(row.status),
    createdAt: String(row.created_at),
    offeredAt: row.offered_at ? String(row.offered_at) : undefined,
    offerExpiresAt: row.offer_expires_at ? String(row.offer_expires_at) : undefined,
  };
}

export async function fetchTripCertificatesForUser(userId: string): Promise<
  {
    id: string;
    userId: string;
    eventTitle: string;
    eventDate: string;
    organizerName: string;
    verifyQr: string;
    postId: string;
  }[]
> {
  if (isDomain10RemoteAvailable() === false || !userId) return [];

  const { data, error } = await supabase
    .from("trip_participation_certificates")
    .select("id, user_id, post_id, event_title, event_date, organizer_name, verify_qr")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return [];
  }
  markDomain10Available();
  return (data ?? []).map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    postId: String(r.post_id),
    eventTitle: String(r.event_title),
    eventDate: String(r.event_date ?? ""),
    organizerName: String(r.organizer_name),
    verifyQr: String(r.verify_qr),
  }));
}

export async function persistTripCertificateRemote(opts: {
  postId: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  verifyQr: string;
}): Promise<string | null> {
  if (isDomain10RemoteAvailable() === false || !opts.userId) return null;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: opts.eventTitle });
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_participation_certificates")
    .upsert(
      {
        trip_id: tripId,
        user_id: opts.userId,
        post_id: opts.postId,
        event_title: opts.eventTitle,
        event_date: opts.eventDate || null,
        organizer_name: opts.organizerName,
        verify_qr: opts.verifyQr,
      },
      { onConflict: "trip_id,user_id" },
    )
    .select("id")
    .single();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function fetchTripCompanionGroups(postId: string): Promise<
  { id: string; label: string; registrationIds: string[]; kind: "room" | "seat" | "housing" }[]
> {
  if (isDomain10RemoteAvailable() === false) return [];
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return [];

  const { data, error } = await supabase
    .from("trip_companion_groups")
    .select("id, label, kind, registration_ids")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return [];
  }
  markDomain10Available();
  return (data ?? []).map((r) => ({
    id: String(r.id),
    label: String(r.label),
    kind: (String(r.kind) as "room" | "seat" | "housing") || "room",
    registrationIds: Array.isArray(r.registration_ids) ? r.registration_ids.map(String) : [],
  }));
}

export async function replaceTripCompanionGroupsRemote(opts: {
  postId: string;
  groups: { label: string; registrationIds: string[]; kind: "room" | "seat" | "housing" }[];
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false) return false;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: "رحلة" });
  if (!tripId) return false;

  const { error: delError } = await supabase.from("trip_companion_groups").delete().eq("trip_id", tripId);
  if (delError) {
    if (isMissingDomain10Error(delError)) markDomain10Unavailable();
    return false;
  }

  if (opts.groups.length === 0) {
    markDomain10Available();
    return true;
  }

  const { error: insError } = await supabase.from("trip_companion_groups").insert(
    opts.groups.map((g) => ({
      trip_id: tripId,
      label: g.label,
      kind: g.kind,
      registration_ids: g.registrationIds,
    })),
  );

  markDomain10Available();
  return true;
}

export async function fetchPilgrimagePassportEntries(userId: string): Promise<
  { id: string; userId: string; kind: string; title: string; completedAt: string; postId?: string }[]
> {
  if (isDomain10RemoteAvailable() === false || !userId) return [];

  const { data, error } = await supabase
    .from("trip_pilgrimage_passport_entries")
    .select("id, user_id, kind, title, completed_at, post_id")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return [];
  }
  markDomain10Available();
  return (data ?? []).map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    kind: String(r.kind),
    title: String(r.title),
    completedAt: String(r.completed_at),
    postId: r.post_id ? String(r.post_id) : undefined,
  }));
}

export async function persistPilgrimageEntryRemote(opts: {
  postId?: string;
  userId: string;
  kind: string;
  title: string;
  completedAt: string;
}): Promise<string | null> {
  if (isDomain10RemoteAvailable() === false || !opts.userId) return null;

  let tripId: string | null = null;
  if (opts.postId) {
    tripId = await ensureTripIdForPost({ postId: opts.postId, title: opts.title });
  }

  const { data, error } = await supabase
    .from("trip_pilgrimage_passport_entries")
    .upsert(
      {
        user_id: opts.userId,
        trip_id: tripId,
        post_id: opts.postId ?? null,
        kind: opts.kind,
        title: opts.title,
        completed_at: opts.completedAt,
      },
      { onConflict: "user_id,title,completed_at" },
    )
    .select("id")
    .single();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function fetchTripMemoryAlbumRemote(
  postId: string,
): Promise<{ photos: string[]; videos: string[]; highlights: string[] } | null> {
  if (isDomain10RemoteAvailable() === false) return null;
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_memory_albums")
    .select("photos, videos, highlights")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  if (!data) return null;
  markDomain10Available();
  return {
    photos: Array.isArray(data.photos) ? data.photos.map(String) : [],
    videos: Array.isArray(data.videos) ? data.videos.map(String) : [],
    highlights: Array.isArray(data.highlights) ? data.highlights.map(String) : [],
  };
}

export async function persistTripMemoryAlbumRemote(opts: {
  postId: string;
  title: string;
  photos: string[];
  videos: string[];
  highlights: string[];
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false) return false;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: opts.title });
  if (!tripId) return false;

  const { error } = await supabase.from("trip_memory_albums").upsert(
    {
      trip_id: tripId,
      post_id: opts.postId,
      photos: opts.photos,
      videos: opts.videos,
      highlights: opts.highlights,
    },
    { onConflict: "trip_id" },
  );

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}

export async function fetchEmergencyContactRemote(opts: {
  postId: string;
  registrationId: string;
}): Promise<{ name: string; phone: string; relation: string } | null> {
  if (isDomain10RemoteAvailable() === false) return null;
  const tripId = await fetchTripIdByPostId(opts.postId);
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_emergency_contacts")
    .select("name, phone, relation")
    .eq("trip_id", tripId)
    .eq("registration_id", opts.registrationId)
    .maybeSingle();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  if (!data) return null;
  markDomain10Available();
  return { name: String(data.name), phone: String(data.phone), relation: String(data.relation) };
}

export async function persistEmergencyContactRemote(opts: {
  postId: string;
  registrationId: string;
  userId: string;
  name: string;
  phone: string;
  relation: string;
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false || !opts.userId) return false;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: "رحلة" });
  if (!tripId) return false;

  const bookingId = await fetchTripBookingId({ postId: opts.postId, userId: opts.userId });

  const { error } = await supabase.from("trip_emergency_contacts").upsert(
    {
      trip_id: tripId,
      user_id: opts.userId,
      registration_id: opts.registrationId,
      booking_id: bookingId,
      name: opts.name,
      phone: opts.phone,
      relation: opts.relation,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trip_id,registration_id" },
  );

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}

export async function fetchTripTimelineEvents(postId: string): Promise<
  { id: string; kind: string; title: string; at: string; mediaUrl?: string }[]
> {
  if (isDomain10RemoteAvailable() === false) return [];
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return [];

  const { data, error } = await supabase
    .from("trip_timeline_events")
    .select("id, kind, title, at, media_url")
    .eq("trip_id", tripId)
    .order("at", { ascending: true });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return [];
  }
  markDomain10Available();
  return (data ?? []).map((r) => ({
    id: String(r.id),
    kind: String(r.kind),
    title: String(r.title),
    at: String(r.at),
    mediaUrl: r.media_url ? String(r.media_url) : undefined,
  }));
}

export async function replaceTripTimelineRemote(opts: {
  postId: string;
  title: string;
  events: { kind: string; title: string; at: string; mediaUrl?: string }[];
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false) return false;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: opts.title });
  if (!tripId) return false;

  const { error: delError } = await supabase.from("trip_timeline_events").delete().eq("trip_id", tripId);
  if (delError) {
    if (isMissingDomain10Error(delError)) markDomain10Unavailable();
    return false;
  }

  if (opts.events.length === 0) {
    markDomain10Available();
    return true;
  }

  const { error: insError } = await supabase.from("trip_timeline_events").insert(
    opts.events.map((e) => ({
      trip_id: tripId,
      post_id: opts.postId,
      kind: e.kind,
      title: e.title,
      at: e.at,
      media_url: e.mediaUrl ?? null,
    })),
  );

  if (insError) {
    if (isMissingDomain10Error(insError)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}

export async function insertTripTimelineEventRemote(opts: {
  postId: string;
  kind: string;
  title: string;
  at: string;
  mediaUrl?: string;
}): Promise<string | null> {
  if (isDomain10RemoteAvailable() === false) return null;
  const tripId = await ensureTripIdForPost({ postId: opts.postId, title: "رحلة" });
  if (!tripId) return null;

  const { data, error } = await supabase
    .from("trip_timeline_events")
    .insert({
      trip_id: tripId,
      post_id: opts.postId,
      kind: opts.kind,
      title: opts.title,
      at: opts.at,
      media_url: opts.mediaUrl ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  markDomain10Available();
  return data?.id ? String(data.id) : null;
}

export async function fetchOrganizerTrustStatsRemote(organizerUserId: string): Promise<{
  tripsCompleted: number;
  attendanceRate: number;
  cancellationRate: number;
  commitmentScore: number;
} | null> {
  if (isDomain10RemoteAvailable() === false || !organizerUserId) return null;

  const { data, error } = await supabase
    .from("trip_organizer_trust_stats")
    .select("trips_completed, attendance_rate, cancellation_rate, commitment_score")
    .eq("organizer_user_id", organizerUserId)
    .maybeSingle();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return null;
  }
  if (!data) return null;
  markDomain10Available();
  return {
    tripsCompleted: Number(data.trips_completed) || 0,
    attendanceRate: Number(data.attendance_rate) || 0,
    cancellationRate: Number(data.cancellation_rate) || 0,
    commitmentScore: Number(data.commitment_score) || 100,
  };
}

export async function persistOrganizerTrustStatsRemote(stats: {
  organizerUserId: string;
  tripsCompleted: number;
  attendanceRate: number;
  cancellationRate: number;
  commitmentScore: number;
}): Promise<boolean> {
  if (isDomain10RemoteAvailable() === false || !stats.organizerUserId) return false;

  const { error } = await supabase.from("trip_organizer_trust_stats").upsert(
    {
      organizer_user_id: stats.organizerUserId,
      trips_completed: stats.tripsCompleted,
      attendance_rate: stats.attendanceRate,
      cancellation_rate: stats.cancellationRate,
      commitment_score: stats.commitmentScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organizer_user_id" },
  );

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return false;
  }
  markDomain10Available();
  return true;
}
