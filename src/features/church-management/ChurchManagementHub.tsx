import { type ReactNode } from "react";
import { Church, LayoutDashboard } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { CopticCross } from "@/components/coptic";
import { cn } from "@/lib/utils";
import { setupGreenButton } from "./church-setup-styles";
import { useChurchHub } from "./church-hub-store";
import type { ApprovedChurch } from "./types";

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
  to: "/profile/church/setup" | "/church";
  variant?: "primary" | "secondary";
}) {
  const navigate = useNavigate();
  const cls =
    variant === "primary"
      ? setupGreenButton
      : "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#efe2c4] bg-white/75 backdrop-blur-sm text-[14px] font-extrabold text-[#3a2a18] shadow-[0_8px_18px_-14px_rgba(120,80,30,0.35)] active:scale-[0.98] transition-transform";

  return (
    <button
      type="button"
      className={cls}
      onClick={() => navigate({ to })}
    >
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

function StateNone() {
  return (
    <HubCard accent="#c98a3c" className="animate-in fade-in duration-300">
      <div className="text-center">
        <ChurchIllustration />
        <h2 className="mt-4 font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
          لم يتم تسجيل كنيسة بعد
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">
          يمكن للكاهن إرسال طلب تأسيس كنيسة جديدة لإدارة Alpha للمراجعة.
        </p>
      </div>
      <div className="mt-5">
        <HubButton to="/profile/church/setup">طلب تأسيس كنيسة</HubButton>
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
      <div className="mt-5">
        <HubButton to="/profile/church/setup" variant="secondary">
          عرض الطلب
        </HubButton>
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

function StateApproved({ church }: { church?: ApprovedChurch }) {
  return (
    <HubCard accent="#3f9d6e" className="animate-in fade-in duration-300">
      <div className="text-right">
        <CopticCross className="mb-3 text-[#3f9d6e]" size={20} />
        <h2 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
          لوحة إدارة الكنيسة
        </h2>
        {church?.name && (
          <p className="mt-1.5 text-[13px] font-bold text-[#6a543a]">{church.name}</p>
        )}
      </div>
      <div className="mt-5">
        <HubButton to="/church">
          <LayoutDashboard className="h-4 w-4" />
          فتح لوحة الإدارة
        </HubButton>
      </div>
    </HubCard>
  );
}

export function ChurchManagementHub() {
  const { state } = useChurchHub();

  return (
    <div className="space-y-4">
      {state.status === "none" && <StateNone />}
      {state.status === "pending" && <StatePending />}
      {state.status === "needs_info" && (
        <StateNeedsInfo adminNotes={state.request?.adminNotes} />
      )}
      {state.status === "approved" && <StateApproved church={state.church} />}
    </div>
  );
}
