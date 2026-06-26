export function BooksPremiumStyles() {
  return (
    <style>{`
      @keyframes booksPremiumHeroPulse {
        0%, 100% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 1px rgba(212,175,55,0.2), 0 14px 32px -14px rgba(70,55,30,0.14);
        }
        50% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.98), 0 0 0 1px rgba(212,175,55,0.42), 0 0 28px rgba(212,175,55,0.16), 0 18px 40px -12px rgba(70,55,30,0.18);
        }
      }
      @keyframes booksPremiumHeroPulseNt {
        0%, 100% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 1px rgba(61,90,154,0.22), 0 14px 32px -14px rgba(30,43,84,0.12);
        }
        50% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.98), 0 0 0 1px rgba(61,90,154,0.45), 0 0 28px rgba(61,90,154,0.18), 0 18px 40px -12px rgba(30,43,84,0.16);
        }
      }
      @keyframes booksTabGoldPulse {
        0%, 100% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(30,43,84,0.35), 0 0 0 1px rgba(212,175,55,0.35), 0 0 16px rgba(212,175,55,0.12);
        }
        50% {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.32), 0 14px 28px -8px rgba(212,175,55,0.28), 0 0 0 2px rgba(240,215,140,0.55), 0 0 32px rgba(212,175,55,0.22);
        }
      }
      @keyframes booksCardSpotPulse {
        0%, 100% {
          box-shadow: 0 0 0 1px rgba(212,175,55,0.25), 0 12px 28px -12px rgba(70,55,30,0.14);
        }
        50% {
          box-shadow: 0 0 0 2px rgba(231,201,122,0.55), 0 0 24px rgba(212,175,55,0.2), 0 16px 36px -10px rgba(70,55,30,0.16);
        }
      }
      @keyframes booksStarTwinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.75; transform: scale(1.4); }
      }
      @keyframes booksOrbFloat {
        0%, 100% { transform: translateY(0); opacity: 0.35; }
        50% { transform: translateY(-4px); opacity: 0.65; }
      }
      .books-premium-hero--ot { animation: booksPremiumHeroPulse 3.8s ease-in-out infinite; }
      .books-premium-hero--nt { animation: booksPremiumHeroPulseNt 3.8s ease-in-out infinite; }
      .books-tab-chip--active { animation: booksTabGoldPulse 2s ease-in-out infinite; }
      .books-card-spotlight { animation: booksCardSpotPulse 2.8s ease-in-out infinite; }
      .books-star-twinkle { animation: booksStarTwinkle 3.4s ease-in-out infinite; }
      .books-orb-float { animation: booksOrbFloat 4.2s ease-in-out infinite; }
    `}</style>
  );
}
