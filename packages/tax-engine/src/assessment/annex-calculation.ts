import type { DasTax } from '@platform/rules-catalog';
import type { Money, Rate } from '@platform/shared-types';
import type { ServiceAnnex } from '../rules/tax-rule-set.js';

/** Result of applying one annex to one revenue entry. */
export interface AnnexCalculation {
  readonly annex: ServiceAnnex;
  readonly bracketOrder: number;
  readonly nominalRate: Rate;
  readonly deduction: Money;
  readonly effectiveRate: Rate;
  readonly taxRates: Readonly<Partial<Record<DasTax, Rate>>>;
  readonly taxAmounts: Readonly<Partial<Record<DasTax, Money>>>;
  readonly total: Money;
  readonly issCapApplied: boolean;
}
