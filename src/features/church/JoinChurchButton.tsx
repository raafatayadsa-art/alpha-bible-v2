import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, LoaderCircle, UserPlus } from "lucide-react";
import { useAlphaAuth } from "@/features/auth";
import {
  getActiveMembershipChurchId,
  joinChurch,
  savePendingChurchJoin,
} from "./church-membership-api";

type JoinChurchButtonProps = {
  churchId: string;
  churchName?: string;
  className?: string;
  compact?: boolean;
  onJoined?: (churchId: string) => void;
};

export function JoinChurchButton({
  churchId,
  churchName,
  className = "",
  compact = false,
  onJoined,
}: JoinChurchButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAlphaAuth();
  const [memberChurchId, setMemberChurchId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [joining, setJoining] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshMembership = useCallback(async () => {
    setChecking(true);
    const activeId = await getActiveMembershipChurchId();
    setMemberChurchId(activeId);
    setChecking(false);
  }, []);

  useEffect(() => {
    void refreshMembership();
    const onHub = () => void refreshMembership();
    window.addEventListener("ab:church-hub", onHub);
    window.addEventListener("storage", onHub);
    return () => {
      window.removeEventListener("ab:church-hub", onHub);
      window.removeEventListener("storage", onHub);
    };
  }, [refreshMembership]);

  const isMember = memberChurchId === churchId;
  const isOtherMember = memberChurchId != null && memberChurchId !== churchId;

  const handleJoin = async () => {
    setFeedback(null);

    if (!isAuthenticated) {
      savePendingChurchJoin(churchId);
      navigate({ to: "/login" });
      return;
    }

    setJoining(true);
    const result = await joinChurch(churchId);
    setJoining(false);

    if (result.ok) {
      setMemberChurchId(result.churchId);
      onJoined?.(result.churchId);
      navigate({ to: "/church", replace: true });
      return;
    }

    if (result.reason === "not_authenticated") {
      savePendingChurchJoin(churchId);
      navigate({ to: "/login" });
      return;
    }

    setFeedback(result.message);
  };

  if (checking) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-white/70 text-[#6b658a] ${compact ? "h-10 text-[12px]" : "h-11 text-[13px]"} font-extrabold ${className}`}
      >
        <LoaderCircle className="h-4 w-4 animate-spin" />
        جاري التحقق…
      </button>
    );
  }

  if (isMember) {
    return (
      <button
        type="button"
        onClick={() => navigate({ to: "/church" })}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] text-white shadow-[0_10px_20px_-10px_rgba(31,138,90,0.55)] active:scale-[0.98] transition-transform ${compact ? "h-10 text-[12px]" : "h-11 text-[13px]"} font-extrabold ${className}`}
      >
        <Check className="h-4 w-4" strokeWidth={2.4} />
        افتح كنيستك
      </button>
    );
  }

  if (isOtherMember) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-[11px] font-bold text-[#6b658a]">أنت عضو في كنيسة أخرى</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={joining}
        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] text-white shadow-[0_10px_20px_-10px_rgba(31,138,90,0.55)] active:scale-[0.98] transition-transform disabled:opacity-70 ${compact ? "h-10 text-[12px]" : "h-11 text-[13px]"} font-extrabold`}
      >
        {joining ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" strokeWidth={2.4} />
        )}
        {joining ? "جاري الانضمام…" : churchName ? `انضم إلى ${churchName}` : "انضم للكنيسة"}
      </button>
      {feedback ? (
        <p className="mt-2 text-center text-[11px] font-bold leading-relaxed text-[#b84a4a]">{feedback}</p>
      ) : null}
    </div>
  );
}
