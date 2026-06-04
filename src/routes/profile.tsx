import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft, ChevronRight, MessageSquare, User as UserIcon, Church,
  Users, Palette, Shield, BadgeCheck, Crown, QrCode, Calendar, Hash,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark, CopticCross } from "@/components/coptic";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الملف الشخصي" },
      { name: "description", content: "ملفك الشخصي في كنيستك القبطية." },
    ],
  }),
  component: ProfileScreen,
});

const MEMBER = {
  name: "مينا عاطف",
  role: "خادم مدارس الأحد",
  church: "كنيسة الشهيد مار جرجس",
  membershipNo: "AC-2024-00187",
  status: "عضو فعّال",
  joinDate: "12 يناير 2019",
  verified: true,
};

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&ecc=H&margin=2&bgcolor=fbf3e1&color=2a1a0d&data=${encodeURIComponent(
  `alpha://member/${MEMBER.membershipNo}`,
)}`;

// ===== Reusable premium glass card =====
function GlassCard({
  children,
  accent = "#b8893a",
  className = "",
  glow = true,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-[22px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 backdrop-blur-xl overflow-hidden ${className}`}
      style={
        glow
          ? {
              boxShadow: `0 18px 36px -20px rgba(120,80,30,0.55), 0 4px 14px -8px ${accent}55, 0 0 0 1px rgba(255,255,255,0.45) inset, inset 0 1px 0 rgba(255,255,255,0.8)`,
            }
          : undefined
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[22px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.14) 45%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[22px]" style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2.5 px-1">
      <CopticCross className="text-[#b8893a]" size={13} />
      <h2 className="text-[13.5px] font-extrabold text-[#3a2a18]">{children}</h2>
    </div>
  );
}

