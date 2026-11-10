import type { Decimal } from '@platform/shared-types';
import type { DasTax } from '@platform/rules-catalog';

export type TaxShares = Readonly<Partial<Record<DasTax, Decimal>>>;

export interface BracketValues {
  readonly order: number;
  readonly upperRbt12Limit: Decimal;
  readonly nominalRate: Decimal;
  readonly deduction: Decimal;
}

export interface IssCapBracket {
  readonly appliesAboveEffectiveRate: Decimal;
  readonly sharesOfRateAboveIss: TaxShares;
}

export interface IssCap {
  readonly maxEffectiveIssRate: Decimal;
  readonly byBracket: ReadonlyMap<number, IssCapBracket>;
}

/** Numeric tables of one annex, already converted from the catalog's decimal strings. */
export interface AnnexTables {
  readonly brackets: readonly BracketValues[];
  readonly sharesByBracket: ReadonlyMap<number, TaxShares>;
  readonly issCap?: IssCap;
}
