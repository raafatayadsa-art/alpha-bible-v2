import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isOwnerSessionActive } from "./owner-access-store";

/** Blocks platform routes unless Owner PIN session is active. */
export function PlatformAccessGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const allowed = isOwnerSessionActive();

  useEffect(() => {
    if (!allowed) {
      navigate({ to: "/settings", replace: true });
    }
  }, [allowed, navigate]);

  if (!allowed) return null;
  return <>{children}</>;
}
