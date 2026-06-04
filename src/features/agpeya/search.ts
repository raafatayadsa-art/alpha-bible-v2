import { useMemo } from "react";

/** Escape a string for safe use inside a RegExp. */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split a string around a case-insensitive query — returns alternating
 *  non-match / match segments so callers can wrap matches in <mark>. */
export interface HighlightSegment {
  text: string;
  match: boolean;
}

export function splitForHighlight(text: string, query: string): HighlightSegment[] {
  if (!query.trim()) return [{ text, match: false }];
  const re = new RegExp(escapeRegExp(query), "gi");
  const out: HighlightSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), match: false });
    out.push({ text: m[0], match: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < text.length) out.push({ text: text.slice(last), match: false });
  return out;
}

/** Count total occurrences of `query` (case-insensitive) across strings. */
export function countMatches(strings: string[], query: string): number {
  if (!query.trim()) return 0;
  const re = new RegExp(escapeRegExp(query), "gi");
  let total = 0;
  for (const s of strings) {
    const matches = s.match(re);
    if (matches) total += matches.length;
  }
  return total;
}

export function useMatchCount(strings: string[], query: string) {
  return useMemo(() => countMatches(strings, query), [strings, query]);
}
