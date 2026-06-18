import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, ShieldPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlphaIdentityRow } from "./AlphaIdentityRow";
import {
  buildTrustShieldContent,
  getTrustShieldIdentitySnapshot,
  resolveTrustShieldChannel,
  type TrustShieldContent,
  type TrustShieldSection,
} from "./alpha-trust-shield-content";
import type { ConnectChannel } from "./connect-channels-registry";
import type { AlphaTrustShieldContext } from "@/features/alpha-connect/alpha-trust-shield-context";
import { loadAlphaConnectSettings } from "./AlphaConnectSettings";
import { usePresenceStoreVersion } from "@/features/alpha-connect/useAlphaPresence";
import { useAlphaConnectStatus } from "@/features/alpha-connect/useAlphaConnectStatus";
import {
  CONNECT_THEME_CHANGED_EVENT,
  getConnectTheme,
  normalizeConnectTheme,
  type AlphaConnectThemeId,
} from "./alpha-connect-theme";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/8 py-1.5 text-[11px] last:border-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function TrustSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center justify-end gap-1.5">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-neon-green" />
      <p className="text-[12px] font-semibold text-neon-green">{title}</p>
    </div>
  );
}

function SectionCard({ section }: { section: TrustShieldSection }) {
  return (
    <section>
      <TrustSectionHeader title={section.title} />
      <div className="glass rounded-2xl px-3 py-2.5">
        {section.rows?.length ? (
          <div>
            {section.rows.map((row) => (
              <InfoRow key={`${section.title}-${row.label}`} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}
        {section.bullets?.length ? (
          <ul className="space-y-1.5 text-right text-[10.5px] leading-relaxed text-muted-foreground">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start justify-end gap-1.5">
                <span>{bullet}</span>
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon-green" />
              </li>
            ))}
          </ul>
        ) : null}
        {section.paragraph ? (
          <p className="text-right text-[10.5px] leading-relaxed text-muted-foreground">{section.paragraph}</p>
        ) : null}
      </div>
    </section>
  );
}

function IdentityHeader({
  channelId,
  channel,
  userId,
}: {
  channelId: string;
  channel: ConnectChannel;
  userId: string;
}) {
  const identity = getTrustShieldIdentitySnapshot(channelId, channel, userId);

  return (
    <AlphaIdentityRow
      className="w-full"
      name={identity.name}
      role={identity.shieldRole}
      avatar={identity.avatar}
      avatarSize="lg"
      presenceUserId={userId}
      nameClassName="text-[13px] font-semibold leading-tight"
      meta={<p className="text-[10px] text-muted-foreground">{identity.churchRank}</p>}
    />
  );
}

function TrustShieldSheetBody({
  content,
  channelId,
  channel,
}: {
  content: TrustShieldContent;
  channelId: string;
  channel: ConnectChannel;
}) {
  const showIdentity = !!content.identityUserId;
  const identityUserId = content.identityUserId;

  return (
    <div className="space-y-4">
      {showIdentity && identityUserId ? (
        <div className="glass flex w-full items-center gap-3 rounded-2xl px-3 py-2.5">
          <IdentityHeader channelId={channelId} channel={channel} userId={identityUserId} />
        </div>
      ) : null}
      {content.sections.map((section) => (
        <SectionCard key={section.title} section={section} />
      ))}
    </div>
  );
}

function useConnectThemeForTrustCenter(): AlphaConnectThemeId {
  const [theme, setTheme] = useState<AlphaConnectThemeId>(() => getConnectTheme());

  useEffect(() => {
    const onThemeChanged = (event: Event) => {
      const next = (event as CustomEvent<{ theme: AlphaConnectThemeId }>).detail?.theme;
      if (next) setTheme(normalizeConnectTheme(next));
    };
    window.addEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
    return () => window.removeEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
  }, []);

  return theme;
}

/** Bottom sheet — glass-strong DNA, slides up from bottom on all Alpha screens. */
function ConnectTrustCenterSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  zIndex = 68,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  zIndex?: number;
}) {
  const connectTheme = useConnectThemeForTrustCenter();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "alpha-connect-theme connect-trust-center-sheet-root fixed inset-0 flex items-end justify-center",
        connectTheme === "classic" && "alpha-connect-theme--classic",
      )}
      style={{ zIndex }}
      data-alpha-connect-drawer
    >
      <button
        type="button"
        aria-label="إغلاق مركز الثقة والأمان"
        className="connect-trust-center-sheet-backdrop absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="connect-trust-center-sheet relative z-[1] flex w-full max-w-[var(--alpha-content-narrow-width)] max-h-[min(82dvh,680px)] flex-col overflow-hidden glass-strong rounded-t-3xl shadow-[0_-16px_52px_rgba(0,0,0,0.48)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 pb-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-[20px] font-bold leading-tight text-foreground">{title}</h2>
            {subtitle ? <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neon-green"
            aria-hidden
          >
            <ShieldCheck className="h-4 w-4 drop-shadow-[0_0_8px_var(--neon-green)]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AlphaTrustShieldSheet({
  open,
  context,
  channelId,
  channel,
  currentUserId,
  onClose,
  anchorRef: _anchorRef,
}: {
  open: boolean;
  context: AlphaTrustShieldContext;
  channelId: string;
  channel: ConnectChannel;
  currentUserId: string;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  usePresenceStoreVersion();
  const status = useAlphaConnectStatus();

  const resolvedChannel = resolveTrustShieldChannel(context, channelId);
  const settings = loadAlphaConnectSettings();
  const content = buildTrustShieldContent(context, {
    channelId,
    channel: resolvedChannel,
    currentUserId,
    settings,
    status,
  });

  return (
    <ConnectTrustCenterSheet
      open={open}
      onClose={onClose}
      title={content.title}
      subtitle={content.subtitle}
    >
      <TrustShieldSheetBody content={content} channelId={channelId} channel={resolvedChannel} />
    </ConnectTrustCenterSheet>
  );
}

export const AlphaTrustShieldButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    className?: string;
    children?: ReactNode;
  }
>(function AlphaTrustShieldButton({ onClick, className, children }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="فتح Alpha Trust Shield"
      aria-haspopup="dialog"
      className={
        className ??
        "connect-trust-shield-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-white/6 text-neon-green backdrop-blur-sm transition-all active:scale-95"
      }
    >
      {children ?? <ShieldPlus className="h-5 w-5" />}
    </button>
  );
});

/** Controlled wrapper for Alpha Connect and other screens. */
export function AlphaTrustShield({
  context,
  channelId,
  channel,
  currentUserId,
  onBeforeOpen,
}: {
  context: AlphaTrustShieldContext;
  channelId: string;
  channel: ConnectChannel;
  currentUserId: string;
  onBeforeOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <AlphaTrustShieldButton
        ref={anchorRef}
        onClick={() => {
          onBeforeOpen?.();
          setOpen(true);
        }}
      />
      <AlphaTrustShieldSheet
        open={open}
        context={context}
        channelId={channelId}
        channel={channel}
        currentUserId={currentUserId}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** @deprecated Use AlphaTrustShieldSheet */
export function ConnectShieldCenterSheet(props: {
  open: boolean;
  channelId: string;
  channel: ConnectChannel;
  currentUserId: string;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <AlphaTrustShieldSheet
      open={props.open}
      context={{ type: "channel", channelId: props.channelId }}
      channelId={props.channelId}
      channel={props.channel}
      currentUserId={props.currentUserId}
      anchorRef={props.anchorRef}
      onClose={props.onClose}
    />
  );
}
