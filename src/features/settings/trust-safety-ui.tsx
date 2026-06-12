import { type ReactNode, useState } from "react";
import {
  Check,
  ChevronDown,
  Church,
  Eye,
  FileText,
  Lock,
  MessageCircle,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react";
import { AlphaIcon3D } from "@/components/controls/AlphaIcon3D";
import { CopticCross } from "@/components/coptic";
import { cn } from "@/lib/utils";
import { useTrustContent } from "./use-trust-content";
import type { TrustContentBlock } from "./trust-safety-types";
import membershipShieldGreen from "@/assets/trust-safety/membership-shield-green-transparent.png";

const TRUST_SECTION_TITLE =
  "font-arabic-serif text-[15.5px] font-extrabold leading-snug text-[#1a6b50]";
const TRUST_SECTION_TITLE_SM =
  "font-arabic-serif text-[15px] font-extrabold leading-snug text-[#1a6b50]";

const GUARANTEE_ICONS = {
  faith: Church,
  transparency: Eye,
  privacy: Lock,
  control: SlidersHorizontal,
} as const;

const DETAIL_SECTION_ICONS = {
  rights: User,
  messages: MessageCircle,
  churches: Church,
  recovery: ShieldCheck,
  community: Users,
} as const;

const DATA_PROTECTION_ICONS = [ShieldCheck, Church, Lock, Shield] as const;

function TrustGlassCheck({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center overflow-hidden rounded-[7px] border backdrop-blur-md",
        className,
      )}
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.78) 0%, rgba(210,240,225,0.58) 45%, rgba(47,157,110,0.32) 100%)",
        borderColor: "rgba(255,255,255,0.72)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(20,90,66,0.14), 0 4px 12px -5px rgba(20,90,66,0.38)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-white/55 to-transparent"
      />
      <Check className="relative h-3.5 w-3.5 text-[#145a42]" strokeWidth={3.2} />
    </span>
  );
}

function TrustPointList({ points }: { points: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {points.map((point) => (
        <li key={point} className="flex items-start justify-start gap-2.5 text-start">
          <span className="text-[10.5px] font-medium leading-[1.6] text-[#4a3a28]">{point}</span>
          <TrustGlassCheck />
        </li>
      ))}
    </ul>
  );
}

function TrustContentBlocks({ blocks }: { blocks: readonly TrustContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div key={block.title}>
          <p className="mb-2 text-[11px] font-extrabold text-[#1a6b50]">{block.title}</p>
          <TrustPointList points={block.points} />
        </div>
      ))}
    </div>
  );
}

