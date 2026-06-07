export type ChurchHubStatus = "none" | "pending" | "needs_info" | "approved";

export type ChurchServantEntry = {
  id: string;
  name: string;
  phone: string;
  role: string;
};

export const PRIEST_RANKS = ["أبونا", "القس", "القمص", "الأسقف", "المطران"] as const;
export type PriestRank = (typeof PRIEST_RANKS)[number];

export type ChurchSetupFormData = {
  churchName: string;
  diocese: string;
  governorate: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  mapLocation: string;
  priestName: string;
  priestRank: string;
  priestPhone: string;
  priestEmail: string;
  priestDiocese: string;
  ordinationDate: string;
  priestIdNumber: string;
  priestNotes: string;
  churchPhone: string;
  whatsapp: string;
  facebook: string;
  youtube: string;
  website: string;
  servants: ChurchServantEntry[];
  documentName?: string;
  additionalNotes: string;
};

export type ChurchSetupRequest = {
  number: string;
  submittedAt: number;
  statusLabel: string;
  adminNotes?: string;
  formData?: ChurchSetupFormData;
  /** Supabase church_setup_requests.id */
  setupRequestId?: string;
  /** Supabase platform_approvals.id — used in Approvals Center */
  approvalId?: string;
};

export type ApprovedChurch = {
  name: string;
  diocese: string;
  membersCount: number;
  servantsCount: number;
};

export type ChurchHubState = {
  status: ChurchHubStatus;
  request?: ChurchSetupRequest;
  church?: ApprovedChurch;
};

export const DEFAULT_CHURCH_HUB: ChurchHubState = {
  status: "none",
};

export const EMPTY_SETUP_FORM: ChurchSetupFormData = {
  churchName: "",
  diocese: "",
  governorate: "",
  city: "",
  address: "",
  latitude: null,
  longitude: null,
  locationLabel: "",
  mapLocation: "",
  priestName: "",
  priestRank: "",
  priestPhone: "",
  priestEmail: "",
  priestDiocese: "",
  ordinationDate: "",
  priestIdNumber: "",
  priestNotes: "",
  churchPhone: "",
  whatsapp: "",
  facebook: "",
  youtube: "",
  website: "",
  servants: [],
  additionalNotes: "",
};
