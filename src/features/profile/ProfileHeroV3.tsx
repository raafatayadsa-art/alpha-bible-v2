import { useRouter } from "@tanstack/react-router";
import { ChevronRight, UserPen } from "lucide-react";
import { AlphaShield, type ShieldProfileInfo, type ShieldRole } from "@/components/alpha/AlphaShield";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { useResolvedTheme } from "@/lib/alpha-theme";
import { cn } from "@/lib/utils";
import heroChurchPremium from "@/assets/home/hero-church-premium.jpg";

function ProfileStatCell({
  glyph,
  value,
  label,
  accent,
  isDark,
}: {
  glyph: string;
  value: string;
  label: string;
  accent: string;
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2.5",
        isDark
          ? "border border-alpha-gold-bright/14 bg-gradient-to-b from-alpha-gold-bright/[0.04] to-black/50"
          : "border border-alpha bg-alpha-surface shadow-[var(--alpha-shadow-mini)]",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden
          className={cn(
            "select-none text-[18px] font-black leading-none",
            isDark ? "hero-ledger-glyph-gold" : "text-alpha-glyph",
          )}
        >
          {glyph}
        </span>
        <span
          className={cn(
            "text-[14px] font-black tabular-nums leading-none",
            isDark ? "text-white" : "text-alpha-heading",
          )}
        >
          {value}
        </span>
      </div>
      <p className="alpha-type-caption font-extrabold leading-none" style={{ color: accent }}>
        {label}
      </p>
    </div>
  );
}

type Props = {
  name: string;
  avatarUrl: string;
  verified: boolean;
  shieldRole: ShieldRole | null;
  churchName: string;
  diocese?: string | null;
  joinLabel: string | null;
  tripCount: number;
  familyCount: number;
  memberMonths: number | null;
  coverUrl?: string | null;
  hideTopBar?: boolean;
  alphaId?: string;
  bio?: string | null;
  birthDate?: string | null;
  /** Shown directly under display name — e.g. المؤسس */
  identityLabel?: string | null;
  showChurch?: boolean;
  showStatsLedger?: boolean;
  showTripStat?: boolean;
  showFamilyStat?: boolean;
  shieldProfileInfo?: ShieldProfileInfo;
};

