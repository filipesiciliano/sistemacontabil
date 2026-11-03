/** Modules of the modular monolith. Each one owns its data and exposes a public API in index.ts. */
export const MODULE_NAMES = [
  'identity',
  'companies',
  'periods',
  'coverage',
  'reconciliation',
  'alerts',
  'opportunities',
  'collaboration',
  'projections',
] as const;

export type ModuleName = (typeof MODULE_NAMES)[number];
