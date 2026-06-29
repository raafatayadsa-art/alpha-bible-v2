/**
 * Dictionary word highlight — emerald/mint accent meaning "this word has an explanation".
 * Style lives in src/styles.css under `.dictionary-highlight` so light and dark
 * (spiritual / dark-reader) variants stay in one place.
 */
export type HighlightKind = "person" | "place" | "prophecy" | "symbol" | "concept";

export function HighlightedWord({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  /** Legacy — kept for API compatibility, no longer drives color. */
  kind?: HighlightKind;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className="dictionary-highlight inline align-baseline"
    >
      {children}
    </button>
  );
}
