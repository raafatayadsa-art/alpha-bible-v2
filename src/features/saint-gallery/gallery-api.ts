import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId, fetchAuthUser } from "@/features/auth";
import { uploadSaintGalleryImage, SAINT_GALLERY_BUCKET } from "./storage-api";
import type { SaintGalleryImage, SaintGalleryStatus, SubmitSaintImageInput } from "./types";

type Row = {
  id: string;
  saint_id: string;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  title: string | null;
  note: string | null;
  status: SaintGalleryStatus;
  submitted_by: string | null;
  contributor_display_name: string | null;
  show_public_name: boolean;
  membership_code: string | null;
  is_featured: boolean;
  like_count: number;
  view_count: number;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): SaintGalleryImage {
  return {
    id: row.id,
    saintId: row.saint_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    title: row.title ?? undefined,
    note: row.note ?? undefined,
    status: row.status,
    submittedBy: row.submitted_by ?? undefined,
    contributorDisplayName: row.contributor_display_name ?? undefined,
    showPublicName: row.show_public_name,
    membershipCode: row.membership_code ?? undefined,
    isFeatured: row.is_featured,
    likeCount: row.like_count,
    viewCount: row.view_count,
    approvedAt: row.approved_at ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchApprovedSaintGallery(saintId: string): Promise<SaintGalleryImage[]> {
  const { data, error } = await supabase
    .from("saint_gallery_images")
    .select("*")
    .eq("saint_id", saintId)
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("approved_at", { ascending: false });

  if (error) {
    console.error("saint_gallery fetch approved", error);
    return [];
  }
  return (data as Row[]).map(mapRow);
}

export async function fetchMySaintContributions(userId?: string | null): Promise<SaintGalleryImage[]> {
  const uid = userId ?? (await getAuthUserId());
  if (!uid) return [];

  const { data, error } = await supabase
    .from("saint_gallery_images")
    .select("*")
    .eq("submitted_by", uid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("saint_gallery fetch mine", error);
    return [];
  }
  return (data as Row[]).map(mapRow);
}

export async function fetchSaintGalleryFeaturedUrl(saintId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("saint_gallery_images")
    .select("public_url")
    .eq("saint_id", saintId)
    .eq("status", "approved")
    .eq("is_featured", true)
    .maybeSingle();

  if (error || !data) return null;
  return data.public_url as string;
}

export async function submitSaintGalleryImage(input: SubmitSaintImageInput): Promise<SaintGalleryImage | null> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const { getCurrentUser } = await import("@/features/church/current-user");
  const userId = await waitForAuthUserId();
  if (!userId) return null;

  const user = await fetchAuthUser();
  const current = getCurrentUser();
  const imageId = crypto.randomUUID();

  let path: string;
  let publicUrl: string;
  try {
    ({ path, publicUrl } = await uploadSaintGalleryImage({
      saintId: input.saintId,
      userKey: userId,
      imageId,
      file: input.file,
    }));
  } catch (err) {
    throw new Error(mapSaintGalleryError(err));
  }

  const row = {
    id: imageId,
    saint_id: input.saintId,
    storage_path: path,
    public_url: publicUrl,
    thumbnail_url: publicUrl,
    title: input.title?.trim() || null,
    note: input.note?.trim() || null,
    status: "pending" as const,
    submitted_by: userId,
    contributor_display_name: input.contributorDisplayName?.trim() || user?.displayName || current.name || null,
    show_public_name: input.showPublicName ?? true,
    membership_code: input.membershipCode?.trim() || current.id.slice(0, 6).toUpperCase() || null,
  };

  const { data, error } = await supabase.from("saint_gallery_images").insert(row).select("*").single();
  if (error) {
    console.error("saint_gallery insert", error);
    await supabase.storage.from(SAINT_GALLERY_BUCKET).remove([path]).catch(() => undefined);
    throw new Error(mapSaintGalleryError(error));
  }

  const image = mapRow(data as Row);
  await createSaintImageApproval(image, user?.displayName ?? user?.email);
  return image;
}

async function createSaintImageApproval(image: SaintGalleryImage, submitterLabel?: string) {
  const { data: saint } = await supabase
    .from("synaxarium_saints")
    .select("name")
    .eq("id", image.saintId)
    .maybeSingle();

  const saintName = (saint?.name as string | undefined) ?? image.saintId;
  const requestNo = `SG-${Date.now().toString(36).toUpperCase()}`;

  await supabase.from("platform_approvals").insert({
    request_no: requestNo,
    kind: "saint_image",
    type: "saint_image",
    source_table: "saint_gallery_images",
    source_id: image.id,
    title: `صورة جديدة — ${saintName}`,
    kind_label: "Saint Image Approval",
    submitted_at: new Date().toISOString(),
    status: "pending",
    priority: "normal",
    submitted_by: image.submittedBy,
    payload: {
      saintId: image.saintId,
      saintName,
      contributorName: image.contributorDisplayName ?? submitterLabel ?? "مساهم",
      membershipCode: image.membershipCode,
      thumbnailUrl: image.publicUrl,
      imageTitle: image.title,
      imageNote: image.note,
    },
  });
}

export async function approveSaintGalleryImage(imageId: string, reviewer: string): Promise<boolean> {
  const { data: row } = await supabase
    .from("saint_gallery_images")
    .select("saint_id")
    .eq("id", imageId)
    .maybeSingle();
  if (!row) return false;

  const { count } = await supabase
    .from("saint_gallery_images")
    .select("id", { count: "exact", head: true })
    .eq("saint_id", row.saint_id)
    .eq("status", "approved")
    .eq("is_featured", true);

  const makeFeatured = (count ?? 0) === 0;

  const { error } = await supabase
    .from("saint_gallery_images")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: reviewer,
      is_featured: makeFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", imageId);

  return !error;
}

export async function patchSaintGalleryStatus(
  imageId: string,
  status: SaintGalleryStatus,
  reviewer: string,
  rejectionReason?: string,
): Promise<boolean> {
  if (status === "approved") return approveSaintGalleryImage(imageId, reviewer);

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    rejection_reason: rejectionReason ?? null,
  };
  if (status === "rejected" || status === "needs_changes") {
    patch.approved_at = null;
    patch.approved_by = null;
  }

  const { error } = await supabase.from("saint_gallery_images").update(patch).eq("id", imageId);
  return !error;
}

