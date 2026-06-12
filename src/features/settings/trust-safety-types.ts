export type TrustContentBlock = {
  title: string;
  points: readonly string[];
};

export type TrustGuaranteeId = "faith" | "transparency" | "privacy" | "control";

export type TrustSectionId = "rights" | "messages" | "churches" | "recovery" | "community";

export const TRUST_GUARANTEE_IDS: TrustGuaranteeId[] = [
  "faith",
  "transparency",
  "privacy",
  "control",
];

export const TRUST_SECTION_IDS: TrustSectionId[] = [
  "rights",
  "messages",
  "churches",
  "recovery",
  "community",
];

export const TRUST_SECTION_ACCENTS: Record<TrustSectionId, string> = {
  rights: "#7a5c9e",
  messages: "#5b8fd1",
  churches: "#b8893a",
  recovery: "#3f9d6e",
  community: "#c44569",
};

export const TRUST_GUARANTEE_ACCENTS: Record<TrustGuaranteeId, string> = {
  faith: "#b8893a",
  transparency: "#5b8fd1",
  privacy: "#7a5c9e",
  control: "#3f9d6e",
};
