import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

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

// ─────────────────────────────────────────────────────────────
// Per-role config
// ─────────────────────────────────────────────────────────────
const SHIELD_CONFIG: Record<ShieldRole, {
  image:       string;
  label:       string;
  glow:        string;
  scale:       number;
  status:      string;       // subtitle shown in chat next to name
  trustLabel:  string;       // human-readable text status shown in the card
  trustNote:   string;       // one-line description shown under trustLabel
  radiate: { core: string; ring1: string; ring2: string };
}> = {
  official: {
    image:      "/shields/official-shield.png?v=8",
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
    image:      "/shields/priest-shield.png?v=5",
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
    image:      "/shields/servant-shield.png?v=5",
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
    image:      "/shields/member-shield.png?v=5",
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

// ─────────────────────────────────────────────────────────────
// Shield image with radiate glow — used inline next to names
// ─────────────────────────────────────────────────────────────
function ShieldImage({ role, px }: { role: ShieldRole; px: number }) {
  const cfg = SHIELD_CONFIG[role];
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-visible"
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
        style={{ width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", filter: cfg.glow, transform: `scale(${cfg.scale})` }}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Compact verification card — dark glass, text-only trust status
// ─────────────────────────────────────────────────────────────
function VerificationCard({
  role, onClose, userName, userAvatar, isOnline,
}: {
  role: ShieldRole;
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
  isOnline?: boolean;
}) {
  const cfg  = SHIELD_CONFIG[role];
  const info = SHIELD_INFO[role];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        dir="rtl"
        role="dialog"
        aria-label={`بطاقة التوثيق · ${cfg.label}`}
        className="fixed bottom-0 left-1/2 z-[91] w-full max-w-[420px] -translate-x-1/2 rounded-t-[24px] border-t border-x border-white/8 bg-[#0e1117]/95 pt-2.5 pb-[max(env(safe-area-inset-bottom),16px)] shadow-[0_-8px_40px_-4px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
      >
        {/* Handle */}
        <div className="mx-auto mb-3 h-[3px] w-8 rounded-full bg-white/20" />

        {/* Row 1: Avatar · Name · Online · Shield · Close */}
        <div className="flex items-center gap-2.5 px-4 pb-2.5">
          {userAvatar && (
            <div className="relative shrink-0">
              <img
                src={userAvatar}
                alt={userName ?? ""}
                className="size-10 rounded-full border border-gold/30 object-cover"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#0e1117] bg-[#166534] shadow-[0_0_5px_rgba(22,101,52,0.5)]" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {userName && (
              <p className="truncate text-[13px] font-bold leading-tight text-white">{userName}</p>
            )}
            {isOnline !== undefined && (
              <p className={`mt-0.5 text-[9px] font-semibold ${isOnline ? "text-[#DCFCE7]" : "text-white/35"}`}>
                {isOnline ? "متصل الآن" : "غير متصل"}
              </p>
            )}
          </div>

          <ShieldImage role={role} px={44} />

          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded-full bg-white/8 text-white/50 hover:bg-white/15"
          >
            <X className="size-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-2.5 h-px bg-white/6" />

        {/* Info rows */}
        {[
          ["الكنيسة",   info.church],
          ["عضو منذ",  info.since],
          ["نوع الدرع", cfg.label],
          ["الحالة",    "الحساب نشط ✓"],
        ].map(([lbl, val]) => (
          <div key={lbl} className="flex items-center px-4 pb-2 text-[9.5px]">
            <span className="flex-1 text-white/40">{lbl}</span>
            <span className="font-semibold text-white/80">{val}</span>
          </div>
        ))}

        {/* Trust text block */}
        <div className="mx-4 mt-1 rounded-2xl border border-white/6 bg-white/4 px-3.5 py-2.5">
          <p className="text-[11px] font-bold leading-tight text-gold/90">{cfg.trustLabel}</p>
          <p className="mt-1 text-[9px] leading-relaxed text-white/45">{cfg.trustNote}</p>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Public component — drop-in, API unchanged + optional user props
// ─────────────────────────────────────────────────────────────
export function AlphaShield({
  role,
  size = "md",
  userName,
  userAvatar,
  isOnline,
}: {
  role: ShieldRole;
  size?: "sm" | "md" | "lg";
  userName?: string;
  userAvatar?: string;
  isOnline?: boolean;
}) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const px = size === "lg" ? 48 : 28;

  return (
    <>
      <button
        type="button"
        aria-label={`بطاقة توثيق · ${SHIELD_CONFIG[role].label}`}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex shrink-0 items-center justify-center p-0 focus:outline-none"
        style={{ width: px, height: px, background: "transparent", border: "none" }}
      >
        <ShieldImage role={role} px={px} />
      </button>

      {mounted && open && (
        <VerificationCard
          role={role}
          onClose={() => setOpen(false)}
          userName={userName}
          userAvatar={userAvatar}
          isOnline={isOnline}
        />
      )}
    </>
  );
}
