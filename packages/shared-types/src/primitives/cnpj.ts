import { z } from 'zod';

const CHECK_DIGIT_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CHECK_DIGIT_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Strips the usual punctuation (`.`, `/`, `-`) and uppercases the identifier. */
export function normalizeCnpj(raw: string): string {
  return raw.replace(/[./\-\s]/g, '').toUpperCase();
}

/**
 * Character value for the check-digit computation: ASCII code minus 48.
 * For digits this is the digit itself, which keeps the classic numeric CNPJ valid; letters are
 * accepted in the first 12 positions to support the alphanumeric CNPJ.
 */
function characterValue(text: string, index: number): number {
  return text.charCodeAt(index) - 48;
}

function checkDigit(base: string, weights: readonly number[]): number {
  const sum = weights.reduce(
    (total, weight, index) => total + characterValue(base, index) * weight,
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(normalized: string): boolean {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(normalized)) return false;
  if (/^(\d)\1{13}$/.test(normalized)) return false;
  const base = normalized.slice(0, 12);
  const first = checkDigit(base, CHECK_DIGIT_WEIGHTS_FIRST);
  const second = checkDigit(base + String(first), CHECK_DIGIT_WEIGHTS_SECOND);
  return normalized.endsWith(`${String(first)}${String(second)}`);
}

/** CNPJ stored normalized (14 characters, no punctuation). */
export const CnpjSchema = z
  .string()
  .transform(normalizeCnpj)
  .refine(isValidCnpj, 'Invalid CNPJ')
  .brand<'Cnpj'>();
export type Cnpj = z.infer<typeof CnpjSchema>;

export function cnpj(raw: string): Cnpj {
  return CnpjSchema.parse(raw);
}

/** Root CNPJ (first 8 characters): identifies the legal entity across its establishments. */
export function cnpjRoot(value: Cnpj): string {
  return value.slice(0, 8);
}
