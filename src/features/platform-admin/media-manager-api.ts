import { supabase } from "@/integrations/supabase/client";

export const ALPHA_MEDIA_BUCKET = "alpha-media";

export type MediaLibraryStatus = "pending" | "approved" | "rejected";
export type MediaManagerTab = "pending" | "approved" | "rejected" | "featured" | "primary";

export type MediaLibraryRow = {
  id: string;
  category: string;
  title: string | null;
  imageUrl: string;
  previewUrl: string;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
  status: MediaLibraryStatus;
  uploadedBy: string | null;
  uploaderName: string | null;
  storagePath: string | null;
  isPrimary: boolean;
  approvedBy: string | null;
  displayOrder: number;
  mediaType: string;
  saintName: string | null;
};

export type MediaManagerStats = {
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  primary: number;
  today: number;
};

export const MEDIA_CATEGORY_FILTERS = [
  { key: "all", labelAr: "الكل", dbValue: null },
  { key: "saints", labelAr: "القديسين", dbValue: "saints" },
  { key: "verse_cards", labelAr: "كروت الآيات", dbValue: "verse_cards" },
  { key: "churches", labelAr: "الكنائس", dbValue: "churches" },
  { key: "monasteries", labelAr: "الأديرة", dbValue: "monasteries" },
  { key: "hero", labelAr: "Hero", dbValue: "hero" },
  { key: "kids", labelAr: "الأطفال", dbValue: "kids" },
  { key: "events", labelAr: "Events", dbValue: "events" },
] as const;

export type MediaCategoryFilterKey = (typeof MEDIA_CATEGORY_FILTERS)[number]["key"];

export const MEDIA_TAB_LABELS: Record<MediaManagerTab, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  featured: "Featured",
  primary: "Primary",
};

export const MEDIA_STATUS_LABELS_AR: Record<MediaLibraryStatus, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: "Image",
  video: "Video",
  pdf: "PDF",
  audio: "Audio",
};

type DbRow = {
  id: string;
  category: string;
  title: string | null;
  image_url: string;
  created_at: string;
  entity_type: string | null;
  entity_id: string | null;
  status: MediaLibraryStatus;
  uploaded_by: string | null;
  storage_path: string | null;
  is_primary: boolean;
  approved_by: string | null;
  display_order: number;
  media_type: string;
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function resolvePreviewUrl(storagePath: string | null, imageUrl: string): Promise<string> {
  if (storagePath?.trim()) {
    const { data, error } = await supabase.storage
      .from(ALPHA_MEDIA_BUCKET)
      .createSignedUrl(storagePath.trim(), 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  }
  return imageUrl;
}

async function enrichRows(rows: DbRow[]): Promise<MediaLibraryRow[]> {
  if (rows.length === 0) return [];

  const saintIds = [
    ...new Set(rows.filter((r) => r.entity_type === "saint" && r.entity_id).map((r) => r.entity_id as string)),
  ];
  const userIds = [...new Set(rows.filter((r) => r.uploaded_by).map((r) => r.uploaded_by as string))];

  const saintMap = new Map<string, string>();
  if (saintIds.length > 0) {
    const { data } = await supabase.from("saints_index").select("id, name").in("id", saintIds);
    for (const s of data ?? []) {
      if (s.id && s.name) saintMap.set(s.id, s.name);
    }
  }

  const userMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, username")
      .in("user_id", userIds);
    for (const u of data ?? []) {
      const label = u.display_name?.trim() || (u.username ? `@${u.username}` : null);
      if (u.user_id && label) userMap.set(u.user_id, label);
    }
  }

  const previewUrls = await Promise.all(
    rows.map((row) => resolvePreviewUrl(row.storage_path, row.image_url)),
  );

  return rows.map((row, idx) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    imageUrl: row.image_url,
    previewUrl: previewUrls[idx] ?? row.image_url,
    createdAt: row.created_at,
    entityType: row.entity_type,
    entityId: row.entity_id,
    status: row.status,
    uploadedBy: row.uploaded_by,
    uploaderName: row.uploaded_by ? (userMap.get(row.uploaded_by) ?? "—") : "—",
    storagePath: row.storage_path,
    isPrimary: row.is_primary,
    approvedBy: row.approved_by,
    displayOrder: row.display_order,
    mediaType: row.media_type,
    saintName: row.entity_id ? (saintMap.get(row.entity_id) ?? null) : null,
  }));
}

