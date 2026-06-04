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

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=fbf3e1&color=3a2a18&data=${encodeURIComponent(
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
    <div className="relative mt-2 overflow-hidden rounded-[24px] border border-[#efe2c4] shadow-[0_18px_36px_-20px_rgba(120,80,30,0.55)]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(231,201,122,0.55), transparent 65%)," +
            "linear-gradient(180deg,#2a1a0d 0%,#3a2818 60%,#1e120a 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 flex items-center justify-between px-4 opacity-[0.07] text-[#f0d78c] font-bold text-[90px] leading-none select-none">
        <span>Ⲱ</span>
        <span>Ⲁ</span>
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#f0d78c]/50">
        <CopticCross size={14} />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[120px] opacity-50 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 270deg at 50% 0%, transparent 0deg, rgba(240,215,140,0.18) 18deg, transparent 36deg, rgba(240,215,140,0.22) 60deg, transparent 90deg, rgba(240,215,140,0.18) 130deg, transparent 170deg, rgba(240,215,140,0.22) 210deg, transparent 250deg)",
        }}
      />

      <div className="relative px-4 pt-4 pb-3.5 flex items-center gap-3.5 text-right">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            aria-hidden
            className="absolute inset-0 -m-2 rounded-full"
            style={{
              background: "conic-gradient(from 90deg, #e7c97a, #d88a2a, #f0d78c, #b8893a, #e7c97a)",
              filter: "blur(6px)",
              opacity: 0.85,
            }}
          />
          <div className="relative h-[64px] w-[64px] rounded-full border-2 border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#3a2418] grid place-items-center">
            <span className="text-[26px] font-bold text-[#f0d78c]">{MEMBER.name.charAt(0)}</span>
          </div>
          {MEMBER.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-b from-[#f0d78c] to-[#b8893a] border-2 border-[#1e120a]">
              <BadgeCheck className="h-3 w-3 text-[#1e120a]" strokeWidth={2.5} />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-end gap-1.5">
            <h1 className="text-[17px] font-extrabold text-[#f7e7b8] truncate">{MEMBER.name}</h1>
          </div>
          <p className="mt-0.5 text-[11px] text-[#e7c97a]/85 flex items-center justify-end gap-1.5 truncate">
            <Crown className="h-3 w-3" /> {MEMBER.role}
          </p>
          <p className="mt-0.5 text-[10.5px] text-[#d8c190]/75 truncate">{MEMBER.church}</p>
          {MEMBER.verified && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#f0d78c]/45 bg-gradient-to-b from-[#f0d78c]/15 to-[#b8893a]/10 px-2 py-0.5 text-[10px] font-bold text-[#f0d78c]">
              <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.5} /> عضو موثق
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Horizontal Smart Membership Card =====
function MembershipCard() {
  return (
    <GlassCard accent="#d88a2a" className="mt-3 p-3">
      <div aria-hidden className="pointer-events-none absolute -right-3 -bottom-5 text-[110px] leading-none font-bold text-[#d88a2a] opacity-[0.05] select-none">
        ☧
      </div>
      <div className="flex items-center gap-3">
        {/* Reduced QR */}
        <div className="shrink-0 grid place-items-center rounded-xl bg-[#fbf3e1] p-1 border border-[#efe2c4] shadow-[inset_0_0_0_1px_rgba(216,138,42,0.22)]">
          <img src={QR_URL} alt="QR العضوية" className="h-[66px] w-[66px]" loading="lazy" />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-[#b8893a]">
            بطاقة عضوية ذكية <QrCode className="h-3 w-3" />
          </div>
          <h3 className="mt-0.5 text-[12.5px] font-extrabold text-[#3a2a18] truncate">{MEMBER.name}</h3>
          <div className="mt-1 grid grid-cols-1 gap-y-0.5 text-[10px]">
            <Row icon={<Hash className="h-2.5 w-2.5" />} label="رقم العضوية" value={MEMBER.membershipNo} mono />
            <Row icon={<Church className="h-2.5 w-2.5" />} label="الكنيسة" value={MEMBER.church} />
            <Row icon={<Crown className="h-2.5 w-2.5" />} label="الدور" value={MEMBER.role} />
            <Row
              icon={<span className="h-1.5 w-1.5 rounded-full bg-[#2f7a4a] shadow-[0_0_5px_rgba(47,122,74,0.7)]" />}
              label="الحالة"
              value={MEMBER.status}
              valueClass="text-[#2f7a4a]"
            />
            <Row icon={<Calendar className="h-2.5 w-2.5" />} label="الانضمام" value={MEMBER.joinDate} />
          </div>
        </div>
      </div>
    </GlassCard>
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
