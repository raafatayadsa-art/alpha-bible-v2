import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus,
  BadgeCheck,
  ShieldCheck,
  Users,
  Crown,
  ChevronLeft,
  X,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  IdCard,
} from "lucide-react";
import { ProfileSubShell } from "@/components/profile/Shell";
import { CopticCross, CopticSeparator } from "@/components/coptic";

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

const ROLE_COLORS: Record<Role, string> = {
  "الأب": "#8a5a14",
  "الأم": "#a07ec4",
  "ابن": "#4a86c1",
  "ابنة": "#c98a3c",
  "جد": "#6b5a3a",
  "جدة": "#9a7e5a",
  "أخ": "#3f9d6e",
  "أخت": "#b8893a",
};

const SEED: Member[] = [
  { id: 1, name: "عاطف صبحي",   role: "الأب", status: "عضو فعّال", verified: true,  initial: "ع" },
  { id: 2, name: "ماري لويس",   role: "الأم", status: "عضو فعّال", verified: true,  initial: "م" },
  { id: 3, name: "مارينا عاطف", role: "أخت",  status: "عضو",       verified: true,  initial: "م" },
  { id: 4, name: "ميخائيل عاطف",role: "ابن",  status: "زائر",      verified: false, initial: "م" },
];

const ROLES: Role[] = ["الأب", "الأم", "ابن", "ابنة", "جد", "جدة", "أخ", "أخت"];

