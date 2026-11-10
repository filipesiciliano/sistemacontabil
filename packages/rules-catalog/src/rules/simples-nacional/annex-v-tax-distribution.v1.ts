import { competence } from '@platform/shared-types';
import { defined, placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { BracketTaxShares } from './parameters/tax-share.js';
import { lc123AnnexSource } from './sources/lc-123-annex.js';

/** Transcribed from LC 123/2006, Annex V (D25). Stays draft until checked by the tax responsibles. */
export const annexVTaxDistributionV1: RuleDefinition<{
  readonly distribution: Parameter<readonly BracketTaxShares[]>;
  readonly issCapRule: Parameter<string>;
}> = {
  id: 'simples-nacional.annex-v.tax-distribution',
  version: 1,
  title: 'Annex V: distribution of the effective rate among taxes',
  officialSource: defined(lc123AnnexSource('V')),
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['V'],
    description: 'Tax distribution for Annex V revenue.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    distribution: defined([
      {
        bracketOrder: 1,
        shares: {
          IRPJ: '0.25',
          CSLL: '0.15',
          COFINS: '0.141',
          PIS_PASEP: '0.0305',
          CPP: '0.2885',
          ISS: '0.14',
        },
      },
      {
        bracketOrder: 2,
        shares: {
          IRPJ: '0.23',
          CSLL: '0.15',
          COFINS: '0.141',
          PIS_PASEP: '0.0305',
          CPP: '0.2785',
          ISS: '0.17',
        },
      },
      {
        bracketOrder: 3,
        shares: {
          IRPJ: '0.24',
          CSLL: '0.15',
          COFINS: '0.1492',
          PIS_PASEP: '0.0323',
          CPP: '0.2385',
          ISS: '0.19',
        },
      },
      {
        bracketOrder: 4,
        shares: {
          IRPJ: '0.21',
          CSLL: '0.15',
          COFINS: '0.1574',
          PIS_PASEP: '0.0341',
          CPP: '0.2385',
          ISS: '0.21',
        },
      },
      {
        bracketOrder: 5,
        shares: {
          IRPJ: '0.23',
          CSLL: '0.125',
          COFINS: '0.141',
          PIS_PASEP: '0.0305',
          CPP: '0.2385',
          ISS: '0.235',
        },
      },
      {
        bracketOrder: 6,
        shares: {
          IRPJ: '0.35',
          CSLL: '0.155',
          COFINS: '0.1644',
          PIS_PASEP: '0.0356',
          CPP: '0.295',
        },
      },
    ]),
    issCapRule: placeholder(
      'PLACEHOLDER_ANNEX_V_ISS_CAP_RULE',
      'The Annex V text has no ISS cap footnote, while PGDAS-D manual section 8.1 states a general 5% cap. Stakeholders to confirm whether it applies to Annex V.',
    ),
  },
};