// ===== Compact Hero =====
function ProfileHero() {
  return (
    <div className="relative mt-2 overflow-hidden rounded-[26px] border border-[#efe2c4] shadow-[0_22px_44px_-22px_rgba(120,80,30,0.6)]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 0%, rgba(231,201,122,0.55), transparent 60%)," +
            "radial-gradient(70% 55% at 50% 100%, rgba(120,70,150,0.35), transparent 65%)," +
            "linear-gradient(180deg,#1c1030 0%,#2a1a45 35%,#3a2618 75%,#180d20 100%)",
        }}
      />

      {/* Incense smoke */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background:
            "radial-gradient(45% 22% at 22% 78%, rgba(240,215,140,0.18), transparent 70%)," +
            "radial-gradient(38% 20% at 78% 82%, rgba(200,170,230,0.16), transparent 70%)," +
            "radial-gradient(30% 18% at 50% 92%, rgba(240,215,140,0.14), transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Church silhouettes */}
      <svg aria-hidden viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full h-[78px] text-[#f0d78c]" fill="currentColor" opacity="0.10">
        <path d="M0 120 L0 92 L26 92 L26 78 Q26 68 36 68 Q46 68 46 78 L46 92 L66 92 L66 72 L62 72 L62 62 L70 62 L70 72 L76 72 L76 92 L106 92 L106 62 Q106 47 121 47 Q136 47 136 62 L136 92 L166 92 L166 82 L164 82 L164 74 L168 74 L168 82 L176 82 L176 92 L216 92 L216 57 Q216 42 231 42 Q246 42 246 57 L246 92 L276 92 L276 72 L316 72 L316 92 L346 92 L346 80 Q346 72 354 72 Q362 72 362 80 L362 92 L400 92 L400 120 Z" />
      </svg>

      {/* Larger Alpha & Omega watermark */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-between px-1 opacity-[0.11] text-[#f0d78c] font-bold text-[170px] leading-none select-none">
        <span>Ⲱ</span>
        <span>Ⲁ</span>
      </div>

      {/* Soft gold light rays */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[220px] opacity-70 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 270deg at 50% 0%, transparent 0deg, rgba(240,215,140,0.28) 12deg, transparent 28deg, rgba(240,215,140,0.32) 50deg, transparent 78deg, rgba(240,215,140,0.26) 118deg, transparent 158deg, rgba(240,215,140,0.32) 202deg, transparent 250deg, rgba(240,215,140,0.28) 292deg, transparent 332deg)",
        }}
      />

      {/* Small floating crosses */}
      <div aria-hidden className="absolute top-6 left-5 text-[#f0d78c]/35"><CopticCross size={9} /></div>
      <div aria-hidden className="absolute top-10 right-6 text-[#f0d78c]/30"><CopticCross size={8} /></div>
      <div aria-hidden className="absolute bottom-16 left-7 text-[#f0d78c]/25"><CopticCross size={7} /></div>
      <div aria-hidden className="absolute bottom-20 right-5 text-[#f0d78c]/30"><CopticCross size={9} /></div>

      <div className="relative px-4 pt-12 pb-5 flex flex-col items-center text-center">
        {/* Premium Orthodox Halo + Cross system */}
        <div className="relative">
          {/* Radiant outer aura — strong sacred glow */}
          <div
            aria-hidden
            className="absolute inset-0 -m-[80px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,236,170,0.85), rgba(240,180,70,0.4) 30%, rgba(216,138,42,0.15) 55%, transparent 75%)",
              filter: "blur(22px)",
            }}
          />
          {/* Radiating light beams behind avatar */}
          <div
            aria-hidden
            className="absolute inset-0 -m-[120px] rounded-full opacity-90 mix-blend-screen"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,240,180,0.55) 6deg, transparent 14deg, rgba(255,230,150,0.4) 26deg, transparent 38deg, rgba(255,240,180,0.5) 54deg, transparent 70deg, rgba(255,225,140,0.45) 88deg, transparent 104deg, rgba(255,240,180,0.55) 124deg, transparent 142deg, rgba(255,230,150,0.4) 162deg, transparent 180deg, rgba(255,240,180,0.55) 198deg, transparent 216deg, rgba(255,230,150,0.4) 236deg, transparent 254deg, rgba(255,240,180,0.5) 274deg, transparent 290deg, rgba(255,225,140,0.45) 308deg, transparent 324deg, rgba(255,240,180,0.55) 344deg, transparent 360deg)",
              maskImage: "radial-gradient(circle, transparent 28%, black 38%, black 70%, transparent 88%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 28%, black 38%, black 70%, transparent 88%)",
            }}
          />
          {/* Inner warm glow */}
          <div
            aria-hidden
            className="absolute inset-0 -m-[36px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,244,208,0.7), rgba(240,180,70,0.3) 50%, transparent 75%)",
              filter: "blur(10px)",
            }}
          />


          {/* Premium engraved halo */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute inset-0 -m-[34px] h-[calc(100%+68px)] w-[calc(100%+68px)]"
          >
            <defs>
              <radialGradient id="haloGold" cx="50%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fff4d0" />
                <stop offset="30%" stopColor="#f0d78c" />
                <stop offset="60%" stopColor="#d8a23a" />
                <stop offset="100%" stopColor="#8a5a1c" />
              </radialGradient>
              <linearGradient id="haloShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#f0d78c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7a4f18" stopOpacity="0.6" />
              </linearGradient>
              <radialGradient id="crossGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff4d0" stopOpacity="1" />
                <stop offset="60%" stopColor="#f0d78c" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#d8a23a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Outer thick metallic ring */}
            <circle cx="100" cy="100" r="93" fill="none" stroke="url(#haloGold)" strokeWidth="2.6" />
            <circle cx="100" cy="100" r="93" fill="none" stroke="url(#haloShine)" strokeWidth="0.6" />

            {/* Ornament band guides */}
            <circle cx="100" cy="100" r="86" fill="none" stroke="#f0d78c" strokeOpacity="0.5" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="#f0d78c" strokeOpacity="0.5" strokeWidth="0.5" />

            {/* Coptic manuscript interlace dashes */}
            <circle cx="100" cy="100" r="81" fill="none" stroke="#f0d78c" strokeOpacity="0.85" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="100" cy="100" r="81" fill="none" stroke="#fff4d0" strokeOpacity="0.5" strokeWidth="0.35" strokeDasharray="2 3" strokeDashoffset="1.2" />

            {/* Geometric Orthodox petals */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * 360) / 24;
              return (
                <g key={`p-${i}`} transform={`rotate(${a} 100 100)`}>
                  <path d="M100 18 Q102.2 25 100 32 Q97.8 25 100 18 Z" fill="#f0d78c" fillOpacity="0.55" />
                </g>
              );
            })}

            {/* Inner ring */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="url(#haloGold)" strokeWidth="1.3" />

            {/* Ornament dots */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * 360) / 24;
              const rad = (a * Math.PI) / 180;
              const r = 66;
              const cx = 100 + r * Math.cos(rad);
              const cy = 100 + r * Math.sin(rad);
              return <circle key={`d-${i}`} cx={cx} cy={cy} r={i % 2 === 0 ? 0.95 : 0.55} fill="#fff4d0" opacity="0.9" />;
            })}

            {/* Cardinal small crosses */}
            {[0, 90, 180, 270].map((a) => {
              const rad = (a * Math.PI) / 180;
              const r = 66;
              const cx = 100 + r * Math.cos(rad);
              const cy = 100 + r * Math.sin(rad);
              return (
                <g key={`c-${a}`} stroke="#fff4d0" strokeWidth="1.1" strokeLinecap="round" opacity="0.95">
                  <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
                  <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} />
                </g>
              );
            })}

            {/* Inner shadow ring */}
            <circle cx="100" cy="100" r="60" fill="none" stroke="#3a2a18" strokeOpacity="0.35" strokeWidth="0.5" />
          </svg>

          {/* Integrated Coptic Cross above halo */}
          <svg
            aria-hidden
            viewBox="0 0 60 80"
            className="absolute left-1/2 -translate-x-1/2 -top-[60px] w-[46px] h-[60px]"
          >
            <ellipse cx="30" cy="40" rx="28" ry="28" fill="url(#crossGlow)" opacity="0.85" />
            <g stroke="#a8761e" strokeWidth="0.6">
              <rect x="26.5" y="14" width="7" height="52" rx="1.2" fill="url(#haloGold)" />
              <rect x="10" y="32.5" width="40" height="7" rx="1.2" fill="url(#haloGold)" />
              <circle cx="30" cy="14" r="3" fill="url(#haloGold)" />
              <circle cx="30" cy="66" r="3" fill="url(#haloGold)" />
              <circle cx="10" cy="36" r="3" fill="url(#haloGold)" />
              <circle cx="50" cy="36" r="3" fill="url(#haloGold)" />
              <circle cx="30" cy="36" r="3.6" fill="#fff4d0" stroke="#a8761e" strokeWidth="0.5" />
              <circle cx="30" cy="36" r="1.4" fill="#a8761e" />
            </g>
            <rect x="27.4" y="15" width="1.2" height="50" rx="0.6" fill="#fff8e0" opacity="0.85" />
            <rect x="11" y="33.4" width="38" height="1.2" rx="0.6" fill="#fff8e0" opacity="0.7" />
          </svg>

          {/* Avatar */}
          <div className="relative h-[104px] w-[104px] rounded-full border-[3px] border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#2a1810] grid place-items-center shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,244,208,0.4)]">
            <span className="text-[42px] font-bold text-[#f0d78c] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{MEMBER.name.charAt(0)}</span>
            <div aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22), transparent)" }} />
          </div>

          {/* Emerald scalloped verified badge */}
          {MEMBER.verified && (
            <span
              className="absolute -bottom-1.5 -right-1.5 grid h-9 w-9 place-items-center"
              aria-label="عضو موثق"
              style={{ filter: "drop-shadow(0 0 10px rgba(46,204,113,0.65)) drop-shadow(0 6px 14px rgba(20,112,74,0.7))" }}
            >
              <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
                <defs>
                  <radialGradient id="emeraldFill" cx="35%" cy="28%" r="75%">
                    <stop offset="0%" stopColor="#7df0b8" />
                    <stop offset="45%" stopColor="#22b478" />
                    <stop offset="100%" stopColor="#0f6a44" />
                  </radialGradient>
                </defs>
                <path
                  d="M20 2 L24 4 L28 2.5 L30.5 6 L34.5 6.5 L35.5 10.5 L38.5 13 L37.5 17 L39 21 L36.5 24.5 L37 28.5 L33.5 30.5 L32 34.5 L28 35 L25 38 L20.5 36.5 L16 38 L12 35 L8 34.5 L6.5 30.5 L3 28.5 L3.5 24.5 L1 21 L2.5 17 L1.5 13 L4.5 10.5 L5.5 6.5 L9.5 6 L12 2.5 L16 4 Z"
                  fill="url(#emeraldFill)"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <BadgeCheck className="relative h-4.5 w-4.5 text-white" strokeWidth={3} />
            </span>
          )}

        </div>


        <h1 className="mt-4 text-[19px] font-extrabold text-[#f7e7b8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          {MEMBER.name}
        </h1>
        <p className="mt-1 text-[12px] text-[#e7c97a]/90 flex items-center justify-center gap-1.5">
          <Crown className="h-3 w-3" /> {MEMBER.role}
        </p>
        <p className="mt-0.5 text-[11px] text-[#d8c190]/75">{MEMBER.church}</p>

        {MEMBER.verified && (
          <span
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white border"
            style={{
              background: "linear-gradient(135deg, rgba(94,224,160,0.28), rgba(31,158,99,0.4))",
              borderColor: "rgba(94,224,160,0.55)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 0 14px rgba(46,204,113,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            <BadgeCheck className="h-3 w-3" strokeWidth={2.8} /> عضو كنسي موثق
          </span>
        )}
      </div>
    </div>
  );
}

