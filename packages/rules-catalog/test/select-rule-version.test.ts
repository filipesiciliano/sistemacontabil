import { competence } from '@platform/shared-types';
import { describe, expect, it } from 'vitest';
import { placeholder, selectRuleVersion } from '../src/index.js';
import { approvedRule } from './rule-fixtures.js';

describe('selectRuleVersion', () => {
  const v1 = approvedRule({
    version: 1,
    validity: { from: competence('2020-01'), to: competence('2026-12') },
  });
  const v2 = approvedRule({ version: 2, validity: { from: competence('2027-01') } });

  it('selects the version effective at the competence', () => {
    const before = selectRuleVersion([v1, v2], competence('2026-12'));
    const after = selectRuleVersion([v1, v2], competence('2027-01'));
    expect(before.outcome === 'selected' && before.rule.version).toBe(1);
    expect(after.outcome === 'selected' && after.rule.version).toBe(2);
  });

  it('reports competences outside every validity', () => {
    expect(selectRuleVersion([v1, v2], competence('2019-12')).outcome).toBe('not_found');
  });

  it('never selects an unapproved version', () => {
    const draft = approvedRule({ approval: { status: 'draft', approvedBy: [] } });
    expect(selectRuleVersion([draft], competence('2025-01')).outcome).toBe('not_approved');
  });

  it('never selects a rule whose validity is a placeholder', () => {
    const pending = approvedRule({ validity: placeholder('PLACEHOLDER_X', 'x') });
    expect(selectRuleVersion([pending], competence('2025-01')).outcome).toBe('not_found');
  });

  it('flags overlapping approved versions as ambiguous', () => {
    const overlapping = approvedRule({ version: 3, validity: { from: competence('2026-06') } });
    expect(selectRuleVersion([v1, overlapping], competence('2026-07')).outcome).toBe('ambiguous');
  });
});
