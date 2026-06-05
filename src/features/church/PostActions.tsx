import { useState } from "react";
import { X, Send, ShieldCheck } from "lucide-react";
import {
  addCondolence,
  addCongrats,
  reserveSeats,
  toggleAttendance,
  useAttendance,
  useReservations,
} from "./post-store";

function PopupShell({
  title, subtitle, onClose, children,
}: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-[#1a0f04]/55 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] rounded-[28px] border border-white/75 bg-[#fbf3e1]/95 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] p-4 text-right">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
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
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
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
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const valid = name.trim().length > 0 && text.trim().length > 0;
  return (
    <PopupShell title="إرسال تعزية" subtitle="الاسم مطلوب — لا يوجد وضع مجهول" onClose={onClose}>
      <div className="space-y-2.5">
        <Field label="الاسم" value={name} onChange={setName} placeholder="اسمك الكامل" maxLength={60} />
        <Field
          label="رسالة التعزية"
          value={text}
          onChange={setText}
          placeholder="الرب ينيح نفسه ويعزّي قلوبكم"
          multiline
          maxLength={400}
        />
      </div>
      <SubmitBtn
        disabled={!valid}
        label="إرسال التعزية"
        onClick={() => {
          addCondolence(postId, name.trim(), text.trim());
          onClose();
        }}
      />
    </PopupShell>
  );
}

/* --------------------------- Congratulation popup --------------------------- */
export function CongratsPopup({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const valid = name.trim().length > 0 && text.trim().length > 0;
  return (
    <PopupShell title="مشاركة التهنئة" subtitle="الاسم مطلوب" onClose={onClose}>
      <div className="space-y-2.5">
        <Field label="الاسم" value={name} onChange={setName} placeholder="اسمك الكامل" maxLength={60} />
        <Field
          label="رسالة التهنئة"
          value={text}
          onChange={setText}
          placeholder="ألف مبروك، الرب يبارك حياتكم"
          multiline
          maxLength={400}
        />
      </div>
      <SubmitBtn
        disabled={!valid}
        label="إرسال التهنئة"
        onClick={() => {
          addCongrats(postId, name.trim(), text.trim());
          onClose();
        }}
      />
    </PopupShell>
  );
}

/* --------------------------- Attend (RSVP) button --------------------------- */
export function AttendButton({ postId, className = "" }: { postId: string; className?: string }) {
  const { going, count } = useAttendance(postId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleAttendance(postId);
      }}
      className={
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-extrabold transition-all active:scale-[0.97] " +
        (going
          ? "bg-[#1f8a5a] text-white shadow-[0_8px_18px_-10px_rgba(31,138,90,0.7)]"
          : "bg-white/90 text-[#3a2a18] border border-[#efe2c4]") +
        " " +
        className
      }
    >
      {going ? "✓ سأحضر" : "سأحضر"}
      <span className="text-[10px] opacity-80">({count.toLocaleString("ar-EG")})</span>
    </button>
  );
}

/* ------------------------------- Reserve popup ------------------------------- */
export function ReservePopup({
  postId, totalSeats, onClose,
}: { postId: string; totalSeats?: number; onClose: () => void }) {
  const { remaining, reserved, mine } = useReservations(postId, totalSeats);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const maxAllowed = remaining != null ? Math.max(0, remaining) : 10;
  return (
    <PopupShell
      title="حجز الرحلة"
      subtitle={
        totalSeats != null
          ? `الأماكن المتاحة: ${(remaining ?? 0).toLocaleString("ar-EG")} من ${totalSeats.toLocaleString("ar-EG")}`
          : `محجوز حتى الآن: ${reserved.toLocaleString("ar-EG")}`
      }
      onClose={onClose}
    >
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
        {mine > 0 ? (
          <p className="mt-2 text-[10.5px] text-[#7a5a30]">حجزت بالفعل {mine.toLocaleString("ar-EG")} مكان</p>
        ) : null}
        {error ? <p className="mt-2 text-[10.5px] font-bold text-[#a8344f]">{error}</p> : null}
      </div>
      <SubmitBtn
        disabled={seats < 1 || maxAllowed < 1}
        label="تأكيد الحجز"
        onClick={() => {
          const ok = reserveSeats(postId, seats, totalSeats);
          if (!ok) setError("لا توجد أماكن كافية");
          else onClose();
        }}
      />
    </PopupShell>
  );
}
