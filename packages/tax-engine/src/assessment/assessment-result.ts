import type { Competence, Money, Rate } from '@platform/shared-types';
import type { CoverageDiagnosis } from '../coverage/coverage-diagnosis.js';
import type { FactorRMethod } from '../factor-r/compute-factor-r.js';
import type { CalculationMemory } from '../memory/calculation-memory.js';
import type { Rbt12Method } from '../rbt12/compute-rbt12.js';
import type { ServiceAnnex } from '../rules/tax-rule-set.js';
import type { EntryResult } from './entry-result.js';

export interface AssessmentResult {
  readonly engineVersion: string;
  readonly competence: Competence;
  /** Exact rule versions used (stored in snapshots). */
  readonly ruleRefs: readonly string[];
  /** False when calculated with rules still under review (non-production only). */
  readonly rulesApproved: boolean;
  /** Coverage plus every required input still missing. */
  readonly coverage: CoverageDiagnosis;
  /** Inputs used while only informed, not confirmed. */
  readonly unconfirmedInputs: readonly string[];
  readonly rbt12?: { readonly value: Money; readonly method: Rbt12Method };
  readonly factorR?: {
    readonly ratio: Rate;
    readonly comparedRatio: Rate;
    readonly annex: ServiceAnnex;
    readonly method: FactorRMethod;
  };
  readonly entries: readonly EntryResult[];
  /** Sum of the calculated entries. Partial unless `principalComplete`. */
  readonly principal: Money;
  readonly principalComplete: boolean;
  /**
   * True only when coverage is `covered`, nothing is missing or unconfirmed, every entry was
   * calculated and every rule is approved. Otherwise the result is provisional.
   */
  readonly conclusive: boolean;
  readonly memory: CalculationMemory;
}
