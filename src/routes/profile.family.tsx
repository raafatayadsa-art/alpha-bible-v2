import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
  X,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  IdCard,
  Sparkles,
} from "lucide-react";
import { ProfileSubShell } from "@/components/profile/Shell";
import { CopticCross, CopticSeparator } from "@/components/coptic";
import alphaLogoAsset from "@/assets/alpha-logo.png.asset.json";

type Role =
  | "الأب"
  | "الأم"
  | "ابن"
  | "ابنة"
  | "جد"
  | "جدة"
  | "أخ"
  | "أخت";

type Member = {
  id: number;
  name: string;
  role: Role;
  status: "عضو فعّال" | "عضو" | "زائر";
  verified: boolean;
  initial: string;
};

type Tint = {
  bg: string;
  ring: string;
  glow: string;
  accent: string;
};

// Tint palette — soft mint/sky/gold/amber tones over cream
const TINT_VERIFIED: Tint = {
  bg: "linear-gradient(180deg, rgba(228,244,232,0.92) 0%, rgba(214,236,221,0.88) 100%)",
  ring: "rgba(120,180,140,0.35)",
  glow: "rgba(95,165,120,0.35)",
  accent: "#3f9d6e",
};
const TINT_PENDING: Tint = {
  bg: "linear-gradient(180deg, rgba(250,240,215,0.94) 0%, rgba(245,228,190,0.9) 100%)",
  ring: "rgba(216,170,80,0.38)",
  glow: "rgba(216,170,80,0.35)",
  accent: "#b8893a",
};
const TINT_CHILD: Tint = {
  bg: "linear-gradient(180deg, rgba(230,238,250,0.94) 0%, rgba(224,228,248,0.9) 100%)",
  ring: "rgba(140,160,210,0.38)",
  glow: "rgba(140,160,210,0.35)",
  accent: "#5a78b8",
};
const TINT_OWNER: Tint = {
  bg: "linear-gradient(180deg, rgba(251,236,178,0.96) 0%, rgba(231,201,122,0.92) 100%)",
  ring: "rgba(201,138,60,0.5)",
  glow: "rgba(201,138,60,0.45)",
  accent: "#8a5a14",
};

const ROLE_LABEL_COLORS: Record<Role, string> = {
  "الأب": "#8a5a14",
  "الأم": "#a07ec4",
  "ابن": "#4a86c1",
  "ابنة": "#c98a3c",
  "جد": "#6b5a3a",
  "جدة": "#9a7e5a",
  "أخ": "#3f9d6e",
  "أخت": "#b8893a",
};

function tintFor(m: Member): Tint {
  if (m.role === "الأب") return TINT_OWNER;
  if (!m.verified) return TINT_PENDING;
  if (m.role === "ابن" || m.role === "ابنة") return TINT_CHILD;
  return TINT_VERIFIED;
}

const SEED: Member[] = [
  { id: 1, name: "عاطف صبحي",   role: "الأب", status: "عضو فعّال", verified: true,  initial: "ع" },
  { id: 2, name: "ماري لويس",   role: "الأم", status: "عضو فعّال", verified: true,  initial: "م" },
  { id: 3, name: "مارينا عاطف", role: "أخت",  status: "عضو",       verified: true,  initial: "م" },
  { id: 4, name: "ميخائيل عاطف",role: "ابن",  status: "زائر",      verified: false, initial: "م" },
];

const ROLES: Role[] = ["الأب", "الأم", "ابن", "ابنة", "جد", "جدة", "أخ", "أخت"];

/* ---------- Mint cream background overlay (Family-only) ---------- */
function MintBackdrop() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-[5] pointer-events-none"
      style={{
        background:
          "radial-gradient(110% 60% at 50% 0%, rgba(200,232,210,0.55), transparent 60%)," +
          "radial-gradient(90% 70% at 100% 100%, rgba(231,201,122,0.18), transparent 65%)," +
          "linear-gradient(180deg, rgba(238,248,240,0.85) 0%, rgba(232,244,232,0.78) 50%, rgba(222,236,222,0.82) 100%)",
      }}
    />
  );
}

