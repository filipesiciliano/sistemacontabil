import { competence } from '@platform/shared-types';
import { defined, placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import { pgdasDManualSource } from './sources/pgdas-d-manual.js';

/**
 * Transcribed from the official PGDAS-D manual (D25). Stays `draft` until the tax responsibles
 * check the transcription. Starts at 2018-04 because the ratio was rounded, not truncated,
 * from 2018-01 to 2018-03.
 */
export const factorRV1: RuleDefinition<{
  /** Fator R threshold as a fraction. */
  readonly threshold: Parameter<string>;
  /** Comparison operator applied to the threshold. */
  readonly comparison: Parameter<'greater_or_equal' | 'greater_than'>;
  /** Number of months before the competence that compose the payroll and revenue windows. */
  readonly windowMonths: Parameter<number>;
  /** Payroll items that enter the numerator and the event that makes them count. */
  readonly payrollComponents: Parameter<readonly string[]>;
  /** How the ratio is computed for companies in their first months of activity. */
  readonly startOfActivityRule: Parameter<string>;
  /** Precision applied to the ratio before the comparison. */
  readonly ratioRounding: Parameter<{ readonly decimalPlaces: number; readonly mode: 'truncate' }>;
  /** Values assumed when payroll or revenue windows are zero. */
  readonly zeroBaseRules: Parameter<readonly string[]>;
  /** Whether export revenue enters the RBT12 used in the ratio. */
  readonly revenueIncludesExports: Parameter<boolean>;
}> = {
  id: 'simples-nacional.factor-r',
  version: 1,
  title: 'Fator R: payroll-to-revenue ratio deciding between Annex III and Annex V',
  officialSource: {
    kind: 'defined',
    value: pgdasDManualSource(
      'Section 8.2.1 (Resolução CGSN 140/2018, art. 26; LC 123/2006, art. 18, §§ 5º-J and 5º-M)',
    ),
  },
  validity: { from: competence('2018-04') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description:
      'Service activities subject to Fator R (Resolução CGSN 140/2018, art. 25, § 1º, V; list in PGDAS-D manual section 8).',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    threshold: defined('0.28'),
    comparison: defined('greater_or_equal'),
    windowMonths: defined(12),
    payrollComponents: placeholder(
      'PLACEHOLDER_FACTOR_R_PAYROLL_COMPONENTS',
      'CONFLICT (D25): the manual counts remuneration PAID in the 12 previous months (cash basis, GFIP/eSocial); stakeholders answered payroll competence (D12). Pending stakeholder review.',
    ),
    startOfActivityRule: defined(
      'Opening month: payroll of the period / revenue of the period. While fewer than 13 months have elapsed since opening: sum of payroll / sum of revenue from the opening month to the month before the period.',
    ),
    ratioRounding: defined({ decimalPlaces: 2, mode: 'truncate' }),
    zeroBaseRules: defined([
      'payroll = 0 and revenue = 0 -> 0.01',
      'payroll = 0 and revenue > 0 -> 0.01',
      'payroll > 0 and revenue = 0 -> 0.28',
    ]),
    revenueIncludesExports: defined(true),
  },
};
