/**
 * Tiny global store for the chapter-level "matched dictionary words" count.
 *
 * Decoupled from React so the diagnostic badge (rendered at root) can read a
 * live count produced inside the chapter reader, without prop drilling.
 */
import { useSyncExternalStore } from "react";

type State = {
  count: number;
  /** "loading" while the chapter is enriching, "ready" when done. */
  status: "idle" | "loading" | "ready";
};

let state: State = { count: 0, status: "idle" };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setChapterDictState(next: Partial<State>) {
  state = { ...state, ...next };
  emit();
}

export function getChapterDictState(): State {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useChapterDictState(): State {
  return useSyncExternalStore(subscribe, getChapterDictState, getChapterDictState);
}
