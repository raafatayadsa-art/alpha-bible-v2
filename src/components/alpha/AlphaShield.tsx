import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { MESSAGING_GLASS_INNER, MESSAGING_GLASS_SHELL } from "./messaging-ui";
import { cn } from "@/lib/utils";
import type { AlphaPresenceStatus } from "@/features/alpha-connect/presence";
import { PRESENCE_LABELS } from "@/features/alpha-connect/presence";

// ─────────────────────────────────────────────────────────────
// Shield Role Hierarchy
// ─────────────────────────────────────────────────────────────
export type ShieldRole = "member" | "servant" | "priest" | "official";

// ─────────────────────────────────────────────────────────────
// Future Badge System — structure only, UI deferred
// ─────────────────────────────────────────────────────────────
export type FutureBadgeId =
  | "founder_member"
  | "active_servant"
  | "prayer_warrior"
  | "bible_teacher"
  | "daily_reader";

export interface FutureBadge {
  id: FutureBadgeId;
  labelAr: string;
  description: string;
}

export const FUTURE_BADGES: readonly FutureBadge[] = [
  { id: "founder_member", labelAr: "عضو مؤسس",    description: "من الأعضاء الأوائل في Alpha" },
  { id: "active_servant", labelAr: "خادم نشط",     description: "خدمة كنسية مستمرة ومنتظمة" },
  { id: "prayer_warrior", labelAr: "محارب الصلاة", description: "التزام يومي بالصلاة والتأمل" },
  { id: "bible_teacher",  labelAr: "معلم الكتاب",  description: "تعليم وإرشاد في الكتاب المقدس" },
  { id: "daily_reader",   labelAr: "قارئ يومي",    description: "خطة قراءة يومية منتظمة" },
] as const;

const FLY_BASE_PX = 152;
const CARD_SHIELD_PX = 44;
const CARD_SHIELD_SCALE = CARD_SHIELD_PX / FLY_BASE_PX;
const SHIELD_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const SHIELD_GROW_MS = 880;
const SHIELD_SETTLE_MS = 980;
const CARD_REVEAL_MS = 920;
/** Above AlphaNavHub drawer (z-9999) when shield opens from menu */
const SHIELD_OVERLAY_BACKDROP_Z = 10050;
const SHIELD_OVERLAY_CARD_Z = 10051;
const SHIELD_OVERLAY_FLY_Z = 10052;

