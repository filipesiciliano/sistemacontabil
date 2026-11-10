import { Decimal } from '@platform/shared-types';
import type { DasTax } from '@platform/rules-catalog';
import type { AnnexTables } from '../rules/annex-tables.js';

export interface TaxRates {
  readonly rates: Readonly<Partial<Record<DasTax, Decimal>>>;
  readonly issCapApplied: boolean;
}

/**
 * Effective rate of each tax = effective rate x share of the bracket. When the annex caps the ISS
 * for the bracket and the effective rate is above the cap threshold, the ISS rate is fixed at the
 * cap and the remainder is split among the other taxes with the redistribution shares.
 */
export function computeTaxRates(
  tables: AnnexTables,
  bracketOrder: number,
  effectiveRate: Decimal,
): TaxRates | undefined {
  const shares = tables.sharesByBracket.get(bracketOrder);
  if (shares === undefined) return undefined;

  const cap = tables.issCap?.byBracket.get(bracketOrder);
  const maxIss = tables.issCap?.maxEffectiveIssRate;
  if (
    cap !== undefined &&
    maxIss !== undefined &&
    effectiveRate.greaterThan(cap.appliesAboveEffectiveRate)
  ) {
    const rateAboveIss = effectiveRate.minus(maxIss);
    const redistributed = Object.fromEntries(
      Object.entries(cap.sharesOfRateAboveIss).map(([tax, share]) => [
        tax,
        rateAboveIss.times(share),
      ]),
    );
    return { rates: { ...redistributed, ISS: maxIss }, issCapApplied: true };
  }

  const rates = Object.fromEntries(
    Object.entries(shares).map(([tax, share]) => [tax, effectiveRate.times(share)]),
  );
  return { rates, issCapApplied: false };
}

export function sumRates(rates: TaxRates['rates']): Decimal {
  return Object.values(rates).reduce((total, rate) => total.plus(rate), new Decimal(0));
}
