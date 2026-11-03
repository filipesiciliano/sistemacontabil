import { z } from 'zod';

/** Tax period (competência) in the `YYYY-MM` format. */
export const CompetenceSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a competence in the YYYY-MM format')
  .brand<'Competence'>();
export type Competence = z.infer<typeof CompetenceSchema>;

export function competence(literal: string): Competence {
  return CompetenceSchema.parse(literal);
}

export function competenceFromParts(year: number, month: number): Competence {
  return competence(`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`);
}

export function competenceParts(value: Competence): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  if (year === undefined || month === undefined) {
    throw new Error(`Malformed competence: ${value}`);
  }
  return { year, month };
}

export function addMonths(value: Competence, months: number): Competence {
  if (!Number.isInteger(months)) {
    throw new RangeError(`months must be an integer, received ${String(months)}`);
  }
  const { year, month } = competenceParts(value);
  const zeroBased = year * 12 + (month - 1) + months;
  return competenceFromParts(Math.floor(zeroBased / 12), (zeroBased % 12) + 1);
}

/** Negative when `a` precedes `b`, zero when equal, positive otherwise. */
export function compareCompetences(a: Competence, b: Competence): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inclusive list of competences from `from` to `to`. Empty when `from` is after `to`. */
export function competenceRange(from: Competence, to: Competence): Competence[] {
  const result: Competence[] = [];
  for (let current = from; compareCompetences(current, to) <= 0; current = addMonths(current, 1)) {
    result.push(current);
  }
  return result;
}