// ─────────────────────────────────────────────────────────────
// Per-role config
// ─────────────────────────────────────────────────────────────
const SHIELD_CONFIG: Record<ShieldRole, {
  image:       string;
  label:       string;
  glow:        string;
  scale:       number;
  status:      string;
  trustLabel:  string;
  trustNote:   string;
  radiate: { core: string; ring1: string; ring2: string };
}> = {
  official: {
    image:      "/shields/official-shield.png?v=14",
    label:      "درع Alpha الرسمي",
    glow:       "drop-shadow(0 0 5px rgba(200,149,42,0.65))",
    scale:      1.25,
    status:     "رسمي · معتمد من فريق Alpha",
    trustLabel: "حساب Alpha رسمي",
    trustNote:  "هذا الحساب مُشغَّل مباشرةً من فريق Alpha.",
    radiate: {
      core:  "bg-[radial-gradient(circle,rgba(200,149,42,0.55)_0%,rgba(200,149,42,0.2)_42%,transparent_72%)]",
      ring1: "border-[#c8952a]/25 bg-[radial-gradient(circle,rgba(200,149,42,0.28)_0%,transparent_68%)]",
      ring2: "border-[#a07020]/15 bg-[radial-gradient(circle,rgba(200,149,42,0.22)_0%,transparent_70%)]",
    },
  },
  priest: {
    image:      "/shields/priest-shield.png?v=15",
    label:      "درع الكاهن الملكي",
    glow:       "drop-shadow(0 0 6px rgba(22,101,52,0.6))",
    scale:      1.25,
    status:     "موثّق · هوية وكنيسة معتمدة",
    trustLabel: "كاهن موثّق ومعتمد",
    trustNote:  "تم التحقق من الهوية والرتبة الكهنوتية.",
    radiate: {
      core:  "bg-[radial-gradient(circle,rgba(22,101,52,0.5)_0%,rgba(22,101,52,0.18)_42%,transparent_72%)]",
      ring1: "border-[#166534]/22 bg-[radial-gradient(circle,rgba(22,101,52,0.22)_0%,transparent_68%)]",
      ring2: "border-[#14532D]/14 bg-[radial-gradient(circle,rgba(22,101,52,0.16)_0%,transparent_70%)]",
    },
  },
  servant: {
    image:      "/shields/servant-shield.png?v=13",
    label:      "درع الخادم",
    glow:       "drop-shadow(0 0 5px rgba(22,101,52,0.5))",
    scale:      1.25,
    status:     "موثّق · معتمد من الكاهن",
    trustLabel: "خادم معتمد",
    trustNote:  "تم اعتماد هذا الخادم من الكاهن المسؤول عن الكنيسة.",
    radiate: {
      core:  "bg-[radial-gradient(circle,rgba(22,101,52,0.5)_0%,rgba(22,101,52,0.18)_42%,transparent_72%)]",
      ring1: "border-[#166534]/22 bg-[radial-gradient(circle,rgba(22,101,52,0.22)_0%,transparent_68%)]",
      ring2: "border-[#14532D]/14 bg-[radial-gradient(circle,rgba(22,101,52,0.16)_0%,transparent_70%)]",
    },
  },
  member: {
    image:      "/shields/member-shield.png?v=13",
    label:      "درع العضو الموثّق",
    glow:       "drop-shadow(0 0 5px rgba(59,89,152,0.55))",
    scale:      1.25,
    status:     "موثّق · عضوية نشطة",
    trustLabel: "عضو موثّق",
    trustNote:  "تم التحقق من هوية هذا العضو وتفعيل عضويته.",
    radiate: {
      core:  "bg-[radial-gradient(circle,rgba(59,89,152,0.55)_0%,rgba(59,89,152,0.2)_42%,transparent_72%)]",
      ring1: "border-[#3b5998]/25 bg-[radial-gradient(circle,rgba(59,89,152,0.28)_0%,transparent_68%)]",
      ring2: "border-[#1a3a6e]/15 bg-[radial-gradient(circle,rgba(59,89,152,0.22)_0%,transparent_70%)]",
    },
  },
};

const SHIELD_INFO: Record<ShieldRole, { church: string; since: string }> = {
  official: { church: "Alpha Official",                       since: "٢٠٢٦" },
  priest:   { church: "كنيسة السيدة العذراء — أرض الجولف", since: "٢٠٢٦" },
  servant:  { church: "كنيسة مارمرقس — مصر الجديدة",        since: "٢٠٢٦" },
  member:   { church: "كنيسة مارمرقس — مصر الجديدة",        since: "٢٠٢٦" },
};

export type ShieldProfileInfo = {
  churchName?: string;
  diocese?: string | null;
  memberSince?: string | null;
  roleLabel?: string;
};

type FlyTransform = { x: number; y: number; scale: number };

function heroHoverPoint(): FlyTransform {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.34,
    scale: 1,
  };
}

function originTransform(origin: DOMRect | null): FlyTransform {
  if (!origin) return heroHoverPoint();
  const size = Math.max(origin.width, origin.height);
  return {
    x: origin.left + origin.width / 2,
    y: origin.top + origin.height / 2,
    scale: Math.max(0.18, Math.min(0.42, size / FLY_BASE_PX)),
  };
}

