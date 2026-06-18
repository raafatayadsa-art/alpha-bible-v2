import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  Lock,
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  ShieldCheck,
  X,
} from "lucide-react";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaTrustShieldSheet } from "@/components/alpha/AlphaTrustShield";
import { getAlphaConnectFrameClass } from "@/components/alpha/alpha-connect-theme";
import { getConnectViewportBackdrop } from "@/components/alpha/alpha-viewport";
import { loadAlphaConnectSettings } from "@/components/alpha/AlphaConnectSettings";
import { ConnectCircleButton } from "@/components/alpha/ConnectCircleButton";
import { ConnectAudioOutputControl } from "@/components/alpha/ConnectAudioOutputControl";
import { useConnectAudioOutput } from "@/components/alpha/connect-audio-output";
import { getConnectChannel } from "@/components/alpha/connect-channels-registry";
import { getCurrentUser } from "@/features/church/current-user";
import avatarMina from "@/assets/avatar-mina.jpg";

const CALL_TRUST_CHANNEL = getConnectChannel("main");
const CALL_TRUST_USER_ID = getCurrentUser().id || "creator";

export const Route = createFileRoute("/personal-call")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    contactId: typeof search.contactId === "string" ? search.contactId : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Alpha Connect — مكالمة فردية" },
      { name: "description", content: "Alpha Connect personal voice call screen." },
    ],
  }),
  component: PersonalCallScreen,
});

type CallState = "dialing" | "connected" | "ended";

