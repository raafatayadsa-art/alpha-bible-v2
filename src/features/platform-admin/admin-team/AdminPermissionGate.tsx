import type { ReactNode } from "react";
import { isPlatformOwnerSync } from "@/features/auth";
import { isOwnerSessionActive } from "../owner-access-store";
import { useAdminPermissions } from "./useAdminPermissions";
import type { AdminPermissionKey } from "./permissions";

export function AdminPermissionGate({
  permission,
  children,
}: {
  permission: AdminPermissionKey | AdminPermissionKey[];
  children: ReactNode;
}) {
  const { has, loading, isHiddenOwner } = useAdminPermissions();
  const ownerBypass = isPlatformOwnerSync() || isOwnerSessionActive();
  if (loading && !ownerBypass) return null;
  if (isHiddenOwner || ownerBypass) return <>{children}</>;
  const allowed = Array.isArray(permission)
    ? permission.some((p) => has(p))
    : has(permission);
  if (!allowed) return null;
  return <>{children}</>;
}
