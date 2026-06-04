import { Link } from "@tanstack/react-router";
import { AlertTriangle, BookmarkX, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Simple Coptic cross divider rendered with current text color. */
export function CopticCross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("inline-block", className)}
      fill="currentColor"
    >
      <path d="M14 4h4v8h8v4h-8v12h-4V16H6v-4h8V4z" />
      <circle cx="16" cy="16" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Decorative section divider with cross in the middle. */
export function CopticDivider({ dark = false }: { dark?: boolean }) {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className={cn("h-px flex-1", dark ? "bg-white/15" : "bg-[#c79356]/35")} />
      <CopticCross className={cn("h-3.5 w-3.5", dark ? "text-[#f0d78c]" : "text-[#c79356]")} />
      <span className={cn("h-px flex-1", dark ? "bg-white/15" : "bg-[#c79356]/35")} />
    </div>
  );
}

/* ---------- Shared shell ---------- */

function Shell({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      dir="rtl"
      className={cn(
        "min-h-dvh flex flex-col items-center justify-center px-6 text-center",
        dark
          ? "bg-[#08131f] text-[#e8e2cf]"
          : "bg-[radial-gradient(120%_60%_at_50%_-10%,#fff5dd_0%,#fbeac6_45%,#f3d9a5_100%)] text-[#3a2410]",
      )}
    >
      {children}
    </div>
  );
}

/* ---------- States ---------- */

export function AgpeyaSkeleton() {
  return (
    <div dir="rtl" className="min-h-dvh bg-[radial-gradient(120%_60%_at_50%_-10%,#fff5dd_0%,#fbeac6_45%,#f3d9a5_100%)]">
      <div className="mx-auto max-w-[640px] px-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-full bg-[#c79356]/15 animate-pulse" />
          <div className="h-5 w-32 rounded bg-[#c79356]/15 animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-[#c79356]/15 animate-pulse" />
        </div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-[#c79356]/15 animate-pulse" />
          ))}
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-[#c79356]/12 animate-pulse"
              style={{ width: `${85 - (i % 4) * 8}%`, marginRight: i % 2 ? 0 : "auto" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgpeyaEmpty({
  title,
  subtitle,
  cta,
  icon: Icon = Inbox,
}: {
  title: string;
  subtitle?: string;
  cta?: { label: string; to: string };
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center px-6 py-16 text-center text-[#3a2410]"
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/75 border border-[#c79356]/35 text-[#c79356] shadow-[0_10px_24px_-14px_rgba(120,80,30,0.45)]">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-arabic-serif text-[18px] font-extrabold text-[#5b3a18]">{title}</h2>
      {subtitle && <p className="mt-1.5 max-w-xs text-[13px] text-[#8a5a1f]">{subtitle}</p>}
      <CopticCross className="mt-4 h-4 w-4 text-[#c79356]/70" />
      {cta && (
        <Link
          to={cta.to}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#e7b35a] via-[#d99a3a] to-[#b87a22] px-5 py-2.5 text-[13px] font-bold text-white shadow"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function AgpeyaErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Shell>
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/80 border border-[#c79356]/35 text-[#b8511a]">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-arabic-serif text-[20px] font-extrabold text-[#5b3a18]">
        تعذر تحميل المحتوى
      </h2>
      <p className="mt-2 max-w-sm text-[13px] text-[#8a5a1f]">
        {message ?? "حدث خطأ غير متوقع. حاول مرة أخرى."}
      </p>
      <div className="mt-5 flex items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#e7b35a] to-[#b87a22] px-4 py-2 text-[13px] font-bold text-white shadow"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            إعادة المحاولة
          </button>
        )}
        <Link
          to="/agpeya"
          className="rounded-full border border-[#c79356]/40 bg-white/70 px-4 py-2 text-[13px] font-bold text-[#5b3a18]"
        >
          الأجبية
        </Link>
      </div>
    </Shell>
  );
}

export function AgpeyaNotFoundState({
  title = "الصلاة غير موجودة",
  subtitle = "تعذر العثور على هذه الصلاة في الأجبية.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <Shell>
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/80 border border-[#c79356]/35 text-[#8a5a1f]">
        <BookmarkX className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-arabic-serif text-[22px] font-extrabold text-[#5b3a18]">{title}</h1>
      <p className="mt-2 max-w-sm text-[13px] text-[#8a5a1f]">{subtitle}</p>
      <Link
        to="/agpeya"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#e7b35a] to-[#b87a22] px-4 py-2 text-[13px] font-bold text-white shadow"
      >
        العودة للأجبية
      </Link>
    </Shell>
  );
}
