import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, LoaderCircle, UserPlus } from "lucide-react";
import { useAlphaAuth } from "@/features/auth";
import {
  isMemberOfChurch,
  joinChurch,
  savePendingChurchJoin,
} from "./church-membership-api";

type JoinChurchButtonProps = {
  churchId: string;
  churchName?: string;
  className?: string;
  compact?: boolean;
  mini?: boolean;
  onJoined?: (churchId: string) => void;
};

export function JoinChurchButton({
  churchId,
  churchName,
  className = "",
  compact = false,
  mini = false,
  onJoined,
}: JoinChurchButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAlphaAuth();
  const [isMember, setIsMember] = useState(false);
  const [checking, setChecking] = useState(true);
  const [joining, setJoining] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshMembership = useCallback(async () => {
    setChecking(true);
    const member = await isMemberOfChurch(churchId);
    setIsMember(member);
    setChecking(false);
  }, [churchId]);

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
      setIsMember(true);
      onJoined?.(result.churchId);
      if (!mini && !compact) {
        navigate({ to: "/church", replace: true });
      }
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
    if (mini) {
      return (
        <button
          type="button"
          disabled
          className={`grid h-8 w-8 place-items-center rounded-full bg-white/70 text-[#6b658a] ${className}`}
          aria-label="جاري التحقق"
        >
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-white/70 text-[#6b658a] ${compact ? "h-8 text-[11px]" : "h-11 text-[13px]"} font-extrabold ${className}`}
      >
        <LoaderCircle className="h-4 w-4 animate-spin" />
        {!mini ? "جاري التحقق…" : null}
      </button>
    );
  }

  if (isMember) {
    if (mini) {
      return (
        <button
          type="button"
          onClick={() => navigate({ to: "/church" })}
          className={`grid h-8 w-8 place-items-center rounded-full bg-[#1f8a5a] text-white active:scale-95 ${className}`}
          aria-label="عضو — افتح الكنيسة"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => navigate({ to: "/church" })}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] text-white shadow-[0_10px_20px_-10px_rgba(31,138,90,0.55)] active:scale-[0.98] transition-transform ${compact ? "h-8 px-3 text-[11px]" : "h-11 text-[13px]"} font-extrabold ${className}`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
        {compact ? "عضو" : "افتح كنيستك"}
      </button>
    );
  }

  if (mini) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => void handleJoin()}
          disabled={joining}
          aria-label="انضم للكنيسة"
          className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] text-white shadow-[0_6px_14px_-8px_rgba(31,138,90,0.55)] active:scale-95 disabled:opacity-70"
        >
          {joining ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
        </button>
        {feedback ? (
          <p className="mt-1 max-w-[88px] text-center text-[9px] font-bold leading-tight text-[#b84a4a]">{feedback}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={joining}
        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#1f8a5a] to-[#3f9d6e] text-white shadow-[0_10px_20px_-10px_rgba(31,138,90,0.55)] active:scale-[0.98] transition-transform disabled:opacity-70 ${compact ? "h-8 px-3 text-[11px]" : "h-11 text-[13px]"} font-extrabold`}
      >
        {joining ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" strokeWidth={2.4} />
        )}
        {joining ? "…" : compact ? "انضم" : churchName ? `انضم إلى ${churchName}` : "انضم للكنيسة"}
      </button>
      {feedback ? (
        <p className="mt-2 text-center text-[11px] font-bold leading-relaxed text-[#b84a4a]">{feedback}</p>
      ) : null}
    </div>
  );
}