function PersonalCallScreen() {
  const navigate = useNavigate();
  const { name: contactName, from: returnTo } = Route.useSearch();
  const displayName = contactName?.trim() || "مينا جورج";
  const [callState, setCallState] = useState<CallState>("dialing");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const securityBtnRef = useRef<HTMLButtonElement>(null);
  const audio = useConnectAudioOutput({ enabled: true });

  useEffect(() => {
    if (callState !== "dialing") return;
    const timeout = window.setTimeout(() => setCallState("connected"), 1500);
    return () => window.clearTimeout(timeout);
  }, [callState]);

  useEffect(() => {
    if (callState !== "connected") return;
    const interval = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [callState]);

  const stateLabel: Record<CallState, string> = {
    dialing: "جاري الاتصال…",
    connected: "متصل",
    ended: "انتهت المكالمة",
  };

  const callTime = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const exitCall = () => {
    if (returnTo) {
      void navigate({ to: returnTo as "/" });
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    void navigate({ to: "/" });
  };

  const goBack = exitCall;

  const endCall = () => {
    setCallState("ended");
    window.setTimeout(() => exitCall(), 900);
  };

  const callTheme = loadAlphaConnectSettings().theme;

  return (
    <AlphaScreenFrame
      mode="fixed"
      showShellBackground={false}
      frameClassName={getAlphaConnectFrameClass(callTheme)}
      viewportBackdrop={getConnectViewportBackdrop(callTheme)}
    >
      <div className="relative flex min-h-full flex-col px-5 pb-8">
        <CallHeader
          ref={securityBtnRef}
          onBack={goBack}
          onSecurity={() => setShowSecurity(true)}
          onMore={() => setShowMenu(true)}
        />

        <main className="flex-1 flex flex-col items-center text-center pt-6">
          <section className="flex flex-col items-center">
            <div className="relative w-[190px] h-[190px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-[oklch(0.82_0.22_145/0.18)]" />
              <div className="absolute inset-5 rounded-full border border-dotted border-[oklch(0.82_0.22_145/0.24)]" />
              <div className="absolute inset-9 rounded-full bg-neon-green/10 blur-2xl" />
              <div className="relative w-[154px] h-[154px] rounded-full p-[3px] bg-gradient-to-br from-neon-green to-[oklch(0.72_0.18_235/0.32)] shadow-[0_0_42px_oklch(0.82_0.22_145/0.20)]">
                <img src={avatarMina} alt="مينا جورج" width={308} height={308} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="absolute bottom-8 left-12 w-5 h-5 rounded-full bg-neon-green border-[3px] border-[#0a1430] shadow-[0_0_12px_var(--neon-green)]" />
            </div>

            <h1 className="text-[28px] font-bold leading-tight mt-4">{displayName}</h1>
            <p className={`text-sm mt-2 ${callState === "ended" ? "text-destructive" : callState === "connected" ? "text-neon-green" : "text-muted-foreground"}`}>
              {stateLabel[callState]}
            </p>
            <p className="text-[44px] font-light tabular-nums mt-2 tracking-widest text-foreground" dir="ltr">
              {callTime}
            </p>

            <button
              onClick={() => setShowSecurity(true)}
              className="glass mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-neon-green/90 active:scale-95 transition-transform"
            >
              <Lock className="w-3 h-3" />
              مكالمة فردية آمنة
            </button>
          </section>

          <section className="w-full mt-auto">
            <div className="glass-strong rounded-3xl p-4">
              <div className="grid grid-cols-3 gap-3">
                <ControlButton
                  active={muted}
                  onClick={() => setMuted((value) => !value)}
                  icon={muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  label={muted ? "مكتوم" : "كتم"}
                />
                <ConnectAudioOutputControl
                  selection={audio.selection}
                  devices={audio.devices}
                  pickerOpen={audio.pickerOpen}
                  onOpenPicker={() => void audio.openPicker()}
                  onClosePicker={() => audio.setPickerOpen(false)}
                  onSelectDevice={(id) => void audio.selectDevice(id)}
                  variant="call-grid"
                />
                <ControlButton
                  active={showMenu}
                  onClick={() => setShowMenu(true)}
                  icon={<MoreVertical className="w-5 h-5" />}
                  label="المزيد"
                />
              </div>

              <div className="flex justify-center mt-6">
                <ConnectCircleButton
                  tone="red"
                  icon={PhoneOff}
                  label="إغلاق"
                  onClick={endCall}
                  disabled={callState === "ended"}
                  aria-label="إنهاء المكالمة"
                />
              </div>
            </div>
          </section>
        </main>

        {showMenu && (
          <Sheet onClose={() => setShowMenu(false)} title="المزيد">
            <SheetItem label={muted ? "إلغاء كتم الميكروفون" : "كتم الميكروفون"} onClick={() => setMuted((value) => !value)} />
            <SheetItem label="تفاصيل أمان المكالمة" onClick={() => setShowSecurity(true)} />
            <SheetItem label="اختيار مخرج الصوت" onClick={() => void audio.openPicker()} />
            <SheetItem label="إنهاء المكالمة" onClick={endCall} danger />
          </Sheet>
        )}

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

const CallHeader = forwardRef<HTMLButtonElement, { onBack: () => void; onSecurity: () => void; onMore: () => void }>(
  function CallHeader({ onBack, onSecurity, onMore }, securityRef) {
  return (
    <header className="mb-2 flex items-center justify-between pt-[max(env(safe-area-inset-top),14px)]">
      <button
        onClick={onBack}
        aria-label="رجوع"
        className="glass w-11 h-11 rounded-2xl flex items-center justify-center text-foreground/90 active:scale-95 transition-transform"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-[19px] font-semibold tracking-tight">Alpha Connect</h2>
          <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">مكالمة فردية</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          ref={securityRef}
          onClick={onSecurity}
          aria-label="مركز الثقة والأمان"
          aria-haspopup="dialog"
          className="glass w-11 h-11 rounded-2xl flex items-center justify-center text-neon-green active:scale-95 transition-transform"
          style={{ borderColor: "oklch(0.82 0.22 145 / 0.4)" }}
        >
          <ShieldCheck className="w-5 h-5" />
        </button>
        <button onClick={onMore} aria-label="المزيد" className="w-8 h-11 flex items-center justify-center text-foreground/70 active:scale-95 transition-transform">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
});

function ControlButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
      <div
        className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center border transition-colors ${
          active
            ? "bg-neon-green text-[#0a1430] border-neon-green shadow-[0_0_18px_oklch(0.82_0.22_145/0.5)]"
            : "glass text-foreground/90 border-white/10"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </button>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[var(--alpha-content-narrow-width)] glass-strong rounded-t-3xl pb-6 pt-3 animate-in slide-in-from-bottom duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
        <div className="flex items-center justify-between px-4 mb-2">
          <button onClick={onClose} aria-label="إغلاق" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-foreground/80">
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">{title}</p>
          <span className="w-9 h-9" />
        </div>
        <div className="px-2">{children}</div>
      </div>
    </div>
  );
}

function SheetItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-white/5 active:scale-[0.99] transition ${
        danger ? "text-destructive" : "text-foreground/90"
      }`}
    >
      <span>{label}</span>
      <ChevronLeft className="w-4 h-4 opacity-60" />
    </button>
  );
}