import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { getRegistrationsForPost } from "../../post-registrations";
import { getTripWallet, recordOrganizerTripPayment, walletRemaining } from "../trip-wallet";

const DEFAULT_AMOUNT = 200;

export function TripOrganizerPaymentPanel({ postId }: { postId: string }) {
  const [tick, setTick] = useState(0);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const registrations = getRegistrationsForPost(postId, "trip").filter((r) => r.status !== "cancelled");

  useEffect(() => {
    setTick((n) => n + 1);
  }, [postId]);

  if (registrations.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-[#e7c97a]/25 bg-black/25 p-2.5 text-right" dir="rtl">
      <p className="text-[10px] font-extrabold text-[#f0d78c] inline-flex items-center gap-1">
        <Wallet className="h-3.5 w-3.5" /> تسجيل دفعات المشاركين
      </p>
      <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
        {registrations.map((reg) => {
          const ledger = getTripWallet(reg.id);
          const remaining = ledger ? walletRemaining(ledger) : null;
          const amountStr = amounts[reg.id] ?? String(DEFAULT_AMOUNT);
          const parsed = Number(amountStr);
          const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_AMOUNT;

          return (
            <li
              key={`${reg.id}-${tick}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white/85 truncate">{reg.userName}</p>
                {ledger ? (
                  <p className="text-[9px] text-white/45">
                    مدفوع {ledger.amountPaid.toLocaleString("ar-EG")} · متبقي{" "}
                    {(remaining ?? 0).toLocaleString("ar-EG")} ج
                  </p>
                ) : (
                  <p className="text-[9px] text-white/45">لا توجد محفظة بعد</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={amountStr}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [reg.id]: e.target.value }))}
                  className="w-14 rounded-md border border-white/15 bg-black/30 px-1 py-0.5 text-[9px] font-bold text-white text-center"
                  aria-label={`مبلغ الدفعة لـ ${reg.userName}`}
                />
                <button
                  type="button"
                  disabled={!reg.userId}
                  onClick={() => {
                    void recordOrganizerTripPayment({
                      postId,
                      registrationId: reg.id,
                      targetUserId: reg.userId,
                      amount,
                      note: "دفعة من المنظم",
                    }).then((ok) => {
                      if (ok) setTick((n) => n + 1);
                    });
                  }}
                  className="rounded-full border border-[#e7c97a]/35 bg-[#e7c97a]/10 px-2 py-1 text-[9px] font-extrabold text-[#f0d78c] disabled:opacity-40 active:scale-95"
                >
                  تسجيل
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
