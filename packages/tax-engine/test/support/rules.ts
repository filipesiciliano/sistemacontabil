import { competence } from '@platform/shared-types';
import { resolveTaxRuleSet, type TaxRuleSet } from '../../src/index.js';

/** Rules transcribed from the official sources, still draft (D25): resolved as "under review". */
export function draftRules(at = '2026-01'): TaxRuleSet {
  const resolution = resolveTaxRuleSet(competence(at), { allowUnapproved: true });
  if (resolution.status !== 'resolved') throw new Error(resolution.problems.join('; '));
  return resolution.rules;
}
