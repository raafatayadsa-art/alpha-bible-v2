import { useEffect, useMemo, useState } from "react";
import { subscribeAuthContext } from "@/features/auth";
import { getCurrentUser } from "@/features/church/current-user";
import {
  buildIdentityCard,
  type AlphaIdentityCard,
} from "@/features/identity/alpha-identity";

type AlphaIdentityOptions = {
  displayName?: string;
  avatarUrl?: string;
  churchName?: string;
  verified?: boolean;
};

export function useAlphaIdentity(options: AlphaIdentityOptions = {}): AlphaIdentityCard {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return subscribeAuthContext(() => setTick((n) => n + 1));
  }, []);

  return useMemo(() => {
    void tick;
    const user = getCurrentUser();
    const card = buildIdentityCard({
      userId: user.id,
      displayName: options.displayName ?? (user.name?.trim() || "مستخدم Alpha"),
      avatarUrl: options.avatarUrl ?? user.avatarUrl,
      churchName: options.churchName,
      verified: options.verified,
    });
    return card;
  }, [tick, options.displayName, options.avatarUrl, options.churchName, options.verified]);
}
