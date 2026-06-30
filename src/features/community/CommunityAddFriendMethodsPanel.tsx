import { lazy, Suspense, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AtSign, Church, LoaderCircle, QrCode, ScanLine, Share2, Smartphone } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { resolvePersonFromCode } from "@/features/profile/profile-people-resolve";
import { useProfileMembershipData } from "@/features/profile/useProfileMembershipData";
import { toast } from "sonner";
import { sendFriendRequestFromUserId } from "./community-friends-api";
import { COMMUNITY_ROUTES } from "./community-routes";
import {
  COMMUNITY_GLASS_BTN,
  COMMUNITY_GLASS_BTN_ACCENT,
  COMMUNITY_GLASS_CARD,
} from "./community-glass-chrome";
import { COMMUNITY_SHIELD_INNER, COMMUNITY_SHIELD_ROW } from "./community-shield-chrome";

const AlphaMembershipQrScanner = lazy(() =>
  import("@/features/profile/AlphaMembershipQrScanner").then((mod) => ({
    default: mod.AlphaMembershipQrScanner,
  })),
);

export const ADD_FRIEND_METHODS = [
  {
    key: "qr" as const,
    label: "QR Code",
    sub: "امسح رمز QR للصديق",
    icon: QrCode,
    accent: "#8a6ec1",
  },
  {
    key: "alpha-id" as const,
    label: "Alpha ID",
    sub: "ابحث عبر Alpha ID",
    icon: AtSign,
    accent: "#c79356",
  },
  {
    key: "church" as const,
    label: "من الكنيسة",
    sub: "ابحث عن إخوة في كنيستك",
    icon: Church,
    accent: "#1f8a5a",
  },
  {
    key: "mobile" as const,
    label: "رقم الموبايل",
    sub: "ابحث عبر رقم الموبايل",
    icon: Smartphone,
    accent: "#5b8fd1",
  },
];

type Props = {
  onAdded?: () => void;
  showShareSection?: boolean;
  compact?: boolean;
};

