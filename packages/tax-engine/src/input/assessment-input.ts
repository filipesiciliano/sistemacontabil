import type { Cnae, Competence, DataPoint, Money, RoundingPolicy } from '@platform/shared-types';
import type { ActivityTaxation } from './activity-taxation.js';

export interface ActivityInput {
  readonly activityId: string;
  readonly cnae: Cnae;
  readonly taxation: DataPoint<ActivityTaxation>;
}

/** Specific treatments of a revenue entry. Every flag outside the POC scope affects coverage. */
export interface RevenueTreatments {
  readonly export: boolean;
  readonly issWithheld: boolean;
  readonly taxSubstitution: boolean;
  readonly monophasic: boolean;
  /** ISS due to the municipality where the service is provided (LC 116/2003, art. 3º exceptions). */
  readonly issDueOutsideEstablishment: boolean;
}

export interface MonthlyRevenue {
  readonly competence: Competence;
  readonly establishmentId: string;
  readonly amount: DataPoint<Money>;
}

/** Payroll of a month as it counts for Fator R (the counting basis is decided upstream, see D25). */
export interface MonthlyPayroll {
  readonly competence: Competence;
  readonly amount: DataPoint<Money>;
}

export interface CurrentRevenueEntry {
  readonly entryId: string;
  readonly establishmentId: string;
  readonly activityId: string;
  readonly amount: DataPoint<Money>;
  readonly treatments: RevenueTreatments;
}

export interface AssessmentInput {
  readonly competence: Competence;
  readonly company: {
    /** Month of the opening date in the CNPJ registry. */
    readonly activityStart: DataPoint<Competence>;
    readonly simplesNacionalOptant: DataPoint<boolean>;
    readonly recognitionRegime: DataPoint<'accrual' | 'cash'>;
  };
  readonly activities: readonly ActivityInput[];
  /** Gross revenue (internal and external market) of previous months, per establishment. */
  readonly revenueHistory: readonly MonthlyRevenue[];
  /** Payroll of previous months and of the competence itself (needed in the opening month). */
  readonly payrollHistory: readonly MonthlyPayroll[];
  /** Revenue of the competence, segregated by establishment, activity and treatment. */
  readonly currentRevenue: readonly CurrentRevenueEntry[];
  /** Rounding of each tax amount. Pending agreement with the stakeholders (D15). */
  readonly taxAmountRounding: RoundingPolicy;
}
