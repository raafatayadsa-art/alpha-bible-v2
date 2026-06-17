/**
 * ALPHA-076 — Alpha Digital Identity System
 * Phone-independent permanent user identity + QR deep links.
 */

export const ALPHA_ID_PREFIX = "ALPHA";
export const ALPHA_QR_SCHEME = "alpha";

export type AlphaDeepLinkKind = "member" | "id" | "group" | "church" | "conference" | "channel";

export type AlphaDeepLink = {
  kind: AlphaDeepLinkKind;
  code: string;
};

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/** Stable permanent Alpha ID from auth user id (UUID). Same device/account → same ID. */
export function deriveAlphaId(userId: string): string {
  if (!userId?.trim()) return `${ALPHA_ID_PREFIX}-GUEST`;
  let hash = FNV_OFFSET;
  for (let i = 0; i < userId.length; i += 1) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  const n = (hash >>> 0) % 1_000_000;
  return `${ALPHA_ID_PREFIX}-${String(n).padStart(6, "0")}`;
}

/** Compact alternate form (e.g. A-7KX92M) — derived from same hash, display-only. */
export function deriveAlphaIdShort(userId: string): string {
  const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  if (!userId?.trim()) return "A-GUEST";
  let hash = FNV_OFFSET;
  for (let i = 0; i < userId.length; i += 1) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  let code = "";
  let h = hash >>> 0;
  for (let i = 0; i < 6; i += 1) {
    code = alphabet[h % 32]! + code;
    h = Math.floor(h / 32);
  }
  return `A-${code}`;
}

/** @deprecated Use deriveAlphaId — kept for gradual UI migration */
export const formatMembershipNo = deriveAlphaId;

export function buildMemberQrPayload(alphaId: string): string {
  return `${ALPHA_QR_SCHEME}://member/${alphaId}`;
}

/** Plain Alpha ID in QR — scannable by any camera and in-app scanner. */
export function getIdentityQrValue(alphaId: string): string {
  return alphaId.trim().toUpperCase();
}

/** Canonical identity QR (ALPHA-076) */
export function buildIdentityQrPayload(alphaId: string): string {
  return `${ALPHA_QR_SCHEME}://id/${alphaId}`;
}

export function buildGroupQrPayload(groupCode: string): string {
  return `${ALPHA_QR_SCHEME}://group/${groupCode}`;
}

export function buildChannelQrPayload(channelCode: string): string {
  return `${ALPHA_QR_SCHEME}://channel/${channelCode}`;
}

export function deriveChannelCode(channelId: string): string {
  return deriveGroupCode(channelId);
}

export function deriveGroupCode(groupId: string): string {
  if (!groupId?.trim()) return `${ALPHA_ID_PREFIX}-G-000000`;
  let hash = FNV_OFFSET;
  for (let i = 0; i < groupId.length; i += 1) {
    hash ^= groupId.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return `${ALPHA_ID_PREFIX}-G-${String((hash >>> 0) % 1_000_000).padStart(6, "0")}`;
}

export function parseAlphaDeepLink(raw: string): AlphaDeepLink | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith(`${ALPHA_QR_SCHEME}://`)) {
      const url = new URL(trimmed);
      const kind = url.hostname as AlphaDeepLinkKind;
      const code = url.pathname.replace(/^\//, "") || url.host;
      if (!code) return null;
      if (["member", "id", "group", "church", "conference", "channel"].includes(kind)) {
        return { kind, code: decodeURIComponent(code) };
      }
    }
  } catch {
    /* fall through */
  }

  const legacy = trimmed.match(/^(ALPHA-[A-Z0-9-]+|A-[A-Z0-9]+)$/i);
  if (legacy) return { kind: "id", code: legacy[1]!.toUpperCase() };

  return null;
}

export function buildQrImageUrl(payload: string, opts?: { size?: number; dark?: string; light?: string }): string {
  const size = opts?.size ?? 200;
  const bgcolor = (opts?.light ?? "ffffff").replace("#", "");
  const color = (opts?.dark ?? "1a1208").replace("#", "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=H&margin=${size >= 400 ? 2 : 0}&bgcolor=${bgcolor}&color=${color}&data=${encodeURIComponent(payload)}`;
}

export type AlphaIdentityCard = {
  alphaId: string;
  alphaIdShort: string;
  displayName: string;
  avatarUrl?: string;
  churchName?: string;
  verified: boolean;
  qrPayload: string;
};

export function buildIdentityCard(input: {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  churchName?: string;
  verified?: boolean;
}): AlphaIdentityCard {
  const alphaId = deriveAlphaId(input.userId);
  return {
    alphaId,
    alphaIdShort: deriveAlphaIdShort(input.userId),
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    churchName: input.churchName,
    verified: input.verified ?? false,
    qrPayload: getIdentityQrValue(deriveAlphaIdShort(input.userId)),
  };
}
