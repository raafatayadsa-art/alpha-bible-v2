import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Building2, Shield, UserCircle } from "lucide-react";
import {
  CyberBtn,
  CyberPanel,
  MissionSubShell,
  PrivacyStrip,
} from "./mission-control-ui";
import { MC, usePlatformStore } from "./platform-store";
import {
  ACCOUNT_STATUS_LABEL,
  ACCOUNT_TYPE_LABEL,
  applyChurchAction,
  applyPersonAction,
  CHURCH_STATUS_LABEL,
  getTrustProfile,
  getTrustProfileAsync,
  TRUST_STATUS_LABEL,
  VERIFICATION_LABEL,
  type ChurchTrustProfile,
  type PersonTrustProfile,
  type TrustStatus,
} from "./scan-store";

function trustColor(status: TrustStatus) {
  if (status === "good") return MC.green;
  if (status === "watch" || status === "restricted") return MC.amber;
  return MC.red;
}

function ProfileSection({
  title,
  titleEn,
  children,
  glow = MC.steel,
}: {
  title: string;
  titleEn?: string;
  children: ReactNode;
  glow?: string;
}) {
  return (
    <CyberPanel glow={glow} className="mb-2.5">
      <p className="mb-2 text-[10px] font-bold text-slate-300">{title}</p>
      {titleEn && <p className="-mt-1 mb-2 text-[7px] font-semibold uppercase tracking-wide text-slate-600">{titleEn}</p>}
      {children}
    </CyberPanel>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-1.5 last:border-0" style={{ borderColor: MC.panelBorder }}>
      <span className="text-[10px] font-semibold text-slate-500">{label}</span>
      <span className="max-w-[58%] text-left text-[10px] font-bold text-slate-200" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}

function PersonProfileView({ profile, onUpdate }: { profile: PersonTrustProfile; onUpdate: () => void }) {
  const { addAudit } = usePlatformStore();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const run = useCallback(
    (action: Parameters<typeof applyPersonAction>[1]) => {
      const next = applyPersonAction(profile.id, action, note);
      if (next) {
        addAudit(`Platform Action — ${profile.displayName}`, action, {
          scanType: profile.qrType,
          trustId: profile.id,
        });
        onUpdate();
      }
    },
    [addAudit, note, onUpdate, profile.displayName, profile.id, profile.qrType],
  );

  return (
    <>
      <ProfileSection title="Identity Summary" titleEn="ملخص الهوية" glow={MC.electric}>
        <Row label="الاسم الظاهر" value={profile.displayName} />
        <Row label="رقم العضوية" value={profile.membershipId} />
        <Row label="نوع الحساب" value={ACCOUNT_TYPE_LABEL[profile.accountType]} />
        <Row label="حالة الحساب" value={ACCOUNT_STATUS_LABEL[profile.accountStatus]} accent={trustColor(profile.trustStatus)} />
      </ProfileSection>

      <ProfileSection title="Trust & Risk Status" titleEn="الثقة والمخاطر" glow={trustColor(profile.trustStatus)}>
        <Row label="Risk / Trust" value={TRUST_STATUS_LABEL[profile.trustStatus]} accent={trustColor(profile.trustStatus)} />
        <Row label="مرات الحظر" value={String(profile.banCount)} />
        <Row label="مرات التقييد" value={String(profile.restrictionCount)} />
        <Row label="بلاغات مؤكدة" value={String(profile.confirmedReports)} accent={profile.confirmedReports > 0 ? MC.red : undefined} />
        <Row label="بلاغات مرفوضة" value={String(profile.rejectedReports)} />
        <Row label="آخر نشاط عام" value={profile.lastPublicActivity} />
      </ProfileSection>

      <ProfileSection title="Church Affiliation" titleEn="الانتماء للكنيسة" glow={MC.cyan}>
        <Row label="الكنيسة الحالية" value={profile.currentChurch} />
        <Row label="تاريخ الانضمام للتطبيق" value={profile.appJoinDate} />
        <Row label="تاريخ الانضمام للكنيسة" value={profile.churchJoinDate} />
        <Row label="صلاحيات المنصة" value={profile.platformPermissions.join(" · ")} />
      </ProfileSection>

      <ProfileSection title="Moderation History" titleEn="سجل الإجراءات الإدارية" glow={MC.amber}>
        {profile.adminActions.length === 0 ? (
          <p className="text-[9px] text-slate-500">لا سجل إداري</p>
        ) : (
          profile.adminActions.slice(0, 6).map((a) => (
            <div key={a.id} className="mb-1.5 rounded-[6px] border px-2 py-1.5" style={{ borderColor: MC.panelBorder }}>
              <p className="text-[10px] font-bold text-slate-300">{a.action}</p>
              <p className="text-[8px] text-slate-500">{a.date} · {a.by}</p>
            </div>
          ))
        )}
      </ProfileSection>

      <ProfileSection title="Transfer History" titleEn="سجل انتقال الكنائس" glow={MC.purple}>
        {profile.churchTransfers.length === 0 ? (
          <p className="text-[9px] text-slate-500">لا انتقالات مسجّلة</p>
        ) : (
          profile.churchTransfers.map((t, i) => (
            <div key={i} className="mb-1.5 text-[9px] text-slate-400">
              <span className="font-bold text-slate-300">{t.from}</span>
              <span className="mx-1 text-slate-600">→</span>
              <span className="font-bold text-slate-300">{t.to}</span>
              <span className="mt-0.5 block text-[8px] text-slate-500">{t.date}</span>
            </div>
          ))
        )}
      </ProfileSection>

      <ProfileSection title="Platform Actions" titleEn="إجراءات المنصة" glow={MC.steel}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة إدارية (اختياري)"
          className="mb-2 w-full rounded-lg border bg-black/30 px-2.5 py-2 text-[10px] text-slate-300 outline-none"
          style={{ borderColor: MC.panelBorder }}
        />
        <div className="grid grid-cols-2 gap-1.5">
          <CyberBtn label="تقييد الحساب" variant="warn" onClick={() => run("restrict")} />
          <CyberBtn label="فك التقييد" variant="primary" onClick={() => run("unrestrict")} />
          <CyberBtn label="حظر الحساب" variant="danger" onClick={() => run("block")} />
          <CyberBtn label="فك الحظر" variant="ghost" onClick={() => run("unblock")} />
          <CyberBtn label="إضافة ملاحظة" className="col-span-2" onClick={() => run("note")} />
          <CyberBtn
            label="فتح البلاغات المرتبطة فقط"
            className="col-span-2"
            variant="ghost"
            onClick={() => navigate({ to: "/platform/reports" })}
          />
        </div>
      </ProfileSection>
    </>
  );
}

function ChurchProfileView({ profile, onUpdate }: { profile: ChurchTrustProfile; onUpdate: () => void }) {
  const { addAudit } = usePlatformStore();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const run = useCallback(
    (action: Parameters<typeof applyChurchAction>[1]) => {
      const next = applyChurchAction(profile.id, action, note);
      if (next) {
        addAudit(`Platform Action — ${profile.churchName}`, action, {
          scanType: "church",
          trustId: profile.id,
        });
        onUpdate();
      }
    },
    [addAudit, note, onUpdate, profile.churchName, profile.id],
  );

  return (
    <>
      <ProfileSection title="Identity Summary" titleEn="ملخص الكنيسة" glow={MC.electric}>
        <Row label="اسم الكنيسة" value={profile.churchName} />
        <Row label="رقم الكنيسة" value={profile.churchId} />
        <Row label="حالة التحقق" value={VERIFICATION_LABEL[profile.verificationStatus]} />
        <Row label="حالة الكنيسة" value={CHURCH_STATUS_LABEL[profile.churchStatus]} accent={trustColor(profile.trustStatus)} />
        <Row label="الكاهن المسؤول" value={profile.responsiblePriest} />
      </ProfileSection>

      <ProfileSection title="Trust & Risk Status" titleEn="الثقة والمخاطر" glow={trustColor(profile.trustStatus)}>
        <Row label="حالة الثقة" value={TRUST_STATUS_LABEL[profile.trustStatus]} accent={trustColor(profile.trustStatus)} />
        <Row label="عدد الأعضاء" value={String(profile.memberCount)} />
        <Row label="عدد الخدام" value={String(profile.servantCount)} />
        <Row label="التخزين المستخدم" value={profile.storageUsed} />
        <Row label="بلاغات مفتوحة" value={String(profile.openReports)} accent={profile.openReports > 0 ? MC.amber : undefined} />
        <Row label="بلاغات مغلقة" value={String(profile.closedReports)} />
        <Row label="آخر نشاط عام" value={profile.lastPublicActivity} />
      </ProfileSection>

      <ProfileSection title="Moderation History" titleEn="سجل إجراءات المنصة" glow={MC.amber}>
        {profile.platformActions.slice(0, 6).map((a) => (
          <div key={a.id} className="mb-1.5 rounded-[6px] border px-2 py-1.5" style={{ borderColor: MC.panelBorder }}>
            <p className="text-[10px] font-bold text-slate-300">{a.action}</p>
            <p className="text-[8px] text-slate-500">{a.date} · {a.by}</p>
          </div>
        ))}
      </ProfileSection>

      <ProfileSection title="Platform Actions" titleEn="إجراءات المنصة" glow={MC.steel}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظة إدارية (اختياري)"
          className="mb-2 w-full rounded-lg border bg-black/30 px-2.5 py-2 text-[10px] text-slate-300 outline-none"
          style={{ borderColor: MC.panelBorder }}
        />
        <div className="grid grid-cols-2 gap-1.5">
          <CyberBtn label="مراجعة حالة الكنيسة" variant="primary" onClick={() => run("review")} />
          <CyberBtn label="تعليق الكنيسة" variant="warn" onClick={() => run("suspend")} />
          <CyberBtn label="إعادة تفعيل" variant="ghost" onClick={() => run("reactivate")} />
          <CyberBtn label="إضافة ملاحظة" onClick={() => run("note")} />
          <CyberBtn
            label="فتح البلاغات المرتبطة فقط"
            className="col-span-2"
            variant="ghost"
            onClick={() => navigate({ to: "/platform/reports" })}
          />
        </div>
      </ProfileSection>

      <div
        className="mb-2 flex items-start gap-2 rounded-[8px] border px-2.5 py-2"
        style={{ borderColor: `${MC.red}33`, background: `${MC.red}0a` }}
      >
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: MC.red }} />
        <p className="text-[8px] leading-relaxed text-slate-500">
          لا يتم عرض أسماء الأعضاء أو المنشورات أو الرسائل — بيانات المنصة العامة فقط.
        </p>
      </div>
    </>
  );
}

