import { ALPHA_ID_PREFIX, ALPHA_QR_SCHEME } from "@/features/identity/alpha-identity";

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/** Stable display code for a publisher page (e.g. ALPHA-P-042817). */
export function derivePublisherCode(publisherId: string): string {
  if (!publisherId?.trim()) return `${ALPHA_ID_PREFIX}-P-000000`;
  let hash = FNV_OFFSET;
  for (let i = 0; i < publisherId.length; i += 1) {
    hash ^= publisherId.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return `${ALPHA_ID_PREFIX}-P-${String((hash >>> 0) % 1_000_000).padStart(6, "0")}`;
}

/** QR payload — opens publisher page in-app or via web URL. */
export function buildPublisherQrPayload(publisherId: string): string {
  return `${ALPHA_QR_SCHEME}://publisher/${publisherId}`;
}

export function publisherPublicPath(publisherId: string): string {
  return `/publisher/${publisherId}`;
}

export function shareUrlForPublisher(publisherId: string): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${publisherPublicPath(publisherId)}`;
  }
  return publisherPublicPath(publisherId);
}
