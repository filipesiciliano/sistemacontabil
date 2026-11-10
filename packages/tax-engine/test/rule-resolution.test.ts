import { competence } from '@platform/shared-types';
import { describe, expect, it } from 'vitest';
import { resolveTaxRuleSet } from '../src/index.js';

describe('resolveTaxRuleSet', () => {
  it('refuses draft rules by default (production behaviour)', () => {
    const resolution = resolveTaxRuleSet(competence('2026-01'));
    expect(resolution.status).toBe('unresolved');
  });

  it('accepts draft rules only when explicitly allowed, flagging them as under review', () => {
    const resolution = resolveTaxRuleSet(competence('2026-01'), { allowUnapproved: true });
    expect(resolution.status).toBe('resolved');
    if (resolution.status === 'resolved') {
      expect(resolution.rules.allApproved).toBe(false);
      expect(resolution.rules.factorR?.ruleRef).toBe('simples-nacional.factor-r@v1');
    }
  });

  it('has no Fator R version before 2018-04 (the ratio was rounded, not truncated)', () => {
    const resolution = resolveTaxRuleSet(competence('2018-03'), { allowUnapproved: true });
    expect(resolution.status === 'resolved' && resolution.rules.factorR).toBeUndefined();
  });

  it('has no version at all before the 2018 tables', () => {
    expect(resolveTaxRuleSet(competence('2017-12'), { allowUnapproved: true }).status).toBe(
      'unresolved',
    );
  });
});
