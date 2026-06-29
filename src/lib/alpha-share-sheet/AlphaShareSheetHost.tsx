import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Download, Share2, Users, X } from "lucide-react";
import { CopticCross } from "@/components/coptic";
import { shareSpiritualMomentToCommunity } from "@/features/community";
import { COMMUNITY_HUB_PATH } from "@/features/community/community-routes";
import {
  ALPHA_WEBSITE_URL,
  type AlphaShareRequest,
} from "@/lib/alpha-share-brand";
import { parseVerseReference } from "@/lib/bible-labels";
import { resolveBibleRouteBookParam } from "@/lib/bible-book-names";
import { ALPHA_SHARE_OPEN_EVENT, type AlphaShareOpenDetail } from "./open-alpha-share";
import { downloadAlphaShareImage, getAlphaShareBlob } from "./share-image-cache";
import { buildAlphaSharePayload } from "./share-links";

function communityInputFromShareRequest(req: AlphaShareRequest) {
  const parsed = req.meta ? parseVerseReference(req.meta) : null;
  const bookRoute = parsed ? resolveBibleRouteBookParam(parsed.book) : undefined;
  return {
    kind: "reading" as const,
    reading: {
      reference: req.meta || req.title,
      text: req.body,
      bookRoute,
      chapter: parsed?.chapter,
      verse: parsed?.verse,
    },
  };
}

export function AlphaShareSheetHost() {
  const navigate = useNavigate();
  const [req, setReq] = useState<AlphaShareRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setReq((e as CustomEvent<AlphaShareOpenDetail>).detail);
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
    setBusy(false);
  }, []);

  if (!req) return null;

  const links = buildAlphaSharePayload(req);

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

  const doShareToCommunity = () => {
    const ok = shareSpiritualMomentToCommunity(communityInputFromShareRequest(req));
    if (!ok) return;
    close();
    void navigate({ to: COMMUNITY_HUB_PATH });
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

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={doShareToCommunity}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[#1f8a5a]/35 py-3.5 text-[12px] font-extrabold text-[#8ef0b8] transition active:scale-[0.99] disabled:opacity-50"
              style={{
                background: "linear-gradient(180deg, rgba(31,138,90,0.22) 0%, rgba(31,138,90,0.08) 100%)",
              }}
            >
              <Users className="h-4 w-4 shrink-0" strokeWidth={2.2} />
              مشاركة على مجتمعي
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void doNative()}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-3.5 py-3.5 text-[12px] font-extrabold text-white/90 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Share2 className="h-4 w-4 shrink-0 text-[#e7c97a]" strokeWidth={2.2} />
              مشاركة
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void doCopy()}
              className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-white/8 py-2.5 text-[10px] font-bold text-white/80 active:scale-[0.97] disabled:opacity-50"
            >
              <Copy className="h-4 w-4 text-[#b8a4e8]" />
              نسخ النص
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void doSaveImage()}
              className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-white/8 py-2.5 text-[10px] font-bold text-white/80 active:scale-[0.97] disabled:opacity-50"
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
