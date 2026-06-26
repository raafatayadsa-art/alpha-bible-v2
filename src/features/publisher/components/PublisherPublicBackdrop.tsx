import { CopticCross, CopticWatermark } from "@/components/coptic";

/** Full-page Coptic backdrop for publisher public screens. */
export function PublisherPublicBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background: `
            linear-gradient(165deg, #faf6ee 0%, #f0e6d4 38%, #ebe0cc 62%, #f5efe4 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.45]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 15%, rgba(212, 168, 87, 0.18) 0%, transparent 42%),
            radial-gradient(circle at 82% 78%, rgba(93, 50, 145, 0.1) 0%, transparent 40%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 28px,
              rgba(184, 137, 58, 0.035) 28px,
              rgba(184, 137, 58, 0.035) 29px
            )
          `,
        }}
      />
      <CopticWatermark position="fixed" className="z-0" tone="light" />
      <CopticCross
        className="pointer-events-none fixed left-1/2 top-[22%] z-0 -translate-x-1/2 text-[var(--gold)]/[0.07]"
        size={140}
      />
      <div
        className="pointer-events-none fixed inset-x-0 top-[calc(max(env(safe-area-inset-top),14px)+2px)] z-[5] flex justify-center"
        aria-hidden
      >
        <p
          className="font-coptic text-[17px] font-bold tracking-[0.22em] text-[var(--gold-deep)]/55"
          style={{ textShadow: "0 0 24px rgba(212,168,87,0.25)" }}
        >
          ⲁⲗⲫⲁ
        </p>
      </div>
    </>
  );
}
