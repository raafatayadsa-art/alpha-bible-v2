import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAuthenticated } from "@/features/church/current-user";
import {
  USER_SYNC_STATUS_EVENT,
  type UserSyncStatus,
} from "@/lib/user-progress-sync-types";

/** Subtle sync indicator + error toast for cross-device sync. */
export function AlphaUserSyncStatus() {
  const [status, setStatus] = useState<UserSyncStatus>("idle");
  const authed = isAuthenticated();

  useEffect(() => {
    const onStatus = (e: Event) => {
      const detail = (e as CustomEvent<{ status: UserSyncStatus; message?: string }>).detail;
      if (!detail?.status) return;
      setStatus(detail.status);
      if (detail.status === "error" && detail.message) {
        toast.error("مزامنة البيانات", { description: detail.message, duration: 3500 });
      }
    };
    window.addEventListener(USER_SYNC_STATUS_EVENT, onStatus);
    return () => window.removeEventListener(USER_SYNC_STATUS_EVENT, onStatus);
  }, []);

  if (!authed || status === "idle" || status === "synced") return null;

  const label =
    status === "syncing" ? "جاري المزامنة…"
    : status === "offline" ? "بدون اتصال"
    : status === "error" ? "خطأ في المزامنة"
    : "";

  if (!label) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(var(--alpha-dock-height,72px)+12px)] start-3 z-[85] rounded-full border px-3 py-1 text-[10px] font-extrabold backdrop-blur-md"
      style={{
        borderColor:
          status === "error" ? "rgba(239,68,68,0.45)"
          : status === "syncing" ? "rgba(231,201,122,0.45)"
          : "rgba(255,255,255,0.2)",
        background: "rgba(0,0,0,0.55)",
        color: status === "error" ? "#fca5a5" : "#f0d78c",
      }}
    >
      {label}
    </div>
  );
}
