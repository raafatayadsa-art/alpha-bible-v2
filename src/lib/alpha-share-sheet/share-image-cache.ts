import { buildAlphaShareImage, type AlphaShareRequest } from "@/lib/alpha-share-brand";

const shareImageCache = new Map<string, Blob>();
const shareImageInflight = new Map<string, Promise<Blob | null>>();

function cacheKey(req: AlphaShareRequest) {
  return `${req.imageSrc}|${req.accent}|${req.title}|${req.body}|${req.meta ?? ""}`;
}

export async function getAlphaShareBlob(req: AlphaShareRequest): Promise<Blob | null> {
  const key = cacheKey(req);
  const cached = shareImageCache.get(key);
  if (cached) return cached;

  let pending = shareImageInflight.get(key);
  if (!pending) {
    pending = buildAlphaShareImage(req)
      .then((blob) => {
        if (blob) shareImageCache.set(key, blob);
        shareImageInflight.delete(key);
        return blob;
      })
      .catch((e) => {
        shareImageInflight.delete(key);
        throw e;
      });
    shareImageInflight.set(key, pending);
  }
  return pending;
}

export async function downloadAlphaShareImage(req: AlphaShareRequest, filename = "alpha-coptic.jpg") {
  const blob = await getAlphaShareBlob(req);
  if (!blob) return false;
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
  return true;
}