/* ---------- Premium Summary Card ---------- */
function SummaryCard({ members }: { members: Member[] }) {
  const verified = members.filter((m) => m.verified).length;
  const pending = members.filter((m) => !m.verified).length;
  const owner = members.find((m) => m.role === "الأب");
  return (
    <div
      className="relative overflow-hidden rounded-[28px] pt-9 pb-4 px-4 mt-5"
      style={{
        background:
          "radial-gradient(120% 70% at 50% 0%, rgba(251,236,178,0.35), transparent 55%)," +
          "radial-gradient(90% 60% at 100% 100%, rgba(180,220,190,0.35), transparent 65%)," +
          "linear-gradient(180deg, rgba(252,250,240,0.92) 0%, rgba(236,246,238,0.85) 100%)",
        border: "1px solid rgba(201,180,120,0.45)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:
          "0 26px 50px -26px rgba(60,110,80,0.45), 0 0 36px -18px rgba(216,170,80,0.4), inset 0 1px 0 rgba(255,255,255,0.9)",
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
      {/* Church silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 200 60"
        className="absolute inset-x-0 bottom-0 w-full h-16 opacity-[0.08] pointer-events-none"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M0 60 L0 42 L30 42 L30 30 L45 30 L45 22 L55 14 L65 22 L65 30 L80 30 L80 18 L92 18 L92 12 L96 12 L96 6 L100 2 L104 6 L104 12 L108 12 L108 18 L120 18 L120 30 L135 30 L135 22 L145 14 L155 22 L155 30 L170 30 L170 42 L200 42 L200 60 Z"
          fill="#1f3a2a"
        />
      </svg>
      {/* Ⲁ Ⲱ watermark */}
      <span aria-hidden className="absolute top-10 left-3 text-[58px] leading-none font-bold text-[#3f7d5a]/[0.07] select-none">Ⲱ</span>
      <span aria-hidden className="absolute bottom-3 right-3 text-[64px] leading-none font-bold text-[#8a5a14]/[0.08] select-none">Ⲁ</span>

      {/* Gold ornamental top hairline */}
      <span aria-hidden className="absolute left-6 right-6 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(216,170,80,0.6), transparent)" }} />

      {/* Alpha logo crest at top center */}
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
        <img
          src={alphaLogoAsset.url}
          alt="Alpha"
          className="h-9 w-9 object-contain"
          style={{ filter: "drop-shadow(0 1px 2px rgba(122,74,20,0.35))" }}
        />
      </div>

      <div className="relative flex items-center gap-2.5">
        <div
          className="grid h-11 w-11 place-items-center rounded-2xl shrink-0"
          style={{
            background:
              "radial-gradient(120% 90% at 30% 20%, rgba(251,236,178,0.95), rgba(216,170,80,0.5) 70%)",
            border: "1px solid rgba(201,138,60,0.55)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 18px -10px rgba(201,138,60,0.55)",
          }}
        >
          <Crown className="h-5 w-5 text-[#7a4a14]" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <h2 className="text-[14px] font-extrabold text-[#1f3a2a] truncate">
              {owner ? `عائلة ${owner.name}` : "عائلتي"}
            </h2>
            <Sparkles className="h-3 w-3 text-[#b8893a]" />
          </div>
          <div className="text-[10.5px] text-[#5a7766]">عضوية عائلية في كنيسة ألفا</div>
        </div>
      </div>

      <div className="relative my-3.5 h-px bg-gradient-to-r from-transparent via-[#b8893a]/40 to-transparent" />

      <div className="relative grid grid-cols-3 gap-2">
        <Stat label="إجمالي" value={members.length} icon={Users} color="#3f7d5a" />
        <Stat label="موثّق" value={verified} icon={ShieldCheck} color="#3f9d6e" />
        <Stat label="بانتظار" value={pending} icon={ShieldAlert} color="#b8893a" />
      </div>

      {owner && (
        <div
          className="relative mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(251,236,178,0.55), rgba(231,201,122,0.3))",
            border: "1px solid rgba(201,138,60,0.35)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#7a4a14]">
            <Crown className="h-3.5 w-3.5" />
            رب الأسرة
          </span>
          <span className="text-[11.5px] font-extrabold text-[#1f3a2a] truncate">{owner.name}</span>
        </div>
      )}
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
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(245,252,247,0.7))",
        border: `1px solid ${color}33`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 14px -10px ${color}66`,
      }}
    >
      <Icon className="mx-auto h-4 w-4" style={{ color }} />
      <div className="mt-0.5 font-extrabold text-[16px] text-[#1f3a2a]">{value}</div>
      <div className="text-[9.5px] text-[#5a7766]">{label}</div>
    </div>
  );
}

/* ---------- Member Card ---------- */
function MemberCard({ m }: { m: Member }) {
  const tint = tintFor(m);
  const roleColor = ROLE_LABEL_COLORS[m.role];
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-3.5 transition active:scale-[0.985]"
      style={{
        background: tint.bg,
        border: `1px solid ${tint.ring}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: `0 14px 28px -20px ${tint.glow}, 0 0 20px -14px ${tint.glow}, inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      {/* leading-edge accent (RTL right) */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 right-0 w-[3px] rounded-full"
        style={{ background: `linear-gradient(180deg, ${tint.accent}, ${tint.accent}80)`, opacity: 0.9 }}
      />
      {/* faint Ⲁ watermark */}
      <span aria-hidden className="absolute -bottom-3 -left-1 text-[44px] leading-none font-bold select-none"
        style={{ color: tint.accent, opacity: 0.07 }}>Ⲁ</span>

      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="grid h-12 w-12 place-items-center rounded-full font-extrabold text-[15px] text-[#1f3a2a]"
            style={{
              background: `radial-gradient(120% 90% at 30% 20%, ${tint.accent}55, ${tint.accent}1a 70%)`,
              border: `1.5px solid ${tint.accent}80`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -5px 9px ${tint.accent}33`,
            }}
          >
            {m.initial}
          </div>
          {m.verified ? (
            <span
              className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-white"
              style={{ boxShadow: "0 2px 6px rgba(63,157,110,0.5)" }}
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#3f9d6e]" />
            </span>
          ) : (
            <span
              className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-white"
              style={{ boxShadow: "0 2px 6px rgba(184,137,58,0.5)" }}
            >
              <ShieldAlert className="h-3 w-3 text-[#b8893a]" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-extrabold text-[#1f3a2a] truncate">{m.name}</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: `${roleColor}1f`,
                color: roleColor,
                border: `1px solid ${roleColor}40`,
              }}
            >
              {m.role}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10.5px] flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: m.status === "عضو فعّال" ? "rgba(63,157,110,0.14)" : "rgba(154,126,90,0.12)",
                color: m.status === "عضو فعّال" ? "#2f7d5a" : "#6a543a",
                border: `1px solid ${m.status === "عضو فعّال" ? "rgba(63,157,110,0.35)" : "rgba(154,126,90,0.35)"}`,
              }}
            >
              <IdCard className="h-3 w-3" />
              {m.status}
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: m.verified ? "rgba(63,157,110,0.12)" : "rgba(184,137,58,0.14)",
                color: m.verified ? "#2f7d5a" : "#8a5a14",
                border: `1px solid ${m.verified ? "rgba(63,157,110,0.32)" : "rgba(184,137,58,0.4)"}`,
              }}
            >
              <ShieldCheck className="h-3 w-3" />
              {m.verified ? "موثّق" : "قيد التوثيق"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Add Sheet ---------- */
function AddSheet({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (m: Omit<Member, "id" | "verified" | "initial" | "status">) => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState<Role>("ابن");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-[#1a2a20]/55 backdrop-blur-sm" onClick={onClose} />
      <div
        dir="rtl"
        className="relative w-full max-w-[440px] rounded-t-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #f4faf5 0%, #eaf2ec 100%)",
          border: "1px solid rgba(200,222,206,0.7)",
          boxShadow: "0 -22px 50px -10px rgba(60,110,80,0.45)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="h-1 w-10 rounded-full bg-[#b8893a]/30 absolute left-0 right-0 top-2 mx-auto" />
          <div className="flex items-center gap-2">
            <CopticCross className="text-[#b8893a]" size={14} />
            <h2 className="text-[15px] font-extrabold text-[#1f3a2a]">إضافة فرد للعائلة</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/80 border border-[#d6e8dd]"
          >
            <X className="h-4 w-4 text-[#1f3a2a]" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1 text-right space-y-3">
          <Field label="الاسم الكامل" icon={Users} value={name} onChange={setName} placeholder="الاسم بالكامل" />
          <Field label="رقم الهاتف"   icon={Phone} value={mobile} onChange={setMobile} placeholder="01xxxxxxxxx" type="tel" />
          <Field label="البريد الإلكتروني" icon={Mail} value={email} onChange={setEmail} placeholder="name@email.com" type="email" />
          <Field label="تاريخ الميلاد" icon={CalendarIcon} value={dob} onChange={setDob} placeholder="" type="date" />

          <div>
            <div className="mb-1.5 text-[11px] font-bold text-[#3f6a55]">صلة القرابة</div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold transition"
                    style={
                      active
                        ? {
                            background: "linear-gradient(180deg,#fbecb2,#e7c97a 55%,#c98a3c)",
                            color: "#3a2a10",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px -8px rgba(216,138,42,0.5)",
                            border: "1px solid rgba(216,138,42,0.4)",
                          }
                        : {
                            background: "rgba(255,255,255,0.75)",
                            color: "#1f3a2a",
                            border: "1px solid #d6e8dd",
                          }
                    }
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            disabled={!name.trim()}
            onClick={() => { onSubmit({ name: name.trim(), role }); onClose(); setName(""); setMobile(""); setEmail(""); setDob(""); }}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-extrabold text-[#f7e7b8] disabled:opacity-50"
            style={{
              background: "linear-gradient(180deg,#2f5a44,#1f3a2a)",
              border: "1px solid rgba(240,215,140,0.4)",
              boxShadow: "0 14px 28px -14px rgba(30,60,42,0.7)",
            }}
          >
            <UserPlus className="h-4 w-4" />
            حفظ الفرد الجديد
          </button>
          <p className="text-center text-[10px] text-[#5a7766]">
            سيتم إرسال طلب التحقق إلى إدارة الكنيسة لتوثيق العضو.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, icon: Icon, value, onChange, placeholder, type = "text",
}: { label: string; icon: any; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-bold text-[#3f6a55]">{label}</div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-[#d6e8dd] bg-white/85 backdrop-blur-xl">
        <Icon className="h-4 w-4 text-[#b8893a] shrink-0" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[13px] text-[#1f3a2a] placeholder:text-[#9bb5a5] text-right"
        />
      </div>
    </label>
  );
}

function FamilyScreen() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);

  const sorted = useMemo(() => {
    const order: Role[] = ["الأب", "الأم", "جد", "جدة", "أخ", "أخت", "ابن", "ابنة"];
    return [...members].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
  }, [members]);

  const addMember = (m: Omit<Member, "id" | "verified" | "initial" | "status">) => {
    setMembers((s) => [
      ...s,
      {
        id: Date.now(),
        name: m.name,
        role: m.role,
        status: "زائر",
        verified: false,
        initial: m.name.trim().charAt(0) || "؟",
      },
    ]);
  };

  return (
    <ProfileSubShell title="العائلة">
      <MintBackdrop />
      <p className="-mt-3 mb-3 text-center text-[11px] text-[#3f6a55]">
        إدارة أفراد العائلة المرتبطين بالكنيسة
      </p>

      <SummaryCard members={members} />

      <CopticSeparator className="my-4" />

      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[13px] font-extrabold text-[#1f3a2a]">أفراد العائلة</h2>
        <span className="text-[10.5px] text-[#5a7766]">{members.length} فرد</span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-extrabold text-[#3a2a10] transition active:scale-[0.985]"
        style={{
          background:
            "linear-gradient(180deg, rgba(251,236,178,0.95), rgba(231,201,122,0.95) 55%, rgba(201,138,60,0.95))",
          border: "1px solid rgba(201,138,60,0.5)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.75), 0 14px 28px -14px rgba(201,138,60,0.6), 0 0 22px -14px rgba(63,157,110,0.45)",
        }}
      >
        <UserPlus className="h-4 w-4" />
        + إضافة فرد جديد
      </button>

      <p className="mt-3 text-center text-[10px] text-[#5a7766]">
        الأفراد ينتمون إلى منظومة الكنيسة، وليست مجرد جهات اتصال.
      </p>

      <AddSheet open={addOpen} onClose={() => setAddOpen(false)} onSubmit={addMember} />
    </ProfileSubShell>
  );
}

export const Route = createFileRoute("/profile/family")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — العائلة" }] }),
  component: FamilyScreen,
});
