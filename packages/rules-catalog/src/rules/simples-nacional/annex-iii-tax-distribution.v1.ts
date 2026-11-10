import { competence } from '@platform/shared-types';
import { defined, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import type { IssCapRedistribution } from './parameters/iss-cap-redistribution.js';
import type { BracketTaxShares } from './parameters/tax-share.js';
import { lc123AnnexSource } from './sources/lc-123-annex.js';

/** Transcribed from LC 123/2006, Annex III, including its ISS footnote (D25). Stays draft. */
export const annexIiiTaxDistributionV1: RuleDefinition<{
  readonly distribution: Parameter<readonly BracketTaxShares[]>;
  readonly issCap: Parameter<IssCapRedistribution>;
}> = {
  id: 'simples-nacional.annex-iii.tax-distribution',
  version: 1,
  title: 'Annex III: distribution of the effective rate among taxes',
  officialSource: defined(lc123AnnexSource('III')),
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['III'],
    description: 'Tax distribution for Annex III revenue.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    distribution: defined([
      {
        bracketOrder: 1,
        shares: {
          IRPJ: '0.04',
          CSLL: '0.035',
          COFINS: '0.1282',
          PIS_PASEP: '0.0278',
          CPP: '0.434',
          ISS: '0.335',
        },
      },
      {
        bracketOrder: 2,
        shares: {
          IRPJ: '0.04',
          CSLL: '0.035',
          COFINS: '0.1405',
          PIS_PASEP: '0.0305',
          CPP: '0.434',
          ISS: '0.32',
        },
      },
      {
        bracketOrder: 3,
        shares: {
          IRPJ: '0.04',
          CSLL: '0.035',
          COFINS: '0.1364',
          PIS_PASEP: '0.0296',
          CPP: '0.434',
          ISS: '0.325',
        },
      },
      {
        bracketOrder: 4,
        shares: {
          IRPJ: '0.04',
          CSLL: '0.035',
          COFINS: '0.1364',
          PIS_PASEP: '0.0296',
          CPP: '0.434',
          ISS: '0.325',
        },
      },
      {
        bracketOrder: 5,
        shares: {
          IRPJ: '0.04',
          CSLL: '0.035',
          COFINS: '0.1282',
          PIS_PASEP: '0.0278',
          CPP: '0.434',
          ISS: '0.335',
        },
      },
      {
        bracketOrder: 6,
        shares: { IRPJ: '0.35', CSLL: '0.15', COFINS: '0.1603', PIS_PASEP: '0.0347', CPP: '0.305' },
      },
    ]),
    issCap: defined({
      maxEffectiveIssRate: '0.05',
      brackets: [
        {
          bracketOrder: 5,
          appliesAboveEffectiveRate: '0.1492537',
          sharesOfRateAboveIss: {
            IRPJ: '0.0602',
            CSLL: '0.0526',
            COFINS: '0.1928',
            PIS_PASEP: '0.0418',
            CPP: '0.6526',
          },
        },
      ],
    }),
  },
};
