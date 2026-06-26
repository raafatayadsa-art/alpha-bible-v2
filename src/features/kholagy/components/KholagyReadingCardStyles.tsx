/** Shared reading-card styles — golden frame glow only on the centered (active) card. */
export function KholagyReadingCardStyles() {
  return (
    <style>{`
      @keyframes kholagyVerseGlowActive {
        0%, 100% {
          box-shadow:
            0 0 0 2px color-mix(in srgb, var(--kg-glow) 72%, transparent),
            0 0 22px color-mix(in srgb, var(--kg-glow) 38%, transparent),
            0 14px 28px -16px rgba(120, 80, 20, 0.22),
            inset 0 1px 0 rgba(255, 248, 220, 0.65);
        }
        50% {
          box-shadow:
            0 0 0 2.5px color-mix(in srgb, var(--kg-glow) 88%, transparent),
            0 0 34px color-mix(in srgb, var(--kg-glow) 52%, transparent),
            0 18px 36px -12px rgba(120, 80, 20, 0.3),
            inset 0 1px 0 rgba(255, 248, 220, 0.82);
        }
      }
      .kholagy-verse-card {
        box-shadow:
          0 10px 22px -18px rgba(90, 50, 120, 0.16),
          inset 0 1px 0 rgba(255, 255, 255, 0.42);
        transition: box-shadow 0.4s ease, border-color 0.4s ease, opacity 0.35s ease;
      }
      .kholagy-verse-card:not(.kholagy-verse-card--active) {
        opacity: 0.88;
      }
      .kholagy-verse-card--active {
        opacity: 1;
        animation: kholagyVerseGlowActive 2.6s ease-in-out infinite;
      }
      .kholagy-reader-sections {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .kholagy-verse-columns {
        width: 100%;
        min-width: 0;
        grid-template-columns: repeat(var(--kg-cols, 1), minmax(0, 1fr));
      }
      .kholagy-text-cop {
        overflow-wrap: anywhere;
        word-break: break-word;
        line-break: auto;
      }
    `}</style>
  );
}
