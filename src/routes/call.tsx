import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, MoreVertical, ShieldCheck, Phone, PhoneOff,
  Mic, MicOff, Volume2, Volume1, Bluetooth, UserPlus, Grid3x3, Lock,
} from "lucide-react";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaTrustShieldSheet } from "@/components/alpha/AlphaTrustShield";
import { getAlphaConnectFrameClass } from "@/components/alpha/alpha-connect-theme";
import { getConnectViewportBackdrop } from "@/components/alpha/alpha-viewport";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";
import { ConnectCircleButton } from "@/components/alpha/ConnectCircleButton";
import { getConnectChannel } from "@/components/alpha/connect-channels-registry";
import { getCurrentUser } from "@/features/church/current-user";
import avatarMina from "@/assets/avatar-mina.jpg";

const CALL_TRUST_CHANNEL = getConnectChannel("main");
const CALL_TRUST_USER_ID = getCurrentUser().id || "creator";

export const Route = createFileRoute("/call")({
  head: () => ({
    meta: [
      { title: "Alpha Connect — مكالمة صوتية" },
      { name: "description", content: "Alpha Connect personal voice call screen." },
    ],
  }),
  component: CallScreen,
});

type CallState = "dialing" | "connected" | "reconnecting" | "ended";
type AudioOut = "earpiece" | "speaker" | "bluetooth";

