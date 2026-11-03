import type { Competence } from '@platform/shared-types';
import type { CoverageDiagnosis } from '../coverage/coverage-diagnosis.js';
import type { CalculationMemory } from '../memory/calculation-memory.js';

/**
 * Immutable record of a calculation: inputs, rule versions and step-by-step memory.
 * Persisted as-is; changing rules never rewrites a snapshot (historical analyses are preserved).
 * The engine is pure, so identifiers and timestamps are supplied by the caller.
 */
export interface CalculationSnapshot<TInputs, TResult> {
  readonly snapshotId: string;
  readonly computedAt: string;
  readonly competence: Competence;
  readonly engineVersion: string;
  readonly ruleVersions: readonly string[];
  readonly inputs: TInputs;
  readonly coverage: CoverageDiagnosis;
  readonly memory: CalculationMemory;
  readonly result: TResult;
}
