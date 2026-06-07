import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Send, ShieldCheck, CalendarDays } from "lucide-react";
import {
  addCondolence,
  addCongrats,
} from "./post-store";
import {
  registerForPost,
  cancelRegistration,
  usePostRegistrations,
  getMemberProfile,
  saveMemberProfile,
  type RegistrationKind,
} from "./post-registrations";

function PopupShell({
  title, subtitle, onClose, children, footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end justify-center px-0 sm:px-3 pb-0 sm:pb-[max(env(safe-area-inset-bottom,0px),12px)]"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-[#1a0f04]/55 backdrop-blur-sm"
      />
      <div
        className="relative flex w-full max-w-[440px] max-h-[min(92dvh,720px)] flex-col rounded-t-[28px] sm:rounded-[28px] border border-white/75 bg-[#fbf3e1]/98 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] text-right overflow-hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom,0px),0px)" }}
      >
        <div className="shrink-0 flex items-start justify-between gap-2 p-4 pb-2.5 border-b border-[#efe2c4]/70">
          <div className="min-w-0 flex-1">
            <h3 className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-tight">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-[10.5px] text-[#7a5a30] inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-[#efe2c4]/70 px-4 py-3 bg-[#fbf3e1]/95">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label, value, onChange, placeholder, multiline, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; maxLength?: number;
}) {
  const cls =
    "w-full rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2.5 text-[13px] text-[#3a2a18] outline-none focus:border-[#c79356] placeholder:text-[#a99060]";
  return (
    <label className="block">
      <span className="block text-[11px] font-extrabold text-[#7a5a30] mb-1">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          className={cls + " resize-none"}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={cls}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function SubmitBtn({ disabled, onClick, label }: { disabled?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(122,74,38,0.7)] active:scale-[0.98] transition-transform disabled:opacity-50"
    >
      <Send className="h-4 w-4 -scale-x-100" />
      {label}
    </button>
  );
}

/* --------------------------- Condolence popup --------------------------- */
export function CondolencePopup({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [name, setName] = useState(() => getMemberProfile().name);
  const [text, setText] = useState("");
  const valid = name.trim().length > 0 && text.trim().length > 0;
  return (
    <PopupShell title="إرسال تعزية" subtitle="الاسم مطلوب — لا يوجد وضع مجهول" onClose={onClose}>
      <div className="space-y-2.5 pb-1">
        <Field label="الاسم" value={name} onChange={setName} placeholder="اسمك الكامل" maxLength={60} />
        <Field
          label="رسالة التعزية"
          value={text}
          onChange={setText}
          placeholder="الرب ينيح نفسه ويعزّي قلوبكم"
          multiline
          maxLength={400}
        />
        <SubmitBtn
          disabled={!valid}
          label="إرسال التعزية"
          onClick={() => {
            saveMemberProfile({ name: name.trim() });
            addCondolence(postId, name.trim(), text.trim());
            onClose();
          }}
        />
      </div>
    </PopupShell>
  );
}

/* --------------------------- Congratulation popup --------------------------- */
export function CongratsPopup({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [name, setName] = useState(() => getMemberProfile().name);
  const [text, setText] = useState("");
  const valid = name.trim().length > 0 && text.trim().length > 0;
  return (
    <PopupShell title="مشاركة التهنئة" subtitle="الاسم مطلوب" onClose={onClose}>
      <div className="space-y-2.5 pb-1">
        <Field label="الاسم" value={name} onChange={setName} placeholder="اسمك الكامل" maxLength={60} />
        <Field
          label="رسالة التهنئة"
          value={text}
          onChange={setText}
          placeholder="ألف مبروك، الرب يبارك حياتكم"
          multiline
          maxLength={400}
        />
        <SubmitBtn
          disabled={!valid}
          label="إرسال التهنئة"
          onClick={() => {
            saveMemberProfile({ name: name.trim() });
            addCongrats(postId, name.trim(), text.trim());
            onClose();
          }}
        />
      </div>
    </PopupShell>
  );
}

/* --------------------------- Attend (RSVP) button --------------------------- */
export function AttendButton({
  postId,
  kind = "attendance",
  label = "سجل حضوري",
  activeLabel = "✓ سجلت حضوري",
  className = "",
}: {
  postId: string;
  kind?: RegistrationKind;
  label?: string;
  activeLabel?: string;
  className?: string;
}) {
  const { count, mine } = usePostRegistrations(postId, kind);
  const going = !!mine;
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setBusy(true);
        if (going && mine) {
          await cancelRegistration(mine.id);
        } else {
          await registerForPost({ postId, kind });
        }
        setBusy(false);
      }}
      className={
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-extrabold transition-all active:scale-[0.97] disabled:opacity-60 " +
        (going
          ? "bg-[#1f8a5a] text-white shadow-[0_8px_18px_-10px_rgba(31,138,90,0.7)]"
          : "bg-white/90 text-[#3a2a18] border border-[#efe2c4]") +
        " " +
        className
      }
    >
      {going ? activeLabel : label}
      <span className="text-[10px] opacity-80">({count.toLocaleString("ar-EG")})</span>
    </button>
  );
}

