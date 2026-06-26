/**
 * @deprecated Legacy standalone messaging UI removed.
 * All messaging routes redirect to `/alpha-connect`.
 * Kept as a stub so stale imports fail visibly during migration cleanup.
 */
export function AlphaMessagingSystem(): null {
  return null;
}

/** @deprecated Use `buildAlphaConnectChatSearch` from `@/features/alpha-connect/alpha-connect-nav`. */
export function navigateToAlphaChat(): never {
  throw new Error("Legacy messaging removed — use Alpha Connect (/alpha-connect).");
}
