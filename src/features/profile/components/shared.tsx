import { CopticCross } from "@/components/coptic";

export function ProfileSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-7 ${className}`}>
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <CopticCross className="text-[#b8893a]" size={13} />
        <h2 className="text-[14px] font-extrabold text-[#3a2a18]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ProfileGlassCard({
  children,
  className = "",
  accent = "#b8893a",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative rounded-[22px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 backdrop-blur-xl overflow-hidden ${className}`}
      style={{
        boxShadow: `0 16px 32px -20px rgba(120,80,30,0.45), 0 0 0 1px rgba(255,255,255,0.5) inset, inset 0 1px 0 rgba(255,255,255,0.75)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[22px]"
        style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ProfileGoldButton({
  children,
  onClick,
  to,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
}) {
  const cls =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-extrabold text-white transition active:scale-[0.98] " +
    "bg-gradient-to-l from-[#b8893a] to-[#c79356] shadow-[0_8px_18px_-10px_rgba(184,137,58,0.55)] " +
    className;

  if (to) {
    return (
      <a href={to} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
