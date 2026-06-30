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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

async function authUserExists(userId: string): Promise<boolean> {
  if (!UUID_RE.test(userId)) return false;

  const { data, error } = await supabase.rpc("auth_user_exists", { uid: userId });
  if (error) {
    console.error("[church] auth_user_exists rpc failed", error);
    return false;
  }
  return data === true;
}

async function resolveSubmitterUserId(
  row: SetupRequestRow,
  fallbackUserId?: string | null,
  preferAuthUser = false,
): Promise<string | null> {
  let authId: string | null =
    fallbackUserId && UUID_RE.test(fallbackUserId) ? fallbackUserId : null;

  if (!authId) {
    try {
      const { getAuthUserId } = await import("@/features/auth");
      authId = await getAuthUserId();
    } catch {
      authId = null;
    }
  }

  if (preferAuthUser && authId && UUID_RE.test(authId)) {
    return authId;
  }

  const submittedBy = row.submitted_by ? String(row.submitted_by) : null;
  if (submittedBy && UUID_RE.test(submittedBy) && submittedBy !== row.id) {
    if (await authUserExists(submittedBy)) {
      return submittedBy;
    }
  }

  if (authId && UUID_RE.test(authId)) {
    return authId;
  }

  return null;
}

async function syncSetupSubmittedBy(setupRequestId: string, memberUserId: string): Promise<void> {
  await supabase
    .from("church_setup_requests")
    .update({ submitted_by: memberUserId, updated_at: new Date().toISOString() })
    .eq("id", setupRequestId);
}

async function ensurePriestRole(
  churchId: string | number,
  row: SetupRequestRow,
  memberUserId: string | null,
): Promise<string | null> {
  if (!row.priest_name?.trim()) return null;

  const { data: existing } = await supabase
    .from("church_roles")
    .select("id")
    .eq("church_id", churchId)
    .eq("role_key", "priest")
    .eq("is_primary_priest", true)
    .limit(1)
    .maybeSingle();

  if (existing?.id != null) {
    console.log("[church_setup approve] created priest role id", existing.id);
    return String(existing.id);
  }

  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const priestRank = String(payload.priestRank ?? "أبونا");
  const whatsapp = String(payload.whatsapp ?? row.priest_phone ?? "");
  const priestName = row.priest_name.trim();

  const { data: role, error: rolesError } = await supabase
    .from("church_roles")
    .insert({
      church_id: churchId,
      user_id: memberUserId,
      role_key: "priest",
      role_name: priestName,
      title: "الكاهن المسؤول",
      phone: row.priest_phone ?? "",
      whatsapp: normalizeWhatsapp(row.priest_phone ?? whatsapp),
      initials: priestInitials(`${priestRank} ${priestName}`),
      messaging_allowed: true,
      is_primary_priest: true,
      visible_to_members: true,
      sort_order: 0,
      is_system: false,
      permissions: {},
    })
    .select("id")
    .single();

  if (rolesError || !role) {
    console.error("provisionChurchFromSetupRequest: priest role insert failed", rolesError);
    return null;
  }

  console.log("[church_setup approve] created priest role id", role.id);
  return String(role.id);
}