function SummaryCard({ members }: { members: Member[] }) {
  const verified = members.filter((m) => m.verified).length;
  const parents = members.filter((m) => m.role === "الأب" || m.role === "الأم").length;
  const children = members.filter((m) => m.role === "ابن" || m.role === "ابنة").length;
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[#efe2c4] p-4"
      style={{
        background:
          "radial-gradient(120% 90% at 20% 0%, rgba(231,201,122,0.45), transparent 65%)," +
          "linear-gradient(180deg, #fbf3e1 0%, #f4ead8 100%)",
        boxShadow:
          "0 18px 36px -22px rgba(120,80,30,0.55), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* Coptic Ⲁ Ⲱ watermark */}
      <span aria-hidden className="absolute -top-3 -left-1 text-[64px] leading-none font-bold text-[#8a5a14]/[0.07] select-none">Ⲱ</span>
      <span aria-hidden className="absolute -bottom-4 -right-1 text-[72px] leading-none font-bold text-[#8a5a14]/[0.07] select-none">Ⲁ</span>

      <div className="flex items-center gap-2">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{
            background: "radial-gradient(120% 90% at 30% 20%, rgba(216,168,58,0.55), rgba(184,137,58,0.18) 70%)",
            border: "1px solid rgba(216,168,58,0.55)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <Crown className="h-4.5 w-4.5 text-[#7a4a14]" />
        </div>
        <div className="text-right">
          <div className="text-[13px] font-extrabold text-[#3a2a18]">عائلة عاطف صبحي</div>
          <div className="text-[10.5px] text-[#9a7e5a]">إدارة أفراد العائلة المرتبطين بالكنيسة</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="إجمالي" value={members.length} icon={Users} color="#b8893a" />
        <Stat label="موثّق" value={verified} icon={ShieldCheck} color="#3f9d6e" />
        <Stat label="هيكل" value={`${parents}/${children}`} icon={Crown} color="#a07ec4" small />
      </div>
    </div>
  );
}

function Stat({
  label, value, icon: Icon, color, small = false,
}: { label: string; value: number | string; icon: any; color: string; small?: boolean }) {
  return (
    <div
      className="rounded-2xl border border-[#efe2c4] bg-white/65 backdrop-blur-xl px-2.5 py-2 text-center"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px -8px ${color}55` }}
    >
      <Icon className="mx-auto h-3.5 w-3.5" style={{ color }} />
      <div className={`mt-0.5 font-extrabold text-[#3a2a18] ${small ? "text-[14px]" : "text-[16px]"}`}>{value}</div>
      <div className="text-[9.5px] text-[#9a7e5a]">{label}</div>
    </div>
  );
}

function MemberCard({ m }: { m: Member }) {
  const color = ROLE_COLORS[m.role];
  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-[#efe2c4] p-3.5"
      style={{
        background: "linear-gradient(180deg, #fbf3e1 0%, #f4ead8 100%)",
        boxShadow: `0 12px 26px -18px rgba(120,80,30,0.5), 0 0 18px -14px ${color}66, inset 0 1px 0 rgba(255,255,255,0.7)`,
      }}
    >
      {/* leading-edge accent (RTL right) */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 right-0 w-[3px] rounded-full"
        style={{ background: `linear-gradient(180deg, ${color}, ${color}80)`, opacity: 0.9 }}
      />
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="grid h-12 w-12 place-items-center rounded-full font-extrabold text-[15px] text-[#3a2a18]"
            style={{
              background: `radial-gradient(120% 90% at 30% 20%, ${color}55, ${color}1a 70%)`,
              border: `1.5px solid ${color}80`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -5px 9px ${color}33`,
            }}
          >
            {m.initial}
          </div>
          {m.verified && (
            <span
              className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-white"
              style={{ boxShadow: "0 2px 6px rgba(63,157,110,0.5)" }}
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#3f9d6e]" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-extrabold text-[#3a2a18] truncate">{m.name}</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
            >
              {m.role}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-end gap-2 text-[10.5px]">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: m.status === "عضو فعّال" ? "rgba(63,157,110,0.12)" : "rgba(154,126,90,0.12)",
                color: m.status === "عضو فعّال" ? "#2f7d5a" : "#6a543a",
                border: `1px solid ${m.status === "عضو فعّال" ? "rgba(63,157,110,0.35)" : "rgba(154,126,90,0.35)"}`,
              }}
            >
              <IdCard className="h-3 w-3" />
              {m.status}
            </span>
            <span className={`inline-flex items-center gap-1 ${m.verified ? "text-[#2f7d5a]" : "text-[#b85a5a]"}`}>
              <ShieldCheck className="h-3 w-3" />
              {m.verified ? "موثّق من الكنيسة" : "غير موثّق"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="absolute inset-0 bg-[#2a1d0d]/55 backdrop-blur-sm" onClick={onClose} />
      <div
        dir="rtl"
        className="relative w-full max-w-[440px] rounded-t-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#fbf3e1 0%, #f4ead8 100%)",
          border: "1px solid #efe2c4",
          boxShadow: "0 -22px 50px -10px rgba(120,80,30,0.45)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="h-1 w-10 rounded-full bg-[#b8893a]/30 absolute left-0 right-0 top-2 mx-auto" />
          <div className="flex items-center gap-2">
            <CopticCross className="text-[#b8893a]" size={14} />
            <h2 className="text-[15px] font-extrabold text-[#3a2a18]">إضافة فرد للعائلة</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/80 border border-[#efe2c4]"
          >
            <X className="h-4 w-4 text-[#3a2a18]" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1 text-right space-y-3">
          <Field label="الاسم الكامل" icon={Users} value={name} onChange={setName} placeholder="الاسم بالكامل" />
          <Field label="رقم الهاتف"   icon={Phone} value={mobile} onChange={setMobile} placeholder="01xxxxxxxxx" type="tel" />
          <Field label="البريد الإلكتروني" icon={Mail} value={email} onChange={setEmail} placeholder="name@email.com" type="email" />
          <Field label="تاريخ الميلاد" icon={CalendarIcon} value={dob} onChange={setDob} placeholder="" type="date" />

          <div>
            <div className="mb-1.5 text-[11px] font-bold text-[#6a543a]">صلة القرابة</div>
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
                            background: "rgba(255,255,255,0.7)",
                            color: "#3a2a18",
                            border: "1px solid #efe2c4",
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
              background: "linear-gradient(180deg,#4d3c70,#2a1d45)",
              border: "1px solid rgba(240,215,140,0.4)",
              boxShadow: "0 14px 28px -14px rgba(40,25,75,0.7)",
            }}
          >
            <UserPlus className="h-4 w-4" />
            حفظ الفرد الجديد
          </button>
          <p className="text-center text-[10px] text-[#9a7e5a]">
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
      <div className="mb-1 text-[11px] font-bold text-[#6a543a]">{label}</div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-[#efe2c4] bg-white/80 backdrop-blur-xl">
        <Icon className="h-4 w-4 text-[#b8893a] shrink-0" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[13px] text-[#3a2a18] placeholder:text-[#b8a378] text-right"
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
      <p className="-mt-3 mb-3 text-center text-[11px] text-[#6a543a]">
        إدارة أفراد العائلة المرتبطين بالكنيسة
      </p>

      <SummaryCard members={members} />

      <CopticSeparator className="my-4" />

      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[13px] font-extrabold text-[#3a2a18]">أفراد العائلة</h2>
        <span className="text-[10.5px] text-[#9a7e5a]">{members.length} فرد</span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-extrabold text-[#3a2a10]"
        style={{
          background: "linear-gradient(180deg,#fbecb2,#e7c97a 55%,#c98a3c)",
          border: "1px solid rgba(216,138,42,0.45)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 14px 28px -14px rgba(216,138,42,0.6)",
        }}
      >
        <UserPlus className="h-4 w-4" />
        + إضافة فرد جديد
      </button>

      <p className="mt-3 text-center text-[10px] text-[#9a7e5a]">
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
