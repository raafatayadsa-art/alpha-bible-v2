import { Users } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";

type Person = { name: string; avatar: string };

function AvatarChip({ person, accent }: { person: Person; accent: string }) {
  return (
    <div
      className="relative shrink-0 rounded-full border-[1.5px] p-[1.5px]"
      style={{ borderColor: accent }}
    >
      <img
        src={person.avatar}
        alt=""
        className="h-9 w-9 rounded-full border border-white/20 object-cover"
      />
    </div>
  );
}

export function ProfileAvatarRow({
  title,
  subtitle,
  people,
  addLabel,
  accent,
  glyph = "Ⲁ",
}: {
  title: string;
  subtitle?: string;
  people: Person[];
  addLabel: string;
  accent: string;
  glyph?: string;
}) {
  const shown = people.slice(0, 5);
  const extra = people.length - shown.length;

  return (
    <div
      className="relative mt-3 overflow-hidden rounded-[20px] border px-4 py-3"
      style={{
        borderColor: `${accent}33`,
        background: "linear-gradient(155deg, rgba(26,16,8,0.92) 0%, rgba(30,20,12,0.88) 100%)",
        boxShadow: "0 16px 32px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      dir="rtl"
    >
      <HeroLedgerStylesHost />

      <div className="flex flex-col items-end text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span aria-hidden className="hero-ledger-glyph-gold select-none text-[14px] font-black leading-none">
            {glyph}
          </span>
          <p className="text-[13px] font-extrabold text-white/90">{title}</p>
        </div>
        {subtitle ? (
          <p className="mt-0.5 text-[10px] font-medium text-white/45">{subtitle}</p>
        ) : null}

        <div className="mt-2.5 flex items-center justify-end" style={{ direction: "ltr" }}>
          {shown.map((p, i) => (
            <div key={`${p.name}-${i}`} style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: shown.length - i }}>
              <AvatarChip person={p} accent={accent} />
            </div>
          ))}
          {extra > 0 ? (
            <span
              className="ms-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white"
              style={{
                marginLeft: "-8px",
                background: accent,
                border: `1.5px solid ${accent}`,
              }}
            >
              +{extra}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-extrabold active:scale-[0.98] transition-transform"
          style={{
            borderColor: `${accent}33`,
            background: "rgba(0,0,0,0.28)",
            color: "#f0d78c",
          }}
        >
          <Users className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={2.2} />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
