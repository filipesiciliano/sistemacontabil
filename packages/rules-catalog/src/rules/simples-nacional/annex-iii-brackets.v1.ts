import { competence } from '@platform/shared-types';
import { defined, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { RevenueBracket } from './parameters/revenue-bracket.js';
import { lc123AnnexSource } from './sources/lc-123-annex.js';

/** Transcribed from LC 123/2006, Annex III (D25). Stays draft until checked by the tax responsibles. */
export const annexIiiBracketsV1: RuleDefinition<{
  readonly brackets: Parameter<readonly RevenueBracket[]>;
}> = {
  id: 'simples-nacional.annex-iii.brackets',
  version: 1,
  title: 'Annex III: brackets, nominal rates and deductions',
  officialSource: defined(lc123AnnexSource('III')),
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['III'],
    description:
      'Rental of movable property and services not listed in art. 18, § 5º-C, including Fator R activities at or above the threshold.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    brackets: defined([
      { order: 1, upperRbt12Limit: '180000', nominalRate: '0.06', deduction: '0' },
      { order: 2, upperRbt12Limit: '360000', nominalRate: '0.112', deduction: '9360' },
      { order: 3, upperRbt12Limit: '720000', nominalRate: '0.135', deduction: '17640' },
      { order: 4, upperRbt12Limit: '1800000', nominalRate: '0.16', deduction: '35640' },
      { order: 5, upperRbt12Limit: '3600000', nominalRate: '0.21', deduction: '125640' },
      { order: 6, upperRbt12Limit: '4800000', nominalRate: '0.33', deduction: '648000' },
    ]),
  },
};
