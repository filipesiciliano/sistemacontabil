import { z } from 'zod';

/** CNAE subclass stored normalized as 7 digits (e.g. "6201501" for "6201-5/01"). */
export const CnaeSchema = z
  .string()
  .transform((raw) => raw.replace(/[.\-/\s]/g, ''))
  .refine((digits) => /^\d{7}$/.test(digits), 'Expected a 7-digit CNAE subclass')
  .brand<'Cnae'>();
export type Cnae = z.infer<typeof CnaeSchema>;

export function cnae(raw: string): Cnae {
  return CnaeSchema.parse(raw);
}

export function formatCnae(value: Cnae): string {
  return `${value.slice(0, 4)}-${value.slice(4, 5)}/${value.slice(5)}`;
}
