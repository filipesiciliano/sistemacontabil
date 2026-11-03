/** The four profiles defined in the stakeholder scope (§1) and decision D8. */
export const ROLES = [
  'business_owner',
  'invited_accountant',
  'tax_consultant',
  'administrator',
] as const;

export type Role = (typeof ROLES)[number];