async function ensureMembership(
  churchId: string | number,
  memberUserId: string,
  row: SetupRequestRow,
  priestRoleId: string | null,
): Promise<string | null> {
  let authUid: string | null = null;
  try {
    const { getAuthUserId } = await import("@/features/auth");
    authUid = await getAuthUserId();
  } catch (e) {
    console.warn("[ensureMembership:start] getAuthUserId failed", e);
  }

  console.log("[ensureMembership:start]", {
    authUid,
    memberUserId,
    churchId,
    roleId: priestRoleId,
    setupRequestId: row.id,
  });

  const { data: existing, error: existingError } = await supabase
    .from("church_memberships")
    .select("id")
    .eq("church_id", churchId)
    .eq("user_id", memberUserId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("[ensureMembership:error] duplicate-check failed", {
      authUid,
      churchId,
      memberUserId,
      error: existingError,
      errorJson: JSON.stringify(existingError, null, 2),
    });
  }

  if (existing?.id != null) {
    console.log("[ensureMembership:success] skipped — membership already exists", {
      authUid,
      membershipId: existing.id,
      churchId,
      memberUserId,
      roleId: priestRoleId,
    });
    return String(existing.id);
  }

  const membershipRow: Record<string, unknown> = {
    church_id: churchId,
    user_id: memberUserId,
    status: "active",
    membership_status: "approved",
    role_label: "كاهن",
    platform_role: "priest",
    is_priest: true,
    role: "priest",
  };

  if (priestRoleId) {
    membershipRow.role_id = Number(priestRoleId) || priestRoleId;
  }

  console.log("[member:create:start]", {
    "auth.uid()": authUid ?? memberUserId,
    "church.id": churchId,
    role_id: priestRoleId ?? null,
    payload: membershipRow,
  });

  const { data: membership, error: memError } = await supabase
    .from("church_memberships")
    .insert(membershipRow)
    .select("*")
    .single();

  if (memError || !membership) {
    console.error("[member:create:error]", {
      code: memError?.code ?? null,
      message: memError?.message ?? null,
      details: memError?.details ?? null,
      hint: memError?.hint ?? null,
    });
    console.error("[ensureMembership:error]", {
      authUid,
      churchId,
      roleId: priestRoleId,
      payload: membershipRow,
      error: memError,
      errorJson: memError ? JSON.stringify(memError, null, 2) : null,
      code: memError?.code,
      message: memError?.message,
      details: memError?.details,
      hint: memError?.hint,
    });
    return null;
  }

  console.log("[member:create:success]", { data: membership });

  console.log("[ensureMembership:success]", {
    authUid,
    membershipId: membership.id,
    churchId,
    memberUserId,
    roleId: priestRoleId,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ab:church-hub"));
  }

  return String(membership.id);
}

async function insertServantRoles(
  churchId: string | number,
  servants: ServantPayload[],
): Promise<void> {
  for (let i = 0; i < servants.length; i++) {
    const s = servants[i];
    if (!s?.name?.trim()) continue;

    const { data: existing } = await supabase
      .from("church_roles")
      .select("id")
      .eq("church_id", churchId)
      .eq("role_key", "servant")
      .eq("role_name", s.name.trim())
      .limit(1)
      .maybeSingle();

    if (existing?.id != null) continue;

    const { error } = await supabase.from("church_roles").insert({
      church_id: churchId,
      role_key: "servant",
      role_name: s.name.trim(),
      title: s.role?.trim() || "خادم",
      phone: s.phone?.trim() ?? "",
      whatsapp: normalizeWhatsapp(s.phone ?? ""),
      initials: servantInitials(s.name),
      messaging_allowed: false,
      visible_to_members: true,
      sort_order: 10 + i,
      is_system: false,
      permissions: {},
    });

    if (error) console.error("provisionChurchFromSetupRequest: servant role insert failed", error);
  }
}

function setupRequestDescriptionMarker(setupRequestId: string): string {
  return JSON.stringify({ alphaSetupRequestId: setupRequestId, alphaSource: "church_setup" });
}

function buildProductionChurchInsert(
  setupRequestId: string,
  row: SetupRequestRow,
  payload: Record<string, unknown>,
  memberUserId: string | null,
) {
  const churchPhone = String(payload.churchPhone ?? row.priest_phone ?? "");
  const whatsapp = String(payload.whatsapp ?? churchPhone);
  const servants = Array.isArray(payload.servants) ? (payload.servants as ServantPayload[]) : [];
  const facebook = String(payload.facebook ?? "").trim();
  const youtube = String(payload.youtube ?? "").trim();
  const website = String(payload.website ?? "").trim();

  const insertRow: Record<string, unknown> = {
    church_name: row.church_name,
    parish: row.diocese,
    governorate: row.governorate,
    city: row.city,
    formatted_address: row.address,
    latitude: row.location_lat,
    longitude: row.location_lng,
    phone: churchPhone || null,
    whatsapp: whatsapp || null,
    email: row.priest_email,
    priests: row.priest_name,
    facebook_url: facebook || null,
    youtube_url: youtube || null,
    website_url: website || null,
    members_count: memberUserId ? 1 : 0,
    servants_count: servants.length,
    is_active: true,
    status: "approved",
    country: "مصر",
    location_verified: row.location_lat != null && row.location_lng != null,
    description: setupRequestDescriptionMarker(setupRequestId),
    claimed_by: memberUserId,
  };

  return { insertRow, servants };
}

async function findChurchBySetupRequestId(setupRequestId: string): Promise<string | number | null> {
  const { data: bySetup, error: setupColError } = await supabase
    .from("churches")
    .select("id")
    .eq("setup_request_id" as "id", setupRequestId)
    .maybeSingle();

  if (!setupColError && bySetup?.id != null) return bySetup.id;

  const { data: byDesc } = await supabase
    .from("churches")
    .select("id")
    .ilike("description", `%${setupRequestId}%`)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return byDesc?.id != null ? byDesc.id : null;
}

/** Create church + roles + membership when a setup request is approved. Idempotent. */
export async function provisionChurchFromSetupRequest(
  setupRequestId: string,
  fallbackUserId?: string | null,
): Promise<string | null> {
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
  const memberUserId = await resolveSubmitterUserId(row, fallbackUserId);

  if (memberUserId && row.submitted_by !== memberUserId) {
    await syncSetupSubmittedBy(setupRequestId, memberUserId);
  }

  let churchId: string | number | null = await findChurchBySetupRequestId(setupRequestId);

  if (churchId == null) {
    const { insertRow, servants: servantRows } = buildProductionChurchInsert(
      setupRequestId,
      row,
      payload,
      memberUserId,
    );

    let church: { id: string | number } | null = null;
    let churchError: { message?: string; code?: string; details?: string } | null = null;

    const withSetupLink = { ...insertRow, setup_request_id: setupRequestId };
    ({ data: church, error: churchError } = await supabase
      .from("churches")
      .insert(withSetupLink as never)
      .select("id")
      .single());

    if (churchError && (churchError.code === "PGRST204" || churchError.message?.includes("setup_request_id"))) {
      ({ data: church, error: churchError } = await supabase
        .from("churches")
        .insert(insertRow as never)
        .select("id")
        .single());
    }

    if (churchError || !church) {
      console.error("provisionChurchFromSetupRequest: church insert failed", churchError);
      return null;
    }

    churchId = church.id;
    console.log("[church_setup approve] created church id", churchId);
    await insertServantRoles(church.id, servantRows);
  } else {
    console.log("[church_setup approve] created church id", churchId);
  }

  if (churchId == null) return null;

  const priestRoleId = await ensurePriestRole(churchId, row, memberUserId);

  if (memberUserId) {
    await ensureMembership(churchId, memberUserId, row, priestRoleId);
  } else {
    console.warn(
      "provisionChurchFromSetupRequest: no auth user id for membership — church created without membership",
    );
  }

  const { error: setupUpdateError } = await supabase
    .from("church_setup_requests")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", setupRequestId);

  if (setupUpdateError) {
    console.error("provisionChurchFromSetupRequest: setup status update failed", setupUpdateError);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ab:church-hub"));
  }

  return String(churchId);
}

async function findExistingPriestRoleId(churchId: string | number): Promise<string | null> {
  const { data } = await supabase
    .from("church_roles")
    .select("id")
    .eq("church_id", churchId)
    .eq("role_key", "priest")
    .eq("is_primary_priest", true)
    .limit(1)
    .maybeSingle();

  return data?.id != null ? String(data.id) : null;
}

async function ensureSetupMembership(
  setupRequestId: string,
  row: SetupRequestRow,
  churchId: string | number,
  fallbackUserId?: string | null,
): Promise<boolean> {
  console.log("[backfill:ensureSetupMembership:start]", {
    setupRequestId,
    churchId,
    fallbackUserId,
    submitted_by: row.submitted_by,
  });

  const memberUserId = await resolveSubmitterUserId(row, fallbackUserId, true);
  if (!memberUserId) {
    console.warn("[backfill:ensureSetupMembership:skip] no auth user for membership", {
      setupRequestId,
      churchId,
      fallbackUserId,
      submitted_by: row.submitted_by,
    });
    return false;
  }

  if (row.submitted_by !== memberUserId) {
    await syncSetupSubmittedBy(setupRequestId, memberUserId);
  }

  let priestRoleId = await findExistingPriestRoleId(churchId);
  if (!priestRoleId) {
    priestRoleId = await ensurePriestRole(churchId, row, memberUserId);
  }

  console.log("[backfill:ensureSetupMembership:calling ensureMembership]", {
    setupRequestId,
    churchId,
    memberUserId,
    priestRoleId,
  });

  const membershipId = await ensureMembership(churchId, memberUserId, row, priestRoleId);
  if (!membershipId) {
    console.error("[backfill:ensureSetupMembership:failed] ensureMembership returned null", {
      setupRequestId,
      churchId,
      memberUserId,
      priestRoleId,
    });
    return false;
  }

  try {
    const { refreshAuthContext } = await import("@/features/auth");
    await refreshAuthContext();
  } catch {
    /* ignore */
  }

  return true;
}

async function findApprovedChurchId(): Promise<string | number | null> {
  const { data: churches, error } = await supabase
    .from("churches")
    .select("id")
    .eq("status", "approved")
    .order("id", { ascending: true });

  if (error) {
    console.error("[ensureCurrentUserApprovedChurchMembership] approved churches query failed", error);
    return null;
  }
  if (!churches?.length) return null;
  if (churches.length === 1) return churches[0].id;

  const { data: setups } = await supabase
    .from("church_setup_requests")
    .select("id")
    .eq("status", "approved");

  if (setups?.length === 1) {
    const linked = await findChurchBySetupRequestId(setups[0].id);
    if (linked != null) return linked;
  }

  return churches[0].id;
}

async function findPrimaryPriestRoleId(churchId: string | number): Promise<string | number | null> {
  const { data } = await supabase
    .from("church_roles")
    .select("id")
    .eq("church_id", churchId)
    .eq("role_key", "priest")
    .eq("is_primary_priest", true)
    .limit(1)
    .maybeSingle();

  if (data?.id != null) return data.id;

  const { data: fallback } = await supabase
    .from("church_roles")
    .select("id")
    .eq("church_id", churchId)
    .eq("role_key", "priest")
    .limit(1)
    .maybeSingle();

  return fallback?.id ?? null;
}

/**
 * Link the signed-in user to an approved church when membership is missing.
 * Called from /profile/church profile load — idempotent.
 */
export async function ensureCurrentUserApprovedChurchMembership(
  authUserId?: string | null,
): Promise<boolean> {
  let userId = authUserId ?? null;
  if (!userId) {
    try {
      const { waitForAuthUserId } = await import("@/features/auth");
      userId = await waitForAuthUserId();
    } catch (e) {
      console.warn("[ensureCurrentUserApprovedChurchMembership] waitForAuthUserId failed", e);
      userId = null;
    }
  }

  if (!userId) {
    console.warn("[ensureCurrentUserApprovedChurchMembership] no auth.uid()");
    return false;
  }

  const { data: existing, error: existingError } = await supabase
    .from("church_memberships")
    .select("id, church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("[ensureCurrentUserApprovedChurchMembership] membership check failed", existingError);
    return false;
  }

  if (existing?.id != null) {
    return true;
  }

  const churchId = await findApprovedChurchId();
  if (churchId == null) {
    console.warn("[ensureCurrentUserApprovedChurchMembership] no approved church found");
    return false;
  }

  const priestRoleId = await findPrimaryPriestRoleId(churchId);
  const membershipRow: Record<string, unknown> = {
    church_id: churchId,
    user_id: userId,
    platform_role: "priest",
    membership_status: "approved",
    status: "active",
    role_label: "كاهن",
  };

  if (priestRoleId != null) {
    membershipRow.role_id = priestRoleId;
  }

  console.log("[member:create:start]", {
    "auth.uid()": userId,
    "church.id": churchId,
    role_id: priestRoleId ?? null,
    payload: membershipRow,
  });

  const { data: membership, error: insertError } = await supabase
    .from("church_memberships")
    .insert(membershipRow)
    .select("*")
    .single();

  if (insertError || !membership) {
    console.error("[member:create:error]", {
      code: insertError?.code ?? null,
      message: insertError?.message ?? null,
      details: insertError?.details ?? null,
      hint: insertError?.hint ?? null,
    });
    return false;
  }

  console.log("[member:create:success]", { data: membership });

  if (priestRoleId != null) {
    await supabase
      .from("church_roles")
      .update({ user_id: userId })
      .eq("id", priestRoleId)
      .is("user_id", null);
  }

  const { data: approvedSetups } = await supabase
    .from("church_setup_requests")
    .select("id")
    .eq("status", "approved")
    .limit(1);

  if (approvedSetups?.[0]?.id) {
    await syncSetupSubmittedBy(approvedSetups[0].id, userId);
  }

  try {
    const { refreshAuthContext } = await import("@/features/auth");
    await refreshAuthContext();
  } catch {
    /* ignore */
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ab:church-hub"));
  }

  return true;
}

/** Backfill churches/memberships for approved setup requests missing provisioned rows. */
export async function backfillApprovedChurchSetupRequests(fallbackUserId?: string | null): Promise<void> {
  console.log("[backfill:start]", { fallbackUserId });

  let authUserId = fallbackUserId ?? null;
  if (!authUserId) {
    try {
      const { getAuthUserId } = await import("@/features/auth");
      authUserId = await getAuthUserId();
    } catch (e) {
      console.error("[backfill:abort] getAuthUserId threw", e);
      authUserId = null;
    }
  }

  console.log("[backfill:authUid]", { authUserId });

  if (!authUserId) {
    console.warn("[backfill:abort] no auth.uid() — ensureMembership will NOT run");
    return;
  }

  const { data: setups, error } = await supabase
    .from("church_setup_requests")
    .select("id")
    .eq("status", "approved");

  if (error) {
    console.error("[backfill:abort] approved setups query failed", {
      error,
      errorJson: JSON.stringify(error, null, 2),
    });
    return;
  }

  if (!setups?.length) {
    console.warn("[backfill:abort] no approved church_setup_requests rows");
    return;
  }

  console.log("[backfill:approvedSetups]", setups.map((s) => s.id));

  for (const setup of setups) {
    const { data: setupRow, error: setupRowError } = await supabase
      .from("church_setup_requests")
      .select("*")
      .eq("id", setup.id)
      .maybeSingle();

    if (setupRowError) {
      console.error("[backfill:skip] setup row query failed", { setupId: setup.id, error: setupRowError });
      continue;
    }

    if (!setupRow) {
      console.warn("[backfill:skip] setup row not found", { setupId: setup.id });
      continue;
    }

    const row = setupRow as SetupRequestRow;
    const churchId = await findChurchBySetupRequestId(setup.id);

    console.log("[backfill:iteration]", {
      setupId: setup.id,
      churchId,
      submitted_by: row.submitted_by,
      authUserId,
    });

    if (churchId == null) {
      console.log("[backfill:provision] no church row — provisionChurchFromSetupRequest", setup.id);
      await provisionChurchFromSetupRequest(setup.id, authUserId);
      continue;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("church_memberships")
      .select("id")
      .eq("church_id", churchId)
      .eq("user_id", authUserId)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error("[backfill:skip] membership check failed", {
        churchId,
        authUserId,
        error: membershipError,
      });
      continue;
    }

    if (!membership) {
      console.log("[backfill:call ensureSetupMembership]", { setupId: setup.id, churchId, authUserId });
      await ensureSetupMembership(setup.id, row, churchId, authUserId);
    } else {
      console.log("[backfill:skip] membership already exists", {
        membershipId: membership.id,
        churchId,
        authUserId,
      });
    }
  }

  console.log("[backfill:done]");
}
