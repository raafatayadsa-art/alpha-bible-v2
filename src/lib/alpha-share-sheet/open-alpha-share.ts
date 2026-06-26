import type { AlphaShareRequest } from "@/lib/alpha-share-brand";

export const ALPHA_SHARE_OPEN_EVENT = "alpha-share-open";

export type AlphaShareOpenDetail = AlphaShareRequest;

export function openAlphaShareSheet(req: AlphaShareRequest) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AlphaShareOpenDetail>(ALPHA_SHARE_OPEN_EVENT, { detail: req }));
}
