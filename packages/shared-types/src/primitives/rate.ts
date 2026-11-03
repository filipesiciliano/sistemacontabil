import { z } from 'zod';
import { Decimal, DECIMAL_LITERAL_PATTERN } from './decimal.js';

/**
 * A rate expressed as a FRACTION, never as a percentage: 28% is `0.28`.
 * Rates are not bounded to [0, 1] because some ratios (e.g. payroll / revenue) may exceed 1.
 */
export const RateSchema = z.instanceof(Decimal).brand<'Rate'>();
export type Rate = z.infer<typeof RateSchema>;

export const RateStringSchema = z
  .string()
  .regex(DECIMAL_LITERAL_PATTERN, 'Expected a decimal fraction string such as "0.28"')
  .transform((literal) => RateSchema.parse(new Decimal(literal)));

export function rate(literal: string): Rate {
  return RateStringSchema.parse(literal);
}

export function toRate(value: Decimal): Rate {
  return RateSchema.parse(value);
}

export function rateToString(value: Rate): string {
  return value.toFixed();
}
