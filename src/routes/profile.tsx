import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, MessageSquare, User as UserIcon, Church,
  Users, Palette, Shield, BadgeCheck, Crown, QrCode, Calendar,
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

// ----- Member data (placeholder) -----
const MEMBER = {
  name: "مينا عاطف",
  role: "خادم مدارس الأحد",
  church: "كنيسة الشهيد مار جرجس",
  membershipNo: "AC-2024-00187",
  status: "عضو فعّال",
  joinDate: "12 يناير 2019",
  verified: true,
};

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=fbf3e1&color=3a2a18&data=${encodeURIComponent(
  `alpha://member/${MEMBER.membershipNo}`,
)}`;


// ===== Reusable premium glass card =====
function GlassCard({
  children,
  accent = "#b8893a",
  className = "",
  glow = true,
  sceneUrl,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
  glow?: boolean;
  sceneUrl?: string;
}) {
  return (
    <div
      className={`relative rounded-[26px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 backdrop-blur-xl overflow-hidden ${className}`}
      style={
        glow
          ? {
              boxShadow: `0 22px 44px -22px rgba(120,80,30,0.6), 0 6px 18px -10px ${accent}66, 0 0 0 1px rgba(255,255,255,0.45) inset, 0 0 32px -14px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.8)`,
            }
          : undefined
      }
    >
      {/* subtle Orthodox scene */}
      {sceneUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
          style={{ backgroundImage: `url(${sceneUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      {/* top glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[26px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 40%, transparent 100%)",
        }}
      />
      {/* gold edge */}
      <div className="pointer-events-none absolute inset-0 rounded-[26px]" style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }} />
      <div className="relative">{children}</div>
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 px-1">
      <CopticCross className="text-[#b8893a]" size={14} />
      <h2 className="text-[15px] font-extrabold text-[#3a2a18]">{children}</h2>
    </div>
  );
}

