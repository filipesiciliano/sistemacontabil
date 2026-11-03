import { placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, PLACEHOLDER_VALIDITY, TAX_RESPONSIBLES } from '../draft-defaults.js';

export const revenueLimitsV1: RuleDefinition<{
  readonly simplesNacionalLimit: Parameter<string>;
  /** Sublimit for ISS/ICMS (may vary per state/municipality). */
  readonly sublimit: Parameter<string>;
  readonly exceedingBehaviour: Parameter<string>;
}> = {
  id: 'simples-nacional.revenue-limits',
  version: 1,
  title: 'Revenue limit and sublimit',
  officialSource: placeholder(
    'PLACEHOLDER_REVENUE_LIMITS_SOURCE',
    'Legal provision for the annual limit, sublimit and the consequences of exceeding them.',
  ),
  validity: PLACEHOLDER_VALIDITY,
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description: 'Limit checks; exceeding situations lead to specialist review in the POC.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    simplesNacionalLimit: placeholder('PLACEHOLDER_SN_LIMIT', 'Annual revenue limit.'),
    sublimit: placeholder('PLACEHOLDER_SN_SUBLIMIT', 'Sublimit and how it applies per state.'),
    exceedingBehaviour: placeholder(
      'PLACEHOLDER_SN_EXCEEDING_BEHAVIOUR',
      'Effects of exceeding the limit/sublimit (and tolerance margins, if any).',
    ),
  },
};
