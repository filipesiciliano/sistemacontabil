import { z } from 'zod';
import { Decimal, DECIMAL_LITERAL_PATTERN } from './decimal.js';

/**
 * Amount in BRL with arbitrary precision. Never built from a JS `number`:
 * money enters the system as a decimal string (API, database `numeric`) and stays a Decimal.
 */
export const MoneySchema = z.instanceof(Decimal).brand<'Money'>();
export type Money = z.infer<typeof MoneySchema>;

/** Edge schema: parses a decimal string (e.g. "1234.56") into Money. */
export const MoneyStringSchema = z
  .string()
  .regex(DECIMAL_LITERAL_PATTERN, 'Expected a decimal string such as "1234.56"')
  .transform((literal) => MoneySchema.parse(new Decimal(literal)));

export function money(literal: string): Money {
  return MoneyStringSchema.parse(literal);
}

export function toMoney(value: Decimal): Money {
  return MoneySchema.parse(value);
}

/** Serialization for APIs and persistence: full precision, no exponent notation. */
export function moneyToString(value: Money): string {
  return value.toFixed();
}