/* ------------------------------- Reserve popup ------------------------------- */
export function ReservePopup({
  postId,
  postTitle,
  tripDate,
  totalSeats,
  onClose,
}: {
  postId: string;
  postTitle?: string;
  tripDate?: string;
  totalSeats?: number;
  onClose: () => void;
}) {
  const { count, mine } = usePostRegistrations(postId, "trip");
  const remaining = totalSeats != null ? Math.max(0, totalSeats - count) : undefined;
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState(() => getMemberProfile().name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const maxAllowed = remaining != null ? Math.max(0, remaining) : 10;

  return (
    <PopupShell
      title="حجز الرحلة"
      subtitle={
        totalSeats != null
          ? `الأماكن المتاحة: ${(remaining ?? 0).toLocaleString("ar-EG")} من ${totalSeats.toLocaleString("ar-EG")}`
          : `محجوز حتى الآن: ${count.toLocaleString("ar-EG")}`
      }
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-white/90 border border-[#efe2c4] py-2.5 text-[12.5px] font-extrabold text-[#6a543a] active:scale-[0.98]"
        >
          إلغاء
        </button>
      }
    >
      <div className="space-y-2.5 pb-1">
        {postTitle ? (
          <div className="rounded-2xl bg-white/90 border border-[#efe2c4] p-3 text-right">
            <p className="text-[10px] font-extrabold text-[#b8893a]">اسم الرحلة</p>
            <p className="mt-0.5 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-snug">{postTitle}</p>
            {tripDate ? (
              <p className="mt-1.5 text-[11px] text-[#6a543a] inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-[#b8893a]" />
                {tripDate}
              </p>
            ) : null}
          </div>
        ) : null}
        <Field label="الاسم" value={name} onChange={setName} placeholder="اسمك الكامل" maxLength={60} />
        <div className="rounded-2xl bg-white/90 border border-[#efe2c4] p-3 text-right">
          <p className="text-[11px] font-extrabold text-[#7a5a30] mb-2">عدد الأماكن</p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="h-9 w-9 rounded-full bg-[#fbf3e1] border border-[#efe2c4] text-[#3a2a18] font-extrabold active:scale-90"
              aria-label="نقص"
            >
              −
            </button>
            <span className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] tabular-nums">
              {seats.toLocaleString("ar-EG")}
            </span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(maxAllowed, s + 1))}
              className="h-9 w-9 rounded-full bg-[#fbf3e1] border border-[#efe2c4] text-[#3a2a18] font-extrabold active:scale-90"
              aria-label="زيادة"
            >
              +
            </button>
          </div>
          {mine && mine.seats > 0 ? (
            <p className="mt-2 text-[10.5px] text-[#7a5a30]">حجزت بالفعل {mine.seats.toLocaleString("ar-EG")} مكان</p>
          ) : null}
          {error ? <p className="mt-2 text-[10.5px] font-bold text-[#a8344f]">{error}</p> : null}
        </div>
        <SubmitBtn
          disabled={seats < 1 || maxAllowed < 1 || !name.trim() || busy}
          label="تأكيد الحجز"
          onClick={async () => {
            setBusy(true);
            setError(null);
            if (totalSeats != null && count + seats > totalSeats) {
              setError("لا توجد أماكن كافية");
              setBusy(false);
              return;
            }
            const res = await registerForPost({
              postId,
              kind: "trip",
              seats,
              userName: name.trim(),
            });
            setBusy(false);
            if (!res.ok) setError(res.error ?? "تعذّر الحجز");
            else onClose();
          }}
        />
      </div>
    </PopupShell>
  );
}
