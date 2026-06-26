import { supabase } from "@/integrations/supabase/client";
import type { PublisherTeamMember, PublisherTeamPermissions } from "./types";

function mapAccess(data: unknown): PublisherTeamPermissions | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const role = o.role === "owner" || o.role === "assistant" ? o.role : null;
  if (!role) return null;
  return {
    role,
    canEditProfile: o.canEditProfile === true,
    canManageContent: o.canManageContent === true,
    canSubmitPublication: o.canSubmitPublication === true,
    canManageTeam: o.canManageTeam === true,
  };
}

export async function fetchPublisherAccess(
  publisherId: string,
): Promise<PublisherTeamPermissions | null> {
  const { data, error } = await supabase.rpc("get_publisher_access", {
    p_publisher_id: publisherId,
  });
  if (error) {
    console.warn("[fetchPublisherAccess]", error.message);
    return null;
  }
  return mapAccess(data);
}

export async function fetchPublisherTeamMembers(
  publisherId: string,
): Promise<PublisherTeamMember[]> {
  const { data, error } = await supabase.rpc("list_publisher_team_members", {
    p_publisher_id: publisherId,
  });
  if (error) {
    console.warn("[fetchPublisherTeamMembers]", error.message);
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      userId: String(r.userId),
      displayName: String(r.displayName ?? "عضو ألفا"),
      canEditProfile: r.canEditProfile === true,
      canManageContent: r.canManageContent === true,
      canSubmitPublication: r.canSubmitPublication === true,
      canManageTeam: r.canManageTeam === true,
      createdAt: String(r.createdAt ?? ""),
    };
  });
}

export type AddPublisherTeamMemberInput = {
  email: string;
  canEditProfile?: boolean;
  canManageContent?: boolean;
  canSubmitPublication?: boolean;
  canManageTeam?: boolean;
};

export async function addPublisherTeamMember(
  publisherId: string,
  input: AddPublisherTeamMemberInput,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("add_publisher_team_member", {
    p_publisher_id: publisherId,
    p_email: input.email.trim(),
    p_can_edit_profile: input.canEditProfile ?? false,
    p_can_manage_content: input.canManageContent ?? true,
    p_can_submit_publication: input.canSubmitPublication ?? false,
    p_can_manage_team: input.canManageTeam ?? false,
  });

  if (error) return mapTeamMemberError(error, "add");
  return { ok: true };
}

export async function addPublisherTeamMemberByAlphaId(
  publisherId: string,
  alphaCode: string,
  input: Omit<AddPublisherTeamMemberInput, "email">,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("add_publisher_team_member_by_alpha_id", {
    p_publisher_id: publisherId,
    p_alpha_id: alphaCode.trim().toUpperCase(),
    p_can_edit_profile: input.canEditProfile ?? false,
    p_can_manage_content: input.canManageContent ?? true,
    p_can_submit_publication: input.canSubmitPublication ?? false,
    p_can_manage_team: input.canManageTeam ?? false,
  });

  if (error) return mapTeamMemberError(error, "add");
  return { ok: true };
}

function mapTeamMemberError(
  error: { message?: string },
  action: "add" | "update",
): { ok: false; message: string } {
  const msg = error.message ?? "";
  if (msg.includes("user_not_found")) {
    return { ok: false, message: "لم نجد عضو ألفا بهذا الباركود." };
  }
  if (msg.includes("cannot_add_owner")) {
    return { ok: false, message: "صاحب الصفحة مسجّل بالفعل كمالك." };
  }
  if (msg.includes("forbidden")) {
    return { ok: false, message: "لا تملك صلاحية إدارة المساعدين." };
  }
  console.error(`[publisher team ${action}]`, error);
  return { ok: false, message: action === "add" ? "تعذّر إضافة المساعد." : "تعذّر التحديث." };
}

export async function updatePublisherTeamMember(
  memberId: string,
  perms: Omit<AddPublisherTeamMemberInput, "email">,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("update_publisher_team_member", {
    p_member_id: memberId,
    p_can_edit_profile: perms.canEditProfile ?? false,
    p_can_manage_content: perms.canManageContent ?? false,
    p_can_submit_publication: perms.canSubmitPublication ?? false,
    p_can_manage_team: perms.canManageTeam ?? false,
  });

  if (error) {
    console.error("[updatePublisherTeamMember]", error);
    return { ok: false, message: "تعذّر تحديث الصلاحيات." };
  }
  return { ok: true };
}

export async function removePublisherTeamMember(
  memberId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("remove_publisher_team_member", {
    p_member_id: memberId,
  });
  if (error) {
    console.error("[removePublisherTeamMember]", error);
    return { ok: false, message: "تعذّر إزالة المساعد." };
  }
  return { ok: true };
}