function applyTabQuery(tab: MediaManagerTab) {
  let query = supabase
    .from("media_library")
    .select(
      "id, category, title, image_url, created_at, entity_type, entity_id, status, uploaded_by, storage_path, is_primary, approved_by, display_order, media_type",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  switch (tab) {
    case "pending":
      query = query.eq("status", "pending");
      break;
    case "approved":
      query = query.eq("status", "approved");
      break;
    case "rejected":
      query = query.eq("status", "rejected");
      break;
    case "featured":
      query = query.eq("status", "approved").or("display_order.gt.0,category.eq.featured");
      break;
    case "primary":
      query = query.eq("status", "approved").eq("is_primary", true);
      break;
  }

  return query;
}

export async function fetchMediaManagerStats(): Promise<MediaManagerStats> {
  const todayIso = startOfTodayIso();

  const [pending, approved, rejected, featured, primary, today] = await Promise.all([
    supabase.from("media_library").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("media_library").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("media_library").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase
      .from("media_library")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .or("display_order.gt.0,category.eq.featured"),
    supabase
      .from("media_library")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_primary", true),
    supabase.from("media_library").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
  ]);

  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    featured: featured.count ?? 0,
    primary: primary.count ?? 0,
    today: today.count ?? 0,
  };
}

export async function fetchMediaLibraryRows(
  tab: MediaManagerTab,
  options?: { category?: string | null; search?: string },
): Promise<MediaLibraryRow[]> {
  let query = applyTabQuery(tab);

  const category = options?.category?.trim();
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    console.warn("[fetchMediaLibraryRows]", error.message);
    return [];
  }

  let rows = await enrichRows((data ?? []) as DbRow[]);

  const search = options?.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter((row) => {
      const haystack = [
        row.title,
        row.saintName,
        row.uploaderName,
        row.category,
        row.mediaType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  return rows;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function mapMediaActionError(message: string): string {
  if (message.includes("not_platform_owner")) {
    return "ليس لديك صلاحية مالك على السيرفر — اطلب من المؤسس إضافة إيميلك في Supabase";
  }
  if (message.includes("not_authenticated")) {
    return "يجب تسجيل الدخول بحساب Supabase (ليس PIN فقط)";
  }
  if (message.includes("Could not find the function") || message.includes("does not exist")) {
    return "طبّق migration أزرار الميديا على Supabase (RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql)";
  }
  if (message.includes("media_not_found")) {
    return "لم يُعثر على الوسيط — ربما حُذف أو لا تملك صلاحية عرضه";
  }
  return message;
}

function isRpcMissing(error: { message: string } | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("could not find the function") || msg.includes("does not exist");
}

function rpcOk(data: unknown, error: { message: string } | null): { ok: boolean; error?: string } {
  if (error) return { ok: false, error: mapMediaActionError(error.message) };
  if (typeof data === "string") {
    try {
      return rpcOk(JSON.parse(data), null);
    } catch {
      return { ok: true };
    }
  }
  if (data && typeof data === "object" && "ok" in data && (data as { ok?: boolean }).ok === false) {
    const err = (data as { error?: string }).error;
    return { ok: false, error: err ? mapMediaActionError(err) : "تعذّر تنفيذ العملية" };
  }
  return { ok: true };
}

async function verifyMediaRow(
  id: string,
  expect: { status?: MediaLibraryStatus; isPrimary?: boolean; deleted?: boolean },
): Promise<boolean> {
  if (expect.deleted) {
    const { data, error } = await supabase.from("media_library").select("id").eq("id", id).maybeSingle();
    if (error) return false;
    return data == null;
  }

  const { data, error } = await supabase
    .from("media_library")
    .select("id, status, is_primary")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return false;
  if (expect.status != null && data.status !== expect.status) return false;
  if (expect.isPrimary != null && data.is_primary !== expect.isPrimary) return false;
  return true;
}

export async function checkMediaManagerAccess(): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) {
    return { ok: false, error: "يجب تسجيل الدخول بحساب Supabase (ليس PIN فقط)" };
  }

  const { data: isOwner, error: ownerErr } = await supabase.rpc("is_platform_owner");
  if (!ownerErr && isOwner === true) return { ok: true };

  if (ownerErr && isRpcMissing(ownerErr)) {
    const { data, error } = await supabase.from("platform_owners").select("user_id").eq("user_id", userId).maybeSingle();
    if (!error && data) return { ok: true };
    return { ok: false, error: mapMediaActionError(ownerErr.message) };
  }

  if (ownerErr) {
    return { ok: false, error: mapMediaActionError(ownerErr.message) };
  }

  return { ok: false, error: "ليس لديك صلاحية مالك على السيرفر" };
}

export async function approveMediaItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("platform_media_approve", { p_id: id });
  const rpc = rpcOk(data, error);
  if (rpc.ok) {
    if (await verifyMediaRow(id, { status: "approved" })) return { ok: true };
    return { ok: false, error: "لم يتغيّر وضع الوسيط بعد القبول — تحقق من صلاحيات المالك" };
  }
  if (!isRpcMissing(error)) return rpc;

  const userId = await currentUserId();
  const { data: row, error: directError } = await supabase
    .from("media_library")
    .update({
      status: "approved",
      approved_by: userId,
    })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (directError) return { ok: false, error: mapMediaActionError(directError.message) };
  if (!row || row.status !== "approved") {
    return {
      ok: false,
      error: "تعذّر قبول الوسيط — طبّق RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql وتأكد من platform_owners",
    };
  }
  return { ok: true };
}