export function CommunityAddFriendMethodsPanel({
  onAdded,
  showShareSection = true,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const m = useProfileMembershipData();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [alphaIdDraft, setAlphaIdDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const addResolved = async (code: string) => {
    setBusy(true);
    try {
      const person = await resolvePersonFromCode(code);
      if (!person?.linkedUserId) {
        toast.error("لم يُعثر على العضو");
        return;
      }
      const outcome = await sendFriendRequestFromUserId(person.linkedUserId, "طلب صداقة من المجتمع");
      if (outcome === "sent") {
        toast.success(`تم إرسال طلب صداقة إلى ${person.name}`);
        onAdded?.();
        return;
      }
      if (outcome === "invalid") {
        toast.error("معرّف العضو غير صالح");
        return;
      }
      toast.error("تعذّر إرسال الطلب");
    } finally {
      setBusy(false);
    }
  };

  const onMethod = (key: (typeof ADD_FRIEND_METHODS)[number]["key"]) => {
    if (key === "qr") {
      setScannerOpen(true);
      return;
    }
    if (key === "alpha-id") {
      document.getElementById("community-alpha-id-input")?.focus();
      return;
    }
    if (key === "church") {
      void navigate({ to: COMMUNITY_ROUTES.discover });
      return;
    }
    if (key === "mobile") {
      void navigate({ to: "/alpha-connect" });
    }
  };

  const shareProfile = async () => {
    const text = `${m.displayName}\nAlpha ID: ${m.alphaId}\n${m.qrPayload}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ملفي على Alpha", text });
        return;
      }
      await navigator.clipboard?.writeText(text);
      toast.success("تم نسخ المعرف");
    } catch {
      /* cancelled */
    }
  };

  const methodCardClass = compact
    ? `flex flex-col items-center gap-1.5 rounded-2xl px-2.5 py-3.5 text-center active:scale-[0.98] disabled:opacity-50 ${COMMUNITY_SHIELD_ROW} bg-white/80`
    : `flex flex-col items-center gap-2 px-3 py-5 text-center ${COMMUNITY_GLASS_CARD} active:scale-[0.98] disabled:opacity-50`;

  const innerIconClass = compact ? "h-11 w-11 rounded-[14px]" : "h-14 w-14 rounded-[18px]";

  return (
    <>
      {!compact ? (
        <p className="mb-3 px-0.5 text-[13px] font-extrabold text-alpha-heading">اختر طريقة للإضافة</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {ADD_FRIEND_METHODS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              disabled={busy}
              onClick={() => onMethod(item.key)}
              className={methodCardClass}
            >
              <span
                className={`grid place-items-center border border-white/20 backdrop-blur-sm ${innerIconClass}`}
                style={{ background: `${item.accent}18`, color: item.accent }}
              >
                <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={2.1} />
              </span>
              <span className={`font-extrabold ${compact ? "text-[11px] text-[#1F2937]" : "text-[13px] text-[#3a2a18]"}`}>
                {item.label}
              </span>
              <span
                className={`font-semibold leading-snug ${compact ? "text-[9px] text-[#6B7280]" : "text-[10px] text-[#7a6548]"}`}
              >
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`mt-3 ${compact ? `${COMMUNITY_SHIELD_INNER} p-3` : `p-4 ${COMMUNITY_GLASS_CARD}`}`}>
        <p className={`font-extrabold ${compact ? "text-[11px] text-[#1F2937]" : "text-[12px] text-[#3a2a18]"}`}>
          Alpha ID
        </p>
        <p className={`mt-0.5 font-semibold ${compact ? "text-[9px] text-[#6B7280]" : "text-[10px] text-[#7a6548]"}`}>
          ابحث بالمعرف مباشرة
        </p>
        <div className="mt-2.5 flex gap-2">
          <input
            id="community-alpha-id-input"
            value={alphaIdDraft}
            onChange={(e) => setAlphaIdDraft(e.target.value.toUpperCase())}
            placeholder="A-XXXXXX"
            dir="ltr"
            className={
              compact
                ? "min-w-0 flex-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-[12px] font-bold text-[#1F2937] outline-none focus:border-[#1f8a5a]/55"
                : "min-w-0 flex-1 rounded-xl border border-[#e7c97a]/35 bg-white/70 px-3 py-2.5 text-[13px] font-bold text-[#3a2a18] outline-none backdrop-blur-sm focus:border-[#c98a3c]/55"
            }
          />
          <button
            type="button"
            disabled={busy || !alphaIdDraft.trim()}
            onClick={() => void addResolved(alphaIdDraft)}
            className={
              compact
                ? "shrink-0 rounded-xl border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 px-3 py-2 text-[11px] font-extrabold text-[#166534] active:scale-95 disabled:opacity-45"
                : `shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-extrabold text-[#1f8a5a] ${COMMUNITY_GLASS_BTN_ACCENT("#1f8a5a")}`
            }
          >
            إضافة
          </button>
        </div>
      </div>

      {showShareSection ? (
        <section className={`mt-3 overflow-hidden text-center ${compact ? `${COMMUNITY_SHIELD_INNER} p-4` : `p-5 ${COMMUNITY_GLASS_CARD}`}`}>
          <p className={`font-extrabold ${compact ? "text-[12px] text-[#1F2937]" : "text-[14px] text-[#f0d78c]"}`}>
            شارك ملفك الشخصي
          </p>
          <p className={`mt-1 font-medium ${compact ? "text-[10px] text-[#6B7280]" : "text-[11px] text-white/50"}`}>
            امسح أو شارك معرفك
          </p>

          <div className="mx-auto mt-3 inline-flex flex-col items-center">
            <div className={`rounded-[16px] border p-1.5 ${compact ? "border-white/15 bg-white/5" : "border-[#e7c97a]/40"}`}>
              <div className="rounded-[12px] bg-white p-1.5">
                <AlphaQrCode
                  value={m.qrPayload}
                  copyIdOnTap={m.alphaId}
                  size={compact ? 120 : 160}
                  className={compact ? "h-[100px] w-[100px]" : "h-[132px] w-[132px]"}
                  fgColor="3a2a18"
                  bgColor="ffffff"
                />
              </div>
            </div>
            <p
              className={`mt-2 font-mono font-extrabold tracking-wide ${compact ? "text-[11px] text-[#1F2937]" : "text-[13px] text-[#f0d78c]"}`}
              dir="ltr"
            >
              @{m.alphaId.replace(/^@/, "")}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => void shareProfile()}
              className={
                compact
                  ? "inline-flex items-center gap-2 rounded-xl border border-[#1f8a5a]/30 bg-[#1f8a5a]/12 px-4 py-2.5 text-[11px] font-extrabold text-[#166534] active:scale-95"
                  : `inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[13px] font-extrabold text-[#3a2a18] ${COMMUNITY_GLASS_BTN} bg-gradient-to-br from-[#f0d78c]/95 to-[#c79356]/88 border-[#e7c97a]/55`
              }
            >
              <Share2 className="h-4 w-4" />
              مشاركة
            </button>
            {!compact ? (
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[12px] font-extrabold text-white/85 backdrop-blur-md active:scale-95"
              >
                <ScanLine className="h-4 w-4" />
                امسح QR
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {scannerOpen ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#f0d78c]" />
            </div>
          }
        >
          <AlphaMembershipQrScanner
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onResolved={(code) => {
              setScannerOpen(false);
              void addResolved(code);
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
}