export function PlatformTrustProfileScreen({ trustId }: { trustId: string }) {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((n) => n + 1), []);

  const [profile, setProfile] = useState<ReturnType<typeof getTrustProfile>>(() => getTrustProfile(trustId));

  useEffect(() => {
    let cancelled = false;
    void getTrustProfileAsync(trustId).then((p) => {
      if (!cancelled && p) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [trustId, version]);

  if (!profile) {
    return (
      <MissionSubShell title="Platform Trust Profile" titleEn="ملف الثقة">
        <CyberPanel glow={MC.red}>
          <p className="text-[11px] font-bold text-slate-300">ملف غير موجود</p>
          <CyberBtn label="العودة إلى Scan Center" className="mt-3 w-full" onClick={() => navigate({ to: "/platform/scan" })} />
        </CyberPanel>
      </MissionSubShell>
    );
  }

  const Icon = profile.kind === "church" ? Building2 : UserCircle;

  return (
    <MissionSubShell title="Platform Trust Profile" titleEn="ملف الثقة الإدارية">
      <button
        type="button"
        onClick={() => navigate({ to: "/platform/scan" })}
        className="mb-2 text-[9px] font-semibold text-slate-500 underline-offset-2 hover:underline"
      >
        ← Scan Center
      </button>

      <PrivacyStrip>
        بيانات ثقة إدارية فقط — لا رسائل · لا منشورات خاصة · لا بيانات عائلات.
      </PrivacyStrip>

      <CyberPanel glow={trustColor(profile.trustStatus)} className="mb-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-[10px] border"
            style={{ borderColor: `${trustColor(profile.trustStatus)}44`, background: `${trustColor(profile.trustStatus)}12` }}
          >
            <Icon className="h-5 w-5" style={{ color: trustColor(profile.trustStatus) }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-extrabold text-slate-100">
              {profile.kind === "person" ? profile.displayName : profile.churchName}
            </p>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
              {profile.qrType} · {TRUST_STATUS_LABEL[profile.trustStatus]}
            </p>
          </div>
          <Shield className="h-4 w-4 shrink-0" style={{ color: MC.green }} />
        </div>
      </CyberPanel>

      {profile.kind === "person" ? (
        <PersonProfileView profile={profile} onUpdate={refresh} />
      ) : (
        <ChurchProfileView profile={profile} onUpdate={refresh} />
      )}
    </MissionSubShell>
  );
}
