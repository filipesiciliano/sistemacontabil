import type { DasTax } from './tax-share.js';

/**
 * ISS cap with redistribution (Annex III footnote): above a given effective rate, the ISS share is
 * fixed and the effective rate minus that fixed ISS share is split among the federal taxes.
 */
export interface IssCapRedistribution {
  readonly maxEffectiveIssRate: string;
  readonly brackets: readonly {
    readonly bracketOrder: number;
    /** Effective rate above which the redistribution applies. */
    readonly appliesAboveEffectiveRate: string;
    /** Shares applied to (effective rate - maxEffectiveIssRate); they add up to 1. */
    readonly sharesOfRateAboveIss: Readonly<Partial<Record<DasTax, string>>>;
  }[];
}