// ===== Hero =====
function ProfileHero() {
  return (
    <div className="relative mt-3 overflow-hidden rounded-[28px] border border-[#efe2c4] shadow-[0_22px_44px_-22px_rgba(120,80,30,0.6)]">
      {/* Church silhouette background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 10%, rgba(231,201,122,0.55), transparent 65%)," +
            "linear-gradient(180deg,#2a1a0d 0%,#3a2818 55%,#1e120a 100%)",
        }}
      />
      {/* Alpha & Omega watermark */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-between px-4 opacity-[0.07] text-[#f0d78c] font-bold text-[120px] leading-none select-none">
        <span>Ⲱ</span>
        <span>Ⲁ</span>
      </div>
      {/* Cross at top center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[#f0d78c]/50 drop-shadow-[0_0_8px_rgba(240,215,140,0.5)]">
        <CopticCross size={18} />
      </div>
      {/* Golden rays */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[180px] opacity-60 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 270deg at 50% 0%, transparent 0deg, rgba(240,215,140,0.18) 12deg, transparent 24deg, rgba(240,215,140,0.22) 40deg, transparent 56deg, rgba(240,215,140,0.16) 80deg, transparent 100deg, rgba(240,215,140,0.22) 130deg, transparent 160deg, rgba(240,215,140,0.18) 200deg, transparent 230deg)",
        }}
      />

      <div className="relative px-5 pt-6 pb-5 flex flex-col items-center text-center">
        {/* Avatar with halo */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full"
            style={{
              background:
                "conic-gradient(from 90deg, #e7c97a, #d88a2a, #f0d78c, #b8893a, #e7c97a)",
              filter: "blur(8px)",
              opacity: 0.9,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -m-1 rounded-full"
            style={{ boxShadow: "0 0 32px 6px rgba(240,215,140,0.45)" }}
          />
          <div className="relative h-[88px] w-[88px] rounded-full border-2 border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#3a2418] grid place-items-center">
            <span className="text-[34px] font-bold text-[#f0d78c]">
              {MEMBER.name.charAt(0)}
            </span>
          </div>
          {MEMBER.verified && (
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#f0d78c] to-[#b8893a] border-2 border-[#1e120a] shadow-[0_4px_12px_rgba(216,138,42,0.6)]">
              <BadgeCheck className="h-4 w-4 text-[#1e120a]" strokeWidth={2.5} />
            </span>
          )}
        </div>

        <h1 className="mt-3 text-[20px] font-extrabold text-[#f7e7b8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">{MEMBER.name}</h1>
        {MEMBER.verified && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#f0d78c]/45 bg-gradient-to-b from-[#f0d78c]/15 to-[#b8893a]/10 px-2.5 py-0.5 text-[10.5px] font-bold text-[#f0d78c] shadow-[0_0_10px_-2px_rgba(240,215,140,0.5)]">
            <BadgeCheck className="h-3 w-3" strokeWidth={2.5} /> عضو موثق
          </span>
        )}
        <p className="mt-1 text-[12px] text-[#e7c97a]/85 flex items-center gap-1.5">
          <Crown className="h-3 w-3" /> {MEMBER.role}
        </p>
        <p className="mt-0.5 text-[11px] text-[#d8c190]/75">{MEMBER.church}</p>
      </div>
    </div>
  );
}


// ===== Smart Membership Card =====
function MembershipCard() {
  return (
    <GlassCard accent="#d88a2a" className="mt-4 p-4">
      {/* faint manuscript watermark */}
      <div aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 text-[140px] leading-none font-bold text-[#d88a2a] opacity-[0.05] select-none">
        ☧
      </div>
      <div className="flex items-stretch gap-3">
        {/* QR (reduced ~18%) */}
        <div className="shrink-0 grid place-items-center rounded-2xl bg-[#fbf3e1] p-1.5 border border-[#efe2c4] shadow-[inset_0_0_0_1px_rgba(216,138,42,0.22),0_4px_10px_-6px_rgba(120,80,30,0.4)]">
          <img src={QR_URL} alt="QR العضوية" className="h-[78px] w-[78px]" loading="lazy" />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#b8893a]">
              <QrCode className="h-3 w-3" /> بطاقة عضوية ذكية
            </div>
            <h3 className="mt-0.5 text-[13.5px] font-extrabold text-[#3a2a18] truncate">{MEMBER.church}</h3>
            <p className="text-[11px] text-[#6a543a] mt-0.5 flex items-center gap-1 truncate">
              <Crown className="h-3 w-3 text-[#b8893a]" /> {MEMBER.role}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-y-0.5 text-[10.5px] mt-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#9a7e5a]">رقم العضوية</span>
              <span className="text-[#3a2a18] font-bold tabular-nums truncate">{MEMBER.membershipNo}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#9a7e5a]">الحالة</span>
              <span className="text-[#2f7a4a] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2f7a4a] shadow-[0_0_6px_rgba(47,122,74,0.7)]" /> {MEMBER.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#9a7e5a]">تاريخ الانضمام</span>
              <span className="text-[#3a2a18] font-bold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[#b8893a]" /> {MEMBER.joinDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ===== Nav Card =====
function NavCard({
  to, icon: Icon, title, subtitle, accent, badge, glyph,
}: {
  to: string; icon: any; title: string; subtitle: string; accent: string; badge?: string; glyph?: string;
}) {
  return (
    <Link to={to as any} className="block active:scale-[0.985] transition-transform">
      <GlassCard accent={accent} className="p-3.5">
        {glyph && (
          <div
            aria-hidden
            className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 text-[88px] leading-none font-bold select-none opacity-[0.06]"
            style={{ color: accent }}
          >
            {glyph}
          </div>
        )}
        <div className="flex items-center gap-3">
          {/* 3D metallic icon */}
          <div
            className="relative shrink-0 grid h-12 w-12 place-items-center rounded-2xl border overflow-hidden"
            style={{
              background: `radial-gradient(120% 90% at 30% 20%, ${accent}66, ${accent}1a 70%)`,
              borderColor: `${accent}66`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -6px 10px ${accent}33, 0 8px 18px -8px ${accent}99`,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)" }}
            />
            <Icon className="relative h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" style={{ color: accent }} strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 justify-between">
              <h3 className="text-[14px] font-extrabold text-[#3a2a18] truncate">{title}</h3>
              {badge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.4)]"
                  style={{ background: `linear-gradient(180deg, ${accent}, ${accent}cc)` }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-[#6a543a] mt-0.5 truncate">{subtitle}</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-[#b8893a]/70 shrink-0" />
        </div>
      </GlassCard>
    </Link>
  );
}

// ===== Messages preview card =====
function MessagesCard() {
  const unread = 3;
  return (
    <Link to={"/profile/messages" as any} className="block active:scale-[0.99] transition-transform">
      <GlassCard accent="#8a6ec1" className="p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-4 -bottom-6 text-[120px] leading-none font-bold text-[#8a6ec1] opacity-[0.06] select-none"
        >
          ✉
        </div>
        <div className="flex items-center gap-3">
          <div
            className="relative shrink-0 grid h-12 w-12 place-items-center rounded-2xl border overflow-hidden"
            style={{
              background: "radial-gradient(120% 90% at 30% 20%, #8a6ec166, #8a6ec11a 70%)",
              borderColor: "#8a6ec166",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -6px 10px #8a6ec133, 0 8px 18px -8px #8a6ec199",
            }}
          >
            <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)" }} />
            <MessageSquare className="relative h-5 w-5 text-[#8a6ec1] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 justify-between">
              <h3 className="text-[14px] font-extrabold text-[#3a2a18]">رسائل الكنيسة</h3>
              {unread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-l from-[#8a6ec1] to-[#d88a2a] text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.4)]">
                  {unread} جديد
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-[#6a543a] mt-1 truncate">
              أبونا داود: «اجتماع الخدام يوم السبت بعد القداس…»
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#9a7e5a]">
              <span className="px-1.5 py-0.5 rounded-full bg-[#8a6ec120] text-[#6a4ea1]">كاهن</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#d88a2a20] text-[#8a5a14]">خدمة</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#4a9e6e20] text-[#2f7a4a]">عضوية</span>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-[#b8893a]/70 shrink-0" />
        </div>
      </GlassCard>
    </Link>
  );
}



function ProfileScreen() {
  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      {/* Cream background (mirrors Home) */}
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

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-2 pt-2">
          <Link to={"/home" as any} aria-label="رجوع" className="grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition">
            <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">الملف الشخصي</h1>
          <div className="h-10 w-10" />
        </header>

        <ProfileHero />
        <MembershipCard />

        <SectionTitle>الرسائل</SectionTitle>
        <MessagesCard />

        <SectionTitle>بياناتي</SectionTitle>
        <div className="space-y-3">
          <NavCard
            to="/profile/personal"
            icon={UserIcon}
            title="البيانات الشخصية"
            subtitle="الاسم، الجوال، البريد، العنوان"
            accent="#4a86c1"
            glyph="✥"
          />
          <NavCard
            to="/profile/church"
            icon={Church}
            title="كنيستي"
            subtitle={`${MEMBER.church} · ${MEMBER.role}`}
            accent="#c98a3c"
            glyph="☩"
          />
          <NavCard
            to="/profile/family"
            icon={Users}
            title="العائلة"
            subtitle="أفراد العائلة وإدارة الحساب"
            accent="#a07ec4"
            badge="جديد"
            glyph="✿"
          />
        </div>

        <SectionTitle>الإعدادات</SectionTitle>
        <div className="space-y-3">
          <NavCard
            to="/profile/appearance"
            icon={Palette}
            title="المظهر"
            subtitle="فاتح · داكن · النظام"
            accent="#d8a83a"
            glyph="Ⲁ"
          />
          <NavCard
            to="/profile/security"
            icon={Shield}
            title="الخصوصية والأمان"
            subtitle="كلمة المرور، الأجهزة، تسجيل الخروج"
            accent="#3f9d6e"
            glyph="⛨"
          />
        </div>


        <p className="mt-8 text-center text-[10px] text-[#9a7e5a]">
          ⲁⲗⲫⲁ · Alpha Coptic · إصدار 1.0
        </p>
      </div>

      <BottomDock />
    </div>
  );
}
