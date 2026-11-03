import { competence } from '@platform/shared-types';
import { describe, expect, it } from 'vitest';
import { placeholder, validateCatalog } from '../src/index.js';
import { approvedRule } from './rule-fixtures.js';

describe('validateCatalog', () => {
  it('accepts a fully documented approved rule', () => {
    expect(validateCatalog([approvedRule()])).toEqual([]);
  });

  it('rejects an approved rule that still holds placeholders', () => {
    const rule = approvedRule({ officialSource: placeholder('PLACEHOLDER_SRC', 'source') });
    expect(validateCatalog([rule]).map((v) => v.message)).toEqual([
      'approved rule still contains placeholders: PLACEHOLDER_SRC',
    ]);
  });

  it('requires approvers, approval date and reference cases for approved rules', () => {
    const rule = approvedRule({
      approval: { status: 'approved', approvedBy: [] },
      referenceCaseIds: [],
    });
    expect(validateCatalog([rule])).toHaveLength(3);
  });

  it('rejects duplicated versions and overlapping approved validities', () => {
    const a = approvedRule({ version: 1 });
    const b = approvedRule({ version: 2, validity: { from: competence('2024-01') } });
    const messages = validateCatalog([a, a, b]).map((v) => v.message);
    expect(messages).toContain('duplicated id and version');
    expect(messages).toContain('validity overlaps with test.rule@v1');
  });
});
