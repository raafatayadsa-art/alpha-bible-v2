import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { Crown, HandHeart, Lock, MessageCircle, Phone, Send, UserCog, X } from "lucide-react";
import type { ContactRoleType } from "@/data/church-contacts";
import {
  buildAlphaConnectChatSearch,
  buildAlphaConnectSearch,
} from "@/features/alpha-connect/alpha-connect-nav";
import {
  fetchChurchContactsByChurchId,
  type ChurchDashboardContact,
} from "@/features/church/church-dashboard-api";
import { usePlatformModules } from "@/lib/platform-modules";
import { CHURCH_DIR } from "../tokens";

type ChurchPhones = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
};

const ROLE_TONE: Record<ContactRoleType, { bg: string; icon: typeof Crown }> = {
  priest: { bg: "linear-gradient(160deg, #7a4a26, #3a2a18)", icon: Crown },
  servant: { bg: "linear-gradient(160deg, #6a4ab5, #4a2e8e)", icon: HandHeart },
  admin: { bg: "linear-gradient(160deg, #1f8a5a, #136a44)", icon: UserCog },
};

function groupedContacts(contacts: ChurchDashboardContact[]) {
  const priests = contacts.filter((c) => c.roleType === "priest");
  const servants = contacts.filter((c) => c.roleType === "servant" || c.roleType === "admin");
  return { priests, servants };
}

function ConnectPopupShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10070] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        dir="rtl"
        className="w-full max-w-md overflow-hidden rounded-[26px] border shadow-2xl"
        style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.beige }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3" style={{ borderColor: CHURCH_DIR.border }}>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-8 w-8 place-items-center rounded-full bg-white/70">
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h3 className="text-[15px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{title}</h3>
            <p className="mt-0.5 text-[11px] font-bold" style={{ color: CHURCH_DIR.sub }}>{subtitle}</p>
          </div>
        </div>
        <div className="max-h-[min(70dvh,520px)] overflow-y-auto p-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function ConnectGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 px-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ color: CHURCH_DIR.purple }}>
        {label}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CallContactRow({ contact, onClose }: { contact: ChurchDashboardContact; onClose: () => void }) {
  const navigate = useNavigate();
  const tone = ROLE_TONE[contact.roleType];
  const RoleIcon = tone.icon;
  const phone = contact.phone?.trim() || contact.whatsapp?.trim();

  return (
    <button
      type="button"
      disabled={!phone}
      onClick={() => {
        onClose();
        if (!phone) return;
        void navigate({
          to: "/alpha-connect",
          search: buildAlphaConnectSearch({
            tab: "calls",
            chat: contact.id,
            name: contact.name,
            role: contact.roleType,
            phone,
          }),
        });
      }}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white/80 p-2.5 text-right active:scale-[0.98] disabled:opacity-50"
      style={{ borderColor: CHURCH_DIR.border }}
    >
      <Phone className="h-4 w-4 shrink-0 text-[#5b8fd1]" strokeWidth={2.4} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{contact.name}</p>
        <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>{phone || "لا يوجد رقم"}</p>
      </div>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: tone.bg }}>
        <RoleIcon className="h-4 w-4" strokeWidth={2.4} />
      </div>
    </button>
  );
}

function ChurchPhoneRow({ label, value, onClose }: { label: string; value: string; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        void navigate({
          to: "/alpha-connect",
          search: buildAlphaConnectSearch({ tab: "calls", name: label, phone: value }),
        });
      }}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white/80 p-2.5 text-right active:scale-[0.98]"
      style={{ borderColor: CHURCH_DIR.border }}
    >
      <Phone className="h-4 w-4 shrink-0 text-[#5b8fd1]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{label}</p>
        <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>{value}</p>
      </div>
    </button>
  );
}

