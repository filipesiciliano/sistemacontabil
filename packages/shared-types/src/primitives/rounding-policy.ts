import { Decimal } from './decimal.js';

export type RoundingMode = 'half_up' | 'half_even' | 'truncate';

/**
 * Rounding is always explicit and named. Which policy applies to each step of the Simples Nacional
 * calculation is a [PENDING DECISION] to be agreed with the stakeholders (docs/07-casos-de-referencia.md).
 */
export interface RoundingPolicy {
  readonly decimalPlaces: number;
  readonly mode: RoundingMode;
}

type DecimalRoundingMode =
  typeof Decimal.ROUND_HALF_UP | typeof Decimal.ROUND_HALF_EVEN | typeof Decimal.ROUND_DOWN;

const DECIMAL_JS_MODE: Record<RoundingMode, DecimalRoundingMode> = {
  half_up: Decimal.ROUND_HALF_UP,
  half_even: Decimal.ROUND_HALF_EVEN,
  truncate: Decimal.ROUND_DOWN,
};

export function applyRounding(value: Decimal, policy: RoundingPolicy): Decimal {
  if (!Number.isInteger(policy.decimalPlaces) || policy.decimalPlaces < 0) {
    throw new RangeError(`Invalid decimalPlaces: ${String(policy.decimalPlaces)}`);
  }
  return value.toDecimalPlaces(policy.decimalPlaces, DECIMAL_JS_MODE[policy.mode]);
}
