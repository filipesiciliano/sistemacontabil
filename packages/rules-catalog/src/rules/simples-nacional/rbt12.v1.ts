import { placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, PLACEHOLDER_VALIDITY, TAX_RESPONSIBLES } from '../draft-defaults.js';

export const rbt12V1: RuleDefinition<{
  /** Number of months preceding the competence that compose the accumulated revenue. */
  readonly windowMonths: Parameter<number>;
  /** Proportionalization rule for companies in their first months of activity. */
  readonly startOfActivityRule: Parameter<string>;
  /** Effective rate formula, as published in the official manual. */
  readonly effectiveRateFormula: Parameter<string>;
}> = {
  id: 'simples-nacional.rbt12',
  version: 1,
  title: 'RBT12, start of activity and effective rate formula',
  officialSource: placeholder(
    'PLACEHOLDER_RBT12_SOURCE',
    'Legal provision and PGDAS-D manual section for RBT12, start of activity and effective rate.',
  ),
  validity: PLACEHOLDER_VALIDITY,
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description: 'Accumulated revenue used to pick the bracket and compute the effective rate.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    windowMonths: placeholder('PLACEHOLDER_RBT12_WINDOW', 'Length of the RBT12 window.'),
    startOfActivityRule: placeholder(
      'PLACEHOLDER_RBT12_START_OF_ACTIVITY',
      'Proportionalization rule for the first months of activity, with examples.',
    ),
    effectiveRateFormula: placeholder(
      'PLACEHOLDER_EFFECTIVE_RATE_FORMULA',
      'Formula transcribed from the official manual, with its rounding.',
    ),
  },
};
