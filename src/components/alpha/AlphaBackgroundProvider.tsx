import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ALPHA_BG_QUERY_KEY,
  ALPHA_BG_STORAGE_KEY,
  parseAlphaBackgroundVariant,
  type AlphaBackgroundVariant,
} from "./alpha-background";

type AlphaBackgroundContextValue = {
  variant: AlphaBackgroundVariant;
  setVariant: (variant: AlphaBackgroundVariant) => void;
};

const AlphaBackgroundContext = createContext<AlphaBackgroundContextValue | null>(null);

const DEFAULT_VARIANT: AlphaBackgroundVariant = "a";

function readStoredVariant(): AlphaBackgroundVariant {
  if (typeof window === "undefined") return DEFAULT_VARIANT;
  try {
    return parseAlphaBackgroundVariant(localStorage.getItem(ALPHA_BG_STORAGE_KEY)) ?? DEFAULT_VARIANT;
  } catch {
    return DEFAULT_VARIANT;
  }
}

/** Global Variant A/B/C toggle — `?alphaBg=a|b|c` overrides and persists. Default A (flat). */
export function AlphaBackgroundProvider({ children }: { children: ReactNode }) {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const queryVariant = useMemo(() => {
    const params = new URLSearchParams(search);
    return parseAlphaBackgroundVariant(params.get(ALPHA_BG_QUERY_KEY));
  }, [search]);

  const [variant, setVariantState] = useState<AlphaBackgroundVariant>(() => readStoredVariant());

  useEffect(() => {
    if (queryVariant) {
      setVariantState(queryVariant);
      try {
        localStorage.setItem(ALPHA_BG_STORAGE_KEY, queryVariant);
      } catch {
        /* ignore */
      }
    }
  }, [queryVariant]);

  const setVariant = useCallback((next: AlphaBackgroundVariant) => {
    setVariantState(next);
    try {
      localStorage.setItem(ALPHA_BG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ variant, setVariant }), [variant, setVariant]);

  return (
    <AlphaBackgroundContext.Provider value={value}>{children}</AlphaBackgroundContext.Provider>
  );
}

export function useAlphaBackgroundVariant(): AlphaBackgroundContextValue {
  const ctx = useContext(AlphaBackgroundContext);
  if (!ctx) {
    return {
      variant: DEFAULT_VARIANT,
      setVariant: () => {},
    };
  }
  return ctx;
}
