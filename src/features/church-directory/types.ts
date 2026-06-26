import type { ChurchPageStatus } from "@/features/church-page";

export type ChurchDirectoryRow = {
  id: string;
  name: string;
  patronSaint: string | null;
  city: string | null;
  governorate: string | null;
  country: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
};

/** Verified church pin for map (Alpha Control location_verified + coords). */
export type ChurchDirectoryMapPin = {
  id: string;
  name: string;
  patronSaint: string | null;
  city: string | null;
  governorate: string | null;
  lat: number;
  lng: number;
};

export type ChurchDirectorySearchResult = {
  rows: ChurchDirectoryRow[];
  totalCount: number;
};

export type ChurchDirectoryFacets = {
  governorates: string[];
  cities: string[];
  patronSaints: string[];
  verifiedCount: number;
  totalCount: number;
};

export type ChurchDirectoryFilterState = {
  query: string;
  governorate: string;
  city: string;
  patronSaint: string;
  verifiedOnly: boolean;
  nearbyOnly: boolean;
};

export type ChurchDirectoryFullDetails = {
  id: string;
  name: string;
  englishName: string | null;
  patronSaint: string | null;
  patronFeasts: string | null;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  description: string | null;
  priestsFull: string | null;
  priestName: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  churchUrl: string | null;
  churchCode: string | null;
  heroImageUrl: string | null;
  coverImageUrl: string | null;
  isVerified: boolean;
  pageStatus: ChurchPageStatus;
  verifiedLocationUrl: string | null;
  lat: number | null;
  lng: number | null;
  memberCount: number;
  servantCount: number;
};

export type DirectoryViewMode = "map" | "list";