function MessageContactRow({ contact, onClose }: { contact: ChurchDashboardContact; onClose: () => void }) {
  const allowed = contact.messagingAllowed;
  return (
    <Link
      to="/alpha-connect"
      search={buildAlphaConnectChatSearch({
        contactId: contact.id,
        name: contact.name,
        role: contact.roleType,
        phone: contact.phone || contact.whatsapp,
      })}
      onClick={onClose}
      className={
        "flex w-full items-center gap-3 rounded-2xl border bg-white/80 p-2.5 text-right transition active:scale-[0.98] " +
        (allowed ? "" : "pointer-events-none opacity-60")
      }
      style={{ borderColor: CHURCH_DIR.border }}
    >
      {allowed ? (
        <Send className="h-4 w-4 shrink-0 text-[#c98a3c] -scale-x-100" strokeWidth={2.4} />
      ) : (
        <Lock className="h-4 w-4 shrink-0 text-[#a08862]" strokeWidth={2.2} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{contact.name}</p>
        <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
          {allowed ? "Alpha Connect — رسالة خاصة" : "المحادثة معطّلة بإذن الكاهن"}
        </p>
      </div>
    </Link>
  );
}

export function ChurchDirectoryConnectActions({ church }: { church: ChurchPhones }) {
  const { isModuleEnabled } = usePlatformModules();
  const messagingOn = isModuleEnabled("messaging");
  const [popup, setPopup] = useState<"call" | "message" | null>(null);
  const [contacts, setContacts] = useState<ChurchDashboardContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!popup) return;
    let cancelled = false;
    setLoading(true);
    void fetchChurchContactsByChurchId(church.id).then((rows) => {
      if (!cancelled) {
        setContacts(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, popup]);

  const { priests, servants } = useMemo(() => groupedContacts(contacts), [contacts]);
  const hasChurchPhone = Boolean(church.phone?.trim() || church.whatsapp?.trim());

  return (
    <>
      <button type="button" onClick={() => setPopup("call")} className="action-tile">
        <Phone className="h-4 w-4" />
        <span>اتصال</span>
      </button>
      {messagingOn ? (
        <button type="button" onClick={() => setPopup("message")} className="action-tile">
          <MessageCircle className="h-4 w-4" />
          <span>رسائل</span>
        </button>
      ) : null}

      {popup === "call" ? (
        <ConnectPopupShell title="Alpha Connect — اتصال" subtitle="الكاهن · الكنيسة · الخدام" onClose={() => setPopup(null)}>
          {loading ? <p className="py-6 text-center text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>جاري التحميل…</p> : null}
          {!loading && priests.length > 0 ? (
            <ConnectGroup label="الكاهن">
              {priests.map((c) => (
                <CallContactRow key={c.id} contact={c} onClose={() => setPopup(null)} />
              ))}
            </ConnectGroup>
          ) : null}
          {!loading && servants.length > 0 ? (
            <ConnectGroup label="الخدام">
              {servants.map((c) => (
                <CallContactRow key={c.id} contact={c} onClose={() => setPopup(null)} />
              ))}
            </ConnectGroup>
          ) : null}
          {!loading && hasChurchPhone ? (
            <ConnectGroup label="الكنيسة">
              {church.phone?.trim() ? (
                <ChurchPhoneRow label="هاتف الكنيسة" value={church.phone.trim()} onClose={() => setPopup(null)} />
              ) : null}
              {church.whatsapp?.trim() ? (
                <ChurchPhoneRow label="واتساب الكنيسة" value={church.whatsapp.trim()} onClose={() => setPopup(null)} />
              ) : null}
            </ConnectGroup>
          ) : null}
          {!loading && !priests.length && !servants.length && !hasChurchPhone ? (
            <p className="py-6 text-center text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>لا توجد أرقام متاحة</p>
          ) : null}
        </ConnectPopupShell>
      ) : null}

      {popup === "message" && messagingOn ? (
        <ConnectPopupShell title="Alpha Connect — رسائل" subtitle="الكاهن والخدام المرتبطون بالكنيسة" onClose={() => setPopup(null)}>
          {loading ? <p className="py-6 text-center text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>جاري التحميل…</p> : null}
          {!loading && priests.length > 0 ? (
            <ConnectGroup label="الكاهن">
              {priests.map((c) => (
                <MessageContactRow key={c.id} contact={c} onClose={() => setPopup(null)} />
              ))}
            </ConnectGroup>
          ) : null}
          {!loading && servants.length > 0 ? (
            <ConnectGroup label="الخدام">
              {servants.map((c) => (
                <MessageContactRow key={c.id} contact={c} onClose={() => setPopup(null)} />
              ))}
            </ConnectGroup>
          ) : null}
          {!loading && !priests.length && !servants.length ? (
            <p className="py-6 text-center text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>لا توجد جهات مراسلة</p>
          ) : null}
        </ConnectPopupShell>
      ) : null}
    </>
  );
}