export async function rejectMediaItem(
  id: string,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("platform_media_reject", {
    p_id: id,
    p_reason: reason?.trim() || null,
  });
  const rpc = rpcOk(data, error);
  if (rpc.ok) {
    if (await verifyMediaRow(id, { status: "rejected" })) return { ok: true };
    return { ok: false, error: "لم يتغيّر وضع الوسيط بعد الرفض — تحقق من صلاحيات المالك" };
  }
  if (!isRpcMissing(error)) return rpc;

  const { data: row, error: directError } = await supabase
    .from("media_library")
    .update({ status: "rejected", is_primary: false })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (directError) return { ok: false, error: mapMediaActionError(directError.message) };
  if (!row || row.status !== "rejected") {
    return {
      ok: false,
      error: "تعذّر رفض الوسيط — طبّق RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql وتأكد من platform_owners",
    };
  }
  return { ok: true };
}

export async function setMediaPrimary(row: MediaLibraryRow): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("platform_media_set_primary", { p_id: row.id });
  const rpc = rpcOk(data, error);
  if (rpc.ok) {
    if (await verifyMediaRow(row.id, { isPrimary: true, status: "approved" })) return { ok: true };
    return { ok: false, error: "لم يُعيَّن الوسيط كرئيسي — تحقق من صلاحيات المالك" };
  }
  if (!isRpcMissing(error)) return rpc;

  if (row.entityType && row.entityId) {
    const { error: clearError } = await supabase
      .from("media_library")
      .update({ is_primary: false })
      .eq("entity_type", row.entityType)
      .eq("entity_id", row.entityId);

    if (clearError) return { ok: false, error: mapMediaActionError(clearError.message) };
  } else {
    const { error: clearError } = await supabase
      .from("media_library")
      .update({ is_primary: false })
      .eq("category", row.category)
      .is("entity_type", null)
      .is("entity_id", null);

    if (clearError) return { ok: false, error: mapMediaActionError(clearError.message) };
  }

  const userId = await currentUserId();
  const { data: updated, error: updateError } = await supabase
    .from("media_library")
    .update({
      is_primary: true,
      status: "approved",
      approved_by: userId,
    })
    .eq("id", row.id)
    .select("id, status, is_primary")
    .maybeSingle();

  if (updateError) return { ok: false, error: mapMediaActionError(updateError.message) };
  if (!updated || !updated.is_primary || updated.status !== "approved") {
    return {
      ok: false,
      error: "تعذّر تعيين الوسيط كرئيسي — طبّق RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql",
    };
  }
  return { ok: true };
}

export async function deleteMediaItem(row: MediaLibraryRow): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("platform_media_delete", { p_id: row.id });
  const rpc = rpcOk(data, error);
  if (rpc.ok) {
    if (await verifyMediaRow(row.id, { deleted: true })) return { ok: true };
    return { ok: false, error: "لم يُحذف الوسيط — تحقق من صلاحيات المالك" };
  }
  if (!isRpcMissing(error)) return rpc;

  if (row.storagePath?.trim()) {
    await supabase.storage.from(ALPHA_MEDIA_BUCKET).remove([row.storagePath.trim()]);
  }

  const { data: deleted, error: directError } = await supabase
    .from("media_library")
    .delete()
    .eq("id", row.id)
    .select("id")
    .maybeSingle();

  if (directError) return { ok: false, error: mapMediaActionError(directError.message) };
  if (deleted) return { ok: true };
  if (await verifyMediaRow(row.id, { deleted: true })) return { ok: true };

  return {
    ok: false,
    error: "تعذّر حذف الوسيط — طبّق RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql وتأكد من platform_owners",
  };
}

export function mediaCategoryLabel(category: string): string {
  const match = MEDIA_CATEGORY_FILTERS.find((f) => f.dbValue === category);
  return match?.labelAr ?? category;
}

export function formatMediaDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function inferMediaType(file: File): "image" | "video" | "pdf" | "audio" {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return "image";
}

export async function uploadMediaFile(
  file: File,
  category: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "يجب تسجيل الدخول" };

  const mediaType = inferMediaType(file);
  const safeName = file.name.replace(/[^\w.\-()+\s]/g, "_");
  const path = `owner-uploads/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(ALPHA_MEDIA_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: publicData } = supabase.storage.from(ALPHA_MEDIA_BUCKET).getPublicUrl(path);
  const title = file.name.replace(/\.[^/.]+$/, "") || "وسيط جديد";

  const { error: insertError } = await supabase.from("media_library").insert({
    category,
    title,
    image_url: publicData.publicUrl,
    storage_path: path,
    status: "pending",
    uploaded_by: userId,
    media_type: mediaType,
    is_primary: false,
    display_order: 0,
  });

  if (insertError) return { ok: false, error: insertError.message };
  return { ok: true };
}
