import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  CyberBtn,
  MissionSubShell,
  ModuleControlRow,
  PrivacyStrip,
} from "./mission-control-ui";
import { MODULE_CONTROL_META } from "./module-control-meta";
import { usePlatformStore, type ModuleState } from "./platform-store";
import { MC } from "./platform-store";

function modulesEqual(a: ModuleState[], b: ModuleState[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, i) => row.key === b[i]?.key && row.enabled === b[i]?.enabled);
}

export function ModuleControlScreen() {
  const { modules, saveModules, addAudit, dbSynced } = usePlatformStore();
  const [draft, setDraft] = useState<ModuleState[]>(modules);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!saving) setDraft(modules);
  }, [modules, saving]);

  const isDirty = useMemo(() => !modulesEqual(draft, modules), [draft, modules]);
  const enabledCount = draft.filter((m) => m.enabled).length;
  const disabledCount = draft.length - enabledCount;

  const setDraftEnabled = (key: ModuleState["key"], enabled: boolean) => {
    setDraft((prev) => prev.map((m) => (m.key === key ? { ...m, enabled } : m)));
    setError(null);
    setSavedFlash(false);
  };

  const handleDiscard = () => {
    setDraft(modules);
    setError(null);
    setSavedFlash(false);
  };

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);
    const result = await saveModules(draft);
    if (result.ok) {
      const turnedOff = draft.filter((d) => {
        const prev = modules.find((m) => m.key === d.key);
        return prev?.enabled && !d.enabled;
      });
      const turnedOn = draft.filter((d) => {
        const prev = modules.find((m) => m.key === d.key);
        return prev && !prev.enabled && d.enabled;
      });
      for (const m of turnedOff) {
        addAudit(`إيقاف ${m.labelAr}`, "حفظ دفعة — إخفاء من التطبيق");
      }
      for (const m of turnedOn) {
        addAudit(`تشغيل ${m.labelAr}`, "حفظ دفعة — إظهار في التطبيق");
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2400);
    } else {
      setError(
        result.error ??
          "تعذّر حفظ التغييرات في قاعدة البيانات. تحقق من الاتصال وحاول مجددًا.",
      );
    }
    setSaving(false);
  };

  return (
    <MissionSubShell title="Module Control" titleEn="إدارة الموديولات">
      <PrivacyStrip>
        عدّل الموديولات ثم اضغط «حفظ». الموديول الموقوف يختفي من التطبيق بالكامل — الرئيسية، التنقل، والمسارات المرتبطة.
      </PrivacyStrip>

      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[14px] border px-4 py-3"
        style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)" }}
      >
        <div className="text-right">
          <p className="text-[15px] font-extrabold text-slate-100">حالة المنصة</p>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            {dbSynced ? "متزامن مع قاعدة البيانات" : "جاري التحميل…"}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className="rounded-full border px-3 py-1 text-[13px] font-extrabold tabular-nums"
            style={{ borderColor: `${MC.green}44`, color: MC.green }}
          >
            {enabledCount} مفعّل
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[13px] font-extrabold tabular-nums text-slate-400"
            style={{ borderColor: MC.panelBorder }}
          >
            {disabledCount} موقوف
          </span>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] font-bold text-red-300">
          {error}
        </p>
      ) : null}

      {savedFlash ? (
        <p className="mb-3 flex items-center justify-end gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[13px] font-bold text-emerald-300">
          <Check className="h-4 w-4" />
          تم حفظ الموديولات وتطبيقها على التطبيق
        </p>
      ) : null}

      <div className="space-y-3 pb-28">
        {draft.length ? (
          draft.map((m) => {
            const meta = MODULE_CONTROL_META[m.key];
            return (
              <ModuleControlRow
                key={m.key}
                labelAr={m.labelAr}
                labelEn={m.label}
                scopeAr={meta.scopeAr}
                icon={meta.icon}
                accent={meta.accent}
                checked={m.enabled}
                disabled={saving}
                onChange={(enabled) => setDraftEnabled(m.key, enabled)}
              />
            );
          })
        ) : (
          <p className="rounded-[16px] border border-slate-700/60 bg-black/30 px-4 py-6 text-center text-[14px] font-bold text-slate-400">
            لا توجد موديولات — تحقق من اتصال Supabase.
          </p>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),72px)] z-40 mx-auto max-w-[var(--alpha-content-max-width)] px-4"
        dir="rtl"
      >
        <div
          className="relative flex items-center gap-2 rounded-[18px] border p-2.5 shadow-2xl backdrop-blur-xl"
          style={{
            borderColor: isDirty ? `${MC.gold}55` : MC.panelBorder,
            background: MC.panel,
            boxShadow: isDirty ? `0 0 28px -8px ${MC.gold}44` : undefined,
          }}
        >
          <CyberBtn
            label={saving ? "جاري الحفظ…" : "حفظ التغييرات"}
            className="min-h-[48px] flex-1 !text-[14px]"
            variant={isDirty ? "save" : "primary"}
            highlight={isDirty && !saving}
            disabled={!isDirty || saving}
            onClick={() => void handleSave()}
          />
          <button
            type="button"
            disabled={!isDirty || saving}
            onClick={handleDiscard}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border px-3 transition active:scale-95 disabled:opacity-40"
            style={{
              borderColor: isDirty ? `${MC.amber}55` : MC.panelBorder,
              background: isDirty ? "rgba(184,149,74,0.12)" : "rgba(0,0,0,0.2)",
              color: isDirty ? MC.amber : MC.muted,
            }}
            aria-label="تراجع عن التغييرات"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-[12px] font-extrabold">تراجع</span>
          </button>
          {isDirty ? (
            <span className="absolute -top-2 left-4 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-extrabold text-black">
              غير محفوظ
            </span>
          ) : null}
        </div>
        {isDirty ? (
          <p className="mt-2 text-center text-[11px] font-bold text-amber-400/90">
            لديك تغييرات — اضغط حفظ لتطبيقها على كل المستخدمين
          </p>
        ) : null}
      </div>
    </MissionSubShell>
  );
}