export function ShieldImage({
  role,
  px,
  className = "",
}: {
  role: ShieldRole | null;
  px: number;
  className?: string;
}) {
  if (!role) return null;
  const cfg = SHIELD_CONFIG[role];
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: px, height: px }}
    >
      <div aria-hidden className={`trust-shield-core-glow pointer-events-none absolute inset-[-40%] rounded-full ${cfg.radiate.core}`} />
      <div aria-hidden className={`trust-shield-radiate pointer-events-none absolute inset-[-18%] rounded-full border ${cfg.radiate.ring1}`} />
      <div aria-hidden className={`trust-shield-radiate trust-shield-radiate-delay pointer-events-none absolute inset-[-8%] rounded-full border ${cfg.radiate.ring2}`} />
      <img
        src={cfg.image}
        alt={cfg.label}
        draggable={false}
        className="absolute pointer-events-none z-10"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "none",
          objectFit: "contain",
          filter: cfg.glow,
          transform: `scale(${cfg.scale})`,
        }}
      />
    </span>
  );
}

function FlyingShield({
  role,
  transform,
  animate,
  duration,
  onSettled,
}: {
  role: ShieldRole | null;
  transform: FlyTransform;
  animate: boolean;
  duration: number;
  onSettled?: () => void;
}) {
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 will-change-transform"
      style={{
        zIndex: SHIELD_OVERLAY_FLY_Z,
        width: FLY_BASE_PX,
        height: FLY_BASE_PX,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) translate(-50%, -50%) scale(${transform.scale})`,
        transition: animate ? `transform ${duration}ms ${SHIELD_EASE}` : "none",
      }}
      onTransitionEnd={(e) => {
        if (animate && e.propertyName === "transform") onSettled?.();
      }}
    >
      <ShieldImage role={role} px={FLY_BASE_PX} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compact verification card — dark glass
// ─────────────────────────────────────────────────────────────
function VerificationCard({
  role,
  onClose,
  userName,
  userAvatar,
  isOnline,
  presenceStatus,
  originRect,
  profileInfo,
}: {
  role: ShieldRole | null;
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
  isOnline?: boolean;
  presenceStatus?: AlphaPresenceStatus | null;
  originRect: DOMRect | null;
  profileInfo?: ShieldProfileInfo;
}) {
  const cfg = SHIELD_CONFIG[role];
  const fallback = SHIELD_INFO[role];
  const churchLine = profileInfo?.churchName?.trim() || fallback.church;
  const dioceseLine = profileInfo?.diocese?.trim() || null;
  const sinceLine = profileInfo?.memberSince?.trim() || fallback.since;
  const roleLine = profileInfo?.roleLabel?.trim() || cfg.label;
  const resolvedPresence = presenceStatus ?? (isOnline ? "available" : isOnline === false ? null : undefined);
  const slotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [flyTransform, setFlyTransform] = useState<FlyTransform>(() => heroHoverPoint());
  const [flyAnimate, setFlyAnimate] = useState(false);
  const [flyPhase, setFlyPhase] = useState<"grow" | "settle" | "done">("grow");
  const [showFlying, setShowFlying] = useState(true);
  const settleStartedRef = useRef(false);

  const beginSettle = useCallback(() => {
    if (settleStartedRef.current) return;
    const slot = slotRef.current?.getBoundingClientRect();
    if (!slot) {
      setFlyPhase("done");
      setShowFlying(false);
      return;
    }
    settleStartedRef.current = true;
    setFlyPhase("settle");
    requestAnimationFrame(() => {
      setFlyTransform({
        x: slot.left + slot.width / 2,
        y: slot.top + slot.height / 2,
        scale: CARD_SHIELD_SCALE,
      });
    });
  }, []);

  useLayoutEffect(() => {
    settleStartedRef.current = false;
    setFlyTransform(originTransform(originRect));
    setFlyAnimate(false);
    setFlyPhase("grow");
    setShowFlying(true);
    setCardVisible(false);
    setBackdropVisible(false);

    const backdropTimer = window.setTimeout(() => setBackdropVisible(true), 16);
    const growFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyTransform(heroHoverPoint());
        setFlyAnimate(true);
      });
    });
    const cardTimer = window.setTimeout(() => setCardVisible(true), 320);

    return () => {
      window.clearTimeout(backdropTimer);
      window.clearTimeout(cardTimer);
      cancelAnimationFrame(growFrame);
    };
  }, [originRect]);

  const handleFlySettled = useCallback(() => {
    if (flyPhase === "grow") return;
    setFlyPhase("done");
    setShowFlying(false);
  }, [flyPhase]);

  const handleCardTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform" || !cardVisible) return;
      beginSettle();
    },
    [beginSettle, cardVisible],
  );

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/36 backdrop-blur-[5px] transition-opacity",
        )}
        style={{
          zIndex: SHIELD_OVERLAY_BACKDROP_Z,
          opacity: backdropVisible ? 1 : 0,
          transitionDuration: `${CARD_REVEAL_MS}ms`,
          transitionTimingFunction: SHIELD_EASE,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {showFlying && flyPhase !== "done" && (
        <FlyingShield
          role={role}
          transform={flyTransform}
          animate={flyAnimate}
          duration={flyPhase === "settle" ? SHIELD_SETTLE_MS : SHIELD_GROW_MS}
          onSettled={handleFlySettled}
        />
      )}

      <div
        className="fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),14px)] pointer-events-none"
        style={{ zIndex: SHIELD_OVERLAY_CARD_Z }}
      >
        <div
          ref={cardRef}
          dir="rtl"
          role="dialog"
          aria-label={`بطاقة التوثيق · ${cfg.label}`}
          className={cn(
            MESSAGING_GLASS_SHELL,
            "pointer-events-auto relative w-[min(100%,276px)] border-white/30 bg-white/50 shadow-[0_20px_52px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-3xl will-change-transform",
            profileInfo &&
              "border-[#f0d78c]/45 shadow-[0_24px_56px_rgba(120,80,30,0.22),inset_0_1px_0_rgba(255,255,255,0.72)]",
          )}
          style={{
            transform: cardVisible ? "translate3d(0, 0, 0)" : "translate3d(0, calc(100% + 28px), 0)",
            opacity: cardVisible ? 1 : 0,
            transition: `transform ${CARD_REVEAL_MS}ms ${SHIELD_EASE}, opacity 560ms ease`,
          }}
          onTransitionEnd={handleCardTransitionEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="absolute left-2.5 top-2.5 grid size-7 place-items-center rounded-full border border-white/35 bg-white/45 text-[#6B7280] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm transition hover:bg-white/65"
          >
            <X className="size-3.5" strokeWidth={2.2} />
          </button>

          <div
            ref={slotRef}
            className="flex justify-center px-4 pt-5 pb-0.5"
            style={{ minHeight: CARD_SHIELD_PX + 6 }}
          >
            {flyPhase === "done" ? (
              <ShieldImage role={role} px={CARD_SHIELD_PX} />
            ) : (
              <span aria-hidden className="block" style={{ width: CARD_SHIELD_PX, height: CARD_SHIELD_PX }} />
            )}
          </div>

          <div className="px-4 pb-0.5 text-center">
            <p className="text-[13px] font-bold text-[#1F2937]">{cfg.label}</p>
            <p className="mt-0.5 text-[9.5px] text-[#6B7280]">{cfg.status}</p>
            {profileInfo?.roleLabel ? (
              <p className="mt-1 text-[10.5px] font-extrabold text-[#b8893a]">{profileInfo.roleLabel}</p>
            ) : null}
          </div>

          {(userAvatar || userName) && (
            <div className="mx-4 mb-2.5 mt-2.5 flex items-center gap-2.5 rounded-[14px] border border-white/28 bg-white/26 px-2.5 py-2 backdrop-blur-sm">
              {userAvatar && (
                <div className="relative shrink-0">
                  <img
                    src={userAvatar}
                    alt={userName ?? ""}
                    className="size-9 rounded-full border border-gold/25 object-cover"
                  />
                  {resolvedPresence ? (
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 size-2 rounded-full border-2 border-white",
                        resolvedPresence === "busy"
                          ? "bg-[#f97316]"
                          : resolvedPresence === "hidden"
                            ? "bg-[#9CA3AF]"
                            : "bg-[#166534]",
                      )}
                    />
                  ) : null}
                </div>
              )}
              <div className="min-w-0 flex-1 text-right">
                {userName && (
                  <p className="truncate text-[12px] font-bold text-[#1F2937]">{userName}</p>
                )}
                {resolvedPresence !== undefined && (
                  <p
                    className={`mt-0.5 text-[9px] font-semibold ${
                      resolvedPresence === "busy"
                        ? "text-[#ea580c]"
                        : resolvedPresence === "hidden"
                          ? "text-[#374151]"
                          : resolvedPresence
                            ? "text-[#166534]"
                            : "text-[#9CA3AF]"
                    }`}
                  >
                    {resolvedPresence ? PRESENCE_LABELS[resolvedPresence] : "غير متصل"}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mx-4 mb-2.5 h-px bg-gradient-to-l from-transparent via-white/42 to-transparent" />

          <div className={`${MESSAGING_GLASS_INNER} mx-4 mb-2.5 space-y-1.5 px-2.5 py-2`}>
            {[
              ["الكنيسة", churchLine],
              ...(dioceseLine ? [["الإيبارشية", dioceseLine] as const] : []),
              ["عضو منذ", sinceLine],
              ["الخدمة", roleLine],
              ["الحالة", "الحساب نشط ✓"],
            ].map(([lbl, val]) => (
              <div key={lbl} className="flex items-center gap-2 text-[9.5px]">
                <span className="flex-1 text-[#6B7280]">{lbl}</span>
                <span className="max-w-[58%] truncate text-left font-semibold text-[#374151]">{val}</span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              `${MESSAGING_GLASS_INNER} mx-4 mb-4 px-3 py-2.5`,
              profileInfo && "border-[#f0d78c]/25 bg-gradient-to-b from-white/40 to-[#fdf6e3]/55",
            )}
          >
            <p className="text-[10.5px] font-bold leading-tight text-[#14532D]">{cfg.trustLabel}</p>
            <p className="mt-0.5 text-[9px] leading-relaxed text-[#6B7280]">{cfg.trustNote}</p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

const SHIELD_SIZES = { xs: 14, sm: 28, md: 36, lg: 48, xl: 92 } as const;
export type AlphaShieldSize = keyof typeof SHIELD_SIZES;

// ─────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────
export function AlphaShield({
  role,
  size = "sm",
  userName,
  userAvatar,
  isOnline,
  presenceStatus,
  pulseWrap = false,
  profileInfo,
  className,
}: {
  role: ShieldRole | null;
  size?: AlphaShieldSize;
  userName?: string;
  userAvatar?: string;
  isOnline?: boolean;
  presenceStatus?: AlphaPresenceStatus | null;
  /** Hero-card style pulse ring around shield (membership card) */
  pulseWrap?: boolean;
  profileInfo?: ShieldProfileInfo;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  if (!role) return null;

  const px = SHIELD_SIZES[size];

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOriginRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setOpen(true);
  };

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label={`بطاقة توثيق · ${SHIELD_CONFIG[role].label}`}
      onClick={handleOpen}
      className={cn(
        "inline-flex shrink-0 items-center justify-center p-0 focus:outline-none active:scale-95 transition-transform",
        className,
      )}
      style={{ width: px, height: px, background: "transparent", border: "none" }}
    >
      <ShieldImage role={role} px={px} />
    </button>
  );

  return (
    <>
      {pulseWrap ? (
        <span className="hero-ledger-pulse-wrap hero-ledger-pulse-wrap--gold inline-flex rounded-2xl">
          {trigger}
        </span>
      ) : (
        trigger
      )}

      {mounted && open && (
        <VerificationCard
          role={role}
          onClose={() => setOpen(false)}
          userName={userName}
          userAvatar={userAvatar}
          isOnline={isOnline}
          presenceStatus={presenceStatus}
          originRect={originRect}
          profileInfo={profileInfo}
        />
      )}
    </>
  );
}
