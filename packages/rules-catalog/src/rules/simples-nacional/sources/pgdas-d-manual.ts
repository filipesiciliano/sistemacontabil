import type { OfficialSource } from '../../../rule/official-source.js';

const PGDAS_D_MANUAL_URL =
  'https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/MANUAL_PGDAS-D_2018_V4.pdf';

/** Receita Federal's PGDAS-D manual (2018 v4, file last updated 2025-06-17). */
export function pgdasDManualSource(reference: string): OfficialSource {
  return {
    title: 'Manual do PGDAS-D e DEFIS (Receita Federal), 2018 v4',
    reference,
    url: PGDAS_D_MANUAL_URL,
  };
}
