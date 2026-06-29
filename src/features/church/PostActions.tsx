import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, ShieldCheck, CalendarDays, Clock, Users } from "lucide-react";
import {
  addCondolence,
  addCongrats,
} from "./post-store";
import {
  registerForPost,
  cancelRegistration,
  usePostRegistrations,
  getMemberProfile,
  type RegistrationKind,
} from "./post-registrations";
import { currentUserName } from "./current-user";
import {
  joinTripWaitlist,
  leaveWaitlist,
  myWaitlistEntry,
  waitlistPosition,
  subscribeTripWaitlist,
  subscribeTripWaitlistRealtime,
  syncTripWaitlistFromDb,
  countWaiting,
} from "./trip-reservations/trip-waitlist";
import {
  getFamilyProfile,
  saveFamilyBookingMeta,
  totalSeatsForFamilySelection,
  type FamilyBookingMode,
} from "./trip-reservations/family-booking";
import { saveEmergencyContact } from "./trip-reservations/emergency-contact";
import { initTripWallet } from "./trip-reservations/trip-wallet";

function PopupShell({
  title, subtitle, onClose, children, footer, compact = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
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
        className="absolute inset-0 bg-[#1a0f04]/22"
      />
      <div
        className={
          "relative flex w-full flex-col rounded-t-[24px] sm:rounded-[24px] border border-white/75 bg-[#fbf3e1]/96 backdrop-blur-md shadow-[0_20px_44px_-18px_rgba(60,40,16,0.45)] text-right overflow-hidden " +
          (compact ? "max-w-[380px] max-h-[min(52dvh,360px)]" : "max-w-[var(--alpha-content-max-width)] max-h-[min(92dvh,720px)]")
        }
        style={{ paddingBottom: "max(env(safe-area-inset-bottom,0px),0px)" }}
      >
        <div className={"shrink-0 flex items-start justify-between gap-2 border-b border-[#efe2c4]/70 " + (compact ? "p-3 pb-2" : "p-4 pb-2.5")}>
          <div className="min-w-0 flex-1">
            <h3 className={"font-arabic-serif font-extrabold text-[#3a2a18] leading-tight " + (compact ? "text-[14px]" : "text-[15.5px]")}>{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-[10px] text-[#7a5a30] inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-[#efe2c4] text-[#7a5a30] active:scale-90 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className={"flex-1 min-h-0 overflow-y-auto overscroll-contain " + (compact ? "px-3 py-2" : "px-4 py-3")}>
          {children}
        </div>
        {footer ? (
          <div className={"shrink-0 border-t border-[#efe2c4]/70 bg-[#fbf3e1]/95 " + (compact ? "px-3 py-2" : "px-4 py-3")}>
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
          rows={3}
          className={cls + " resize-none min-h-[4.5rem]"}
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

function SubmitBtn({ disabled, onClick, label, compact = false }: { disabled?: boolean; onClick: () => void; label: string; compact?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white font-extrabold shadow-[0_12px_24px_-12px_rgba(122,74,38,0.7)] active:scale-[0.98] transition-transform disabled:opacity-50 " +
        (compact ? "mt-2 text-[12px] py-2" : "mt-3 text-[13px] py-2.5")
      }
    >
      <Send className="h-3.5 w-3.5 -scale-x-100" />
      {label}
    </button>
  );
}

function senderName(): string {
  return currentUserName();
}

/* --------------------------- Condolence popup --------------------------- */
export function CondolencePopup({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const valid = text.trim().length > 0;
  return (
    <PopupShell title="إرسال تعزية" onClose={onClose} compact>
      <div className="pb-0.5">
        <Field
          label="رسالة التعزية"
          value={text}
          onChange={setText}
          placeholder="الرب ينيح نفسه ويعزّي قلوبكم"
          multiline
          maxLength={400}
        />
        <SubmitBtn
          compact
          disabled={!valid}
          label="إرسال التعزية"
          onClick={() => {
            addCondolence(postId, senderName(), text.trim());
            onClose();
          }}
        />
      </div>
    </PopupShell>
  );
}

/* --------------------------- Congratulation popup --------------------------- */
export function CongratsPopup({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const valid = text.trim().length > 0;
  return (
    <PopupShell title="مشاركة التهنئة" onClose={onClose} compact>
      <div className="pb-0.5">
        <Field
          label="رسالة التهنئة"
          value={text}
          onChange={setText}
          placeholder="ألف مبروك، الرب يبارك حياتكم"
          multiline
          maxLength={400}
        />
        <SubmitBtn
          compact
          disabled={!valid}
          label="إرسال التهنئة"
          onClick={() => {
            addCongrats(postId, senderName(), text.trim());
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
  const isFull = totalSeats != null && remaining === 0;
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bookingMode, setBookingMode] = useState<FamilyBookingMode>("solo");
  const [includeSelf, setIncludeSelf] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const familyProfile = getFamilyProfile();
  const [, setWaitlistTick] = useState(0);
  const waitlistEntry = myWaitlistEntry(postId);
  const waitlistPos = waitlistEntry ? waitlistPosition(waitlistEntry) : null;

  useEffect(() => subscribeTripWaitlist(() => setWaitlistTick((n) => n + 1)), [postId]);
  useEffect(() => {
    void syncTripWaitlistFromDb(postId);
    return subscribeTripWaitlistRealtime(postId);
  }, [postId]);

  const familySeats =
    bookingMode === "family"
      ? totalSeatsForFamilySelection(bookingMode, selectedFamily, includeSelf)
      : seats;
  const maxAllowed = remaining != null ? Math.max(0, remaining) : 10;
  const effectiveSeats = bookingMode === "family" ? familySeats : seats;

  function toggleFamilyMember(id: string) {
    setSelectedFamily((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <PopupShell
      compact
      title={isFull ? "قائمة الانتظار" : "حجز الرحلة"}
      subtitle={
        isFull
          ? `${countWaiting(postId).toLocaleString("ar-EG")} في الانتظار`
          : totalSeats != null
            ? `المتاح: ${(remaining ?? 0).toLocaleString("ar-EG")} من ${totalSeats.toLocaleString("ar-EG")}`
            : `محجوز: ${count.toLocaleString("ar-EG")}`
      }
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-white/90 border border-[#efe2c4] py-2 text-[12px] font-extrabold text-[#6a543a] active:scale-[0.98]"
        >
          إغلاق
        </button>
      }
    >
      <div className="space-y-2 pb-0.5">
        {postTitle ? (
          <div className="rounded-xl bg-white/90 border border-[#efe2c4] p-2.5 text-right">
            <p className="text-[9.5px] font-extrabold text-[#b8893a]">اسم الرحلة</p>
            <p className="mt-0.5 font-arabic-serif text-[13px] font-extrabold text-[#3a2a18] leading-snug line-clamp-2">{postTitle}</p>
            {tripDate ? (
              <p className="mt-1 text-[10.5px] text-[#6a543a] inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-[#b8893a]" />
                {tripDate}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isFull ? (
          <>
            <div className="rounded-xl bg-white/90 border border-[#efe2c4] p-2.5 text-right">
              <p className="text-[10px] font-extrabold text-[#7a5a30] mb-1.5 inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> نوع الحجز
              </p>
              <div className="flex gap-2">
                {(["solo", "family"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBookingMode(m)}
                    className={
                      "flex-1 rounded-xl py-1.5 text-[10px] font-extrabold border " +
                      (bookingMode === m
                        ? "bg-[#1f8a5a] text-white border-[#1f8a5a]"
                        : "bg-white border-[#efe2c4] text-[#5a4030]")
                    }
                  >
                    {m === "solo" ? "نفسي فقط" : "حجز عائلي"}
                  </button>
                ))}
              </div>
            </div>

            {bookingMode === "family" ? (
              <div className="rounded-xl bg-white/90 border border-[#efe2c4] p-2.5 text-right space-y-1.5">
                <p className="text-[10px] font-extrabold text-[#7a5a30]">{familyProfile.householdName}</p>
                <label className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#3a2a18]">
                  <input type="checkbox" checked={includeSelf} onChange={(e) => setIncludeSelf(e.target.checked)} />
                  <span>أنا ({getMemberProfile().name || "المستخدم"})</span>
                </label>
                {familyProfile.members
                  .filter((m) => m.name.trim())
                  .map((m) => (
                    <label key={m.id} className="flex items-center justify-between gap-2 text-[11px] text-[#5a4030]">
                      <input
                        type="checkbox"
                        checked={selectedFamily.includes(m.id)}
                        onChange={() => toggleFamilyMember(m.id)}
                      />
                      <span>{m.name} · {m.relation}</span>
                    </label>
                  ))}
                <p className="text-[10px] font-bold text-[#1f8a5a]">إجمالي الأماكن: {familySeats.toLocaleString("ar-EG")}</p>
              </div>
            ) : (
              <div className="rounded-xl bg-white/90 border border-[#efe2c4] p-2.5 text-right">
                <p className="text-[10px] font-extrabold text-[#7a5a30] mb-1.5">عدد الأماكن</p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSeats((s) => Math.max(1, s - 1))}
                    className="h-7 w-7 rounded-full bg-[#fbf3e1] border border-[#efe2c4] text-[#3a2a18] text-sm font-extrabold active:scale-90"
                    aria-label="نقص"
                  >
                    −
                  </button>
                  <span className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18] tabular-nums">
                    {seats.toLocaleString("ar-EG")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeats((s) => Math.min(maxAllowed, s + 1))}
                    className="h-7 w-7 rounded-full bg-[#fbf3e1] border border-[#efe2c4] text-[#3a2a18] text-sm font-extrabold active:scale-90"
                    aria-label="زيادة"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {mine && mine.seats > 0 ? (
              <p className="text-[10px] text-[#7a5a30] text-right">حجزت {mine.seats.toLocaleString("ar-EG")} مكان</p>
            ) : null}
            {error ? <p className="text-[10px] font-bold text-[#a8344f] text-right">{error}</p> : null}

            <div className="rounded-xl bg-white/90 border border-[#efe2c4] p-2.5 text-right space-y-1.5">
              <p className="text-[10px] font-extrabold text-[#7a5a30]">جهة اتصال للطوارئ</p>
              <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="الاسم" className="w-full rounded-lg border border-[#efe2c4] px-2 py-1.5 text-[11px]" />
              <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="رقم الهاتف" className="w-full rounded-lg border border-[#efe2c4] px-2 py-1.5 text-[11px]" />
              <input value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} placeholder="صلة القرابة" className="w-full rounded-lg border border-[#efe2c4] px-2 py-1.5 text-[11px]" />
            </div>

            <SubmitBtn
              compact
              disabled={effectiveSeats < 1 || maxAllowed < effectiveSeats || busy}
              label="تأكيد الحجز"
              onClick={async () => {
                setBusy(true);
                setError(null);
                if (totalSeats != null && count + effectiveSeats > totalSeats) {
                  setError("لا توجد أماكن كافية");
                  setBusy(false);
                  return;
                }
                const profile = getMemberProfile();
                const res = await registerForPost({
                  postId,
                  kind: "trip",
                  seats: effectiveSeats,
                  userName: senderName(),
                });
                if (res.ok && res.row) {
                  const members =
                    bookingMode === "family"
                      ? [
                          ...(includeSelf
                            ? [{ id: "self", name: profile.name || senderName(), relation: "أنا" }]
                            : []),
                          ...familyProfile.members.filter((m) => selectedFamily.includes(m.id)),
                        ]
                      : [{ id: "self", name: profile.name || senderName(), relation: "أنا" }];
                  saveFamilyBookingMeta({
                    registrationId: res.row.id,
                    postId,
                    mode: bookingMode,
                    householdName: familyProfile.householdName,
                    members,
                    bookedAt: new Date().toISOString(),
                  });
                  if (emergencyName.trim() && emergencyPhone.trim()) {
                    saveEmergencyContact(
                      {
                        registrationId: res.row.id,
                        name: emergencyName.trim(),
                        phone: emergencyPhone.trim(),
                        relation: emergencyRelation.trim() || "قريب",
                      },
                      postId,
                    );
                  }
                  initTripWallet({ registrationId: res.row.id, postId, amountDue: effectiveSeats * 200 });
                }
                setBusy(false);
                if (!res.ok) setError(res.error ?? "تعذّر الحجز");
                else onClose();
              }}
            />
          </>
        ) : (
          <div className="rounded-xl bg-[#fff8e8] border border-[#e7c97a] p-3 text-right space-y-2">
            <p className="text-[11px] font-extrabold text-[#8a6a1e] inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> اكتمل العدد — يمكنك الانضمام لقائمة الانتظار
            </p>
            {waitlistEntry ? (
              <p className="text-[10px] text-[#6a543a]">
                أنت في القائمة · المركز {waitlistPos}
                {waitlistEntry.status === "offered" ? " · لديك عرض نشط!" : ""}
              </p>
            ) : null}
            {error ? <p className="text-[10px] font-bold text-[#a8344f]">{error}</p> : null}
            {waitlistEntry ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  leaveWaitlist(postId);
                  setWaitlistTick((n) => n + 1);
                }}
                className="w-full rounded-full border border-[#efe2c4] bg-white py-2 text-[11px] font-extrabold text-[#9a3030]"
              >
                مغادرة قائمة الانتظار
              </button>
            ) : (
              <SubmitBtn
                compact
                disabled={busy}
                label="انضمام لقائمة الانتظار"
                onClick={() => {
                  setBusy(true);
                  const res = joinTripWaitlist(postId, seats);
                  setBusy(false);
                  if (!res.ok) setError(res.error ?? "تعذّر الانضمام");
                  else setWaitlistTick((n) => n + 1);
                }}
              />
            )}
          </div>
        )}
      </div>
    </PopupShell>
  );
}
