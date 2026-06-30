import { useState } from "react";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible";
import { CopticWatermark } from "@/components/coptic";
import { useMemberChurch } from "@/features/church/use-member-church";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AMOUNTS = [50, 100, 200, 500];

export function DonateScreen() {
  const { church } = useMemberChurch();
  const [amount, setAmount] = useState<number | null>(100);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!amount) {
      toast.error("اختر مبلغاً للتبرع");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      toast.success(
        church?.name
          ? `شكراً — سيتم ربط التبرع ب${church.name} قريباً`
          : "شكراً — بوابة التبرع قيد التفعيل",
      );
    }, 600);
  };

  return (
    <div dir="rtl" className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0f1419]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% -10%, rgba(120,190,255,0.22), transparent 60%), radial-gradient(70% 50% at 80% 100%, rgba(63,157,110,0.18), transparent 55%), linear-gradient(180deg, #121820 0%, #0a0e12 100%)",
        }}
      />
      <CopticWatermark tone="dark" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-28 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="mb-4 flex items-center justify-between">
          <BackButton to="/profile" compact tone="dark" />
          <h1 className="font-arabic-serif text-[17px] font-extrabold text-white/90">تبرع</h1>
          <span className="h-9 w-9" aria-hidden />
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div
            className={cn(
              "relative overflow-hidden rounded-[32px] border border-white/14",
              "bg-white/[0.08] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-2xl",
              "px-5 py-7 sm:px-7 sm:py-9",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent"
            />

            <div className="relative text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/20 bg-gradient-to-br from-[#ff6b8a]/35 to-[#c44569]/25 text-[#ffd6e0] shadow-[0_12px_32px_-12px_rgba(196,69,105,0.55)]">
                <Heart className="h-8 w-8 fill-current" strokeWidth={1.8} />
              </span>

              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/45">
                Alpha Bible
              </p>
              <h2 className="mt-2 font-arabic-serif text-[26px] font-extrabold leading-tight text-white">
                ادعم رسالة Alpha
              </h2>
              <p className="mx-auto mt-3 max-w-[28ch] text-[14px] leading-relaxed text-white/65">
                {church?.name
                  ? `تبرعك يدعم ${church.name} وخدمات Alpha Bible الروحية.`
                  : "تبرعك يدعم نشر الكتاب المقدس والمحتوى الكنسي على Alpha."}
              </p>
            </div>

            <div className="relative mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={cn(
                    "rounded-2xl border px-3 py-3.5 text-[15px] font-extrabold transition active:scale-[0.97]",
                    amount === v
                      ? "border-[#5eead4]/50 bg-gradient-to-br from-[#1f6e54]/90 to-[#3eb482]/75 text-white shadow-[0_10px_28px_-12px_rgba(62,180,130,0.65)]"
                      : "border-white/12 bg-white/6 text-white/82 hover:bg-white/10",
                  )}
                >
                  {v} ج.م
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={busy || !amount}
              onClick={submit}
              className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-l from-[#1f6e54] via-[#2f9d72] to-[#3eb482] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_40px_-14px_rgba(31,110,84,0.75)] active:scale-[0.98] disabled:opacity-45"
            >
              <Sparkles className="h-4 w-4" />
              {busy ? "جاري المعالجة…" : "متابعة التبرع"}
            </button>

            <div className="relative mt-5 flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-white/45">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5eead4]/70" strokeWidth={2} />
              <p>بوابة الدفع الآمنة قيد التفعيل — لن يُخصم أي مبلغ حتى اكتمال الربط.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomDock />
    </div>
  );
}
