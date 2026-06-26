import type {
  PublisherContentItem,
  PublisherContentKind,
  PublisherContentStatus,
  PublisherContentVisibility,
  PublisherRecord,
  PublisherStatus,
  PublisherType,
} from "./types";

export type PublisherRow = {
  id: string;
  publisher_type: PublisherType;
  name: string;
  english_name: string | null;
  bio: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  status: PublisherStatus;
  is_trusted: boolean;
  is_public: boolean;
  owner_user_id: string | null;
  church_id: number | null;
  monastery_id: number | null;
  follower_count: number;
  content_count: number;
  likes_count?: number;
  readiness_score: number;
  submitted_for_review_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  hero_content_ids?: string[] | null;
};

export type PublisherContentRow = {
  id: string;
  publisher_id: string;
  content_kind: PublisherContentKind;
  title: string;
  description: string | null;
  cover_url: string | null;
  media_url: string | null;
  visibility: PublisherContentVisibility;
  allow_download: boolean;
  likes_count: number;
  duration_seconds: number | null;
  status: PublisherContentStatus;
  sort_order: number;
  payload?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export const PUBLISHER_SELECT =
  "id, publisher_type, name, english_name, bio, logo_url, cover_url, phone, email, website_url, facebook_url, youtube_url, status, is_trusted, is_public, owner_user_id, church_id, monastery_id, follower_count, content_count, likes_count, readiness_score, submitted_for_review_at, published_at, created_at, updated_at, hero_content_ids";

export const CONTENT_SELECT =
  "id, publisher_id, content_kind, title, description, cover_url, media_url, visibility, allow_download, likes_count, duration_seconds, status, sort_order, payload, created_at, updated_at";

export function mapPublisherFromRow(row: PublisherRow): PublisherRecord {
  return {
    id: row.id,
    publisherType: row.publisher_type,
    name: row.name,
    englishName: row.english_name,
    bio: row.bio,
    logoUrl: row.logo_url,
    coverUrl: row.cover_url,
    phone: row.phone,
    email: row.email,
    websiteUrl: row.website_url,
    facebookUrl: row.facebook_url,
    youtubeUrl: row.youtube_url,
    status: row.status,
    isTrusted: row.is_trusted,
    isPublic: row.is_public,
    ownerUserId: row.owner_user_id,
    churchId: row.church_id != null ? String(row.church_id) : null,
    monasteryId: row.monastery_id != null ? String(row.monastery_id) : null,
    followerCount: row.follower_count ?? 0,
    contentCount: row.content_count ?? 0,
    likesCount: row.likes_count ?? 0,
    listenCount: 0,
    readinessScore: row.readiness_score ?? 0,
    submittedForReviewAt: row.submitted_for_review_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    heroContentIds: row.hero_content_ids ?? [],
  };
}

export function mapContentFromRow(row: PublisherContentRow): PublisherContentItem {
  return {
    id: row.id,
    publisherId: row.publisher_id,
    contentKind: row.content_kind,
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url,
    mediaUrl: row.media_url ?? null,
    visibility: row.visibility ?? "private",
    allowDownload: row.allow_download ?? false,
    likesCount: row.likes_count ?? 0,
    durationSeconds: row.duration_seconds ?? null,
    status: row.status,
    sortOrder: row.sort_order ?? 0,
    payload: row.payload ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
