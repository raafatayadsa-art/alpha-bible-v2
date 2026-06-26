export { SmartContextCard } from "./SmartContextCard";
export { useSmartContext } from "./useSmartContext";
export { pickSmartContextCard, buildSmartContextCandidates } from "./smart-context-engine";
export {
  readTripLiveSnapshot,
  writeTripLiveSnapshot,
  markTripCompleted,
  seedRegisteredTripSnapshot,
} from "./trip-live-store";
export type {
  SmartContextCard as SmartContextCardModel,
  SmartContextKind,
  TripLivePhase,
  TripCompanionPayload,
} from "./types";
