import { CompetenceSchema, COVERAGE_STATUSES } from '@platform/shared-types';
import { z } from 'zod';
import { REFERENCE_CASE_SCENARIOS } from './reference-case-scenario.js';

/**
 * Format of the reference cases provided by the tax responsibles (D3). Monetary values and rates
 * are decimal strings; rates are fractions. `"missing"` states explicitly that a value was not
 * provided: absence is never zero.
 */
const decimal = z.string().regex(/^-?\d+(\.\d+)?$/);
const decimalOrMissing = z.union([decimal, z.literal('missing')]);
const taxBreakdown = z.record(z.string(), decimal);

const establishment = z.object({
  establishmentId: z.string().min(1),
  isHeadquarters: z.boolean(),
  uf: z.string().length(2),
  municipality: z.string().min(1),
});

const activity = z.object({
  cnae: z.string().regex(/^\d{4}-?\d\/?\d{2}$/),
  description: z.string().min(1),
  subjectToFactorR: z.boolean(),
});

const revenueEntry = z.object({
  competence: CompetenceSchema,
  establishmentId: z.string().min(1),
  cnae: z.string().min(1),
  treatment: z.string().min(1),
  amount: decimalOrMissing,
});

const payrollEntry = z.object({
  competence: CompetenceSchema,
  proLabore: decimalOrMissing,
  salaries: decimalOrMissing,
  otherComponents: z.record(z.string(), decimalOrMissing),
});

const declaredAssessment = z.object({
  rbt12: decimal,
  factorR: decimalOrMissing,
  annex: z.string().min(1),
  effectiveRate: decimal,
  taxes: taxBreakdown,
  principal: decimal,
  additions: z.object({ fine: decimal, interest: decimal }),
  total: decimal,
});

const expectedResult = z.object({
  coverage: z.enum(COVERAGE_STATUSES),
  rbt12: decimal,
  factorR: decimalOrMissing,
  annex: z.string().min(1),
  bracket: z.number().int().positive(),
  effectiveRate: decimal,
  taxes: taxBreakdown,
  principal: decimal,
  differenceToDeclared: z.object({ principal: decimal, additions: decimal }),
  notes: z.string(),
});

export const ReferenceCaseSchema = z.object({
  caseId: z.string().regex(/^RC-\d{3,}$/),
  title: z.string().min(1),
  scenarios: z.array(z.enum(REFERENCE_CASE_SCENARIOS)).min(1),
  anonymized: z.literal(true),
  providedBy: z.string().min(1),
  approval: z.object({
    status: z.enum(['draft', 'approved']),
    approvedBy: z.array(z.string()),
    approvedAt: z.string().optional(),
  }),
  competence: CompetenceSchema,
  company: z.object({
    activityStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    simplesOptionStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    establishments: z.array(establishment).min(1),
    activities: z.array(activity).min(1),
  }),
  revenueHistory: z.array(revenueEntry),
  payrollHistory: z.array(payrollEntry),
  currentPeriodRevenue: z.array(revenueEntry),
  declared: declaredAssessment,
  expected: expectedResult,
});

export type ReferenceCase = z.infer<typeof ReferenceCaseSchema>;
