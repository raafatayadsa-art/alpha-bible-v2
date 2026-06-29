import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Fingerprint,
  History,
  Lock,
  MessageSquareOff,
  RefreshCw,
  Settings,
  ShieldAlert,
  Siren,
  UserX,
  Wrench,
} from "lucide-react";
import {
  COMMAND_ICONS,
  CyberBtn,
  CyberPanel,
  CyberSearch,
  MissionSubShell,
  ModuleControlRow,
  PrivacyStrip,
} from "./mission-control-ui";
import { usePlatformStore } from "./platform-store";
import { subscribePlatformSync, broadcastPlatformLiveUpdate } from "./platform-control-sync";
import { setOwnerPin, revokeOwnerSession } from "./owner-access-store";
import {
  fetchAiRules,
  fetchLibraryDocs,
  fetchPlatformSettings,
  fetchPrivacyMetrics,
  fetchReports,
  formatCount,
  patchPlatformSettingsDb,
  toggleAiRuleDb,
  type AiRule,
  type LibraryDoc,
  type PlatformReport,
  type PlatformSettings,
  type PrivacyMetrics,
} from "./platform-api";
import { usePlatformDashboard } from "./use-platform-dashboard";
import { MC } from "./platform-store";

export function PrivacySecurityScreen() {
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);

  useEffect(() => {
    void fetchPrivacyMetrics().then(setMetrics);
  }, []);

  const items = [
    { labelAr: "الكلمات المحظورة", labelEn: "Blocked Words", value: metrics?.blockedWords ?? "—", icon: Ban, accent: MC.red },
    { labelAr: "البلاغات الأمنية", labelEn: "Security Reports", value: metrics?.securityReports ?? "—", icon: ShieldAlert, accent: MC.amber },
    { labelAr: "المستخدمون المقيدون", labelEn: "Restricted Users", value: metrics?.restrictedUsers ?? "—", icon: UserX, accent: MC.purple },
    { labelAr: "الحسابات المحظورة", labelEn: "Blocked Accounts", value: metrics?.blockedAccounts ?? "—", icon: Lock, accent: MC.red },
    { labelAr: "سجل المخالفات", labelEn: "Violations Log", value: metrics?.violations ?? "—", icon: History, accent: MC.cyan },
  ];

  return (
    <MissionSubShell title="Privacy & Security" titleEn="الخصوصية والأمان">
      <PrivacyStrip>Owner لا يرى رسائل أو منشورات أو بيانات أعضاء — إدارة سياسات المنصة فقط.</PrivacyStrip>
      <div className="space-y-3">
        {items.map((item) => (
          <ModuleControlRow
            key={item.labelAr}
            labelAr={item.labelAr}
            labelEn={item.labelEn}
            scopeAr="مؤشرات أمنية عامة — بدون بيانات خاصة"
            icon={item.icon}
            accent={item.accent}
            metricValue={String(item.value)}
          />
        ))}
      </div>
    </MissionSubShell>
  );
}

export function ReportedContentScreen() {
  const [reports, setReports] = useState<PlatformReport[]>([]);

  useEffect(() => {
    void fetchReports().then((r) => setReports(r ?? []));
  }, []);

  const openCount = reports.filter((r) => r.status === "open" || r.status === "reviewing").length;
  const byKind = {
    post: reports.filter((r) => r.kind === "post").length,
    image: reports.filter((r) => r.kind === "image").length,
    comment: reports.filter((r) => r.kind === "comment").length,
  };

  return (
    <MissionSubShell title="Reported Content" titleEn="المحتوى المبلغ عنه" navActive="alerts">
      <PrivacyStrip>فقط المحتوى المبلغ عنه رسمياً — لا محتوى خاص غير مبلغ عنه.</PrivacyStrip>
      <CyberPanel glow={MC.red}>
        <p className="text-[12px] font-bold text-slate-200">{openCount} بلاغات مفتوحة</p>
        <p className="mt-1 text-[10px] text-slate-400">
          منشورات {byKind.post} · صور {byKind.image} · تعليقات {byKind.comment}
        </p>
      </CyberPanel>
      <div className="mt-2 space-y-2">
        {reports.slice(0, 8).map((r) => (
          <CyberPanel key={r.id} glow={MC.red} className="!p-2">
            <p className="text-[10px] font-bold text-slate-200">{r.summary}</p>
            <p className="text-[8px] text-slate-500">
              {r.kind} · {r.status} · {r.severity}
            </p>
          </CyberPanel>
        ))}
      </div>
    </MissionSubShell>
  );
}

