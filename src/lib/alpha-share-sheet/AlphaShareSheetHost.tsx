import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Copy,
  Download,
  Facebook,
  MessageCircle,
  Send,
  Share2,
  Twitter,
  UserRound,
  X,
} from "lucide-react";
import { CopticCross } from "@/components/coptic";
import {
  ALPHA_WEBSITE_URL,
  type AlphaShareRequest,
} from "@/lib/alpha-share-brand";
import { ALPHA_SHARE_OPEN_EVENT, type AlphaShareOpenDetail } from "./open-alpha-share";
import { repostContentToProfile } from "./profile-content-reposts";
import { downloadAlphaShareImage, getAlphaShareBlob } from "./share-image-cache";
import { buildAlphaSharePayload } from "./share-links";

type SocialKey = "wa" | "tg" | "fb" | "x";

const SOCIAL_OPTIONS: {
  key: SocialKey;
  label: string;
  color: string;
  glow: string;
  icon: typeof MessageCircle;
}[] = [
  { key: "wa", label: "واتساب", color: "#25D366", glow: "rgba(37,211,102,0.35)", icon: MessageCircle },
  { key: "tg", label: "تيليجرام", color: "#229ED9", glow: "rgba(34,158,217,0.35)", icon: Send },
  { key: "fb", label: "فيسبوك", color: "#1877F2", glow: "rgba(24,119,242,0.35)", icon: Facebook },
  { key: "x", label: "تويتر", color: "#1DA1F2", glow: "rgba(29,161,242,0.35)", icon: Twitter },
];