export async function incrementSaintGalleryView(imageId: string): Promise<void> {
  const { data } = await supabase.from("saint_gallery_images").select("view_count").eq("id", imageId).maybeSingle();
  if (!data) return;
  await supabase
    .from("saint_gallery_images")
    .update({ view_count: (data.view_count as number) + 1 })
    .eq("id", imageId);
}

export async function toggleSaintGalleryLike(imageId: string, userKey: string): Promise<number> {
  const { data: existing } = await supabase
    .from("saint_gallery_likes")
    .select("image_id")
    .eq("image_id", imageId)
    .eq("user_key", userKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("saint_gallery_likes").delete().eq("image_id", imageId).eq("user_key", userKey);
  } else {
    await supabase.from("saint_gallery_likes").insert({ image_id: imageId, user_key: userKey });
  }

  const { count } = await supabase
    .from("saint_gallery_likes")
    .select("image_id", { count: "exact", head: true })
    .eq("image_id", imageId);

  const likeCount = count ?? 0;
  await supabase.from("saint_gallery_images").update({ like_count: likeCount }).eq("id", imageId);
  return likeCount;
}

export const saintGalleryQueryKeys = {
  approved: (saintId: string) => ["saint-gallery", "approved", saintId] as const,
  mine: (userId: string) => ["saint-gallery", "mine", userId] as const,
};

export function mapSaintGalleryError(err: unknown): string {
  const msg =
    (err && typeof err === "object" && "message" in err && typeof err.message === "string"
      ? err.message
      : err instanceof Error
        ? err.message
        : String(err ?? "")).toLowerCase();

  if (msg.includes("bucket not found")) {
    return "نظام صور القديسين غير مفعّل بعد. شغّل supabase/RUN_SAINT_COMMUNITY_GALLERY.sql في Supabase.";
  }
  if (msg.includes("could not find the table") || msg.includes("schema cache")) {
    return "جدول مساهمات الصور غير موجود بعد. شغّل supabase/RUN_SAINT_COMMUNITY_GALLERY.sql في Supabase.";
  }
  if (msg.includes("row-level security") || msg.includes("permission denied")) {
    return "لا توجد صلاحية للرفع. تأكد من تسجيل الدخول وحاول مرة أخرى.";
  }
  if (msg.includes("payload too large") || msg.includes("file size")) {
    return "حجم الصورة أكبر من 5 ميجابايت.";
  }
  if (msg.includes("invalid mime") || msg.includes("mime type")) {
    return "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.";
  }
  return "حدث خطأ أثناء الرفع. حاول مرة أخرى.";
}

export async function checkSaintGalleryBackendReady(): Promise<{ ready: boolean; error?: string }> {
  const { error: tableError } = await supabase.from("saint_gallery_images").select("id").limit(1);
  if (tableError) {
    return { ready: false, error: mapSaintGalleryError(tableError) };
  }

  const probe = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
  const probePath = `_probe/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await supabase.storage.from(SAINT_GALLERY_BUCKET).upload(probePath, probe, {
    contentType: "image/png",
    upsert: true,
  });
  if (uploadError) {
    return { ready: false, error: mapSaintGalleryError(uploadError) };
  }
  await supabase.storage.from(SAINT_GALLERY_BUCKET).remove([probePath]);
  return { ready: true };
}
