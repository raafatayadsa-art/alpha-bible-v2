import { type ReactNode, useEffect, useRef } from "react";
import { Church } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { CopticCross } from "@/components/coptic";
import { canManageChurchPosts, useAlphaAuth } from "@/features/auth";
import { useChurchHubDashboardAccess, useChurchProfile } from "@/features/church/use-church-dashboard";
import { cn } from "@/lib/utils";
import { setupGreenButton } from "./church-setup-styles";

function HubCard({
  children,
  accent = "#b8893a",
  className = "",
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[24px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 backdrop-blur-xl overflow-hidden",
        className,
      )}
      style={{
        boxShadow: `0 18px 38px -22px rgba(120,80,30,0.55), 0 0 28px -14px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.75)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[24px]"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)",
        }}
      />
      <div className="relative p-5">{children}</div>
    </div>
  );
}

function HubButton({
  children,
  to,
  variant = "primary",
}: {
  children: ReactNode;
  to: string;
  variant?: "primary" | "secondary";
}) {
  const navigate = useNavigate();
  const cls =
    variant === "primary"
      ? setupGreenButton
      : "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#efe2c4] bg-white/75 backdrop-blur-sm text-[14px] font-extrabold text-[#3a2a18] shadow-[0_8px_18px_-14px_rgba(120,80,30,0.35)] active:scale-[0.98] transition-transform";

  return (
    <button type="button" className={cls} onClick={() => navigate({ to: to as "/" })}>
      {children}
    </button>
  );
}

function ChurchIllustration() {
  return (
    <div className="mx-auto grid h-20 w-20 place-items-center rounded-[22px] border border-[#efe2c4] bg-gradient-to-br from-[#fff8e9] to-[#e7c07a]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_-12px_rgba(120,80,30,0.45)]">
      <Church className="h-9 w-9 text-[#7a4a26]" strokeWidth={1.8} />
    </div>
  );
}

function StateLoading() {
  return (
    <HubCard accent="#3f9d6e" className="animate-in fade-in duration-300">
      <p className="text-center text-[13px] font-bold text-[#6a543a]">جاري فتح لوحة الكنيسة…</p>
    </HubCard>
  );
}

function StateOpeningChurch() {
  return (
    <HubCard accent="#3f9d6e" className="animate-in fade-in duration-300">
      <div className="text-center">
        <ChurchIllustration />
        <h2 className="mt-4 font-arabic-serif text-[17px] font-bold text-[#3a2a18]">كنيستك معاك</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">جاري فتح شاشة الكنيسة…</p>
      </div>
      <div className="mt-5">
        <HubButton to="/church">فتح كنيستك معاك</HubButton>
      </div>
    </HubCard>
  );
}

function StateEmpty({ canManage }: { canManage: boolean }) {
  return (
    <HubCard accent="#c98a3c" className="animate-in fade-in duration-300">
      <div className="text-center">
        <ChurchIllustration />
        <h2 className="mt-4 font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
          لا توجد كنيسة مرتبطة بحسابك
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">
          يمكنك اختيار كنيسة من الدليل أو إرسال طلب انضمام. {canManage ? "وبصفتك خادماً أو كاهناً يمكنك أيضاً طلب تأسيس كنيسة." : ""}
        </p>
      </div>
      <div className="mt-5 space-y-2.5">
        <HubButton to="/church/directory">اختيار كنيسة</HubButton>
        <HubButton to="/church/directory" variant="secondary">
          طلب الانضمام لكنيسة
        </HubButton>
        {canManage ? (
          <HubButton to="/profile/church/setup" variant="secondary">
            طلب تأسيس كنيسة
          </HubButton>
        ) : null}
      </div>
    </HubCard>
  );
}

function StatePending() {
  return (
    <HubCard accent="#a07ec4" className="animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="text-right flex-1">
          <CopticCross className="mb-3 text-[#a07ec4]" size={20} />
          <h2 className="font-arabic-serif text-[17px] font-bold text-[#3a2a18] leading-snug">
            طلب تأسيس الكنيسة قيد المراجعة
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#6a543a]">
            تم استلام طلبك وسيتم مراجعته بواسطة إدارة Alpha.
          </p>
        </div>
      </div>
    </HubCard>
  );
}

function StateNeedsInfo({ adminNotes }: { adminNotes?: string }) {
  return (
    <HubCard accent="#d8a83a" className="animate-in fade-in duration-300">
      <div className="text-right">
        <CopticCross className="mb-3 text-[#d8a83a]" size={20} />
        <h2 className="font-arabic-serif text-[17px] font-bold text-[#3a2a18]">
          مطلوب بيانات إضافية
        </h2>
        {adminNotes ? (
          <p className="mt-2 rounded-2xl border border-[#f0c878]/50 bg-[#fff8e9]/80 px-3.5 py-3 text-[12.5px] leading-relaxed text-[#3a2a18]">
            {adminNotes}
          </p>
        ) : (
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#6a543a]">
            يرجى مراجعة ملاحظات الإدارة وتحديث الطلب.
          </p>
        )}
      </div>
      <div className="mt-5">
        <HubButton to="/profile/church/setup">تعديل الطلب</HubButton>
      </div>
    </HubCard>
  );
}

function StateError({ onRetry }: { onRetry: () => void }) {
  return (
    <HubCard accent="#c45c5c" className="animate-in fade-in duration-300">
      <div className="text-center">
        <h2 className="font-arabic-serif text-[17px] font-bold text-[#3a2a18]">تعذّر تحميل بيانات الكنيسة</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">
          تحقق من الاتصال وحاول مرة أخرى. لن نبقيك في شاشة التحميل.
        </p>
      </div>
      <div className="mt-5 space-y-2.5">
        <button type="button" className={setupGreenButton} onClick={onRetry}>
          إعادة المحاولة
        </button>
        <HubButton to="/church/directory" variant="secondary">
          اختيار كنيسة
        </HubButton>
      </div>
    </HubCard>
  );
}

export function ChurchManagementHub() {
  const navigate = useNavigate();
  const redirectedRef = useRef(false);
  const { user, isAuthenticated, role } = useAlphaAuth();
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useChurchProfile();
  const {
    canOpenDashboard,
    loading: accessLoading,
    error: accessError,
    refresh: refreshAccess,
  } = useChurchHubDashboardAccess();

  const loading = profileLoading || accessLoading;
  const canManage = canManageChurchPosts(role);
  const shouldOpenChurch = canOpenDashboard || profile.hasApprovedChurch;

  useEffect(() => {
    if (loading) return;

    if (shouldOpenChurch && !redirectedRef.current) {
      redirectedRef.current = true;
      console.info("[ChurchManagementHub] approved church found — opening /church", {
        userId: user?.id ?? null,
        isAuthenticated,
        canOpenDashboard,
        hasApprovedChurch: profile.hasApprovedChurch,
      });
      navigate({ to: "/church", replace: true });
    }
  }, [loading, shouldOpenChurch, canOpenDashboard, profile.hasApprovedChurch, navigate, user?.id, isAuthenticated]);

  useEffect(() => {
    if (loading) return;
    console.info("[ChurchManagementHub] resolved", {
      userId: user?.id ?? null,
      isAuthenticated,
      canOpenDashboard,
      setupStatus: profile.setupStatus,
      hasApprovedChurch: profile.hasApprovedChurch,
      canManage,
    });
  }, [loading, user?.id, isAuthenticated, canOpenDashboard, profile.setupStatus, profile.hasApprovedChurch, canManage]);

  const retry = () => {
    redirectedRef.current = false;
    void refreshProfile();
    void refreshAccess();
  };

  if (loading) {
    return <StateLoading />;
  }

  if (profileError || accessError) {
    return <StateError onRetry={retry} />;
  }

  if (shouldOpenChurch) {
    return <StateOpeningChurch />;
  }

  if (profile.setupStatus === "pending") {
    return <StatePending />;
  }

  if (profile.setupStatus === "needs_info") {
    return <StateNeedsInfo adminNotes={profile.adminNotes} />;
  }

  return <StateEmpty canManage={canManage} />;
}