export function AIControlScreen() {
  const [rules, setRules] = useState<AiRule[]>([]);

  useEffect(() => {
    void fetchAiRules().then((r) => setRules(r ?? []));
  }, []);

  const toggle = (key: string, enabled: boolean) => {
    setRules((prev) => prev.map((r) => (r.key === key ? { ...r, enabled } : r)));
    void toggleAiRuleDb(key, enabled);
  };

  return (
    <MissionSubShell title="AI Control" titleEn="AI Control">
      <PrivacyStrip>AI moderation on platform level — no private data training.</PrivacyStrip>
      <div className="space-y-3">
        {rules.map((s) => (
          <ModuleControlRow
            key={s.key}
            labelAr={s.labelAr}
            labelEn={s.label}
            scopeAr={`طابور المراجعة: ${s.queueCount} عنصر`}
            icon={COMMAND_ICONS.ai}
            accent={MC.purple}
            checked={s.enabled}
            onChange={() => toggle(s.key, !s.enabled)}
          />
        ))}
      </div>
    </MissionSubShell>
  );
}

export function AnalyticsScreen() {
  const dash = usePlatformDashboard();
  const tiles = [
    { label: "المستخدمون", value: formatCount(dash.stats.users) },
    { label: "الكنائس", value: String(dash.stats.churches) },
    { label: "الكهنة", value: String(dash.stats.priests) },
    { label: "الخدام", value: formatCount(dash.stats.servants) },
    { label: "الرسائل", value: formatCount(dash.stats.messages) },
    { label: "الطلبات", value: String(dash.stats.requests) },
    { label: "البلاغات", value: String(dash.stats.reports) },
    { label: "موافقات معلقة", value: String(dash.pendingApprovals) },
  ];

  return (
    <MissionSubShell title="Analytics" titleEn="التحليلات">
      <PrivacyStrip>تقارير عامة فقط — بدون بيانات شخصية.</PrivacyStrip>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <ModuleControlRow
            key={t.label}
            labelAr={t.label}
            labelEn="Analytics"
            scopeAr="إحصائية عامة للمنصة"
            icon={COMMAND_ICONS.analytics}
            accent={MC.cyan}
            metricValue={t.value}
          />
        ))}
      </div>
    </MissionSubShell>
  );
}

export function AuditLogsScreen() {
  const { auditLog, refreshAuditLog } = usePlatformStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refreshAuditLog().finally(() => setLoading(false));
  }, [refreshAuditLog]);

  const handleRefresh = () => {
    setLoading(true);
    void refreshAuditLog().finally(() => setLoading(false));
  };

  return (
    <MissionSubShell title="Audit Logs" titleEn="سجل العمليات">
      <PrivacyStrip>كل عملية إدارية: المسؤول · التاريخ · الوقت · السبب.</PrivacyStrip>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold tabular-nums" style={{ color: MC.muted }}>
          {loading ? "…" : `${auditLog.length} سجل`}
        </span>
        <button
          type="button"
          aria-label="تحديث السجل"
          disabled={loading}
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[9px] font-extrabold transition active:scale-95 disabled:opacity-50"
          style={{ borderColor: MC.panelBorder, color: MC.cyan, background: MC.panel }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>
      <div className="space-y-2">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[14px] border"
              style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}
            />
          ))
        ) : auditLog.length === 0 ? (
          <CyberPanel glow={MC.steel}>
            <p className="text-center text-[11px] font-bold text-slate-400">لا توجد سجلات تدقيق بعد</p>
          </CyberPanel>
        ) : (
          auditLog.map((e) => (
          <CyberPanel key={e.id} glow={e.scanMeta ? MC.cyan : MC.steel}>
            <p className="text-[12px] font-extrabold text-slate-200">{e.action}</p>
            <div className="mt-2 space-y-0.5 text-[10px]">
              <p className="text-slate-500">
                {new Date(e.timestamp).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className="text-slate-400">Admin: {e.admin}</p>
              <p className="text-slate-300">Reason: {e.reason}</p>
              {e.scanMeta && (
                <p className="text-[9px] text-slate-500">
                  Scan · {e.scanMeta.scanType} · {e.scanMeta.trustId}
                  {e.scanMeta.accessReason ? ` · ${e.scanMeta.accessReason}` : ""}
                </p>
              )}
            </div>
          </CyberPanel>
          ))
        )}
      </div>
    </MissionSubShell>
  );
}

