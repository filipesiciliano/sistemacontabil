import type { Decimal } from '@platform/shared-types';
import type { AnnexTables } from './annex-tables.js';

export type ServiceAnnex = 'III' | 'V';

export type RuleRole =
  | 'rbt12'
  | 'revenueLimits'
  | 'factorR'
  | 'annexIiiBrackets'
  | 'annexIiiTaxDistribution'
  | 'annexVBrackets'
  | 'annexVTaxDistribution';

/** Every rule parameter the engine needs for one competence, resolved and converted to Decimal. */
export interface TaxRuleSet {
  /** Exact rule versions used, e.g. "simples-nacional.rbt12@v1" (stored in snapshots). */
  readonly ruleRefs: Readonly<Record<Exclude<RuleRole, 'factorR'>, string>>;
  /** False when any selected version is not approved ("rules under review"). */
  readonly allApproved: boolean;
  readonly rbt12: {
    readonly windowMonths: number;
    readonly annualizationFactor: Decimal;
    readonly zeroRbt12Substitute: Decimal;
  };
  readonly limits: {
    readonly simplesNacionalLimit: Decimal;
    readonly sublimit: Decimal;
  };
  /** Absent when no version is effective at the competence (e.g. before 2018-04). */
  readonly factorR?: {
    readonly ruleRef: string;
    readonly threshold: Decimal;
    readonly windowMonths: number;
    readonly decimalPlaces: number;
    readonly noPayroll: Decimal;
    readonly payrollWithoutRevenue: Decimal;
  };
  readonly annexes: Readonly<Record<ServiceAnnex, AnnexTables>>;
}
