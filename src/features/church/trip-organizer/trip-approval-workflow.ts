import type { ChurchPost, ChurchPostDetails } from "@/data/church-posts";
import { connectEffectiveAlphaRole } from "@/components/alpha/connect-alpha-access";
import { provisionTripChannels } from "@/features/alpha-connect/provision-trip-channels";
import {
  createChurchPost,
  fetchChurchPostById,
  patchChurchPostDetails,
  type CreateChurchPostResult,
} from "@/features/church/church-posts-api";
import { getCurrentUser } from "@/features/church/current-user";
import { expireSingleTripGrant, grantSingleTripOrganizer } from "./trip-organizer-grants";
import { canPublishTripDirectly } from "./trip-organizer-access";

const TRIP_APPROVAL_EVENT = "ab:trip-approval-changed";

export function notifyTripApprovalChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TRIP_APPROVAL_EVENT));
  }
}

export function subscribeTripApprovalChanged(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TRIP_APPROVAL_EVENT, handler);
  return () => window.removeEventListener(TRIP_APPROVAL_EVENT, handler);
}

function withTripAudit(
  post: ChurchPost,
  creator: { id: string; name: string },
  churchName: string,
  status: ChurchPostDetails["approvalStatus"],
): ChurchPost {
  return {
    ...post,
    details: {
      ...post.details,
      approvalStatus: status,
      organizerUserId: creator.id,
      organizerName: creator.name,
      churchName,
      submittedAt: new Date().toISOString(),
    },
  };
}

export async function submitTripPost(
  churchId: string,
  post: ChurchPost,
  churchName: string,
): Promise<CreateChurchPostResult & { pending?: boolean }> {
  const user = getCurrentUser();

  if (canPublishTripDirectly(user.id)) {
    const approved = withTripAudit(post, user, churchName, "approved");
    approved.details = {
      ...approved.details,
      approvedByUserId: user.id,
      approvedByName: user.name || post.author,
      reviewedAt: new Date().toISOString(),
    };
    const result = await createChurchPost(churchId, approved, user.id || null);
    if (result.ok) {
      try {
        provisionTripChannels({
          post: result.post,
          churchId,
          creatorId: user.id || "creator",
          creatorName: user.name || post.author,
          creatorAvatar: user.avatarUrl,
          creatorRole: connectEffectiveAlphaRole(),
        });
      } catch (err) {
        console.warn("[ALPHA-084] trip channels on direct publish", err);
      }
    }
    notifyTripApprovalChanged();
    return result;
  }

  const pending = withTripAudit(post, user, churchName, "pending");
  const result = await createChurchPost(churchId, pending, user.id || null);
  notifyTripApprovalChanged();
  return { ...result, pending: result.ok };
}

export async function approveTripPost(
  churchId: string,
  postId: string,
  churchName: string,
): Promise<{ ok: boolean; error?: string }> {
  const reviewer = getCurrentUser();
  const post = await fetchChurchPostById(postId);
  if (!post || post.type !== "trip") return { ok: false, error: "الرحلة غير موجودة" };

  const ok = await patchChurchPostDetails(postId, {
    approvalStatus: "approved",
    approvedByUserId: reviewer.id,
    approvedByName: reviewer.name || "مراجع",
    reviewedAt: new Date().toISOString(),
    churchName,
  });
  if (!ok) return { ok: false, error: "تعذّر اعتماد الرحلة" };

  const fresh = await fetchChurchPostById(postId);
  if (fresh) {
    try {
      provisionTripChannels({
        post: fresh,
        churchId,
        creatorId: fresh.details?.organizerUserId || reviewer.id || "creator",
        creatorName: fresh.details?.organizerName || fresh.author,
        creatorAvatar: reviewer.avatarUrl,
        creatorRole: connectEffectiveAlphaRole(),
      });
      if (fresh.details?.organizerUserId) {
        grantSingleTripOrganizer({
          userId: fresh.details.organizerUserId,
          userName: fresh.details.organizerName || fresh.author,
          churchId,
          postId,
          grantedBy: reviewer.id || "reviewer",
          grantedByName: reviewer.name || "مراجع",
        });
      }
    } catch (err) {
      console.warn("[ALPHA-084] channels on approve", err);
    }
  }

  notifyTripApprovalChanged();
  return { ok: true };
}

export async function requestTripChanges(
  postId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const reviewer = getCurrentUser();
  const ok = await patchChurchPostDetails(postId, {
    approvalStatus: "changes_requested",
    approvalNote: note.trim() || "يرجى مراجعة التفاصيل",
    approvedByUserId: reviewer.id,
    approvedByName: reviewer.name || "مراجع",
    reviewedAt: new Date().toISOString(),
  });
  notifyTripApprovalChanged();
  return ok ? { ok: true } : { ok: false, error: "تعذّر إرسال طلب التعديل" };
}

export async function rejectTripPost(
  postId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const reviewer = getCurrentUser();
  const ok = await patchChurchPostDetails(postId, {
    approvalStatus: "rejected",
    approvalNote: note.trim() || "تم رفض الرحلة",
    approvedByUserId: reviewer.id,
    approvedByName: reviewer.name || "مراجع",
    reviewedAt: new Date().toISOString(),
  });
  expireSingleTripGrant(postId);
  notifyTripApprovalChanged();
  return ok ? { ok: true } : { ok: false, error: "تعذّر رفض الرحلة" };
}
