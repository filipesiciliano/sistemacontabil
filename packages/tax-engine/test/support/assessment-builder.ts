import {
  addMonths,
  cnae,
  competence,
  type Competence,
  type DataPoint,
  type Money,
} from '@platform/shared-types';
import type {
  ActivityTaxation,
  AssessmentInput,
  CurrentRevenueEntry,
  MonthlyPayroll,
  MonthlyRevenue,
  RevenueTreatments,
} from '../../src/index.js';
import { amount, confirmed } from './data-points.js';

export const NO_TREATMENTS: RevenueTreatments = {
  export: false,
  issWithheld: false,
  taxSubstitution: false,
  monophasic: false,
  issDueOutsideEstablishment: false,
};

/** Monthly values listed from `first` onwards, in thousands of BRL as in the manual tables. */
export function revenueFrom(first: string, thousands: readonly number[]): MonthlyRevenue[] {
  return thousands.map((value, index) => ({
    competence: addMonths(competence(first), index),
    establishmentId: 'EST-1',
    amount: amount(String(value * 1000)),
  }));
}

export function payrollFrom(first: string, thousands: readonly number[]): MonthlyPayroll[] {
  return thousands.map((value, index) => ({
    competence: addMonths(competence(first), index),
    amount: amount(String(value * 1000)),
  }));
}

export function entry(
  revenue: DataPoint<Money>,
  overrides: Partial<CurrentRevenueEntry> = {},
): CurrentRevenueEntry {
  return {
    entryId: 'E1',
    establishmentId: 'EST-1',
    activityId: 'A1',
    amount: revenue,
    treatments: NO_TREATMENTS,
    ...overrides,
  };
}

export interface BuildOptions {
  readonly competence: string;
  readonly activityStart: string;
  readonly taxation: ActivityTaxation;
  readonly revenueHistory?: readonly MonthlyRevenue[];
  readonly payrollHistory?: readonly MonthlyPayroll[];
  readonly currentRevenue: readonly CurrentRevenueEntry[];
}

/** Test policy: half-up to cents per tax, consistent with the manual examples (D15 pending). */
export const TEST_ROUNDING = { decimalPlaces: 2, mode: 'half_up' } as const;

export function buildInput(
  options: BuildOptions,
  overrides: Partial<AssessmentInput> = {},
): AssessmentInput {
  const start: Competence = competence(options.activityStart);
  return {
    competence: competence(options.competence),
    company: {
      activityStart: confirmed(start),
      simplesNacionalOptant: confirmed(true),
      recognitionRegime: confirmed('accrual'),
    },
    activities: [
      { activityId: 'A1', cnae: cnae('6201-5/01'), taxation: confirmed(options.taxation) },
    ],
    revenueHistory: options.revenueHistory ?? [],
    payrollHistory: options.payrollHistory ?? [],
    currentRevenue: options.currentRevenue,
    taxAmountRounding: TEST_ROUNDING,
    ...overrides,
  };
}
