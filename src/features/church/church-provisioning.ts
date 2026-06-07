import { supabase } from "@/integrations/supabase/client";

type SetupRequestRow = {
  id: string;
  church_name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  priest_name: string | null;
  priest_phone: string | null;
  submitted_by: string | null;
  payload: Record<string, unknown> | null;
};

type ServantPayload = { name?: string; phone?: string; role?: string };

function priestInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "✚";
  if (trimmed.includes("أبونا") || trimmed.includes("القس") || trimmed.includes("القمص")) return "✚";
  return trimmed.charAt(0);
}

function servantInitials(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : "خ";
}

function normalizeWhatsapp(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Create church + roles + membership when a setup request is approved. Idempotent. */
export async function provisionChurchFromSetupRequest(setupRequestId: string): Promise<string | null> {
  const existing = await supabase
    .from("churches")
    .select("id")
    .eq("setup_request_id", setupRequestId)
    .maybeSingle();

  if (existing.data?.id) return existing.data.id;

  const { data: setup, error: setupError } = await supabase
    .from("church_setup_requests")
    .select("*")
    .eq("id", setupRequestId)
    .maybeSingle();

  if (setupError || !setup) {
    console.error("provisionChurchFromSetupRequest: setup not found", setupError);
    return null;
  }

  const row = setup as SetupRequestRow;
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const churchPhone = String(payload.churchPhone ?? row.priest_phone ?? "");
  const whatsapp = String(payload.whatsapp ?? churchPhone);
  const servants = Array.isArray(payload.servants) ? (payload.servants as ServantPayload[]) : [];
  const memberUserId = row.submitted_by;

  const { data: church, error: churchError } = await supabase
    .from("churches")
    .insert({
      setup_request_id: setupRequestId,
      name: row.church_name,
      diocese: row.diocese,
      governorate: row.governorate,
      city: row.city,
      address: row.address,
      location_lat: row.location_lat,
      location_lng: row.location_lng,
      phone: churchPhone || null,
      whatsapp: whatsapp || null,
      status: "approved",
      member_count: memberUserId ? 1 : 0,
      servant_count: servants.length,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (churchError || !church) {
    console.error("provisionChurchFromSetupRequest: church insert failed", churchError);
    return null;
  }

  const churchId = String(church.id);
  const roles: Record<string, unknown>[] = [];

  if (row.priest_name?.trim()) {
    const priestRank = String(payload.priestRank ?? "أبونا");
    roles.push({
      church_id: churchId,
      user_id: memberUserId,
      role_type: "priest",
      display_name: row.priest_name.trim(),
      title: "الكاهن المسؤول",
      phone: row.priest_phone ?? "",
      whatsapp: normalizeWhatsapp(row.priest_phone ?? whatsapp),
      initials: priestInitials(`${priestRank} ${row.priest_name}`),
      messaging_allowed: true,
      is_primary_priest: true,
      visible_to_members: true,
      sort_order: 0,
    });
  }

  servants.forEach((s, i) => {
    if (!s.name?.trim()) return;
    roles.push({
      church_id: churchId,
      role_type: "servant",
      display_name: s.name.trim(),
      title: s.role?.trim() || "خادم",
      phone: s.phone?.trim() ?? "",
      whatsapp: normalizeWhatsapp(s.phone ?? ""),
      initials: servantInitials(s.name),
      messaging_allowed: false,
      visible_to_members: true,
      sort_order: 10 + i,
    });
  });

  if (roles.length) {
    const { error: rolesError } = await supabase.from("church_roles").insert(roles);
    if (rolesError) console.error("provisionChurchFromSetupRequest: roles insert failed", rolesError);
  }

  if (memberUserId) {
    const { error: memError } = await supabase.from("church_memberships").insert({
      church_id: churchId,
      user_id: memberUserId,
      status: "active",
      role_label: "عضو",
      platform_role: row.priest_name ? "priest" : "member",
    });
    if (memError) console.error("provisionChurchFromSetupRequest: membership insert failed", memError);
  }

  console.log("provisionChurchFromSetupRequest: church created", churchId);
  return churchId;
}
