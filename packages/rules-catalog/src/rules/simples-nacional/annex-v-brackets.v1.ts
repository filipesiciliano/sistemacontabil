import { placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, PLACEHOLDER_VALIDITY, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { RevenueBracket } from './parameters/revenue-bracket.js';

export const annexVBracketsV1: RuleDefinition<{
  readonly brackets: Parameter<readonly RevenueBracket[]>;
}> = {
  id: 'simples-nacional.annex-v.brackets',
  version: 1,
  title: 'Annex V: brackets, nominal rates and deductions',
  officialSource: placeholder(
    'PLACEHOLDER_ANNEX_V_SOURCE',
    'Exact legal provision (law, annex and wording in force) provided by the tax responsibles.',
  ),
  validity: PLACEHOLDER_VALIDITY,
  scope: {
    regime: 'simples_nacional',
    annexes: ['V'],
    description:
      'Service activities taxed under Annex V, including Fator R activities below the threshold.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    brackets: placeholder(
      'PLACEHOLDER_ANNEX_V_BRACKETS',
      'Every bracket with RBT12 upper limit, nominal rate and deduction, with official source.',
    ),
  },
};
