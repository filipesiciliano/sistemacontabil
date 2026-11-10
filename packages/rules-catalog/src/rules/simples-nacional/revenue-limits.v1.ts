import { competence } from '@platform/shared-types';
import { defined, placeholder, type Parameter } from '../../rule/parameter.js';
import type { RuleDefinition } from '../../rule/rule-definition.js';
import { DRAFT_APPROVAL, TAX_RESPONSIBLES } from '../draft-defaults.js';
import { pgdasDManualSource } from './sources/pgdas-d-manual.js';

/** Transcribed from the PGDAS-D manual (D25). Stays draft until checked by the tax responsibles. */
export const revenueLimitsV1: RuleDefinition<{
  /** Annual gross revenue limit to remain in the Simples Nacional. */
  readonly simplesNacionalLimit: Parameter<string>;
  /** Mandatory ISS/ICMS sublimit (states with GDP share of 1% or more, or that did not opt). */
  readonly sublimit: Parameter<string>;
  /** Optional lower sublimit some states may adopt, and which states adopted it each year. */
  readonly stateOptionalSublimit: Parameter<{
    readonly amount: string;
    readonly statesByYear: Readonly<Record<string, readonly string[]>>;
  }>;
  /** Revenue measured against the sublimit: previous calendar year (RBAA) or current year to date including the period (RBA). */
  readonly sublimitMeasure: Parameter<'previous_year_or_current_year_to_date'>;
  /** Effects of exceeding the limit or sublimit, including tolerance margins. */
  readonly exceedingBehaviour: Parameter<string>;
}> = {
  id: 'simples-nacional.revenue-limits',
  version: 1,
  title: 'Revenue limit and sublimit',
  officialSource: defined(
    pgdasDManualSource('Glossary (EPP definition) and section 8.4 (LC 123/2006, arts. 3º and 19)'),
  ),
  validity: { from: competence('2018-01') },
  scope: {
    regime: 'simples_nacional',
    annexes: ['III', 'V'],
    description: 'Limit checks; exceeding situations lead to specialist review in the POC.',
  },
  owner: TAX_RESPONSIBLES,
  referenceCaseIds: [],
  approval: DRAFT_APPROVAL,
  parameters: {
    simplesNacionalLimit: defined('4800000'),
    sublimit: defined('3600000'),
    stateOptionalSublimit: placeholder(
      'PLACEHOLDER_SN_STATE_OPTIONAL_SUBLIMIT',
      'Optional sublimit of R$ 1,800,000.00 (manual 8.4) and the states adopting it each year (Anexo XII of Resolução CGSN 140/2018 until 2020; Portaria CGSN afterwards).',
    ),
    sublimitMeasure: defined('previous_year_or_current_year_to_date'),
    exceedingBehaviour: placeholder(
      'PLACEHOLDER_SN_EXCEEDING_BEHAVIOUR',
      'Effects of exceeding the limit/sublimit (and tolerance margins, if any).',
    ),
  },
};
