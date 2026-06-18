import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  HandHeart,
  Crown,
  Sparkles,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ChevronLeft,
  ShieldCheck,
  Star,
  BadgeCheck,
} from "lucide-react";
import { ProfileSubShell } from "@/components/profile/Shell";
import { CopticCross, CopticSeparator } from "@/components/coptic";
import { AlphaOfficialLogo } from "@/components/brand";

/* ---------- Types ---------- */
type UserRole = "member" | "servant" | "leader" | "priest";

type Service = {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  membersCount: number;
  servantsCount: number;
  nextMeeting: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
  leader: string;
  description: string;
  accent: string;
  glow: string;
};

type RoleMeta = {
  label: string;
  color: string;
  bg: string;
  ring: string;
  icon: any;
  permissions: string[];
};

/* ---------- Role Permissions ---------- */
const ROLE_META: Record<UserRole, RoleMeta> = {
  priest: {
    label: "كاهن",
    color: "#7a4a14",
    bg: "linear-gradient(180deg, rgba(251,236,178,0.95), rgba(231,201,122,0.85))",
    ring: "rgba(201,138,60,0.55)",
    icon: Crown,
    permissions: ["إدارة كاملة", "إضافة وحذف الخدّام", "تعديل بيانات الخدمة", "نشر الإعلانات"],
  },
  leader: {
    label: "أمين الخدمة",
    color: "#5a3a8a",
    bg: "linear-gradient(180deg, rgba(232,222,250,0.95), rgba(210,196,240,0.85))",
    ring: "rgba(122,90,170,0.45)",
    icon: Star,
    permissions: ["إدارة الخدمة", "إضافة الخدّام", "جدولة الاجتماعات", "متابعة الحضور"],
  },
  servant: {
    label: "خادم",
    color: "#2f7d5a",
    bg: "linear-gradient(180deg, rgba(220,242,228,0.95), rgba(198,232,212,0.85))",
    ring: "rgba(63,157,110,0.45)",
    icon: HandHeart,
    permissions: ["إدارة محدودة", "تسجيل الحضور", "إضافة الأعضاء", "مشاركة الإعلانات"],
  },
  member: {
    label: "عضو",
    color: "#6a543a",
    bg: "linear-gradient(180deg, rgba(248,238,210,0.95), rgba(236,222,182,0.85))",
    ring: "rgba(184,137,58,0.4)",
    icon: BadgeCheck,
    permissions: ["عرض الخدمة", "الاطلاع على الاجتماعات", "تلقي الإعلانات"],
  },
};

/* ---------- Mock data ---------- */
const CURRENT_USER_ROLE: UserRole = "servant";

const MY_SERVICE: Service = {
  id: "youth",
  name: "Youth Service",
  arabicName: "خدمة الشباب",
  icon: "✿",
  membersCount: 84,
  servantsCount: 12,
  nextMeeting: {
    title: "اجتماع الأسبوع",
    date: "الجمعة 13 يونيو",
    time: "7:00 م",
    location: "قاعة الشباب — كنيسة ألفا",
  },
  leader: "الشماس مينا عاطف",
  description: "خدمة الشباب من ١٨ إلى ٣٥ سنة — اجتماعات أسبوعية، رحلات، خلوات روحية.",
  accent: "#a07ec4",
  glow: "rgba(160,126,196,0.45)",
};

const OTHER_SERVICES: Pick<Service, "id" | "arabicName" | "icon" | "accent" | "membersCount">[] = [
  { id: "sunday", arabicName: "مدارس الأحد", icon: "☩", accent: "#c98a3c", membersCount: 142 },
  { id: "girls", arabicName: "خدمة البنات", icon: "✿", accent: "#d68aa8", membersCount: 56 },
  { id: "choir", arabicName: "الكورال", icon: "♪", accent: "#5a78b8", membersCount: 28 },
  { id: "deacons", arabicName: "الشمامسة", icon: "✠", accent: "#3f9d6e", membersCount: 18 },
];

