import type { DailyReading } from "@/features/katameros/types";
import type { Saint } from "@/features/synaxarium/types";
import { AGPEYA_PRAYERS } from "@/features/agpeya/data";
import { FEASTS } from "@/features/feasts/data";
import { displayName } from "@/lib/bible-books";
import {
  BIBLE_SEARCH_HINTS,
  hasBibleBookResult,
  includesBookQuery,
  normSearchText,
  resolveCatalogBook,
  bibleBookResultId,
} from "./bible-book-search";
import type { ChurchDashboardContact, ChurchDashboardPrayer } from "@/features/church/church-dashboard-api";
import type { PrayerRequest } from "@/data/prayer-requests";
import { buildAlphaConnectChatSearch } from "@/features/alpha-connect/alpha-connect-nav";

export type ContextualSearchScope =
  | "bible"
  | "agpeya"
  | "katameros"
  | "synaxarium"
  | "church"
  | "community"
  | "feasts";

export type ContextualSearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  image?: string;
};

export type ContextualSearchContext = {
  books?: string[];
  katamerosReadings?: DailyReading[];
  synaxariumSaints?: Saint[];
  churchContacts?: ChurchDashboardContact[];
  churchPrayers?: ChurchDashboardPrayer[];
  churchPosts?: { id: string; title: string; excerpt?: string }[];
  prayerRequests?: PrayerRequest[];
};

export const CONTEXTUAL_SEARCH_META: Record<
  ContextualSearchScope,
  { title: string; placeholder: string }
> = {
  bible: { title: "البحث في الكتاب", placeholder: "ابحث عن سفر أو إصحاح..." },
  agpeya: { title: "البحث في الأجبية", placeholder: "ابحث عن صلاة..." },
  katameros: { title: "البحث في القطمارس", placeholder: "ابحث في قراءات اليوم..." },
  synaxarium: { title: "البحث في السنكسار", placeholder: "ابحث باسم القديس..." },
  church: { title: "البحث في الكنيسة", placeholder: "ابحث في المنشورات والخدمات..." },
  community: { title: "البحث في المجتمع", placeholder: "ابحث في طلبات الصلاة..." },
  feasts: { title: "البحث في المناسبات", placeholder: "ابحث باسم العيد أو المناسبة..." },
};

const CHURCH_QUICK_LINKS: ContextualSearchResult[] = [
  { id: "church:directory", title: "دليل الكنائس", subtitle: "ابحث عن كنيسة قريبة", to: "/church/directory" },
  { id: "church:prayers", title: "طلبات الصلاة", subtitle: "شارك في الصلاة", to: "/prayer-requests" },
  { id: "church:archive", title: "أرشيف المنشورات", subtitle: "منشورات سابقة", to: "/church/archive" },
];

export { normSearchText } from "./bible-book-search";

function includesQuery(haystack: string, query: string): boolean {
  const nq = normSearchText(query);
  if (!nq) return true;
  return normSearchText(haystack).includes(nq);
}

export function searchContextual(
  scope: ContextualSearchScope,
  query: string,
  context: ContextualSearchContext = {},
): ContextualSearchResult[] {
  const nq = normSearchText(query);
  if (!nq) return [];

  switch (scope) {
    case "bible": {
      const out: ContextualSearchResult[] = [];
      const books = context.books ?? [];
      for (const book of books) {
        const name = displayName(book);
        if (includesBookQuery(book, query)) {
          out.push({
            id: bibleBookResultId(book),
            title: name,
            subtitle: "اقرأ الإصحاحات",
            to: "/$book",
            params: { book },
          });
        }
      }
      for (const hint of BIBLE_SEARCH_HINTS) {
        if (!includesQuery(`${hint.title} ${hint.book}`, query)) continue;
        const book = resolveCatalogBook(hint.book, books);
        if (hasBibleBookResult(out, book)) continue;
        out.push({
          id: `hint:${book}`,
          title: displayName(book),
          subtitle: "اقرأ الإصحاحات",
          to: "/$book",
          params: { book },
        });
      }
      return out.slice(0, 40);
    }

    case "agpeya":
      return AGPEYA_PRAYERS.filter((p) =>
        includesQuery(`${p.title} ${p.subtitle ?? ""} ${p.description ?? ""}`, query),
      ).map((p) => ({
        id: `agpeya:${p.id}`,
        title: p.title,
        subtitle: p.subtitle ?? p.description,
        to: "/agpeya/$prayerId",
        params: { prayerId: p.id },
      }));

    case "katameros":
      return (context.katamerosReadings ?? [])
        .filter((r) => includesQuery(`${r.title} ${r.reference ?? ""} ${r.body ?? ""}`, query))
        .map((r) => ({
          id: `kat:${r.id}`,
          title: r.title,
          subtitle: r.reference || r.source,
          to: "/katameros",
        }));

    case "synaxarium":
      return (context.synaxariumSaints ?? [])
        .filter((s) =>
          includesQuery(`${s.name} ${s.title} ${s.summary} ${s.copticDate}`, query),
        )
        .map((s) => ({
          id: `saint:${s.id}`,
          title: s.name,
          subtitle: `${s.copticDate} · ${s.title}`,
          to: "/synaxarium/$saintId",
          params: { saintId: s.id },
          image: s.image,
        }));

    case "feasts":
      return FEASTS.filter((f) =>
        includesQuery(`${f.title} ${f.subtitle} ${f.description ?? ""}`, query),
      ).map((f) => ({
        id: `feast:${f.id}`,
        title: f.title,
        subtitle: f.subtitle,
        to: "/feasts/$eventId",
        params: { eventId: f.id },
        image: f.image,
      }));

    case "church": {
      const out: ContextualSearchResult[] = [];
      for (const post of context.churchPosts ?? []) {
        if (includesQuery(`${post.title} ${post.excerpt ?? ""}`, query)) {
          out.push({
            id: `post:${post.id}`,
            title: post.title,
            subtitle: post.excerpt,
            to: "/church/post/$id",
            params: { id: post.id },
          });
        }
      }
      for (const c of context.churchContacts ?? []) {
        if (includesQuery(`${c.name} ${c.role}`, query)) {
          out.push({
            id: `contact:${c.id}`,
            title: c.name,
            subtitle: c.role,
            to: "/alpha-connect",
            search: buildAlphaConnectChatSearch({
              contactId: c.id,
              name: c.name,
              role: c.roleType === "priest" || c.roleType === "servant" || c.roleType === "admin" ? c.roleType : "admin",
            }),
          });
        }
      }
      for (const p of context.churchPrayers ?? []) {
        if (includesQuery(`${p.title} ${p.request}`, query)) {
          out.push({
            id: `prayer:${p.id}`,
            title: p.title,
            subtitle: p.request,
            to: "/prayer-requests",
          });
        }
      }
      for (const link of CHURCH_QUICK_LINKS) {
        if (includesQuery(`${link.title} ${link.subtitle ?? ""}`, query)) {
          out.push(link);
        }
      }
      return out.slice(0, 40);
    }

    case "community":
      return (context.prayerRequests ?? [])
        .filter((p) => includesQuery(`${p.title} ${p.request} ${p.category}`, query))
        .map((p) => ({
          id: `community:${p.id}`,
          title: p.title,
          subtitle: p.category,
          to: "/prayer-requests",
        }))
        .slice(0, 40);

    default:
      return [];
  }
}
