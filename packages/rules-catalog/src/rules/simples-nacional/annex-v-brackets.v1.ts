import { competence } from '@platform/shared-types';
import { defined, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { RevenueBracket } from './parameters/revenue-bracket.js';
import { lc123AnnexSource } from './sources/lc-123-annex.js';

/** Transcribed from LC 123/2006, Annex V (D25). Stays draft until checked by the tax responsibles. */
export const annexVBracketsV1: RuleDefinition<{
  readonly brackets: Parameter<readonly RevenueBracket[]>;
}> = {
  id: 'simples-nacional.annex-v.brackets',
  version: 1,
  title: 'Annex V: brackets, nominal rates and deductions',
  officialSource: defined(lc123AnnexSource('V')),
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['V'],
    description:
      'Services listed in art. 18, § 5º-I, including Fator R activities below the threshold.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    brackets: defined([
      { order: 1, upperRbt12Limit: '180000', nominalRate: '0.155', deduction: '0' },
      { order: 2, upperRbt12Limit: '360000', nominalRate: '0.18', deduction: '4500' },
      { order: 3, upperRbt12Limit: '720000', nominalRate: '0.195', deduction: '9900' },
      { order: 4, upperRbt12Limit: '1800000', nominalRate: '0.205', deduction: '17100' },
      { order: 5, upperRbt12Limit: '3600000', nominalRate: '0.23', deduction: '62100' },
      { order: 6, upperRbt12Limit: '4800000', nominalRate: '0.305', deduction: '540000' },
    ]),
  },
};
