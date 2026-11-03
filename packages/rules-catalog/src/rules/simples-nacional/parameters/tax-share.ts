/** Tax distribution (repartição) of the effective rate among the taxes collected through the DAS. */
export const DAS_TAXES = [
  'IRPJ',
  'CSLL',
  'COFINS',
  'PIS_PASEP',
  'CPP',
  'ISS',
  'ICMS',
  'IPI',
] as const;
export type DasTax = (typeof DAS_TAXES)[number];

export interface BracketTaxShares {
  readonly bracketOrder: number;
  /** Share of each tax as a fraction; shares of a bracket must add up to 1. */
  readonly shares: Readonly<Partial<Record<DasTax, string>>>;
}
