import { placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, PLACEHOLDER_VALIDITY, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { BracketTaxShares } from './parameters/tax-share.js';

export const annexIiiTaxDistributionV1: RuleDefinition<{
  readonly distribution: Parameter<readonly BracketTaxShares[]>;
  readonly issCapRule: Parameter<string>;
}> = {
  id: 'simples-nacional.annex-iii.tax-distribution',
  version: 1,
  title: 'Annex III: distribution of the effective rate among taxes',
  officialSource: placeholder(
    'PLACEHOLDER_ANNEX_III_DISTRIBUTION_SOURCE',
    'Legal provision for the distribution table and for any ISS cap/redistribution rule.',
  ),
  validity: PLACEHOLDER_VALIDITY,
  scope: {
    regime: 'simples_nacional',
    annexes: ['III'],
    description: 'Tax distribution for Annex III revenue.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    distribution: placeholder(
      'PLACEHOLDER_ANNEX_III_DISTRIBUTION',
      'Share of each tax per bracket, with official source.',
    ),
    issCapRule: placeholder(
      'PLACEHOLDER_ANNEX_III_ISS_CAP_RULE',
      'Whether and how the ISS share is capped and redistributed, with official source.',
    ),
  },
};