export function SystemSettingsScreen() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const loadSettings = useCallback(() => {
    void fetchPlatformSettings().then(setSettings);
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("ab:mc-platform-settings");
        if (cached) setSettings(JSON.parse(cached) as PlatformSettings);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
    return subscribePlatformSync(() => loadSettings());
  }, [loadSettings]);

  const patch = (p: Partial<PlatformSettings>) => {
    setSettings((prev) => {
      const next = prev ? { ...prev, ...p } : prev;
      if (next && typeof window !== "undefined") {
        localStorage.setItem("ab:mc-platform-settings", JSON.stringify(next));
      }
      return next;
    });
    void patchPlatformSettingsDb(p).then((ok) => {
      if (ok) broadcastPlatformLiveUpdate();
    });
  };

  if (!settings) {
    return (
      <MissionSubShell title="System Settings" titleEn="إعدادات النظام" navActive="profile">
        <CyberPanel glow={MC.steel}>
          <p className="text-[12px] text-slate-400">جاري تحميل الإعدادات…</p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  return (
    <MissionSubShell title="System Settings" titleEn="إعدادات النظام" navActive="profile">
      <PrivacyStrip>إعدادات المنصة العامة — بدون الوصول للمحتوى الخاص.</PrivacyStrip>
      <div className="space-y-3">
        <ModuleControlRow
          labelAr="تفعيل التسجيل"
          labelEn="Registration"
          scopeAr="السماح بإنشاء حسابات جديدة"
          icon={Settings}
          accent={MC.green}
          checked={settings.registrationEnabled}
          onChange={() => patch({ registrationEnabled: !settings.registrationEnabled })}
        />
        <ModuleControlRow
          labelAr="التحقق مطلوب"
          labelEn="Verification Required"
          scopeAr="يتطلب تأكيد الهوية قبل الاستخدام الكامل"
          icon={ShieldAlert}
          accent={MC.cyan}
          checked={settings.verificationRequired}
          onChange={() => patch({ verificationRequired: !settings.verificationRequired })}
        />
        <ModuleControlRow
          labelAr="السماح بكنائس جديدة"
          labelEn="New Churches"
          scopeAr="فتح طلبات تسجيل كنائس جديدة"
          icon={COMMAND_ICONS.churches}
          accent={MC.purple}
          checked={settings.allowNewChurches}
          onChange={() => patch({ allowNewChurches: !settings.allowNewChurches })}
        />
        <CyberSearch
          value={settings.maintenanceMessage}
          onChange={(v) => patch({ maintenanceMessage: v })}
          placeholder="رسالة الصيانة (اختياري)"
        />
      </div>
    </MissionSubShell>
  );
}

export function AlphaLibraryScreen() {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);

  useEffect(() => {
    void fetchLibraryDocs().then((d) => setDocs(d ?? []));
  }, []);

  return (
    <MissionSubShell title="Alpha Library" titleEn="مكتبة Alpha">
      <PrivacyStrip>وثائق وسياسات عامة — بدون محتوى خاص.</PrivacyStrip>
      <div className="space-y-3">
        {docs.map((d) => (
          <ModuleControlRow
            key={d.id}
            labelAr={d.title}
            labelEn={d.category}
            scopeAr={d.description}
            icon={COMMAND_ICONS.library}
            accent={MC.green}
            metricValue="وثيقة"
          />
        ))}
      </div>
    </MissionSubShell>
  );
}

