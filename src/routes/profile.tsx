import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft, ChevronRight, MessageSquare, User as UserIcon, Church,
  Users, Palette, Shield, BadgeCheck, Crown, QrCode, Calendar, Hash, ScanLine,
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
            "radial-gradient(110% 70% at 50% 0%, rgba(231,201,122,0.55), transparent 60%)," +
            "radial-gradient(80% 60% at 50% 110%, rgba(216,138,42,0.35), transparent 60%)," +
            "linear-gradient(180deg,#241408 0%,#3a2818 55%,#180d05 100%)",
        }}
      />

      {/* Alpha / Omega watermark */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-between px-3 opacity-[0.09] text-[#f0d78c] font-bold text-[120px] leading-none select-none">
        <span>Ⲱ</span>
        <span>Ⲁ</span>
      </div>

      {/* Soft gold light rays */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[180px] opacity-60 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 270deg at 50% 0%, transparent 0deg, rgba(240,215,140,0.22) 14deg, transparent 32deg, rgba(240,215,140,0.28) 56deg, transparent 88deg, rgba(240,215,140,0.22) 128deg, transparent 168deg, rgba(240,215,140,0.28) 208deg, transparent 248deg, rgba(240,215,140,0.22) 290deg, transparent 330deg)",
        }}
      />

      {/* Coptic geometry arc */}
      <svg aria-hidden viewBox="0 0 320 60" className="absolute inset-x-0 top-1 mx-auto w-[88%] h-[42px] text-[#f0d78c]/40" fill="none" stroke="currentColor" strokeWidth="0.7">
        <path d="M10 50 Q160 -8 310 50" />
        <path d="M30 52 Q160 8 290 52" opacity="0.55" />
        <circle cx="60" cy="34" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="260" cy="34" r="1.4" fill="currentColor" stroke="none" />
      </svg>

      {/* Top Coptic cross */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#f0d78c]">
        <CopticCross size={18} />
      </div>

      <div className="relative px-4 pt-10 pb-5 flex flex-col items-center text-center">
        {/* Halo + Avatar */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-[18px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #e7c97a, #f7e7b8 16%, #d88a2a 28%, #f0d78c 44%, #b8893a 60%, #f0d78c 74%, #d88a2a 86%, #e7c97a)",
              filter: "blur(2px)",
              opacity: 0.95,
              maskImage:
                "radial-gradient(circle, transparent 56%, black 60%, black 78%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(circle, transparent 56%, black 60%, black 78%, transparent 82%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -m-[26px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(240,215,140,0.55), transparent 65%)",
              filter: "blur(10px)",
            }}
          />
          {/* Ornament dot+cross ring */}
          <svg
            aria-hidden
            viewBox="0 0 120 120"
            className="absolute inset-0 -m-[14px] h-[calc(100%+28px)] w-[calc(100%+28px)] text-[#f0d78c]/90"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 360) / 12;
              const rad = (a * Math.PI) / 180;
              const r = 56;
              const cx = 60 + r * Math.cos(rad);
              const cy = 60 + r * Math.sin(rad);
              return <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.6 : 1} fill="currentColor" />;
            })}
            {[0, 90, 180, 270].map((a) => {
              const rad = (a * Math.PI) / 180;
              const r = 56;
              const cx = 60 + r * Math.cos(rad);
              const cy = 60 + r * Math.sin(rad);
              return (
                <g key={a} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
                  <line x1={cx - 2.5} y1={cy} x2={cx + 2.5} y2={cy} />
                  <line x1={cx} y1={cy - 2.5} x2={cx} y2={cy + 2.5} />
                </g>
              );
            })}
          </svg>

          {/* Avatar */}
          <div className="relative h-[104px] w-[104px] rounded-full border-[3px] border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#2a1810] grid place-items-center shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7)]">
            <span className="text-[42px] font-bold text-[#f0d78c] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{MEMBER.name.charAt(0)}</span>
            <div aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent)" }} />
          </div>

          {/* Emerald verified badge */}
          {MEMBER.verified && (
            <span
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[#1e120a]"
              style={{
                background: "radial-gradient(120% 90% at 30% 20%, #5ee0a0, #1f9e63 60%, #14704a 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 14px rgba(46,204,113,0.65), 0 6px 14px -6px rgba(20,112,74,0.8)",
              }}
              aria-label="عضو موثق"
            >
              <BadgeCheck className="h-4 w-4 text-white" strokeWidth={2.8} />
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

// ===== Premium Membership Card (tap to expand) =====
function MembershipCard() {
  return (
    <Link to={"/profile/membership" as any} className="block active:scale-[0.99] transition-transform mt-3">
      <GlassCard accent="#d88a2a" className="p-3.5">
        {/* manuscript dot texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] rounded-[22px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #b8893a 0.6px, transparent 1px), radial-gradient(circle at 70% 80%, #b8893a 0.6px, transparent 1px)",
            backgroundSize: "14px 14px, 18px 18px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-3 -bottom-5 text-[120px] leading-none font-bold text-[#d88a2a] opacity-[0.06] select-none">☧</div>

        {/* Header strip */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-dashed border-[#d88a2a]/35">
          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold tracking-wider text-[#b8893a] uppercase">
            <CopticCross size={10} /> Alpha Coptic
          </span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#b8893a]">
            بطاقة عضوية ذكية <QrCode className="h-3 w-3" />
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          {/* QR with center brand chip */}
          <div className="relative shrink-0 grid place-items-center rounded-xl bg-[#fbf3e1] p-1.5 border border-[#efe2c4] shadow-[inset_0_0_0_1px_rgba(216,138,42,0.25),0_6px_14px_-8px_rgba(120,80,30,0.5)]">
            <img src={QR_URL} alt="QR العضوية" className="h-[78px] w-[78px]" loading="lazy" />
            <span
              className="absolute inset-0 m-auto grid h-[22px] w-[22px] place-items-center rounded-md text-[11px] font-extrabold"
              style={{
                background: "linear-gradient(135deg,#fbf3e1,#f0d78c)",
                color: "#3a2a18",
                boxShadow: "0 0 0 1.5px #fbf3e1, 0 0 0 2.5px #b8893a, 0 2px 6px rgba(0,0,0,0.25)",
              }}
              aria-hidden
            >
              ⲁ
            </span>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <h3 className="text-[13.5px] font-extrabold text-[#3a2a18] truncate leading-tight">{MEMBER.name}</h3>
            <p className="text-[10.5px] text-[#9a7e5a] mt-0.5 truncate">{MEMBER.role}</p>
            <div className="mt-1.5 grid grid-cols-1 gap-y-0.5 text-[10px]">
              <Row icon={<Hash className="h-2.5 w-2.5" />} label="رقم العضوية" value={MEMBER.membershipNo} mono />
              <Row icon={<Church className="h-2.5 w-2.5" />} label="الكنيسة" value={MEMBER.church} />
              <Row
                icon={<span className="h-1.5 w-1.5 rounded-full bg-[#2f7a4a] shadow-[0_0_6px_rgba(47,122,74,0.8)]" />}
                label="الحالة"
                value={MEMBER.status}
                valueClass="text-[#2f7a4a]"
              />
              <Row icon={<Calendar className="h-2.5 w-2.5" />} label="الانضمام" value={MEMBER.joinDate} />
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-dashed border-[#d88a2a]/35 flex items-center justify-between">
          <span className="text-[9.5px] text-[#9a7e5a]">اضغط لفتح البطاقة الكاملة</span>
          <ChevronLeft className="h-3.5 w-3.5 text-[#b8893a]" />
        </div>
      </GlassCard>
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

// ===== Featured Messages Hero Card =====
function MessagesHero() {
  const unread = 3;
  return (
    <Link to={"/profile/messages" as any} className="block active:scale-[0.99] transition-transform">
      <div
        className="relative overflow-hidden rounded-[24px] border border-[#efe2c4]"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(216,138,42,0.30), transparent 60%)," +
            "linear-gradient(180deg, #4a3a6a 0%, #3a2a55 55%, #2a1d45 100%)",
          boxShadow: "0 22px 44px -22px rgba(74,58,106,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset, inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Church silhouettes */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] mix-blend-screen"
          style={{
            background:
              "radial-gradient(40% 60% at 12% 100%, rgba(231,201,122,0.5), transparent 60%)," +
              "radial-gradient(35% 55% at 88% 100%, rgba(231,201,122,0.45), transparent 60%)",
          }}
        />
        <div aria-hidden className="absolute right-3 top-3 text-[#f0d78c]/50">
          <CopticCross size={14} />
        </div>
        <div aria-hidden className="pointer-events-none absolute -left-3 -bottom-4 text-[120px] leading-none font-bold text-[#f0d78c]/[0.06] select-none">✉</div>

        <div className="relative p-4 flex items-center gap-3.5 text-right">
          <div
            className="relative shrink-0 grid h-14 w-14 place-items-center rounded-2xl border overflow-hidden"
            style={{
              background: "radial-gradient(120% 90% at 30% 20%, rgba(240,215,140,0.45), rgba(216,138,42,0.18) 70%)",
              borderColor: "rgba(240,215,140,0.45)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -6px 10px rgba(216,138,42,0.3), 0 8px 18px -8px rgba(216,138,42,0.6)",
            }}
          >
            <MessageSquare className="h-6 w-6 text-[#f7e7b8]" strokeWidth={2.3} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-gradient-to-b from-[#ff6b6b] to-[#c0392b] text-white text-[10px] font-extrabold px-1 border-2 border-[#3a2a55] shadow-[0_4px_10px_rgba(192,57,43,0.6)]">
                {unread}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-extrabold text-[#f7e7b8]">رسائل الكنيسة</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-l from-[#f0d78c] to-[#d88a2a] text-[#2a1d45]">
                {unread} جديد
              </span>
            </div>
            <p className="text-[11.5px] text-[#e7c97a]/85 mt-1 truncate">
              أبونا داود: «اجتماع الخدام يوم السبت بعد القداس…»
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[9.5px]">
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[#f7e7b8] border border-white/15">كاهن</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[#f7e7b8] border border-white/15">خدمة</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[#f7e7b8] border border-white/15">عضوية</span>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-[#f0d78c]/70 shrink-0" />
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
