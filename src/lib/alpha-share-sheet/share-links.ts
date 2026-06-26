import {
  ALPHA_WEBSITE_URL,
  alphaShareText,
  type AlphaShareRequest,
} from "@/lib/alpha-share-brand";

export const ALPHA_SHARE_HASHTAGS = "#ألفا_القبطي #AlphaCoptic #AlphaBible";

export function buildAlphaSharePayload(req: AlphaShareRequest) {
  const text = alphaShareText(req);
  const withTags = `${text}\n\n${ALPHA_SHARE_HASHTAGS}`;
  const encoded = encodeURIComponent(withTags);
  const url = encodeURIComponent(ALPHA_WEBSITE_URL);
  const textOnly = encodeURIComponent(text);

  return {
    text,
    withTags,
    encoded,
    url,
    textOnly,
    whatsapp: `https://wa.me/?text=${encoded}`,
    telegram: `https://t.me/share/url?url=${url}&text=${encodeURIComponent(`${text}\n\n${ALPHA_SHARE_HASHTAGS}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?text=${encoded}&url=${url}`,
  };
}
