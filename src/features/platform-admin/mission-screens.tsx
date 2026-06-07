import { useEffect, useState } from "react";
import { Fingerprint, History, Lock, ShieldAlert } from "lucide-react";
import {
  CyberBtn,
  CyberPanel,
  CyberSearch,
  CyberToggle,
  MissionSubShell,
  PrivacyStrip,
} from "./mission-control-ui";
import { usePlatformStore } from "./platform-store";
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

export function ModuleControlScreen() {
  const { modules, toggleModule, addAudit } = usePlatformStore();

  return (
    <MissionSubShell title="Module Control" titleEn="إدارة الموديولات">
      <PrivacyStrip>تشغيل/إيقاف الموديولات — بدون الوصول لبيانات المستخدمين.</PrivacyStrip>
      <div className="space-y-2">
        {modules.map((m) => (
          <CyberToggle
            key={m.key}
            label={`${m.labelAr} · ${m.label}`}
            checked={m.enabled}
            onChange={() => {
              toggleModule(m.key);
              addAudit(m.enabled ? `إيقاف ${m.labelAr}` : `تشغيل ${m.labelAr}`, "Owner action");
            }}
          />
        ))}
      </div>
    </MissionSubShell>
  );
}

export function PrivacySecurityScreen() {
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);

  useEffect(() => {
    void fetchPrivacyMetrics().then(setMetrics);
  }, []);

  const items = [
    { label: "الكلمات المحظورة", value: metrics?.blockedWords ?? "—" },
    { label: "البلاغات الأمنية", value: metrics?.securityReports ?? "—" },
    { label: "المستخدمون المقيدون", value: metrics?.restrictedUsers ?? "—" },
    { label: "الحسابات المحظورة", value: metrics?.blockedAccounts ?? "—" },
    { label: "سجل المخالفات", value: metrics?.violations ?? "—" },
  ];

  return (
    <MissionSubShell title="Privacy & Security" titleEn="الخصوصية والأمان">
      <PrivacyStrip>Owner لا يرى رسائل أو منشورات أو بيانات أعضاء — إدارة سياسات المنصة فقط.</PrivacyStrip>
      <div className="space-y-2">
        {items.map((item) => (
          <CyberPanel key={item.label} glow={MC.green}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-extrabold tabular-nums text-slate-100">{item.value}</span>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" style={{ color: MC.green }} />
                <span className="text-[12px] font-bold text-slate-200">{item.label}</span>
              </div>
            </div>
          </CyberPanel>
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
      <div className="space-y-2">
        {rules.map((s) => (
          <CyberToggle
            key={s.key}
            label={`${s.labelAr} · Queue ${s.queueCount}`}
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
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t) => (
          <CyberPanel key={t.label} glow={MC.cyan}>
            <p className="text-[10px] text-slate-500">{t.label}</p>
            <p className="text-[18px] font-extrabold tabular-nums text-slate-100">{t.value}</p>
          </CyberPanel>
        ))}
      </div>
    </MissionSubShell>
  );
}

export function AuditLogsScreen() {
  const { auditLog } = usePlatformStore();

  return (
    <MissionSubShell title="Audit Logs" titleEn="سجل العمليات">
      <PrivacyStrip>كل عملية إدارية: المسؤول · التاريخ · الوقت · السبب.</PrivacyStrip>
      <div className="space-y-2">
        {auditLog.map((e) => (
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
        ))}
      </div>
    </MissionSubShell>
  );
}

export function SystemSettingsScreen() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    void fetchPlatformSettings().then(setSettings);
  }, []);

  const patch = (p: Partial<PlatformSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...p } : prev));
    void patchPlatformSettingsDb(p);
  };

  if (!settings) {
    return (
      <MissionSubShell title="System Settings" titleEn="إعدادات النظام">
        <CyberPanel glow={MC.steel}>
          <p className="text-[12px] text-slate-400">جاري تحميل الإعدادات…</p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  return (
    <MissionSubShell title="System Settings" titleEn="إعدادات النظام">
      <PrivacyStrip>إعدادات المنصة العامة — بدون الوصول للمحتوى الخاص.</PrivacyStrip>
      <div className="space-y-2">
        <CyberToggle
          label="تفعيل التسجيل"
          checked={settings.registrationEnabled}
          onChange={() => patch({ registrationEnabled: !settings.registrationEnabled })}
        />
        <CyberToggle
          label="التحقق مطلوب"
          checked={settings.verificationRequired}
          onChange={() => patch({ verificationRequired: !settings.verificationRequired })}
        />
        <CyberToggle
          label="السماح بكنائس جديدة"
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
      <div className="space-y-2">
        {docs.map((d) => (
          <CyberPanel key={d.id} glow={MC.green}>
            <p className="text-[12px] font-bold text-slate-200">{d.title}</p>
            <p className="text-[9px] text-slate-500">{d.category} · {d.description}</p>
          </CyberPanel>
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
        <CyberToggle label="Face ID" checked={false} onChange={() => window.alert("Face ID — قريباً")} />
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
      <div className="space-y-2">
        <CyberToggle label="Maintenance Mode" checked={emergency.maintenance} onChange={() => toggle("maintenance", "Maintenance Mode")} />
        <CyberToggle label="Disable Registration" checked={emergency.disableRegistration} onChange={() => toggle("disableRegistration", "Disable Registration")} />
        <CyberToggle label="Disable Messaging" checked={emergency.disableMessaging} onChange={() => toggle("disableMessaging", "Disable Messaging")} />
        <CyberToggle label="Disable Community" checked={emergency.disableCommunity} onChange={() => toggle("disableCommunity", "Disable Community")} />
        <CyberBtn
          label="Emergency Lockdown"
          variant="danger"
          className="w-full"
          onClick={() => {
            patchEmergency({ lockdown: !emergency.lockdown });
            addAudit("Emergency Lockdown", "Critical");
          }}
        />
      </div>
    </MissionSubShell>
  );
}
