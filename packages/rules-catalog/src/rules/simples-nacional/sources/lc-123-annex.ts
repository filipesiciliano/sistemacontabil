import type { OfficialSource } from '../../../rule/official-source.js';

const LC_123_URL = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm';

/**
 * Annex of LC 123/2006 as worded by LC 155/2016 (in force since 2018-01-01). The text was copied
 * from the Planalto website by the product owner, because the site refuses automated access (D25).
 */
export function lc123AnnexSource(annex: 'III' | 'V'): OfficialSource {
  return {
    title: 'Lei Complementar nº 123/2006 (wording by LC nº 155/2016)',
    reference: `Annex ${annex}`,
    url: LC_123_URL,
  };
}
