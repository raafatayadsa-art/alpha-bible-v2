import type { PublisherReadinessCheck } from "../types";
import { PUBLISHER_TEXT_SUB, PUBLISHER_TEXT_TITLE } from "./publisher-glass-chrome";

type Props = {
  score: number;
  checks: PublisherReadinessCheck[];
};

export function PublisherReadinessCard({ score, checks }: Props) {
  return (
    <section
      className="rounded-[var(--alpha-radius-card-compact)] border p-4"
      style={{ borderColor: "rgba(93,50,145,0.14)", background: "rgba(255,255,255,0.92)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-right">
          <p className={PUBLISHER_TEXT_TITLE}>جاهزية الصفحة</p>
          <p className={`mt-0.5 ${PUBLISHER_TEXT_SUB}`}>أكمل 100% قبل إرسال المراجعة النهائية</p>
        </div>
        <div
          className="grid h-14 w-14 place-items-center rounded-full border-4"
          style={{
            borderColor: score >= 100 ? "#10b981" : "#5D3291",
            color: score >= 100 ? "#059669" : "#5D3291",
          }}
        >
          <span className="alpha-type-body font-extrabold">{score}%</span>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-alpha-progress-track">
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
          <li key={check.key} className="flex items-center justify-between gap-2 alpha-type-desc font-bold">
            <span className={check.done ? "text-emerald-700" : PUBLISHER_TEXT_SUB}>{check.done ? "✓" : "○"}</span>
            <span className="flex-1 text-right" style={{ color: check.done ? "#3a3258" : "#6b658a" }}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
