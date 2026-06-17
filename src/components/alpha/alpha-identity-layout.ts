/**
 * Global RTL identity layout — single attached identity block per person row.
 *
 * Row: [Identity block: Avatar·Name·Shield·Role] · [optional secondary] · [Trailing controls]
 * Identity never splits across the row — avatar stays attached to name/shield/role.
 */

export const ALPHA_IDENTITY_ROW = "alpha-identity-row";
export const ALPHA_IDENTITY_ROW_STACKED = "alpha-identity-row alpha-identity-row--stacked";

export const ALPHA_IDENTITY_BLOCK = "alpha-identity-block";
export const ALPHA_IDENTITY_BLOCK_STACKED = "alpha-identity-block alpha-identity-block--stacked";
export const ALPHA_IDENTITY_BLOCK_DETAILS = "alpha-identity-block__details";
export const ALPHA_IDENTITY_BLOCK_ROLE = "alpha-identity-block__role";

/** @deprecated use ALPHA_IDENTITY_BLOCK__avatar via class alpha-identity-block__avatar */
export const ALPHA_IDENTITY_AVATAR = "alpha-identity-block__avatar";

export const ALPHA_IDENTITY_ROW_SECONDARY = "alpha-identity-row__secondary";
export const ALPHA_IDENTITY_TRAILING = "alpha-identity-row__trailing";

export const ALPHA_IDENTITY_NAME = "alpha-identity-name";
export const ALPHA_IDENTITY_NAME_STACKED = "alpha-identity-name alpha-identity-name--stacked";
export const ALPHA_IDENTITY_NAME_TEXT = "alpha-identity-name__text";

export const ALPHA_IDENTITY_AVATAR_SIZES = {
  xs: "alpha-identity-avatar--xs",
  sm: "alpha-identity-avatar--sm",
  md: "alpha-identity-avatar--md",
  lg: "alpha-identity-avatar--lg",
} as const;

export type AlphaIdentityAvatarSize = keyof typeof ALPHA_IDENTITY_AVATAR_SIZES;