// ===== Premium Orthodox Membership Certificate =====
function MembershipCard() {
  return (
    <Link
      to={"/profile/membership" as any}
      className="block active:scale-[0.99] transition-transform mt-3 group"
      aria-label="فتح بطاقة العضوية الكاملة"
    >
      <div
        className="relative overflow-hidden rounded-[24px]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #fff7e3 0%, #fbf0d4 45%, #f1dfb3 100%)",
          boxShadow:
            "0 28px 50px -22px rgba(120,80,30,0.55), 0 8px 18px -10px rgba(216,138,42,0.45), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(216,138,42,0.35)",
        }}
      >
        {/* Manuscript parchment texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 28%, #8a5a1c 0.6px, transparent 1px), radial-gradient(circle at 72% 78%, #8a5a1c 0.5px, transparent 1px), radial-gradient(circle at 50% 50%, #b8893a 0.4px, transparent 1px)",
            backgroundSize: "12px 12px, 16px 16px, 22px 22px",
          }}
        />
        {/* Aged parchment shading */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 50% at 0% 0%, rgba(184,137,58,0.18), transparent 60%)," +
              "radial-gradient(70% 50% at 100% 100%, rgba(184,137,58,0.16), transparent 60%)",
          }}
        />

        {/* Alpha & Omega watermark */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-[#b8893a]/[0.09] font-bold text-[88px] leading-none select-none">
          <span>Ⲱ</span>
          <span>Ⲁ</span>
        </div>
        {/* Center Chi-Rho watermark */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-[150px] leading-none font-bold text-[#d88a2a]/[0.05] select-none">☧</div>

        {/* Double gold inner border frame */}
        <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[18px] border border-[#d88a2a]/40" />
        <div aria-hidden className="pointer-events-none absolute inset-[7px] rounded-[16px] border border-[#d88a2a]/20" />

        {/* Ornamental corner flourishes */}
        {[
          { p: "top-1.5 left-1.5", r: 0 },
          { p: "top-1.5 right-1.5", r: 90 },
          { p: "bottom-1.5 right-1.5", r: 180 },
          { p: "bottom-1.5 left-1.5", r: 270 },
        ].map((c, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 24 24"
            className={`pointer-events-none absolute ${c.p} h-5 w-5 text-[#b8893a]/70`}
            style={{ transform: `rotate(${c.r}deg)` }}
          >
            <path d="M2 2 L10 2 M2 2 L2 10 M4 4 Q9 4 9 9" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
          </svg>
        ))}

        <div className="relative p-4 pt-3.5">
          {/* Header strip */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-dashed border-[#d88a2a]/45">
            <span className="inline-flex items-center gap-1.5 text-[9.5px] font-extrabold tracking-[0.18em] text-[#8a5a1c] uppercase">
              <CopticCross size={11} /> Alpha Coptic · شهادة عضوية
            </span>
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#8a5a1c]">
              <QrCode className="h-3 w-3" /> ذكية
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Premium framed QR */}
            <div className="relative shrink-0">
              <div
                className="relative rounded-[14px] p-[3px]"
                style={{
                  background:
                    "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 40%, #fff4d0 55%, #b8893a 100%)",
                  boxShadow:
                    "0 8px 18px -8px rgba(120,80,30,0.6), inset 0 1px 0 rgba(255,255,255,0.7)",
                }}
              >
                <div
                  className="rounded-[12px] p-1.5"
                  style={{
                    background: "#fff7e3",
                    boxShadow: "inset 0 0 0 1px rgba(216,138,42,0.45), inset 0 2px 6px rgba(120,80,30,0.18)",
                  }}
                >
                  <img src={QR_URL} alt="QR العضوية" className="block h-[82px] w-[82px]" loading="lazy" />
                </div>
                <span
                  className="absolute inset-0 m-auto grid h-[24px] w-[24px] place-items-center rounded-md text-[12px] font-extrabold"
                  style={{
                    background: "linear-gradient(135deg,#fff7e3,#f0d78c)",
                    color: "#3a2a18",
                    boxShadow: "0 0 0 1.5px #fff7e3, 0 0 0 2.5px #b8893a, 0 2px 6px rgba(0,0,0,0.3)",
                  }}
                  aria-hidden
                >
                  ⲁ
                </span>
              </div>
              <p className="mt-1.5 text-center text-[8.5px] font-bold tracking-wider text-[#8a5a1c]/80 uppercase">
                Scan ID
              </p>
            </div>

            <div className="flex-1 min-w-0 text-right">
              <h3 className="text-[18px] font-extrabold text-[#2a1a08] leading-tight truncate" style={{ letterSpacing: "-0.01em" }}>
                {MEMBER.name}
              </h3>
              <span
                className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold text-[#5a3a0e]"
                style={{
                  background: "linear-gradient(135deg, #fff4d0, #f0d78c)",
                  boxShadow: "inset 0 0 0 1px rgba(184,137,58,0.55), 0 2px 4px -2px rgba(120,80,30,0.4)",
                }}
              >
                <Crown className="h-2.5 w-2.5" /> {MEMBER.role}
              </span>

              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2dbb7a, #14704a)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 10px rgba(46,204,113,0.45), 0 2px 4px -2px rgba(20,112,74,0.6)",
                  }}
                >
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.8} /> عضوية موثقة
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-y-0.5 text-[10px]">
                <Row icon={<Hash className="h-2.5 w-2.5" />} label="رقم العضوية" value={MEMBER.membershipNo} mono />
                <Row icon={<Church className="h-2.5 w-2.5" />} label="الكنيسة" value={MEMBER.church} />
                <Row icon={<Calendar className="h-2.5 w-2.5" />} label="الانضمام" value={MEMBER.joinDate} />
              </div>
            </div>
          </div>

          {/* Tap hint footer */}
          <div className="mt-3 pt-2.5 border-t border-dashed border-[#d88a2a]/45 flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#5a3a0e]"
              style={{
                background: "linear-gradient(135deg, #fff4d0, #f0d78c)",
                boxShadow: "inset 0 0 0 1px rgba(184,137,58,0.5), 0 2px 6px -2px rgba(120,80,30,0.35)",
              }}
            >
              <QrCode className="h-3 w-3" /> اضغط لفتح البطاقة الكاملة
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3a2a18] text-[#f0d78c] shadow-[0_4px_10px_-4px_rgba(58,42,24,0.7)] group-active:scale-95 transition-transform">
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Row({ icon, label, value, mono, valueClass = "text-[#3a2a18]" }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#9a7e5a] inline-flex items-center gap-1 shrink-0">{icon} {label}</span>
      <span className={`${valueClass} font-bold truncate ${mono ? "tabular-nums" : ""}`}>{value}</span>
    </div>
  );
}

// ===== Featured Messages Hero Card — Premium Inbox =====
function MessagesHero() {
  const unread = 3;
  return (
    <Link
      to="/profile/messages"
      preload="intent"
      className="block active:scale-[0.985] transition-transform cursor-pointer"
    >
      <div
        className="relative overflow-hidden rounded-[22px]"
        style={{
          background:
            "radial-gradient(140% 90% at 100% 0%, rgba(216,138,42,0.32), transparent 55%)," +
            "linear-gradient(180deg, #4d3c70 0%, #3a2a55 55%, #261a40 100%)",
          boxShadow:
            "0 20px 40px -22px rgba(40,25,75,0.7), 0 0 0 1px rgba(240,215,140,0.22) inset, inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Subtle church silhouette + manuscript dot texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(240,215,140,0.55) 0.6px, transparent 0.6px)",
            backgroundSize: "9px 9px",
            maskImage:
              "linear-gradient(180deg, transparent 0%, #000 40%, #000 100%)",
          }}
        />
        <svg
          aria-hidden
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-14 opacity-[0.14]"
        >
          <path
            d="M0,80 L0,55 L30,55 L30,42 L48,42 L48,55 L70,55 L70,30 L78,22 L86,30 L86,55 L120,55 L120,40 L140,40 L140,28 L150,18 L160,28 L160,40 L180,40 L180,55 L210,55 L210,32 L222,22 L234,32 L234,55 L270,55 L270,45 L290,45 L290,55 L320,55 L320,80 Z"
            fill="#f0d78c"
          />
          <line x1="150" y1="6" x2="150" y2="20" stroke="#f0d78c" strokeWidth="1.5" />
          <line x1="144" y1="11" x2="156" y2="11" stroke="#f0d78c" strokeWidth="1.5" />
          <line x1="82" y1="12" x2="82" y2="22" stroke="#f0d78c" strokeWidth="1.2" />
          <line x1="78" y1="16" x2="86" y2="16" stroke="#f0d78c" strokeWidth="1.2" />
          <line x1="228" y1="12" x2="228" y2="22" stroke="#f0d78c" strokeWidth="1.2" />
          <line x1="224" y1="16" x2="232" y2="16" stroke="#f0d78c" strokeWidth="1.2" />
        </svg>
        <div aria-hidden className="absolute right-3 top-3 text-[#f0d78c]/45">
          <CopticCross size={12} />
        </div>

        <div className="relative p-3.5 text-right">
          {/* Header row: title + gold unread pill */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-extrabold text-[#f7e7b8] tracking-tight">
              رسائل الكنيسة
            </h3>
            {unread > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-[3px] rounded-full text-[#3a2a10]"
                style={{
                  background:
                    "linear-gradient(180deg, #fbecb2 0%, #e7c97a 55%, #c98a3c 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px -2px rgba(216,138,42,0.55)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3a2a10]" />
                {unread} رسائل جديدة
              </span>
            )}
          </div>

          {/* Body row: refined 3D icon + message preview */}
          <div className="mt-2.5 flex items-stretch gap-3">
            <div
              className="relative shrink-0 grid place-items-center rounded-[14px] overflow-hidden"
              style={{
                width: 44,
                height: 44,
                background:
                  "radial-gradient(120% 90% at 30% 20%, rgba(247,231,184,0.55), rgba(120,75,170,0.35) 65%, rgba(58,42,85,0.9) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -6px 10px rgba(58,42,85,0.55), 0 6px 14px -6px rgba(216,138,42,0.55), 0 0 0 1px rgba(240,215,140,0.5)",
              }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <defs>
                  <linearGradient id="msgGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff4cf" />
                    <stop offset="55%" stopColor="#f0d78c" />
                    <stop offset="100%" stopColor="#c98a3c" />
                  </linearGradient>
                </defs>
                <rect
                  x="3" y="5.5" width="18" height="13" rx="2.5"
                  fill="url(#msgGold)" stroke="#7a5418" strokeWidth="0.6"
                />
                <path
                  d="M3.5 6.5 L12 13 L20.5 6.5"
                  stroke="#5a3d10" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
                <path d="M12 2.5 L12 5" stroke="#f0d78c" strokeWidth="1" strokeLinecap="round" />
                <path d="M11 3.5 L13 3.5" stroke="#f0d78c" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold text-[#f7e7b8] truncate">
                  الأب داود
                </span>
                <span className="text-[9.5px] text-[#e7c97a]/70 shrink-0">
                  منذ ٢٠ دقيقة
                </span>
              </div>
              <p className="text-[11.5px] text-[#e7c97a]/90 mt-0.5 truncate leading-snug">
                اجتماع الخدام السبت القادم بعد القداس…
              </p>
            </div>

            <ChevronLeft className="h-4 w-4 text-[#f0d78c]/70 shrink-0 self-center" />
          </div>

          {/* Glassy category chips */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {[
              { label: "كاهن", dot: "#f0d78c" },
              { label: "خدمة", dot: "#9fd6ff" },
              { label: "عضوية", dot: "#a8f0c6" },
              { label: "إشعار", dot: "#f6b6b6" },
            ].map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[9.5px] font-semibold text-[#f7e7b8]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
                  border: "1px solid rgba(240,215,140,0.25)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: c.dot }}
                />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ===== Secondary featured: Personal =====
function PersonalFeature() {
  return (
    <Link to={"/profile/personal" as any} className="block active:scale-[0.99] transition-transform mt-3">
      <GlassCard accent="#4a86c1" className="p-3.5">
        <div aria-hidden className="pointer-events-none absolute -left-2 -bottom-4 text-[90px] leading-none font-bold text-[#4a86c1] opacity-[0.06] select-none">✥</div>
        <div className="flex items-center gap-3.5">
          <Icon3D color="#4a86c1" size={52}>
            <UserIcon className="h-5.5 w-5.5" style={{ color: "#4a86c1" }} strokeWidth={2.4} />
          </Icon3D>
          <div className="flex-1 min-w-0 text-right">
            <h3 className="text-[14.5px] font-extrabold text-[#3a2a18]">البيانات الشخصية</h3>
            <p className="text-[11.5px] text-[#6a543a] mt-0.5 truncate">عرض وتعديل بياناتك الشخصية</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-[#b8893a]/70 shrink-0" />
        </div>
      </GlassCard>
    </Link>
  );
}

function Icon3D({ color, size = 44, children }: { color: string; size?: number; children: React.ReactNode }) {
  return (
    <div
      className="relative shrink-0 grid place-items-center rounded-2xl border overflow-hidden"
      style={{
        width: size, height: size,
        background: `radial-gradient(120% 90% at 30% 20%, ${color}66, ${color}1a 70%)`,
        borderColor: `${color}66`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -6px 10px ${color}33, 0 8px 18px -8px ${color}99`,
      }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

// ===== Small grid tile =====
function GridTile({ to, icon: Icon, title, subtitle, accent, glyph }: { to: string; icon: any; title: string; subtitle: string; accent: string; glyph?: string }) {
  return (
    <Link to={to as any} className="block active:scale-[0.985] transition-transform">
      <GlassCard accent={accent} className="p-3 h-full">
        {glyph && (
          <div aria-hidden className="pointer-events-none absolute -left-2 -bottom-3 text-[70px] leading-none font-bold select-none opacity-[0.06]" style={{ color: accent }}>{glyph}</div>
        )}
        <div className="flex flex-col items-center text-center gap-2">
          <Icon3D color={accent} size={40}>
            <Icon className="h-4.5 w-4.5" style={{ color: accent }} strokeWidth={2.4} />
          </Icon3D>
          <div className="min-w-0">
            <h3 className="text-[12.5px] font-extrabold text-[#3a2a18] truncate">{title}</h3>
            <p className="text-[10px] text-[#6a543a] mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

function ProfileScreen() {
  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 0%, rgba(231,201,122,0.35), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 30%, rgba(216,138,42,0.16), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(190,150,90,0.22), transparent 65%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#ecdcb6 100%)",
        }}
      />
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),10px)]">
        <header className="flex items-center justify-between gap-2 pt-1">
          <Link to={"/home" as any} aria-label="رجوع" className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_4px_12px_-8px_rgba(120,80,30,0.4)] active:scale-95 transition">
            <ChevronRight className="h-4.5 w-4.5 text-[#3a2a18]" />
          </Link>
          <h1 className="text-[14px] font-extrabold text-[#3a2a18]">الملف الشخصي</h1>
          <div className="h-9 w-9" />
        </header>

        <ProfileHero />
        <MembershipCard />

        <SectionTitle>رسائل الكنيسة</SectionTitle>
        <MessagesHero />

        <SectionTitle>بياناتي</SectionTitle>
        <PersonalFeature />

        <SectionTitle>إدارة الحساب</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <GridTile to="/profile/church" icon={Church} title="كنيستي" subtitle={MEMBER.church} accent="#c98a3c" glyph="☩" />
          <GridTile to="/profile/family" icon={Users} title="العائلة" subtitle="أفراد العائلة" accent="#a07ec4" glyph="✿" />
          <GridTile to="/profile/appearance" icon={Palette} title="المظهر" subtitle="فاتح · داكن · النظام" accent="#d8a83a" glyph="Ⲁ" />
          <GridTile to="/profile/security" icon={Shield} title="الخصوصية والأمان" subtitle="كلمة المرور والأجهزة" accent="#3f9d6e" glyph="⛨" />
        </div>

        <p className="mt-8 text-center text-[10px] text-[#9a7e5a]">
          ⲁⲗⲫⲁ · Alpha Coptic · إصدار 1.0
        </p>
      </div>

      <BottomDock />
    </div>
  );
}