function TrustCard({
  children,
  className,
  accent = "#3f9d6e",
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fbf3e1]/97 to-[#f4ead8]/95 backdrop-blur-xl",
        className,
      )}
      style={{
        boxShadow: `0 16px 34px -20px rgba(120,80,30,0.42), 0 0 24px -14px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.88)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[22px] bg-gradient-to-b from-white/42 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function TrustGreenShield({
  className,
  size = "hero",
  glow = false,
}: {
  className?: string;
  size?: "hero" | "bar";
  glow?: boolean;
}) {
  const isHero = size === "hero";

  const shield = (
    <img
      src={membershipShieldGreen}
      alt=""
      decoding="async"
      className={cn(
        "relative z-[2] object-contain",
        isHero
          ? "h-auto w-full max-w-[148px] drop-shadow-[0_12px_28px_rgba(47,157,110,0.38)]"
          : "h-9 w-9 shrink-0 drop-shadow-[0_6px_14px_rgba(47,157,110,0.32)]",
        className,
      )}
    />
  );

  if (!glow) return shield;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        isHero ? "min-h-[132px] w-full" : "h-9 w-9 shrink-0",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "trust-shield-core-glow pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(62,180,130,0.55)_0%,rgba(47,157,110,0.2)_42%,transparent_72%)]",
          isHero ? "inset-[2%]" : "inset-[-40%]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "trust-shield-radiate pointer-events-none absolute rounded-full border border-[#5fd4a8]/25",
          isHero ? "inset-[6%]" : "inset-[-18%]",
          "bg-[radial-gradient(circle,rgba(79,212,168,0.28)_0%,transparent_68%)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "trust-shield-radiate trust-shield-radiate-delay pointer-events-none absolute rounded-full border border-[#3f9d6e]/15",
          isHero ? "inset-[14%]" : "inset-[-8%]",
          "bg-[radial-gradient(circle,rgba(47,157,110,0.22)_0%,transparent_70%)]",
        )}
      />
      {shield}
    </div>
  );
}

function ProtectionRing({ value = 100 }: { value?: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[48px] w-[48px] shrink-0">
      <svg className="h-[48px] w-[48px] -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#e0efe7" strokeWidth="3.5" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#2f9d6e"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold tabular-nums text-[#1a6b50]">
        {value}%
      </span>
    </div>
  );
}

function TrustSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 text-[10px] font-extrabold tracking-[0.06em] text-[#1a6b50]">{children}</p>
  );
}

export function TrustSafetyHeroCard() {
  const content = useTrustContent();

  return (
    <TrustCard accent="#3f9d6e" className="mb-3">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1 text-start">
          <h2 className="font-arabic-serif text-[16px] font-extrabold leading-[1.45] text-[#1a6b50]">
            {content.hero.title}
          </h2>
          <p className="mt-2 text-[11.5px] font-medium leading-[1.65] text-[#6a543a]">
            {content.hero.summary}
          </p>
        </div>

        <div className="w-[36%] max-w-[140px] shrink-0">
          <TrustGreenShield size="hero" glow />
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#d8efe4]/90 bg-[#f4fbf7]/95 px-3.5 py-2">
        <ProtectionRing value={100} />
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <p className="text-[12px] font-extrabold text-[#1a6b50]">{content.hero.protectionLevel}</p>
          <TrustGreenShield size="bar" glow />
        </div>
      </div>
    </TrustCard>
  );
}

export function TrustSafetyFeatureGrid() {
  const content = useTrustContent();
  const [activeId, setActiveId] = useState(content.guarantees[0]?.id ?? "faith");
  const active = content.guarantees.find((g) => g.id === activeId) ?? content.guarantees[0];
  const ActiveIcon = GUARANTEE_ICONS[active.id];

  return (
    <TrustCard accent={active.accent} className="mb-3">
      <div className="px-4 pb-3 pt-4">
        <TrustSectionLabel>{content.guaranteesLabel}</TrustSectionLabel>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">
          {content.guaranteesIntro}
        </p>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3.5 pb-3">
        {content.guarantees.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition-all duration-300",
                isActive
                  ? "border-[#3f9d6e]/40 bg-gradient-to-l from-[#2f9d6e] to-[#45b888] text-white shadow-[0_8px_20px_-10px_rgba(47,157,110,0.55)]"
                  : "border-[#efe2c4]/90 bg-white/55 text-[#6a543a] hover:bg-white/80",
              )}
            >
              {item.tab}
            </button>
          );
        })}
      </div>

      <div
        key={active.id}
        className="mx-3.5 mb-4 animate-in fade-in slide-in-from-bottom-1 duration-300 rounded-[18px] border border-[#efe2c4]/75 bg-white/50 px-4 py-4 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <AlphaIcon3D color={active.accent} size={52} isOpen>
            <ActiveIcon className="h-[22px] w-[22px]" style={{ color: active.accent }} strokeWidth={2.4} />
          </AlphaIcon3D>
          <div className="min-w-0 flex-1 text-start">
            <h3 className={TRUST_SECTION_TITLE_SM}>
              {active.title}
            </h3>
            <p className="mt-1.5 text-[11px] font-medium leading-[1.65] text-[#6a543a]">{active.summary}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {active.points.map((point) => (
            <li key={point} className="flex items-start justify-start gap-2.5 text-start">
              <span className="text-[10.5px] font-medium leading-[1.6] text-[#4a3a28]">{point}</span>
              <TrustGlassCheck />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[14px] border border-[#d8efe4]/90 bg-[#f4fbf7]/90 px-3 py-2.5">
          <span className="text-[13px] font-extrabold tabular-nums text-[#1a6b50]">{active.metricValue}</span>
          <span className="text-[11px] font-bold text-[#3a2a18]">{active.metric}</span>
        </div>
      </div>
    </TrustCard>
  );
}

export function TrustDataProtectionSection() {
  const content = useTrustContent();
  const [open, setOpen] = useState(true);

  return (
    <TrustCard accent="#3f9d6e" className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-[18px] text-start transition active:scale-[0.99]"
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[#3f9d6e] transition-transform duration-300",
            open && "rotate-180",
          )}
        />
        <div className="min-w-0 flex-1">
          <h2 className={TRUST_SECTION_TITLE}>{content.dataProtection.title}</h2>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">
            {content.dataProtection.subtitle}
          </p>
        </div>
        <AlphaIcon3D color="#3f9d6e" size={52} isOpen={open}>
          <Shield className="h-[22px] w-[22px] text-[#3f9d6e]" strokeWidth={2.4} />
        </AlphaIcon3D>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-3">
            {content.dataProtection.summary.map((item, index) => {
              const Icon = DATA_PROTECTION_ICONS[index] ?? Shield;
              return (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[#e2f0e9]/90 bg-white/55 px-3 py-3 text-start backdrop-blur-sm"
                >
                  <div className="mb-2 flex justify-start">
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8efe4] bg-[#edf8f2]">
                      <Icon className="h-4 w-4 text-[#2f9d6e]" strokeWidth={2.3} />
                    </div>
                  </div>
                  <p className="text-[11.5px] font-extrabold text-[#2a1f12]">{item.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#6a543a]">{item.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="mx-3.5 mb-3 rounded-[16px] border border-[#e2f0e9]/90 bg-white/55 px-3.5 py-3.5 text-start backdrop-blur-sm">
            <p className="mb-2.5 text-[11px] font-extrabold text-[#1a6b50]">{content.dataProtection.detailsTitle}</p>
            <TrustPointList points={content.dataProtection.detailsPoints} />
          </div>

          <button
            type="button"
            className="mx-3.5 mb-4 flex w-[calc(100%-1.75rem)] items-center justify-center gap-2 rounded-[14px] border border-[#c8e8d8] bg-gradient-to-l from-[#e8f7ef] to-[#f4fbf7] py-3 text-[12px] font-extrabold text-[#1a6b50] shadow-[0_8px_18px_-14px_rgba(47,157,110,0.35)] transition active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" />
            {content.dataProtection.readFullDetails}
          </button>
        </div>
      </div>
    </TrustCard>
  );
}

function TrustSectionCard({
  id,
  title,
  description,
  accent,
  blocks,
  isOpen,
  onToggle,
}: {
  id: string;
  title: string;
  description: string;
  accent: string;
  blocks: readonly TrustContentBlock[];
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  const Icon = DETAIL_SECTION_ICONS[id as keyof typeof DETAIL_SECTION_ICONS] ?? Shield;

  return (
    <TrustCard accent={accent} className="mb-2.5">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3.5 px-4 py-[18px] text-start transition active:scale-[0.985]"
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[#c9a05a] transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
        <div className="min-w-0 flex-1">
          <h2 className={TRUST_SECTION_TITLE}>{title}</h2>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">{description}</p>
        </div>
        <AlphaIcon3D color={accent} size={52} isOpen={isOpen}>
          <Icon className="h-[22px] w-[22px]" style={{ color: accent }} strokeWidth={2.4} />
        </AlphaIcon3D>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#efe2c4]/70 px-4 py-3.5">
            <TrustContentBlocks blocks={blocks} />
          </div>
        </div>
      </div>
    </TrustCard>
  );
}

export function TrustSafetySectionList() {
  const content = useTrustContent();
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="mt-1">
      <div className="mb-2.5 px-1 pb-2 pt-1">
        <TrustSectionLabel>{content.detailSectionsLabel}</TrustSectionLabel>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">
          {content.detailSectionsIntro}
        </p>
      </div>
      {content.detailSections.map((section) => (
        <TrustSectionCard
          key={section.id}
          id={section.id}
          title={section.title}
          description={section.description}
          accent={section.accent}
          blocks={section.blocks}
          isOpen={openSection === section.id}
          onToggle={(id) => setOpenSection((prev) => (prev === id ? null : id))}
        />
      ))}
    </div>
  );
}

export function TrustSafetyFooter() {
  const content = useTrustContent();

  return (
    <TrustCard accent="#3f9d6e" className="mt-6">
      <div className="relative px-5 py-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-3 h-16 rounded-full bg-[radial-gradient(circle,rgba(47,157,110,0.12)_0%,transparent_72%)]"
        />
        <div className="relative mx-auto mb-3 flex items-center justify-center gap-2 text-[#b8893a]">
          <span className="text-[13px] font-bold">Ⲁ</span>
          <CopticCross size={16} className="text-[#b8893a]" />
          <span className="text-[13px] font-bold">Ⲱ</span>
        </div>
        <div
          aria-hidden
          className="mx-auto mb-3 h-px w-24 bg-gradient-to-l from-transparent via-[#3f9d6e]/45 to-transparent"
        />
        <p className="font-arabic-serif text-[13.5px] font-extrabold leading-[1.75] text-[#2a1f12]">
          {content.footer.commitment}
        </p>
        <p className="mt-3 font-arabic-serif text-[12px] font-semibold leading-[1.7] text-[#6a543a]">
          {content.footer.goal}
        </p>
        <p className="mt-3 text-[11px] font-bold tracking-wide text-[#1a6b50]">{content.footer.tagline}</p>
      </div>
    </TrustCard>
  );
}