export function AlphaShareSheetHost() {
  const [req, setReq] = useState<AlphaShareRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setReq((e as CustomEvent<AlphaShareOpenDetail>).detail);
      setSocialOpen(false);
      setToast(null);
    };
    window.addEventListener(ALPHA_SHARE_OPEN_EVENT, onOpen as EventListener);
    return () => window.removeEventListener(ALPHA_SHARE_OPEN_EVENT, onOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const close = useCallback(() => {
    setReq(null);
    setSocialOpen(false);
    setBusy(false);
  }, []);

  if (!req) return null;

  const links = buildAlphaSharePayload(req);

  const openExternal = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    close();
  };

  const shareWithImage = async (href: string) => {
    setBusy(true);
    try {
      const blob = await getAlphaShareBlob(req);
      const file = blob ? new File([blob], "alpha-coptic.jpg", { type: "image/jpeg" }) : null;
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };
      if (file && nav.canShare?.({ files: [file], text: links.withTags })) {
        await nav.share({ title: req.title, text: links.withTags, files: [file] });
        close();
        return;
      }
      if (blob) await downloadAlphaShareImage(req);
    } catch {
      /* fall through to external link */
    }
    setBusy(false);
    openExternal(href);
  };

  const doNative = async () => {
    setBusy(true);
    try {
      const blob = await getAlphaShareBlob(req);
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };
      if (blob && nav.canShare?.({ files: [new File([blob], "alpha-coptic.jpg", { type: "image/jpeg" })] })) {
        const file = new File([blob], "alpha-coptic.jpg", { type: "image/jpeg" });
        await nav.share({ title: req.title, text: links.withTags, files: [file] });
      } else if (nav.share) {
        await nav.share({ title: req.title, text: links.withTags, url: ALPHA_WEBSITE_URL });
      } else {
        await navigator.clipboard?.writeText(links.withTags);
        setToast("تم نسخ النص");
        return;
      }
    } catch {
      /* cancelled */
    }
    setBusy(false);
    close();
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard?.writeText(links.withTags);
      setToast("تم نسخ النص");
    } catch {
      setToast("تعذّر النسخ");
    }
    close();
  };

  const doSaveImage = async () => {
    setBusy(true);
    const ok = await downloadAlphaShareImage(req);
    setBusy(false);
    setToast(ok ? "تم حفظ الصورة" : "تعذّر حفظ الصورة");
    close();
  };

  const doRepostToProfile = () => {
    repostContentToProfile(req);
    setToast("تم النشر على صفحتك");
    close();
  };

  const socialHref: Record<SocialKey, string> = {
    wa: links.whatsapp,
    tg: links.telegram,
    fb: links.facebook,
    x: links.twitter,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="مشاركة المحتوى"
      className="fixed inset-0 z-[120] flex items-end justify-center"
      onClick={close}
    >
      <div className="absolute inset-0 bg-[#05030c]/72 backdrop-blur-md animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[var(--alpha-content-max-width)] animate-in slide-in-from-bottom-4 duration-300"
      >
        <div
          className="rounded-t-[28px] border border-white/10 px-4 pt-2.5 pb-[max(env(safe-area-inset-bottom),16px)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,14,32,0.94) 0%, rgba(10,8,20,0.97) 100%)",
            backdropFilter: "blur(28px) saturate(160%)",
            boxShadow:
              "0 -24px 56px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(231,201,122,0.06)",
          }}
        >
          <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-white/18" />

          <div className="flex items-start justify-between gap-3 px-0.5">
            <div className="min-w-0 flex-1 text-right">
              <h3 className="flex items-center justify-end gap-1.5 text-[14px] font-extrabold text-white">
                <CopticCross className="text-[#e7c97a]" size={13} />
                انتشار البركة
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-[#e7c97a]/90">{req.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/55">{req.body}</p>
            </div>
            <button
              type="button"
              aria-label="إغلاق"
              onClick={close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/6 text-white/70 backdrop-blur-md transition active:scale-95"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={doRepostToProfile}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#e7c97a]/28 py-3.5 text-[12px] font-extrabold text-[#f0d78c] transition active:scale-[0.99] disabled:opacity-50"
              style={{
                background: "linear-gradient(180deg, rgba(231,201,122,0.16) 0%, rgba(231,201,122,0.05) 100%)",
              }}
            >
              <UserRound className="h-4 w-4" strokeWidth={2.2} />
              مشاركة على صفحتي
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setSocialOpen((v) => !v)}
              className="flex items-center justify-between gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-3.5 py-3.5 text-[12px] font-extrabold text-white/90 transition active:scale-[0.99] disabled:opacity-50"
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#e7c97a] transition-transform ${socialOpen ? "rotate-180" : ""}`}
              />
              <span className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#e7c97a]" strokeWidth={2.2} />
                السوشيال ميديا
              </span>
            </button>
          </div>

          {socialOpen ? (
            <div className="mt-2.5 grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {SOCIAL_OPTIONS.map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.key}
                    type="button"
                    disabled={busy}
                    onClick={() => void shareWithImage(socialHref[o.key])}
                    className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-white/[0.03] px-1 py-2.5 transition active:scale-[0.94] disabled:opacity-45"
                  >
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md"
                      style={{
                        borderColor: `${o.color}55`,
                        background: `linear-gradient(145deg, ${o.color}28, rgba(0,0,0,0.35))`,
                        boxShadow: `0 8px 24px -8px ${o.glow}`,
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.1} />
                    </span>
                    <span className="text-[9.5px] font-bold text-white/82">{o.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void doNative()}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/8 py-2.5 text-[10px] font-bold text-white/80 active:scale-[0.97] disabled:opacity-50"
            >
              <Share2 className="h-4 w-4 text-[#e7c97a]" />
              مشاركة
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void doCopy()}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/8 py-2.5 text-[10px] font-bold text-white/80 active:scale-[0.97] disabled:opacity-50"
            >
              <Copy className="h-4 w-4 text-[#b8a4e8]" />
              نسخ النص
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void doSaveImage()}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/8 py-2.5 text-[10px] font-bold text-white/80 active:scale-[0.97] disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-[#7ec8a8]" />
              حفظ الصورة
            </button>
          </div>

          {toast ? (
            <p
              role="status"
              className="mt-3 rounded-xl border border-[#7af0b8]/30 bg-[#0a2a20]/80 py-2 text-center text-[11px] font-bold text-[#eaf6ec]"
            >
              {toast}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
