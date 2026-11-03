import { COVERAGE_STATUSES } from '@platform/shared-types';
import { describe, expect, it } from 'vitest';
import { ptBR } from '../src/i18n/pt-br.js';

describe('pt-BR dictionary', () => {
  it('has a label for every coverage status', () => {
    for (const status of COVERAGE_STATUSES) {
      expect(ptBR.coverage[status]).toBeTruthy();
    }
  });
});
