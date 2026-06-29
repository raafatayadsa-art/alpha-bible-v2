import { useEffect } from "react";
import { ensureProfileRegistryReset } from "./profile-registry-reset";

/** Clears legacy profile people registry once per device version. */
export function ProfileRegistryBootstrap() {
  useEffect(() => {
    ensureProfileRegistryReset();
  }, []);
  return null;
}
