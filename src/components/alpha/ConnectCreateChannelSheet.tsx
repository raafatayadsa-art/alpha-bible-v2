import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { connectEffectiveAlphaRole } from "./connect-alpha-access";
import {
  countConnectChannelTopicWords,
  getConnectChannelIconOptionsForRole,
  normalizeConnectChannelTopic,
  type ConnectChannelIcon,
} from "./connect-channels-registry";
import { ConnectChannelIconView } from "./ConnectChannelIconView";

export function ConnectCreateChannelSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; topic: string; icon: ConnectChannelIcon }) => void;
}) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [icon, setIcon] = useState<ConnectChannelIcon>("users");

  const iconOptions = useMemo(() => getConnectChannelIconOptionsForRole(connectEffectiveAlphaRole()), [open]);
  const topicWords = countConnectChannelTopicWords(topic);
  const topicTooLong = topicWords > 10;

  if (!open) return null;

  const trimmed = name.trim();
  const canCreate = trimmed.length >= 2 && !topicTooLong;

  const reset = () => {
    setName("");
    setTopic("");
    setIcon("users");
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: trimmed, topic: normalizeConnectChannelTopic(topic), icon });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="connect-create-channel-sheet fixed inset-0 z-[70] flex items-end justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[var(--alpha-content-narrow-width)] glass-strong rounded-t-3xl pb-[max(16px,env(safe-area-inset-bottom))] pt-3 animate-in slide-in-from-bottom duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="glass flex h-10 w-10 items-center justify-center rounded-xl text-foreground/80 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[16px] font-semibold">قناة جديدة</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">اسم + موضوع + أيقونة</p>
          </div>
          <span className="h-10 w-10" />
        </div>

        <div className="max-h-[min(62dvh,480px)] space-y-3.5 overflow-y-auto overscroll-y-contain px-4 pb-2">
          <label className="block text-right">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">اسم القناة</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: فريق التسبيح"
              autoFocus
              className="glass w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-right text-[16px] outline-none placeholder:text-muted-foreground/70 focus:border-neon-green/35"
            />
          </label>

          <label className="block text-right">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">موضوع القناة (اختياري)</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="وصف مختصر — 10 كلمات كحد أقصى"
              className={`glass w-full rounded-2xl border bg-white/[0.03] px-4 py-3.5 text-right text-[15px] outline-none placeholder:text-muted-foreground/70 focus:border-neon-green/35 ${
                topicTooLong ? "border-destructive/50" : "border-white/10"
              }`}
            />
            <p className={`mt-1 text-[12px] ${topicTooLong ? "text-destructive" : "text-muted-foreground"}`}>
              {topicWords}/10 كلمات
            </p>
          </label>

          <div>
            <p className="mb-2.5 text-right text-[13px] font-medium text-muted-foreground">أيقونة القناة</p>
            <div className="grid grid-cols-4 gap-2.5">
              {iconOptions.map((option) => {
                const selected = icon === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setIcon(option.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 transition-colors active:scale-95 ${
                      selected ? "glass border border-neon-green/35 bg-neon-green/5" : "bg-white/[0.03]"
                    }`}
                  >
                    <div className="connect-create-channel-icon-ring flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
                      <ConnectChannelIconView icon={option.id} size="lg" />
                    </div>
                    <span className={`text-[11px] font-medium ${selected ? "text-neon-green" : "text-muted-foreground"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={!canCreate}
            onClick={handleCreate}
            className="connect-create-channel-submit glass w-full rounded-2xl border py-3.5 text-[15px] font-semibold transition-opacity disabled:opacity-40 active:scale-[0.99]"
          >
            إنشاء والدخول
          </button>
        </div>
      </div>
    </div>
  );
}
