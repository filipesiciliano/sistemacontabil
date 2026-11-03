import { placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, PLACEHOLDER_VALIDITY, TAX_RESPONSIBLES } from '../draft-defaults.js';

export const factorRV1: RuleDefinition<{
  /** Fator R threshold as a fraction. */
  readonly threshold: Parameter<string>;
  /** Comparison operator applied to the threshold (e.g. "greater_or_equal"). */
  readonly comparison: Parameter<'greater_or_equal' | 'greater_than'>;
  /** Number of months that compose the payroll and revenue windows. */
  readonly windowMonths: Parameter<number>;
  /** Payroll components that enter the numerator (pró-labore, salaries, eligible charges...). */
  readonly payrollComponents: Parameter<readonly string[]>;
  /** How the windows behave for companies in their first months of activity. */
  readonly startOfActivityRule: Parameter<string>;
  /** Whether the ratio is rounded/truncated before comparison, and how. */
  readonly ratioRounding: Parameter<string>;
}> = {
  id: 'simples-nacional.factor-r',
  version: 1,
  title: 'Fator R: payroll-to-revenue ratio deciding between Annex III and Annex V',
  officialSource: placeholder(
    'PLACEHOLDER_FACTOR_R_SOURCE',
    'Legal provision defining Fator R, its components and threshold.',
  ),
  validity: PLACEHOLDER_VALIDITY,
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description: 'Service activities subject to Fator R.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    threshold: placeholder(
      'PLACEHOLDER_FACTOR_R_THRESHOLD',
      'Threshold value with official source.',
    ),
    comparison: placeholder(
      'PLACEHOLDER_FACTOR_R_COMPARISON',
      'Whether reaching exactly the threshold qualifies (reference cases at 27.99% and 28.00%).',
    ),
    windowMonths: placeholder('PLACEHOLDER_FACTOR_R_WINDOW', 'Length of the payroll window.'),
    payrollComponents: placeholder(
      'PLACEHOLDER_FACTOR_R_PAYROLL_COMPONENTS',
      'Exhaustive list of payroll items that compose the numerator.',
    ),
    startOfActivityRule: placeholder(
      'PLACEHOLDER_FACTOR_R_START_OF_ACTIVITY',
      'Treatment of Fator R in the first months of activity.',
    ),
    ratioRounding: placeholder(
      'PLACEHOLDER_FACTOR_R_RATIO_ROUNDING',
      'Precision/rounding used when comparing the ratio with the threshold.',
    ),
  },
};
