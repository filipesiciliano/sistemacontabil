import type { Competence } from '@platform/shared-types';
import { isPlaceholder } from '../rule/parameter.js';
import type { RuleDefinition } from '../rule/rule-definition.js';
import { isEffectiveAt } from '../rule/validity.js';

export type RuleSelection<TParameters> =
  | { readonly outcome: 'selected'; readonly rule: RuleDefinition<TParameters> }
  | { readonly outcome: 'not_found' }
  | {
      readonly outcome: 'not_approved';
      readonly candidates: readonly RuleDefinition<TParameters>[];
    }
  | { readonly outcome: 'ambiguous'; readonly candidates: readonly RuleDefinition<TParameters>[] };

/**
 * Selects the rule version effective at the competence being analysed. Only approved versions are
 * selectable; rules whose validity is still a placeholder are never selected.
 */
export function selectRuleVersion<TParameters>(
  versions: readonly RuleDefinition<TParameters>[],
  at: Competence,
): RuleSelection<TParameters> {
  const effective = versions.filter(
    (rule) => !isPlaceholder(rule.validity) && isEffectiveAt(rule.validity, at),
  );
  const approved = effective.filter((rule) => rule.approval.status === 'approved');

  const [single, ...others] = approved;
  if (single !== undefined && others.length === 0) return { outcome: 'selected', rule: single };
  if (approved.length > 1) return { outcome: 'ambiguous', candidates: approved };
  if (effective.length > 0) return { outcome: 'not_approved', candidates: effective };
  return { outcome: 'not_found' };
}
