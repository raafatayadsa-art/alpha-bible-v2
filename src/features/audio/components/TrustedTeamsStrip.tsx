import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { PublisherRecord } from "@/features/publisher/types";
import cardChurch from "@/assets/home/card-church.jpg";
import { SectionHeader } from "./SectionHeader";

type Props = {
  teams: PublisherRecord[];
};

export function TrustedTeamsStrip({ teams }: Props) {
  if (!teams.length) return null;

  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="فرق وكورالات موثوقة" />

      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
        {teams.map((team) => {
          const logo = team.logoUrl?.trim() || cardChurch;
          return (
            <Link
              key={team.id}
              to="/publisher/$publisherId"
              params={{ publisherId: team.id }}
              className="group flex w-[88px] shrink-0 snap-start flex-col items-center gap-2 text-center"
            >
              <div className="relative">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-[var(--gold)]/35 shadow-[0_8px_24px_-8px_rgba(140,100,40,0.45)]">
                  <img src={logo} alt="" className="h-full w-full object-cover transition group-active:scale-95" />
                </div>
                {team.isTrusted ? (
                  <span className="absolute -bottom-0.5 -left-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#5D3291] text-white ring-2 ring-[var(--ivory)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-[11px] font-extrabold leading-tight text-foreground">{team.name}</p>
              <p className="text-[9px] font-bold text-muted-foreground">
                {team.followerCount.toLocaleString("ar-EG")} متابع
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