/* ---------- Premium Service Card ---------- */
function ServiceCard({ service, role }: { service: Service; role: UserRole }) {
  const roleMeta = ROLE_META[role];
  const RoleIcon = roleMeta.icon;

  return (
    <div
      className="relative overflow-hidden rounded-[28px] pt-9 pb-4 px-4 mt-5"
      style={{
        background:
          `radial-gradient(120% 70% at 50% 0%, ${service.accent}28, transparent 55%),` +
          "radial-gradient(90% 60% at 100% 100%, rgba(231,201,122,0.22), transparent 65%)," +
          "linear-gradient(180deg, rgba(252,250,240,0.95) 0%, rgba(246,240,232,0.88) 100%)",
        border: "1px solid rgba(201,180,120,0.45)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: `0 26px 50px -26px ${service.glow}, 0 0 36px -18px rgba(216,170,80,0.4), inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      {/* Golden light rays */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 220deg at 50% 0%, transparent 0deg, rgba(231,201,122,0.22) 30deg, transparent 60deg, rgba(231,201,122,0.18) 95deg, transparent 130deg, rgba(231,201,122,0.2) 165deg, transparent 200deg)",
          maskImage: "linear-gradient(180deg, #000 0%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 90%)",
        }}
      />
      {/* Coptic watermark */}
      <span aria-hidden className="absolute top-10 left-3 text-[58px] leading-none font-bold select-none" style={{ color: service.accent, opacity: 0.08 }}>Ⲱ</span>
      <span aria-hidden className="absolute bottom-3 right-3 text-[64px] leading-none font-bold text-[#8a5a14]/[0.08] select-none">Ⲁ</span>

      {/* Gold ornamental top hairline */}
      <span
        aria-hidden
        className="absolute left-6 right-6 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(216,170,80,0.6), transparent)" }}
      />

      {/* Official Alpha logo crest at top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center h-14 w-14 rounded-full"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 20%, rgba(255,247,215,0.98), rgba(231,201,122,0.6) 65%, rgba(201,138,60,0.4))",
          border: "1.5px solid rgba(201,138,60,0.6)",
          boxShadow:
            "0 0 22px rgba(231,201,122,0.7), inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 22px -10px rgba(201,138,60,0.55)",
        }}
      >
        <AlphaOfficialLogo size="sm" className="scale-[0.85]" />
      </div>

      {/* Header: name + role badge */}
      <div className="relative flex items-center gap-2.5">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl shrink-0 text-[22px] font-extrabold"
          style={{
            background: `radial-gradient(120% 90% at 30% 20%, ${service.accent}55, ${service.accent}1a 70%)`,
            border: `1.5px solid ${service.accent}80`,
            color: service.accent,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px -10px ${service.glow}`,
          }}
        >
          {service.icon}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <h2 className="text-[15px] font-extrabold text-[#1f3a2a] truncate">
              {service.arabicName}
            </h2>
            <Sparkles className="h-3.5 w-3.5 text-[#b8893a]" />
          </div>
          <div className="text-[10.5px] text-[#5a7766] truncate">
            {service.leader} · {service.name}
          </div>
        </div>

        {/* User status badge */}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0 text-[10.5px] font-extrabold"
          style={{
            background: roleMeta.bg,
            border: `1px solid ${roleMeta.ring}`,
            color: roleMeta.color,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px -10px ${roleMeta.color}66`,
          }}
        >
          <RoleIcon className="h-3 w-3" />
          {roleMeta.label}
        </span>
      </div>

      <div className="relative my-3.5 h-px bg-gradient-to-r from-transparent via-[#b8893a]/40 to-transparent" />

      {/* Stats */}
      <div className="relative grid grid-cols-2 gap-2">
        <Stat label="الأعضاء" value={service.membersCount} icon={Users} color="#3f7d5a" />
        <Stat label="الخدّام" value={service.servantsCount} icon={HandHeart} color={service.accent} />
      </div>

      {/* Next Meeting */}
      <div
        className="relative mt-3 rounded-2xl p-3"
        style={{
          background: "linear-gradient(180deg, rgba(251,236,178,0.55), rgba(231,201,122,0.28))",
          border: "1px solid rgba(201,138,60,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-[#7a4a14]" />
          <span className="text-[10.5px] font-extrabold text-[#7a4a14]">الاجتماع القادم</span>
          <span className="flex-1 h-px bg-gradient-to-l from-transparent via-[#b8893a]/30 to-transparent" />
        </div>
        <div className="text-right">
          <div className="text-[12.5px] font-extrabold text-[#1f3a2a]">{service.nextMeeting.title}</div>
          <div className="mt-1 flex items-center justify-end gap-3 text-[10.5px] text-[#5a7766] flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#b8893a]" />
              {service.nextMeeting.date} · {service.nextMeeting.time}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#b8893a]" />
              {service.nextMeeting.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, icon: Icon, color,
}: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div
      className="rounded-2xl px-2.5 py-2.5 text-center"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(250,246,238,0.7))",
        border: `1px solid ${color}33`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 14px -10px ${color}66`,
      }}
    >
      <Icon className="mx-auto h-4 w-4" style={{ color }} />
      <div className="mt-0.5 font-extrabold text-[18px] text-[#1f3a2a]">{value}</div>
      <div className="text-[10px] text-[#5a7766]">{label}</div>
    </div>
  );
}

/* ---------- Permissions Card ---------- */
function PermissionsCard({ role }: { role: UserRole }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-4"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.ring}`,
        backdropFilter: "blur(18px)",
        boxShadow: `0 14px 28px -20px ${meta.color}66, inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${meta.ring}` }}
        >
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 text-right">
          <div className="text-[12.5px] font-extrabold" style={{ color: meta.color }}>
            صلاحياتك: {meta.label}
          </div>
          <div className="text-[10px] text-[#5a7766]">ما يمكنك فعله في الخدمة</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {meta.permissions.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[11.5px] text-[#1f3a2a]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Other Services List ---------- */
function OtherServiceRow({ s }: { s: typeof OTHER_SERVICES[number] }) {
  return (
    <button
      className="w-full flex items-center gap-3 p-3 rounded-2xl transition active:scale-[0.98]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(250,246,238,0.7))",
        border: `1px solid ${s.accent}33`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 16px -12px ${s.accent}55`,
      }}
    >
      <div
        className="grid h-10 w-10 place-items-center rounded-xl shrink-0 text-[18px] font-extrabold"
        style={{
          background: `radial-gradient(120% 90% at 30% 20%, ${s.accent}44, ${s.accent}14 70%)`,
          border: `1px solid ${s.accent}60`,
          color: s.accent,
        }}
      >
        {s.icon}
      </div>
      <div className="flex-1 text-right">
        <div className="text-[13px] font-extrabold text-[#1f3a2a]">{s.arabicName}</div>
        <div className="text-[10.5px] text-[#5a7766]">{s.membersCount} عضو</div>
      </div>
      <ChevronLeft className="h-4 w-4 text-[#b8893a]" />
    </button>
  );
}

/* ---------- Screen ---------- */
function ServiceScreen() {
  const [role] = useState<UserRole>(CURRENT_USER_ROLE);
  const service = useMemo(() => MY_SERVICE, []);

  return (
    <ProfileSubShell title="خدمتي">
      <p className="-mt-3 mb-3 text-center text-[11px] text-[#3f6a55]">
        خدمتك في كنيسة ألفا — اجتماعات، أعضاء، صلاحيات
      </p>

      <ServiceCard service={service} role={role} />

      <CopticSeparator className="my-4" />

      <PermissionsCard role={role} />

      <div className="flex items-center justify-between mt-5 mb-2 px-1">
        <h2 className="text-[13px] font-extrabold text-[#1f3a2a]">خدمات أخرى في الكنيسة</h2>
        <CopticCross className="text-[#b8893a]" size={12} />
      </div>

      <div className="space-y-2">
        {OTHER_SERVICES.map((s) => (
          <OtherServiceRow key={s.id} s={s} />
        ))}
      </div>

      <p className="mt-5 text-center text-[10px] text-[#5a7766]">
        الخدمة هي تجسيد محبة المسيح لإخوته في الكنيسة.
      </p>
    </ProfileSubShell>
  );
}

export const Route = createFileRoute("/profile/service")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — خدمتي" }] }),
  component: ServiceScreen,
});
