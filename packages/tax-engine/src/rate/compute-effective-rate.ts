import type { Decimal } from '@platform/shared-types';
import type { BracketValues } from '../rules/annex-tables.js';

/**
 * Effective rate = ((RBT12 x nominal rate) - deduction) / RBT12, kept at full precision.
 * A zero RBT12 is replaced by the rule's substitute (PGDAS-D manual 8.1: "considerar RBT12 = 1").
 */
export function computeEffectiveRate(
  rbt12: Decimal,
  bracket: BracketValues,
  zeroRbt12Substitute: Decimal,
): Decimal {
  const base = rbt12.isZero() ? zeroRbt12Substitute : rbt12;
  return base.times(bracket.nominalRate).minus(bracket.deduction).dividedBy(base);
}
