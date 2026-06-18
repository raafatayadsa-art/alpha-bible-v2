import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  KATAMEROS_CURVE_QUERY_KEY,
  parseKatamerosCurveVariant,
  type KatamerosCurvePreviewVariant,
} from "./katameros-curve-preview";

/** Returns preview variant when `?katamerosBg=a|b|c` is present; otherwise null (production). */
export function useKatamerosCurvePreview(): KatamerosCurvePreviewVariant | null {
  const search = useRouterState({ select: (s) => s.location.searchStr });

  return useMemo(() => {
    const params = new URLSearchParams(search);
    return parseKatamerosCurveVariant(params.get(KATAMEROS_CURVE_QUERY_KEY));
  }, [search]);
}