export function ProfileHeroV3({
  name,
  avatarUrl,
  verified,
  shieldRole,
  churchName,
  diocese,
  joinLabel,
  tripCount,
  familyCount,
  memberMonths,
  coverUrl,
  hideTopBar = false,
  alphaId,
  bio,
  birthDate,
  identityLabel,
  showChurch = true,
  showStatsLedger = true,
  showTripStat = true,
  showFamilyStat = true,
  shieldProfileInfo,
}: Props) {
  const { goBack } = useAlphaNavigation();
  const router = useRouter();
  const isDark = useResolvedTheme() === "dark";
  const cover = coverUrl?.trim() || heroChurchPremium;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      goBack();
      return;
    }
    void router.navigate({ to: "/" });
  };

  const monthsLabel = memberMonths != null && memberMonths > 0 ? String(memberMonths) : "—";

  return (
    <section className="relative overflow-hidden rounded-b-[28px] bg-alpha-base">
      <HeroLedgerStylesHost />

      {/* Cover — compact crop, seamless fade into page */}
      <div className="relative h-[118px] w-full overflow-hidden">
        <img
          src={cover}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-[center_28%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg,rgba(8,4,2,0.4) 0%,rgba(8,4,2,0.12) 42%,var(--alpha-bg-base) 100%)"
              : "linear-gradient(180deg,rgba(58,42,24,0.28) 0%,rgba(244,234,216,0.35) 55%,var(--alpha-bg-base) 100%)",
          }}
        />
        {!hideTopBar ? (
          <div className="relative z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="رجوع"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border shadow-sm backdrop-blur-xl active:scale-95 transition-transform",
                isDark
                  ? "border-white/20 bg-black/35 text-white"
                  : "border-alpha bg-alpha-surface text-alpha",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="w-10" aria-hidden />
          </div>
        ) : null}
      </div>

      {/* Avatar + identity — overlaps cover, no gap */}
      <div className="relative z-10 -mt-9 px-4 pb-3" dir="rtl">
        <div className="flex flex-col items-center text-center">
          <div
            className="relative aspect-square w-[80px] rounded-full p-[3px]"
            style={{
              background:
                "linear-gradient(145deg, #fff8e8 0%, #f0d78c 22%, #d4af37 48%, #f0d78c 62%, #a8761e 100%)",
              boxShadow: isDark
                ? "0 0 0 1px rgba(255,255,255,0.55) inset, 0 16px 36px -14px rgba(0,0,0,0.65), 0 0 24px rgba(240,215,140,0.28)"
                : "0 0 0 1px rgba(255,255,255,0.85) inset, 0 12px 28px -12px rgba(120,80,30,0.28)",
            }}
          >
            <div className="h-full w-full overflow-hidden rounded-full border-[2.5px] border-white bg-[#2a1f45] shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover object-center" />
              ) : (
                <span className="grid h-full w-full place-items-center text-[28px] font-extrabold text-alpha-gold-bright">
                  {name.charAt(0)}
                </span>
              )}
            </div>
            {verified && shieldRole ? (
              <span className="absolute -bottom-0.5 -left-0.5 z-10 scale-[0.92]">
                <AlphaShield
                  role={shieldRole}
                  size="md"
                  userName={name}
                  userAvatar={avatarUrl}
                  profileInfo={shieldProfileInfo}
                />
              </span>
            ) : null}
          </div>

          <h1
            className={cn(
              "mt-2 font-arabic-serif text-[20px] font-extrabold leading-tight",
              isDark ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "text-alpha-heading",
            )}
          >
            {name}
          </h1>
          {identityLabel?.trim() ? (
            <p
              className={cn(
                "mt-0.5 text-[12px] font-extrabold tracking-wide",
                isDark ? "text-alpha-gold-bright" : "text-alpha-gold-deep",
              )}
            >
              {identityLabel.trim()}
            </p>
          ) : null}
          <p className={cn("mt-1 text-[11.5px] font-bold", isDark ? "text-white/65" : "text-alpha-muted")}>
            {showChurch
              ? diocese?.trim() && diocese !== "—"
                ? `عضو · ${churchName} · ${diocese.trim()}`
                : `عضو · ${churchName}`
              : "عضو في Alpha"}
          </p>
          {alphaId ? (
            <p
              className={cn(
                "mt-1 font-mono text-[10px] font-bold tracking-wide",
                isDark ? "text-alpha-gold-bright/80" : "text-alpha-glyph",
              )}
            >
              {alphaId}
            </p>
          ) : null}
          {bio?.trim() ? (
            <p
              className={cn(
                "mt-2 max-w-[300px] text-[12px] leading-relaxed line-clamp-3",
                isDark ? "text-white/72" : "text-alpha-muted",
              )}
            >
              {bio.trim()}
            </p>
          ) : null}
          {birthDate?.trim() ? (
            <p className={cn("mt-1 text-[11px] font-bold", isDark ? "text-[#f0d78c]/75" : "text-alpha-muted")}>
              {birthDate.trim()}
            </p>
          ) : null}
          {joinLabel ? (
            <p className={cn("mt-1 text-[10px] font-semibold", isDark ? "text-[#f0d78c]/60" : "text-alpha-heading-muted")}>
              {joinLabel}
            </p>
          ) : null}
        </div>

        {showStatsLedger ? (
          <div
            className={cn(
              "mt-3 flex items-stretch gap-1.5 rounded-[14px] p-1.5",
              isDark
                ? "border border-[#f0d78c]/12 bg-[rgba(14,8,2,0.55)] backdrop-blur-[10px]"
                : "border border-alpha bg-alpha-elevated shadow-[0_8px_22px_-14px_rgba(120,80,30,0.18)]",
            )}
          >
            {showTripStat ? (
              <>
                <ProfileStatCell
                  glyph="Ⲁ"
                  value={String(tripCount)}
                  label="رحلات"
                  accent={isDark ? "#5b9fd8" : "#3a6a9b"}
                  isDark={isDark}
                />
                <div
                  aria-hidden
                  className={cn(
                    "my-1 w-px shrink-0 bg-gradient-to-b from-transparent to-transparent",
                    isDark ? "via-[#e7c97a]/25" : "via-[#b8893a]/30",
                  )}
                />
              </>
            ) : null}
            <ProfileStatCell
              glyph="Ⲱ"
              value={monthsLabel}
              label="شهراً"
              accent={isDark ? "#1faa6a" : "#2d7a52"}
              isDark={isDark}
            />
            {showFamilyStat ? (
              <>
                <div
                  aria-hidden
                  className={cn(
                    "my-1 w-px shrink-0 bg-gradient-to-b from-transparent to-transparent",
                    isDark ? "via-[#e7c97a]/25" : "via-[#b8893a]/30",
                  )}
                />
                <ProfileStatCell
                  glyph="Ⲱ"
                  value={String(familyCount)}
                  label="عائلة"
                  accent={isDark ? "#f0c850" : "#8a6a28"}
                  isDark={isDark}
                />
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2.5 flex items-center justify-center">
          <button
            type="button"
            onClick={() => void router.navigate({ to: "/profile/edit" })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[11.5px] font-extrabold active:scale-95 transition-transform",
              isDark
                ? "border border-[#f0d78c]/35 text-white"
                : "alpha-chrome-btn text-alpha",
            )}
            style={
              isDark
                ? { background: "linear-gradient(135deg,rgba(240,215,140,0.22) 0%,rgba(0,0,0,0.35) 100%)" }
                : undefined
            }
          >
            <UserPen
              className={cn("h-3.5 w-3.5", isDark ? "text-[#f0d78c]" : "text-alpha-glyph")}
              strokeWidth={2.2}
            />
            تعديل الملف الشخصي
          </button>
        </div>
      </div>
    </section>
  );
}
