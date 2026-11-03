import { compareCompetences, type Competence } from '@platform/shared-types';
import type { Placeholder } from './parameter.js';

/** Inclusive range of competences in which a rule version applies. `to` absent = still in force. */
export interface Validity {
  readonly from: Competence;
  readonly to?: Competence;
}

export type RuleValidity = Validity | Placeholder;

export function isEffectiveAt(validity: Validity, at: Competence): boolean {
  const startsBefore = compareCompetences(validity.from, at) <= 0;
  const endsAfter = validity.to === undefined || compareCompetences(at, validity.to) <= 0;
  return startsBefore && endsAfter;
}

export function validitiesOverlap(a: Validity, b: Validity): boolean {
  const aEndsBeforeB = a.to !== undefined && compareCompetences(a.to, b.from) < 0;
  const bEndsBeforeA = b.to !== undefined && compareCompetences(b.to, a.from) < 0;
  return !aEndsBeforeB && !bEndsBeforeA;
}
