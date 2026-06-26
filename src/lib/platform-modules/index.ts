export type { PlatformModuleKey, PlatformModuleRow } from "./types";
export { PLATFORM_MODULE_KEYS } from "./types";
export {
  MODULE_ROUTE_PREFIXES,
  NAV_ITEM_MODULE_KEY,
  isPathModuleEnabled,
  SEARCH_SCOPE_MODULE,
  resolveModuleKeyForPath,
} from "./module-route-map";
export {
  fetchPlatformModulesPublic,
  getCachedPlatformModules,
  isModuleEnabledInList,
  notifyPlatformModulesChanged,
  patchCachedPlatformModule,
  purgeLegacyPlatformModuleCaches,
  syncPlatformModulesFromServer,
  ALWAYS_ENABLED_MODULE_KEYS,
} from "./platform-modules-client";
export { usePlatformModules } from "./usePlatformModules";
export { PlatformModuleGate } from "./PlatformModuleGate";
export { ModuleGate } from "./ModuleGate";
export { PlatformModulesBootstrap } from "./PlatformModulesBootstrap";
export {
  OWNER_MODULE_DEFAULTS,
  mergeOwnerModuleStates,
  type OwnerModuleState,
} from "./owner-module-defaults";
