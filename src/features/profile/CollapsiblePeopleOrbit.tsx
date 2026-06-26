import { useState, type CSSProperties } from "react";
import { Users, type LucideIcon } from "lucide-react";
import { HeroLedgerStylesHost, HeroSpiritLedgerCell } from "@/components/home/hero-card-chrome";

type Person = { id: string; name: string; avatar: string };

function PersonGlowChip({ person, accent }: { person: Person; accent: string }) {
  return (
    <div className="flex w-[62px] shrink-0 flex-col items-center">
      <div
        className="relative rounded-full p-[2px]"
        style={{
          background: `linear-gradient(145deg, #fff8e8, ${accent}, #f0d78c)`,
          boxShadow: `0 0 18px ${accent}44, 0 8px 20px -10px ${accent}55`,
        }}
      >
        <img
          src={person.avatar}
          alt=""
          className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-inner"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `inset 0 0 12px ${accent}28` }}
        />
      </div>
      <span className="mt-1.5 w-full truncate text-center text-[8.5px] font-extrabold text-[#f0d78c]">
        {person.name.split(" ")[0]}
      </span>
    </div>
  );
}

export function CollapsiblePeopleOrbit({
  title,
  subtitle,
  people,
  addLabel,
  accent,
  glyph = "Ⲁ",
  icon: Icon = Users,
  onAdd,
}: {
  title: string;
  subtitle?: string;
  people: Person[];
  addLabel: string;
  accent: string;
  glyph?: string;
  icon?: LucideIcon;
  onAdd?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const preview = people[0];

  return (
    <div
      className="relative mt-3 overflow-hidden rounded-[22px] border transition-[box-shadow,border-color] duration-300"
      style={
        {
          "--orbit-accent": accent,
          borderColor: open ? `${accent}66` : "rgba(240,215,140,0.22)",
          background:
            "linear-gradient(155deg, #1a1228 0%, #2a1f45 38%, #1e1530 72%, #2d2018 100%)",
          boxShadow: open
            ? `0 24px 48px -16px rgba(0,0,0,0.62), 0 0 0 1px rgba(240,215,140,0.18), 0 0 40px ${accent}30`
            : `0 18px 40px -18px rgba(0,0,0,0.55), 0 0 0 1px rgba(240,215,140,0.12), 0 0 28px ${accent}18`,
        } as CSSProperties
      }
    >
      <HeroLedgerStylesHost />

      {/* layered atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 85% 55% at 15% 0%, ${accent}28 0%, transparent 58%), radial-gradient(ellipse 70% 50% at 92% 100%, rgba(240,215,140,0.14) 0%, transparent 55%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-2 left-3 select-none text-[64px] font-black leading-none text-white/[0.04]"
      >
        {glyph}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-4 select-none text-[10px] font-bold text-[#f0d78c]/25"
      >
        ✦
      </span>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 36px rgba(240,215,140,0.08), inset 0 0 0 1px rgba(240,215,140,0.1)",
        }}
      />

      <div className="relative z-10 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? `إخفاء ${title}` : `عرض ${title}`}
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full transition-all duration-300 active:scale-95"
            style={{
              background: `linear-gradient(145deg, rgba(255,248,232,0.95) 0%, ${accent}33 45%, ${accent}55 100%)`,
              boxShadow: open
                ? `0 0 0 3px rgba(255,255,255,0.75), 0 0 32px ${accent}66, 0 0 52px ${accent}33, inset 0 0 20px ${accent}28`
                : `0 0 0 2px rgba(255,255,255,0.85), 0 0 26px ${accent}55, 0 14px 32px -12px rgba(0,0,0,0.55), inset 0 0 16px ${accent}22`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-1 rounded-full border"
              style={{ borderColor: `${accent}55` }}
            />
            {open ? (
              <Icon className="relative z-10 h-6 w-6 text-[#f0d78c]" strokeWidth={2.2} />
            ) : preview?.avatar ? (
              <img
                src={preview.avatar}
                alt=""
                className="relative z-10 h-[62px] w-[62px] rounded-full border-[2.5px] border-white object-cover shadow-md"
              />
            ) : (
              <Icon className="relative z-10 h-6 w-6 text-[#f0d78c]" strokeWidth={2.2} />
            )}
            {!open && people.length > 0 ? (
              <span
                className="absolute -bottom-0.5 -left-0.5 z-20 grid h-[20px] min-w-[20px] place-items-center rounded-full px-1 text-[9px] font-extrabold text-white shadow-md"
                style={{
                  background: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 70%, #2a1f45))`,
                  boxShadow: `0 0 12px ${accent}66`,
                }}
              >
                {people.length}
              </span>
            ) : null}
          </button>

          <div
            className="min-w-0 flex-1 rounded-xl border px-1.5 py-1"
            style={{
              borderColor: `${accent}33`,
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(8px)",
            }}
          >
            <HeroSpiritLedgerCell
              glyph={glyph}
              label={title}
              sublabel={subtitle ?? "اضغط الدائرة للعرض"}
              value={people.length}
              accent={accent}
              variant="default"
              compact
              className="pointer-events-none w-full"
            />
          </div>
        </div>

        {open ? (
          <div
            className="mt-3 w-full overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex w-max items-start gap-3 px-1">
              {people.map((p) => (
                <PersonGlowChip key={p.id} person={p} accent={accent} />
              ))}
              <button
                type="button"
                onClick={onAdd}
                className="flex w-[62px] shrink-0 flex-col items-center active:scale-95"
              >
                <span
                  className="grid h-[58px] w-[58px] place-items-center rounded-full border-2 border-dashed text-xl font-light"
                  style={{
                    borderColor: `${accent}55`,
                    color: "#f0d78c",
                    background: "rgba(0,0,0,0.22)",
                    boxShadow: `inset 0 0 16px ${accent}18, 0 0 14px ${accent}22`,
                  }}
                >
                  +
                </span>
                <span className="mt-1.5 text-[8.5px] font-extrabold text-[#f0d78c]/85">{addLabel}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
