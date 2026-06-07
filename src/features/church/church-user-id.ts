export { getAuthUserId as getResidentUserId } from "@/features/auth";

export function readSetupRequestIdFromHub(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ab:church-hub");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { request?: { setupRequestId?: string } };
    return parsed.request?.setupRequestId ?? null;
  } catch {
    return null;
  }
}
