import type { PublisherReadinessCheck } from "../types";

type Props = {
  score: number;
  checks: PublisherReadinessCheck[];
};

export function PublisherReadinessCard({ score, checks }: Props) {
  return (
    <section
      className="rounded-[22px] border p-4"
      style={{ borderColor: "rgba(93,50,145,0.14)", background: "rgba(255,255,255,0.92)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-right">
          <p className="text-[13px] font-extrabold text-[#3a3258]">جاهزية الصفحة</p>
          <p className="mt-0.5 text-[10px] font-bold text-[#6b658a]">أكمل 100% قبل إرسال المراجعة النهائية</p>
        </div>
        <div
          className="grid h-14 w-14 place-items-center rounded-full border-4"
          style={{
            borderColor: score >= 100 ? "#10b981" : "#5D3291",
            color: score >= 100 ? "#059669" : "#5D3291",
          }}
        >
          <span className="text-[13px] font-extrabold">{score}%</span>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#ece6dc]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            background: score >= 100 ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#7b4cb8,#5D3291)",
          }}
        />
      </div>

      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.key} className="flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className={check.done ? "text-emerald-700" : "text-[#6b658a]"}>{check.done ? "✓" : "○"}</span>
            <span className="flex-1 text-right" style={{ color: check.done ? "#3a3258" : "#6b658a" }}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
