import { useChapterDictState } from "@/lib/chapter-dict-store";

/**
 * Tiny diagnostic pill — bottom-left, low-opacity. Shows the number of
 * unique dictionary-matched words in the currently open chapter. Updates
 * live as the chapter loads + the bulk lookup finishes.
 */
export function DictionaryDebugBadge() {
  const { count, status } = useChapterDictState();
  const label =
    status === "loading"
      ? "dict: …"
      : status === "idle"
        ? "dict: –"
        : `dict: ${count}`;

  return (
    <div
      dir="ltr"
      className="pointer-events-none fixed bottom-1 left-1 z-[9999] rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white/85 shadow-sm"
    >
      {label}
    </div>
  );
}
