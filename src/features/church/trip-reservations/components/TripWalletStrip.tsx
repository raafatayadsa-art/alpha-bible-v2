import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { myRegistration } from "../../post-registrations";
import { getTripWallet, syncTripWalletFromDb, walletRemaining } from "../trip-wallet";

export function TripWalletStrip({ postId, registrationId }: { postId: string; registrationId?: string }) {
  const mine = myRegistration(postId, "trip");
  const regId = registrationId ?? mine?.id;
  const [, setTick] = useState(0);
  const ledger = regId ? getTripWallet(regId) : undefined;

  useEffect(() => {
    if (!regId) return;
    void syncTripWalletFromDb({ postId, registrationId: regId }).then(() => setTick((n) => n + 1));
  }, [postId, regId]);

  if (!regId || !ledger) return null;
  const remaining = walletRemaining(ledger);

  return (
    <div className="rounded-xl border border-[#b8893a]/30 bg-[#fff8e8] px-3 py-2 text-right mt-2" dir="rtl">
      <p className="text-[10px] font-extrabold text-[#8a6a1e] inline-flex items-center gap-1">
        <Wallet className="h-3.5 w-3.5" /> محفظة الرحلة
      </p>
      <div className="mt-1 flex justify-between text-[11px] font-bold text-[#3a2a18]">
        <span>مدفوع: {ledger.amountPaid.toLocaleString("ar-EG")}</span>
        <span>متبقي: {remaining.toLocaleString("ar-EG")} {ledger.currency === "EGP" ? "ج" : ledger.currency}</span>
      </div>
    </div>
  );
}
