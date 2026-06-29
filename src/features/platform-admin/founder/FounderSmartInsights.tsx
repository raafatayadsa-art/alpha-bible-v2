import { Link } from "@tanstack/react-router";
import { Brain, ChevronLeft, Sparkles } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import type { Dash } from "./founder-dashboard-data";
import { FounderIcon3D } from "./FounderIcon3D";

const TAGS = {
  growth: { label: "فرصة نمو", color: PP_GOLD },
  retention: { label: "تنبيه احتفاظ", color: MC.red },
  perf: { label: "أداء", color: MC.purple },
} as const;

export function FounderSmartInsights({ dash, mediaPending }: { dash: Dash; mediaPending?: number }) {
  const cards: {
    id: string;
    tag: (typeof TAGS)[keyof typeof TAGS];
    title: string;
    body: string;
    action: string;
    to: string;
  }[] = [];

  if (mediaPending != null && mediaPending > 0) {
    cards.push({
      id: "media",
      tag: TAGS.retention,
      title: `${mediaPending} وسائط بانتظار المراجعة`,
      body: "راجع Media Manager واعتمد الوسائط قبل نشرها في التطبيق.",
      action: "فتح Media Manager",
      to: "/platform/media-manager",
    });
  }

  if (dash.pendingApprovals > 0) {
    cards.push({
      id: "approvals",
      tag: TAGS.growth,
      title: `${dash.pendingApprovals} طلبات بانتظار الاعتماد`,
      body: "راجع مركز الاعتمادات لتقليل زمن انتظار الكنائس والكهنة الجدد.",
      action: "فتح الاعتمادات",
      to: "/platform/approvals",
    });
  }

  if (dash.criticalAlerts > 0) {
    cards.push({
      id: "reports",
      tag: TAGS.perf,
      title: `${dash.criticalAlerts} بلاغات مفتوحة`,
      body: "راجع البلاغات المفتوحة ومراقبة الخصوصية قبل أي تحديث.",
      action: "فتح البلاغات",
      to: "/platform/reports",
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: "ok",
      tag: TAGS.perf,
      title: "لا توجد تنبيهات حرجة",
      body: "كل الأنظمة تعمل ببيانات حقيقية — اضغط «مزامنة» لتحديث الإعدادات لجميع المستخدمين.",
      action: "إعدادات النظام",
      to: "/platform/settings",
    });
  }

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-[9px] font-bold" style={{ color: MC.muted }}>
          بناءً على بيانات حية
        </span>
        <div className="flex items-center gap-2">
          <FounderIcon3D icon={Brain} accent={MC.purple} size="sm" />
          <p className="text-[13px] font-extrabold" style={{ color: MC.white }}>
            رؤى ذكية
          </p>
          <Sparkles className="h-4 w-4" style={{ color: PP_GOLD }} />
        </div>
      </div>
      <div className="space-y-2">
        {cards.map((card) => (
          <CyberPanel key={card.id} glow={card.tag.color} className="!p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PP_GOLD }} />
              <div className="min-w-0 flex-1 text-right">
                <span
                  className="mb-1 inline-block rounded-full border px-2 py-0.5 text-[7px] font-extrabold"
                  style={{ borderColor: `${card.tag.color}55`, color: card.tag.color, background: `${card.tag.color}15` }}
                >
                  {card.tag.label}
                </span>
                <p className="text-[12px] font-extrabold leading-snug" style={{ color: MC.white }}>
                  {card.title}
                </p>
                <p className="mt-1 text-[10px] font-medium leading-relaxed" style={{ color: MC.muted }}>
                  {card.body}
                </p>
              </div>
            </div>
            <Link
              to={card.to as "/platform"}
              className="flex w-full items-center justify-center gap-1 rounded-[12px] border px-3 py-2.5 text-[10px] font-extrabold transition active:scale-[0.98]"
              style={{ borderColor: `${card.tag.color}44`, color: card.tag.color, background: "rgba(0,0,0,0.22)" }}
            >
              {card.action}
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </CyberPanel>
        ))}
      </div>
    </div>
  );
}
