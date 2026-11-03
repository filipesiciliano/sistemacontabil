import { describe, expect, it } from 'vitest';
import { collectPlaceholderKeys, RULE_CATALOG, validateCatalog } from '../src/index.js';

describe('RULE_CATALOG governance', () => {
  it('has no governance violations', () => {
    expect(validateCatalog(RULE_CATALOG)).toEqual([]);
  });

  it('keeps every not-yet-sourced rule as draft (values come from the tax responsibles)', () => {
    for (const rule of RULE_CATALOG) {
      if (collectPlaceholderKeys(rule).length > 0) {
        expect(rule.approval.status, rule.id).not.toBe('approved');
      }
    }
  });
});
