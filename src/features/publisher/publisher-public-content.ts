import { contentHasPlayableMedia } from "./publisher-content-payload";
import type { PublisherContentItem, PublisherContentKind, PublisherRecord } from "./types";

export type PublisherContentGroups = {
  hymns: PublisherContentItem[];
  albums: PublisherContentItem[];
  playlists: PublisherContentItem[];
  videos: PublisherContentItem[];
  lectures: PublisherContentItem[];
  books: PublisherContentItem[];
  articles: PublisherContentItem[];
};

const GROUP_KINDS: Record<keyof PublisherContentGroups, PublisherContentKind[]> = {
  hymns: ["hymn"],
  albums: ["album"],
  playlists: ["playlist"],
  videos: ["video"],
  lectures: ["lecture"],
  books: ["book", "pdf"],
  articles: ["article"],
};

function sortByEngagement(a: PublisherContentItem, b: PublisherContentItem) {
  const likes = (b.likesCount ?? 0) - (a.likesCount ?? 0);
  if (likes !== 0) return likes;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function groupPublisherContent(content: PublisherContentItem[]): PublisherContentGroups {
  const groups: PublisherContentGroups = {
    hymns: [],
    albums: [],
    playlists: [],
    videos: [],
    lectures: [],
    books: [],
    articles: [],
  };

  for (const item of content) {
    for (const [key, kinds] of Object.entries(GROUP_KINDS) as [keyof PublisherContentGroups, PublisherContentKind[]][]) {
      if (kinds.includes(item.contentKind)) {
        groups[key].push(item);
        break;
      }
    }
  }

  for (const key of Object.keys(groups) as (keyof PublisherContentGroups)[]) {
    groups[key].sort(sortByEngagement);
  }

  return groups;
}

const HERO_ELIGIBLE_KINDS: PublisherContentKind[] = ["hymn", "album", "playlist", "lecture", "video"];

export function isHeroEligibleContent(item: PublisherContentItem, allContent: PublisherContentItem[]): boolean {
  if (!HERO_ELIGIBLE_KINDS.includes(item.contentKind)) return false;
  return Boolean(item.coverUrl?.trim() || item.mediaUrl?.trim() || contentHasPlayableMedia(item, allContent));
}

/** Featured hero slides — publisher-configured order first, else auto (unlimited). */
export function pickHeroSlides(
  content: PublisherContentItem[],
  publisher: PublisherRecord,
): PublisherContentItem[] {
  const byId = new Map(content.map((c) => [c.id, c]));
  const configured = (publisher.heroContentIds ?? [])
    .map((id) => byId.get(id))
    .filter((c): c is PublisherContentItem => Boolean(c));
  if (configured.length) return configured;

  const groups = groupPublisherContent(content);
  const hymnSlides = groups.hymns.filter((h) => contentHasPlayableMedia(h, content));
  if (hymnSlides.length) return hymnSlides;

  const albumSlides = groups.albums.filter(
    (a) => a.coverUrl?.trim() || a.mediaUrl?.trim() || contentHasPlayableMedia(a, content),
  );
  if (albumSlides.length) return albumSlides;

  const lectureSlides = groups.lectures.filter((l) => contentHasPlayableMedia(l, content));
  if (lectureSlides.length) return lectureSlides;

  if (publisher.coverUrl?.trim() || publisher.logoUrl?.trim()) {
    return [
      {
        id: `publisher-${publisher.id}`,
        publisherId: publisher.id,
        contentKind: "hymn",
        title: publisher.name,
        description: publisher.bio,
        coverUrl: publisher.coverUrl ?? publisher.logoUrl,
        mediaUrl: null,
        visibility: "public",
        allowDownload: false,
        likesCount: publisher.likesCount ?? 0,
        durationSeconds: null,
        status: "approved",
        sortOrder: 0,
        payload: null,
        createdAt: publisher.createdAt,
        updatedAt: publisher.updatedAt,
      },
    ];
  }

  return [];
}

export type PublisherSectionKey =
  | "listen"
  | "continue"
  | "favorites"
  | "hymns"
  | "albums"
  | "playlists"
  | "videos"
  | "lectures"
  | "books"
  | "articles"
  | "about";

export const PUBLISHER_SECTION_LABELS: Record<PublisherSectionKey, string> = {
  listen: "استمع الآن",
  continue: "أكمل الاستماع",
  favorites: "المفضلة",
  hymns: "ترانيم مختارة",
  albums: "الألبومات",
  playlists: "قوائم التشغيل",
  videos: "فيديوهات",
  lectures: "محاضرات",
  books: "كتب",
  articles: "مقالات",
  about: "حول الناشر",
};

export function visiblePublisherSections(
  groups: PublisherContentGroups,
  opts: { hasContinue: boolean; hasFavorites: boolean; hasBio: boolean; hasListen?: boolean },
): PublisherSectionKey[] {
  const keys: PublisherSectionKey[] = [];
  if (opts.hasListen) keys.push("listen");
  if (opts.hasContinue) keys.push("continue");
  if (opts.hasFavorites) keys.push("favorites");
  if (groups.hymns.length) keys.push("hymns");
  if (groups.albums.length) keys.push("albums");
  if (groups.playlists.length) keys.push("playlists");
  if (groups.videos.length) keys.push("videos");
  if (groups.lectures.length) keys.push("lectures");
  if (groups.books.length) keys.push("books");
  if (groups.articles.length) keys.push("articles");
  if (opts.hasBio) keys.push("about");
  return keys;
}
