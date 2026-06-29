import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible";
import { CopticWatermark } from "@/components/coptic";
import { useMemberChurch } from "@/features/church/use-member-church";
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
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center justify-between gap-2 py-3">
          <BackButton to="/more" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-extrabold text-alpha-heading">تبرع</h1>
          <span className="h-9 w-9 shrink-0" aria-hidden />
        </header>

        <div className="mt-4 overflow-hidden rounded-[26px] border border-alpha/50 bg-white/80 p-6 text-center shadow-[var(--alpha-shadow-featured)]">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#e7c97a]/40 bg-gradient-to-br from-[#f0d78c]/30 to-white text-[#c44569]">
            <Heart className="h-7 w-7 fill-current" strokeWidth={2} />
          </span>
          <h2 className="mt-4 font-arabic-serif text-[20px] font-extrabold text-alpha-heading">ادعم رسالة Alpha</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-alpha-muted">
            {church?.name
              ? `تبرعك يدعم ${church.name} وخدمات Alpha Bible الروحية.`
              : "تبرعك يدعم نشر الكتاب المقدس والمحتوى الكنسي على Alpha."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={
                  "rounded-full border px-4 py-2 text-[13px] font-extrabold transition active:scale-95 " +
                  (amount === v
                    ? "border-[#1f6e54] bg-gradient-to-l from-[#1f6e54] to-[#3eb482] text-white"
                    : "border-alpha/40 bg-white/70 text-alpha-heading")
                }
              >
                {v} ج.م
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy || !amount}
            onClick={submit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#1f6e54] to-[#3eb482] px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(31,110,84,0.45)] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {busy ? "جاري المعالجة…" : "متابعة التبرع"}
          </button>

          <p className="mt-4 text-[10px] leading-relaxed text-alpha-muted">
            بوابة الدفع الآمنة قيد التفعيل — لن يُخصم أي مبلغ حتى اكتمال الربط.
          </p>
        </div>
      </div>

      <BottomDock />
    </div>
  );
}
