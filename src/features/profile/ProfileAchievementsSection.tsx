import { Link } from "@tanstack/react-router";
import { Award, Camera, ChevronLeft, Star } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { getAlphaRoleSync } from "@/features/auth";
import { SAINT_GALLERY_STATUS_LABEL } from "@/features/saint-gallery";
import { useMyProfileContributions, saintStatusAccent } from "./profile-contributions-api";
import { roleLabelAr } from "./profile-role";
import { useResolvedTheme } from "@/lib/alpha-theme";
import { cn } from "@/lib/utils";
const MOCK_BADGES = [
  { id: "member", label: "عضو موثّق", glyph: "Ⲁ", accent: "#5b9fd8" },
  { id: "prayer", label: "حامل الصلاة", glyph: "Ⲱ", accent: "#8a6ec1" },
  { id: "trip", label: "حاجّ Alpha", glyph: "Ⲁ", accent: "#d4af37" },
];

export function ProfileAchievementsSection() {
  const isDark = useResolvedTheme() === "dark";
  const roleLabel = roleLabelAr(getAlphaRoleSync());  const { data } = useMyProfileContributions();
  const saintImages = data?.saintImages ?? [];
  const totalContributions = data?.total ?? 0;

  return (
    <section className="mt-4">
      <HeroLedgerStylesHost />
      <div className="mb-2.5 flex items-end justify-between gap-2 px-0.5">
        <Link
          to="/profile/contributions"
          className={cn(
            "text-[10px] font-bold active:scale-95",
            isDark ? "text-[#f0d78c]/60" : "text-alpha-muted",
          )}
        >
          مساهماتي ({totalContributions}) ←
        </Link>
        <h2
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-extrabold",
            isDark ? "text-white/85" : "text-alpha-heading",
          )}
        >
          <Award className={cn("h-4 w-4", isDark ? "text-[#f0d78c]" : "text-alpha-glyph")} strokeWidth={2.2} />
          الإنجازات والشارات
        </h2>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-[20px] border px-3 py-3",
          isDark
            ? "border-[#f0d78c]/12"
            : "border-alpha bg-alpha-surface shadow-[0_10px_24px_-14px_rgba(120,80,30,0.16)]",
        )}
        style={
          isDark
            ? { background: "linear-gradient(155deg, rgba(26,16,8,0.92) 0%, rgba(30,20,12,0.88) 100%)" }
            : undefined
        }
        dir="rtl"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold"
            style={
              isDark
                ? { borderColor: "#f0d78c44", color: "#f0d78c", background: "rgba(240,215,140,0.08)" }
                : { borderColor: "rgba(184,137,58,0.35)", color: "#5a3d20", background: "rgba(251,243,225,0.85)" }
            }
          >
            <Star className="h-3 w-3" />
            {roleLabel}
          </span>
          <p className={cn("text-[10px]", isDark ? "text-white/45" : "text-alpha-muted")}>3 شارات</p>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_BADGES.map((b) => (
            <div
              key={b.id}
              className="flex w-[88px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5"
              style={{
                borderColor: `${b.accent}44`,
                background: isDark ? `${b.accent}12` : `${b.accent}18`,
              }}
            >
              <span
                aria-hidden
                className={cn(
                  "text-[20px] font-black leading-none",
                  isDark ? "hero-ledger-glyph-gold" : "text-alpha-glyph",
                )}
              >
                {b.glyph}
              </span>
              <p
                className={cn(
                  "mt-1.5 text-center text-[8.5px] font-extrabold leading-tight",
                  isDark ? "text-white/75" : "text-alpha",
                )}
              >
                {b.label}
              </p>
            </div>
          ))}
        </div>
        {saintImages.length > 0 ? (
          <div className={cn("mt-3 border-t pt-3", isDark ? "border-white/8" : "border-alpha-subtle")}>
            <div className="mb-2 flex items-center justify-between">
              <Link
                to="/profile/contributions"
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-bold active:scale-95",
                  isDark ? "text-[#f0d78c]/55" : "text-alpha-muted",
                )}
              >
                عرض الكل
                <ChevronLeft className="h-3 w-3" />
              </Link>
              <p
                className={cn(
                  "flex items-center gap-1 text-[10px] font-extrabold",
                  isDark ? "text-white/70" : "text-alpha",
                )}
              >
                <Camera className={cn("h-3.5 w-3.5", isDark ? "text-[#f0d78c]/70" : "text-alpha-glyph")} />
                مساهماتك ({saintImages.length})
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {saintImages.slice(0, 8).map((img) => (
                <Link
                  key={img.id}
                  to="/profile/contributions"
                  className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-[#f0d78c]/25 active:scale-95"
                >
                  <img src={img.publicUrl} alt="" className="h-full w-full object-cover" />
                  <span
                    className="absolute bottom-0 inset-x-0 py-0.5 text-center text-[6.5px] font-extrabold text-white"
                    style={{ background: `${saintStatusAccent(img.status)}bb` }}
                  >
                    {SAINT_GALLERY_STATUS_LABEL[img.status]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
