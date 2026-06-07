import { type ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  type LucideIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  Monitor,
  Moon,
  Search,
  Smartphone,
  Sun,
} from "lucide-react";
import { AlphaIcon3D } from "@/components/controls/AlphaIcon3D";
import { AlphaPremiumIcon } from "@/components/controls/AlphaPremiumIcon";
import { cn } from "@/lib/utils";

function protectionBadgeLabel(scoreLabel: string): string {
  if (scoreLabel === "ممتاز") return "الحماية ممتازة";
  if (scoreLabel === "جيد جداً") return "الحماية جيدة جداً";
  if (scoreLabel === "جيد") return "الحماية جيدة";
  return "الحماية تحتاج تحسين";
}

export function GlassCard({
  children,
  accent = "#b8893a",
  className = "",
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[#efe2c4]/90 bg-gradient-to-b from-[#fbf3e1]/96 to-[#f4ead8]/94 backdrop-blur-xl",
        className,
      )}
      style={{
        boxShadow:
          `0 18px 36px -20px rgba(120,80,30,0.5), 0 0 24px -14px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[22px] bg-gradient-to-b from-white/45 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PremiumSectionCard({
  id,
  title,
  description,
  icon: Icon,
  accent = "#b8893a",
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className={cn("mb-2.5 animate-in fade-in duration-300", isOpen && "mb-3.5")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[22px] border backdrop-blur-xl transition-all duration-300 ease-out",
          isOpen
            ? "border-[#efe2c4]/95 bg-gradient-to-b from-[#fbf3e1]/98 to-[#f4ead8]/96"
            : "border-[#efe2c4]/85 bg-gradient-to-b from-[#fbf3e1]/94 to-[#f4ead8]/92 hover:border-[#efe2c4]",
        )}
        style={{
          boxShadow: isOpen
            ? `0 22px 44px -20px rgba(120,80,30,0.48), 0 0 32px -14px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.9)`
            : `0 14px 30px -22px rgba(120,80,30,0.38), 0 0 20px -16px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.82)`,
        }}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 rounded-t-[22px] bg-gradient-to-b to-transparent transition-all duration-300",
            isOpen ? "h-[58%] from-white/55" : "h-[48%] from-white/42",
          )}
        />
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          className="relative flex w-full items-center gap-3.5 px-4 py-[18px] text-right transition duration-200 hover:bg-white/20 active:scale-[0.985]"
        >
          <AlphaIcon3D color={accent} size={52} isOpen={isOpen}>
            <Icon className="h-[22px] w-[22px]" style={{ color: accent }} strokeWidth={2.4} />
          </AlphaIcon3D>
          <div className="min-w-0 flex-1">
            <h2 className="font-arabic-serif text-[15.5px] font-extrabold leading-snug text-[#2a1f12]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6a543a]">{description}</p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-[#c9a05a] transition-transform duration-300 ease-out",
              isOpen && "rotate-180",
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-all duration-400 ease-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[#efe2c4]/55 bg-white/10 px-1.5 pb-2 pt-1 backdrop-blur-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DarkModeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] px-4 py-3.5 transition hover:bg-white/25">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        style={{
          background: checked
            ? "linear-gradient(145deg, #3a2a1844, #3a2a1818)"
            : "linear-gradient(145deg, #d8a83a44, #d8a83a18)",
          borderColor: checked ? "#3a2a1855" : "#d8a83a55",
        }}
      >
        <Moon className={cn("h-5 w-5 transition-colors", checked ? "text-[#e7c97a]" : "text-[#8a5a14]")} />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[13px] font-extrabold text-[#2a1f12]">🌙 الوضع الداكن</p>
        <p className="mt-0.5 text-[10.5px] text-[#6a543a]">
          {checked ? "الوضع الداكن مفعل" : "الوضع الفاتح مفعل"}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="الوضع الداكن"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-300",
          checked
            ? "bg-gradient-to-l from-[#3a2a18] to-[#5a4630]"
            : "bg-[#d8cdb8]",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-[24px] w-[24px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out",
            checked ? "right-[25px]" : "right-[3px]",
          )}
        />
      </button>
    </div>
  );
}

export function LinkCard({
  to,
  icon: Icon,
  title,
  subtitle,
  accent,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <Link
      to={to as "/"}
      className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-white/40 active:scale-[0.99]"
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        style={{
          background: `linear-gradient(145deg, ${accent}44, ${accent}18)`,
          borderColor: `${accent}55`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[13px] font-bold text-[#3a2a18]">{title}</p>
        <p className="text-[10.5px] text-[#6a543a]">{subtitle}</p>
      </div>
      <ChevronLeft className="h-4 w-4 shrink-0 text-[#b8893a]/70" />
    </Link>
  );
}

export function ToggleRow({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] px-3 py-2.5">
      <div className="min-w-0 flex-1 text-right">
        <p className="text-[12.5px] font-bold text-[#3a2a18]">{label}</p>
        {subtitle && <p className="text-[10px] text-[#6a543a]">{subtitle}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-gradient-to-l from-[#1f6e54] to-[#3eb482]" : "bg-[#d8cdb8]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
            checked ? "right-[22px]" : "right-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 py-2.5">
      <p className="mb-2 text-right text-[12px] font-bold text-[#3a2a18]">{label}</p>
      <div className="flex flex-wrap justify-end gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold transition active:scale-95",
              value === o.value
                ? "bg-gradient-to-l from-[#1f6e54] to-[#3eb482] text-white shadow-sm"
                : "border border-[#efe2c4] bg-white/60 text-[#6a543a]",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionRow({ label, subtitle, onClick, danger }: {
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 text-right transition hover:bg-white/35 active:scale-[0.99]"
    >
      <ChevronLeft className="h-4 w-4 shrink-0 text-[#b8893a]/60" />
      <div className="flex-1">
        <p className={cn("text-[12.5px] font-bold", danger ? "text-[#EF4444]" : "text-[#3a2a18]")}>{label}</p>
        {subtitle && <p className="text-[10px] text-[#6a543a]">{subtitle}</p>}
      </div>
    </button>
  );
}

export function SettingsSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7e5a]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث في الإعدادات..."
        className="w-full rounded-2xl border border-[#efe2c4]/90 bg-white/65 py-2.5 pl-3 pr-10 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#4fd4a8]/50 focus:ring-2 focus:ring-[#4fd4a8]/20"
      />
    </div>
  );
}

export function Divider() {
  return <div className="mx-3 h-px bg-[#efe2c4]/70" />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pt-1 text-[10px] font-extrabold tracking-wide text-[#c9a05a]">{children}</p>
  );
}

export function ControlCenterHero({
  score,
  scoreLabel,
}: {
  score: number;
  scoreLabel: string;
  devices?: number;
  verified?: boolean;
}) {
  const badgeText = protectionBadgeLabel(scoreLabel);

  return (
    <GlassCard
      accent="#d8a83a"
      className="relative mb-4 overflow-hidden p-0 animate-in fade-in slide-in-from-bottom-2 duration-400"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 55% at 50% -8%, rgba(231,201,122,0.28), transparent 62%)," +
            "radial-gradient(50% 45% at 100% 100%, rgba(216,168,58,0.12), transparent 65%)," +
            "linear-gradient(165deg, #fffdf8 0%, #faf3e6 48%, #f3e8d4 100%)",
        }}
      />
      <div className="relative px-4 py-4 text-center">
        <h1
          className="font-arabic-serif text-[32px] font-extrabold leading-[1.1]"
          style={{
            backgroundImage: "linear-gradient(90deg, #8a5a14 0%, #c9a05a 48%, #e7c97a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          مركز التحكم الشخصي
        </h1>
        <p className="mt-1 text-[11px] font-extrabold tracking-[0.14em] text-[#a67c32]">
          Alpha Control Center
        </p>
        <p className="mx-auto mt-2 max-w-[300px] text-[13.5px] font-semibold leading-relaxed text-[#3f3224]">
          إعدادات الخصوصية والأمان وتجربتك الروحية
        </p>

        <div className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-[#efe2c4]/90 bg-[#fffdf8]/80 px-3 py-1.5 shadow-[0_6px_18px_-14px_rgba(120,80,30,0.35)]">
          <AlphaPremiumIcon kind="security" size="md" color="#3f9d6e" />
          <span className="text-[12.5px] font-bold text-[#2a1f12]">{badgeText}</span>
          <span className="text-[13px] font-extrabold tabular-nums text-[#1f6e54]">{score}%</span>
        </div>
      </div>
    </GlassCard>
  );
}

export function LogoutButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full grid place-items-center rounded-2xl border border-[#e8b4b4]/60 bg-gradient-to-l from-[#c14545] to-[#d86a6a] py-3.5 font-extrabold text-[#fdf8f0] shadow-[0_10px_24px_-12px_rgba(193,69,69,0.55)] backdrop-blur-sm transition active:scale-[0.98]"
    >
      تسجيل الخروج
    </button>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="px-3 py-2">
      <label className="mb-1.5 block text-right text-[11.5px] font-bold text-[#3a2a18]">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[#efe2c4]/90 bg-white/65 px-3 py-2.5 text-[13px] font-semibold text-[#3a2a18] placeholder:text-[#9a7e5a]/80 shadow-[inset_0_1px_2px_rgba(120,80,30,0.04)] backdrop-blur-sm outline-none focus:border-[#3f9d6e]/50 focus:ring-2 focus:ring-[#3f9d6e]/15"
      />
    </div>
  );
}

export function PasswordChangeForm({
  onSubmit,
}: {
  onSubmit?: (data: { current: string; next: string }) => void | Promise<void>;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
    if (!current.trim() || !next.trim() || !confirm.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (next !== confirm) {
      setError("تأكيد كلمة المرور غير متطابق");
      return;
    }
    if (next.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.({ current, next });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("تعذّر تحديث كلمة المرور. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-1.5 my-1 rounded-[18px] border border-[#efe2c4]/70 bg-white/25 p-1 backdrop-blur-sm">
      <p className="px-3 pt-2.5 text-right text-[12px] font-extrabold text-[#2a1f12]">تغيير كلمة المرور</p>
      <p className="px-3 pb-1 text-right text-[10px] text-[#6a543a]">آخر تحديث: منذ شهرين</p>
      <PasswordField
        label="كلمة المرور الحالية"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <PasswordField
        label="كلمة المرور الجديدة"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
      />
      <PasswordField
        label="تأكيد كلمة المرور الجديدة"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
      {error && (
        <p className="px-3 pb-1 text-right text-[10.5px] font-bold text-[#EF4444]">{error}</p>
      )}
      {success && (
        <p className="px-3 pb-1 text-right text-[10.5px] font-bold text-[#1f6e54]">
          تم تحديث كلمة المرور بنجاح
        </p>
      )}
      <div className="px-3 py-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-l from-[#1f6e54] to-[#3eb482] py-2.5 text-[12.5px] font-extrabold text-[#fdf8f0] shadow-[0_8px_20px_-10px_rgba(31,110,84,0.55)] transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_ACTIVE_SESSIONS = [
  { id: "iphone", device: "iPhone 15", detail: "الجهاز الحالي · آخر نشاط: الآن", current: true },
  { id: "web", device: "Web Chrome", detail: "آخر نشاط: منذ 3 ساعات", current: false },
] as const;

export function ActiveSessionsList({
  sessions = DEFAULT_ACTIVE_SESSIONS,
}: {
  sessions?: readonly { id: string; device: string; detail: string; current: boolean }[];
}) {
  return (
    <div className="space-y-1 px-1.5 py-1">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-[16px] px-3 py-2.5"
        >
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            style={{
              background: "linear-gradient(145deg, #4a86c144, #4a86c118)",
              borderColor: "#4a86c155",
            }}
          >
            <Smartphone className="h-4.5 w-4.5 text-[#4a86c1]" />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[12.5px] font-bold text-[#3a2a18]">{s.device}</p>
            <p className="text-[10px] text-[#6a543a]">{s.detail}</p>
          </div>
          {s.current && (
            <span className="shrink-0 rounded-full bg-[#3f9d6e]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#1f6e54]">
              نشط
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const THEME_OPTIONS = [
  { id: "light" as const, label: "الوضع الفاتح", sub: "Alpha Cream", icon: Sun },
  { id: "dark" as const, label: "الوضع الداكن", sub: "Alpha Dark", icon: Moon },
  { id: "system" as const, label: "النظام التلقائي", sub: "حسب النظام", icon: Monitor },
];

export function ThemeModePicker({
  value,
  onChange,
}: {
  value: "light" | "dark" | "system";
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  return (
    <div className="space-y-1 px-1.5 py-1">
      {THEME_OPTIONS.map((o) => {
        const active = value === o.id;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-white/40 active:scale-[0.99]",
              active && "bg-white/45",
            )}
          >
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              style={{
                background: active
                  ? "linear-gradient(145deg, #d8a83a44, #d8a83a18)"
                  : "linear-gradient(145deg, #d8a83a22, #d8a83a0a)",
                borderColor: active ? "#d8a83a88" : "#d8a83a44",
              }}
            >
              <Icon className="h-5 w-5 text-[#8a5a14]" />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[13px] font-bold text-[#3a2a18]">{o.label}</p>
              <p className="text-[10.5px] text-[#6a543a]">{o.sub}</p>
            </div>
            {active && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d8a83a] text-white shadow-sm">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