function CallScreen() {
  const navigate = useNavigate();
  const [callState, setCallState] = useState<CallState>("dialing");
  const [muted, setMuted] = useState(false);
  const [audioOut, setAudioOut] = useState<AudioOut>("earpiece");
  const [seconds, setSeconds] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const securityBtnRef = useRef<HTMLButtonElement>(null);

  // Simulate dialing → connected
  useEffect(() => {
    if (callState !== "dialing") return;
    const t = setTimeout(() => setCallState("connected"), 1800);
    return () => clearTimeout(t);
  }, [callState]);

  // Timer ticks while connected
  useEffect(() => {
    if (callState !== "connected") return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [callState]);

  const stateLabel: Record<CallState, string> = {
    dialing: "جاري الاتصال…",
    connected: "متصل",
    reconnecting: "إعادة الاتصال…",
    ended: "انتهت المكالمة",
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const handleEnd = () => {
    setCallState("ended");
    setTimeout(() => navigate({ to: "/" }), 900);
  };

  const cycleAudio = () => {
    setAudioOut((a) => (a === "earpiece" ? "speaker" : a === "speaker" ? "bluetooth" : "earpiece"));
  };

  const callTheme = loadAlphaConnectSettings().theme;

  return (
    <AlphaScreenFrame
      mode="fixed"
      showShellBackground={false}
      frameClassName={getAlphaConnectFrameClass(callTheme)}
      viewportBackdrop={getConnectViewportBackdrop(callTheme)}
    >
      <div className="relative flex min-h-full flex-col px-5 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between pt-[max(env(safe-area-inset-top),14px)]">
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="رجوع"
            className="glass w-11 h-11 rounded-2xl flex items-center justify-center text-foreground/90 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-[19px] font-semibold tracking-tight">Alpha Connect</h1>
              <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">مكالمة صوتية</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              ref={securityBtnRef}
              onClick={() => setShowSecurity(true)}
              aria-label="مركز الثقة والأمان"
              aria-haspopup="dialog"
              className="glass w-11 h-11 rounded-2xl flex items-center justify-center text-neon-green active:scale-95 transition-transform"
              style={{ borderColor: "oklch(0.82 0.22 145 / 0.4)" }}
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMenu((s) => !s)}
              aria-label="المزيد"
              className="w-8 h-11 flex items-center justify-center text-foreground/70"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contact area */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative">
            <div className="w-[148px] h-[148px] rounded-full p-[3px] bg-gradient-to-br from-neon-green to-[oklch(0.82_0.22_145/0.25)]">
              <img
                src={avatarMina}
                alt="مينا جورج"
                width={296}
                height={296}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-neon-green border-[3px] border-[#0a1430] shadow-[0_0_10px_var(--neon-green)]" />
          </div>
          <h2 className="text-[26px] font-bold mt-4 leading-tight">مينا جورج</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
            <span className="text-xs text-neon-green">متصل الآن</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">خادم اجتماع الشباب</p>
        </div>

        {/* Call status + timer */}
        <div className="flex flex-col items-center mt-7">
          <p className="text-sm text-muted-foreground tracking-wide">{stateLabel[callState]}</p>
          <p className="text-[42px] font-light tabular-nums tracking-widest mt-1 text-foreground" dir="ltr">
            {mm}:{ss}
          </p>
          {/* Security badge */}
          <button
            onClick={() => setShowSecurity(true)}
            className="glass mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-neon-green/90"
          >
            <Lock className="w-3 h-3" />
            المكالمة آمنة ومشفرة
          </button>
        </div>

        {/* Center call indicator (alpha brand button, decorative + active) */}
        <div className="flex items-center justify-center my-6">
          <div className="relative w-[140px] h-[140px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-[oklch(0.82_0.22_145/0.18)]" />
            <div className="absolute inset-4 rounded-full border border-dotted border-[oklch(0.82_0.22_145/0.22)]" />
            <button
              aria-label="حالة المكالمة"
              className="relative w-[104px] h-[104px] rounded-full neon-ring flex items-center justify-center"
              style={{ background: "var(--gradient-mic)" }}
            >
              <Phone className="w-9 h-9 text-neon-green drop-shadow-[0_0_10px_var(--neon-green)]" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Controls grid */}
        <div className="glass-strong rounded-3xl p-4 mt-auto">
          <div className="grid grid-cols-5 gap-2">
            <ControlBtn
              active={muted}
              onClick={() => setMuted((m) => !m)}
              icon={muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              label={muted ? "صامت" : "الميكروفون"}
            />
            <ControlBtn
              active={audioOut === "speaker"}
              onClick={() => setAudioOut((a) => (a === "speaker" ? "earpiece" : "speaker"))}
              icon={audioOut === "speaker" ? <Volume2 className="w-5 h-5" /> : <Volume1 className="w-5 h-5" />}
              label="سماعة"
            />
            <ControlBtn
              active={audioOut === "bluetooth"}
              onClick={cycleAudio}
              icon={<Bluetooth className="w-5 h-5" />}
              label="بلوتوث"
            />
            <ControlBtn
              onClick={() => {}}
              icon={<UserPlus className="w-5 h-5" />}
              label="إضافة"
            />
            <ControlBtn
              onClick={() => {}}
              icon={<Grid3x3 className="w-5 h-5" />}
              label="لوحة"
            />
          </div>

          {/* End call */}
          <div className="flex justify-center mt-5">
            <ConnectCircleButton
              tone="red"
              icon={PhoneOff}
              label="إغلاق"
              onClick={handleEnd}
              disabled={callState === "ended"}
              aria-label="إنهاء المكالمة"
            />
          </div>
        </div>

        {/* More menu sheet */}
        {showMenu && (
          <Sheet onClose={() => setShowMenu(false)} title="خيارات المكالمة">
            <SheetItem label="كتم الإشعارات" />
            <SheetItem label="تسجيل المكالمة" />
            <SheetItem label="جودة الاتصال" />
            <SheetItem label="الإبلاغ عن مشكلة" danger />
          </Sheet>
        )}

        {/* Security sheet */}
        <AlphaTrustShieldSheet
          open={showSecurity}
          onClose={() => setShowSecurity(false)}
          anchorRef={securityBtnRef}
          context={{ type: "call" }}
          channelId="main"
          channel={CALL_TRUST_CHANNEL}
          currentUserId={CALL_TRUST_USER_ID}
        />
      </div>
    </AlphaScreenFrame>
  );
}

function ControlBtn({
  icon, label, onClick, active,
}: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
          active
            ? "bg-neon-green text-[#0a1430] border-neon-green shadow-[0_0_18px_oklch(0.82_0.22_145/0.5)]"
            : "glass text-foreground/90 border-white/10"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </button>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[430px] glass-strong rounded-t-3xl pb-6 pt-3 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
        <p className="text-center text-sm font-semibold mb-2">{title}</p>
        <div className="px-2">{children}</div>
      </div>
    </div>
  );
}

function SheetItem({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <button
      className={`w-full text-right px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors ${
        danger ? "text-destructive" : "text-foreground/90"
      }`}
    >
      {label}
    </button>
  );
}
