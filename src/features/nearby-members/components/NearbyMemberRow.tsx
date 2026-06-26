import { useState } from "react";
import { Bluetooth, Loader2, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import { AlphaIdentityRow } from "@/components/alpha/AlphaIdentityRow";
import {
  formatNearbyDistance,
  respondNearbyConnectionRequest,
  sendNearbyConnectionRequest,
  type NearbyMember,
} from "@/features/nearby-members";

type NearbyMemberRowProps = {
  member: NearbyMember;
  onChanged: () => void;
  onMessage?: (member: NearbyMember) => void;
};

export function NearbyMemberRow({ member, onChanged, onMessage }: NearbyMemberRowProps) {
  const [busy, setBusy] = useState(false);

  const onSendRequest = async () => {
    setBusy(true);
    try {
      await sendNearbyConnectionRequest(member.userId);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const onRespond = async (accept: boolean) => {
    if (!member.connectionRequestId) return;
    setBusy(true);
    try {
      await respondNearbyConnectionRequest(member.connectionRequestId, accept);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const action = (() => {
    if (member.connectionStatus === "connected") {
      return (
        <button
          type="button"
          onClick={() => onMessage?.(member)}
          className="rounded-full bg-neon-green/15 px-3 h-8 text-[10px] font-bold text-neon-green border border-neon-green/30"
        >
          مراسلة
        </button>
      );
    }
    if (member.connectionStatus === "pending_sent") {
      return <span className="text-[10px] font-bold text-[#b8893a]">طلب مرسل</span>;
    }
    if (member.connectionStatus === "pending_received") {
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRespond(true)}
            className="rounded-full bg-neon-green/15 px-2.5 h-8 text-[10px] font-bold text-neon-green"
          >
            قبول
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRespond(false)}
            className="rounded-full bg-white/10 px-2.5 h-8 text-[10px] font-bold text-muted-foreground"
          >
            رفض
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void onSendRequest()}
        className="rounded-full bg-[#6a4ab5]/20 px-3 h-8 text-[10px] font-bold text-[#c4b5fd] border border-[#6a4ab5]/35 active:scale-95 transition-transform inline-flex items-center gap-1"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        إرسال طلب اتصال
      </button>
    );
  })();

  return (
    <div className="glass-strong rounded-2xl px-3 py-2.5">
      <AlphaIdentityRow
        name={member.displayName}
        role={member.role}
        avatar={member.avatarUrl}
        avatarSize="sm"
        avatarRing="glass"
        presenceUserId={member.userId}
        meta={
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground truncate">{member.churchName}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#b8893a]">
              <MapPin className="h-3 w-3" />
              {formatNearbyDistance(member.distanceM)}
              <span className="text-muted-foreground font-medium">· {member.alphaIdShort}</span>
            </div>
          </div>
        }
        trailing={action}
      />
    </div>
  );
}

type NearbyOptInBannerProps = {
  onEnable: () => void;
  loading?: boolean;
};

export function NearbyOptInBanner({ onEnable, loading }: NearbyOptInBannerProps) {
  return (
    <div className="glass-strong rounded-2xl p-4 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-neon-green" />
      <h3 className="mt-3 text-[14px] font-extrabold">اكتشاف آمن للأعضاء القريبين</h3>
      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
        لا يتم مشاركة رقم الهاتف. يعتمد على Alpha ID داخل كنيستك فقط. يمكنك إيقاف الظهور في أي وقت.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={onEnable}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-neon-green/20 px-5 h-10 text-[12px] font-extrabold text-neon-green border border-neon-green/30"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        تفعيل الظهور القريب
      </button>
    </div>
  );
}

export function NearbySourceStrip({ usingGps }: { usingGps: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 text-[10px] font-bold">
      <span className={`inline-flex items-center gap-1 ${usingGps ? "text-neon-green" : "text-muted-foreground"}`}>
        <MapPin className="h-3 w-3" /> GPS {usingGps ? "نشط" : "—"}
      </span>
      <span className="inline-flex items-center gap-1 text-muted-foreground/70">
        <Bluetooth className="h-3 w-3" /> Bluetooth · قريباً
      </span>
    </div>
  );
}

export function NearbyRefreshButton({ onRefresh, loading }: { onRefresh: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-label="تحديث"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 border border-white/10 text-muted-foreground active:scale-95"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}