export function OwnerSecurityScreen() {
  const [pinDraft, setPinDraft] = useState("");
  const { addAudit } = usePlatformStore();

  return (
    <MissionSubShell title="Owner Security" titleEn="أمان المالك" navActive="profile">
      <CyberPanel glow={MC.cyan} className="mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" style={{ color: MC.cyan }} />
          <p className="text-[12px] font-extrabold text-slate-200">Owner Security Center</p>
        </div>
      </CyberPanel>

      <CyberPanel glow={MC.gold} className="mb-2">
        <p className="mb-2 text-[11px] font-bold text-slate-200">Change PIN Code</p>
        <CyberSearch value={pinDraft} onChange={setPinDraft} placeholder="PIN جديد (6 أرقام)" />
        <CyberBtn
          label="تحديث PIN"
          className="w-full"
          onClick={() => {
            if (pinDraft.length !== 6 || !/^\d+$/.test(pinDraft)) {
              window.alert("PIN يجب أن يكون 6 أرقام");
              return;
            }
            setOwnerPin(pinDraft);
            setPinDraft("");
            addAudit("تغيير PIN", "Owner security");
            window.alert("تم تحديث PIN");
          }}
        />
        <p className="mt-2 text-[9px] text-slate-500">PIN الحالي: ••••••</p>
      </CyberPanel>

      <div className="space-y-2">
        <ModuleControlRow
          labelAr="Face ID"
          labelEn="Biometric Login"
          scopeAr="تسجيل دخول بالبصمة — قريباً"
          icon={Fingerprint}
          accent={MC.cyan}
          checked={false}
          onChange={() => window.alert("Face ID — قريباً")}
        />
        <CyberPanel glow={MC.electric}>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" style={{ color: MC.cyan }} />
            <span className="text-[12px] font-bold text-slate-200">Active Sessions · 1</span>
          </div>
        </CyberPanel>
        <CyberPanel glow={MC.steel}>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-200">Login History</span>
          </div>
        </CyberPanel>
        <CyberBtn
          label="Emergency Lock"
          variant="danger"
          className="w-full"
          onClick={() => {
            revokeOwnerSession();
            window.location.href = "/settings";
          }}
        />
      </div>
    </MissionSubShell>
  );
}

export function EmergencyCenterScreen() {
  const { emergency, patchEmergency, addAudit } = usePlatformStore();

  const toggle = (key: keyof typeof emergency, label: string) => {
    patchEmergency({ [key]: !emergency[key] });
    addAudit(label, "Emergency Center");
  };

  return (
    <MissionSubShell title="Emergency Center" titleEn="مركز الطوارئ" navActive="quick">
      <div
        className="mb-3 rounded-lg border px-3 py-2 text-[10px] font-bold text-slate-300"
        style={{ borderColor: `${MC.red}44`, background: `${MC.red}15` }}
      >
        لن يتم الوصول إلى أي بيانات خاصة أثناء تنفيذ أوامر الطوارئ.
      </div>
      <div className="space-y-3">
        <ModuleControlRow
          labelAr="وضع الصيانة"
          labelEn="Maintenance Mode"
          scopeAr="إظهار شاشة صيانة للمستخدمين"
          icon={Wrench}
          accent={MC.amber}
          checked={emergency.maintenance}
          onChange={() => toggle("maintenance", "Maintenance Mode")}
        />
        <ModuleControlRow
          labelAr="إيقاف التسجيل"
          labelEn="Disable Registration"
          scopeAr="منع إنشاء حسابات جديدة فوراً"
          icon={UserX}
          accent={MC.red}
          checked={emergency.disableRegistration}
          onChange={() => toggle("disableRegistration", "Disable Registration")}
        />
        <ModuleControlRow
          labelAr="إيقاف الرسائل"
          labelEn="Disable Messaging"
          scopeAr="تعطيل Alpha Connect والمراسلة"
          icon={MessageSquareOff}
          accent={MC.red}
          checked={emergency.disableMessaging}
          onChange={() => toggle("disableMessaging", "Disable Messaging")}
        />
        <ModuleControlRow
          labelAr="إيقاف المجتمع"
          labelEn="Disable Community"
          scopeAr="إخفاء المنشورات والتفاعل الاجتماعي"
          icon={Siren}
          accent={MC.red}
          checked={emergency.disableCommunity}
          onChange={() => toggle("disableCommunity", "Disable Community")}
        />
        <CyberBtn
          label="Emergency Lockdown"
          variant="danger"
          className="w-full !min-h-[52px] !text-[14px]"
          onClick={() => {
            patchEmergency({ lockdown: !emergency.lockdown });
            addAudit("Emergency Lockdown", "Critical");
          }}
        />
      </div>
    </MissionSubShell>
  );
}
