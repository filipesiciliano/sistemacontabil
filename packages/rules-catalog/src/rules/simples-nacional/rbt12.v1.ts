import { competence } from '@platform/shared-types';
import { defined, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import { pgdasDManualSource } from './sources/pgdas-d-manual.js';

/** Transcribed from the official PGDAS-D manual (D25). Stays `draft` until checked by the tax responsibles. */
export const rbt12V1: RuleDefinition<{
  /** Number of months preceding the competence that compose the accumulated revenue. */
  readonly windowMonths: Parameter<number>;
  /** Proportionalization rule (RBT12p) for companies in their first 12 months of activity. */
  readonly startOfActivityRule: Parameter<string>;
  /** Effective rate formula, as published in the official manual. */
  readonly effectiveRateFormula: Parameter<string>;
  /** RBT12 value assumed in the effective rate formula when the accumulated revenue is zero. */
  readonly zeroRbt12Substitute: Parameter<string>;
}> = {
  id: 'simples-nacional.rbt12',
  version: 1,
  title: 'RBT12, start of activity and effective rate formula',
  officialSource: {
    kind: 'defined',
    value: pgdasDManualSource(
      'Sections 8.1 and 8.3 (LC 123/2006, art. 18, § 2º; Resolução CGSN 140/2018, art. 2º, IV and V)',
    ),
  },
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description: 'Accumulated revenue used to pick the bracket and compute the effective rate.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    windowMonths: defined(12),
    startOfActivityRule: defined(
      'First month of activity: revenue of the period x 12. Next 11 months: arithmetic mean of the revenue of the months before the period x 12. The activity start date is the opening date in the CNPJ registry.',
    ),
    effectiveRateFormula: defined(
      '((RBT12 x nominal rate of the bracket) - deduction of the bracket) / RBT12',
    ),
    zeroRbt12Substitute: defined('1'),
  },
};
