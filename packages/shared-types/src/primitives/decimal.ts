import DecimalJs from 'decimal.js';

/**
 * Isolated Decimal constructor for every monetary and rate computation.
 * Using a clone keeps configuration local: no package may mutate the global decimal.js settings.
 * Intermediate precision is intentionally generous; rounding to presentation/legal precision is
 * always explicit (see `rounding-policy.ts`).
 */
export const Decimal = DecimalJs.clone({
  precision: 50,
  rounding: DecimalJs.ROUND_HALF_UP,
  toExpNeg: -30,
  toExpPos: 40,
});

export type Decimal = InstanceType<typeof Decimal>;

/** Plain decimal literal: optional minus sign, digits, optional fractional part with a dot. */
export const DECIMAL_LITERAL_PATTERN = /^-?\d+(\.\d+)?$/;
