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

export interface RuleSelectionOptions {
  /**
   * Also select draft or in-review versions when no approved one is effective. Only for
   * non-production environments (POC/staging): results must be flagged as "rules under review".
   */
  readonly allowUnapproved?: boolean;
}

/**
 * Selects the rule version effective at the competence being analysed. By default only approved
 * versions are selectable; retired versions and placeholder validities are never selected.
 */
export function selectRuleVersion<TParameters>(
  versions: readonly RuleDefinition<TParameters>[],
  at: Competence,
  options: RuleSelectionOptions = {},
): RuleSelection<TParameters> {
  const effective = versions.filter(
    (rule) =>
      rule.approval.status !== 'retired' &&
      !isPlaceholder(rule.validity) &&
      isEffectiveAt(rule.validity, at),
  );
  const approved = effective.filter((rule) => rule.approval.status === 'approved');
  const selectable =
    approved.length === 0 && options.allowUnapproved === true ? effective : approved;

  const [single, ...others] = selectable;
  if (single !== undefined && others.length === 0) return { outcome: 'selected', rule: single };
  if (selectable.length > 1) return { outcome: 'ambiguous', candidates: selectable };
  if (effective.length > 0) return { outcome: 'not_approved', candidates: effective };
  return { outcome: 'not_found' };
}
