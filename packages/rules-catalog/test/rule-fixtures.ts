import { competence } from '@platform/shared-types';
import { defined, type RuleDefinition } from '../src/index.js';

export function approvedRule(
  overrides: Partial<RuleDefinition<{ value: string }>> = {},
): RuleDefinition<{ value: string }> {
  return {
    id: 'test.rule',
    version: 1,
    title: 'Test rule',
    officialSource: defined({ title: 'Test source', reference: 'Art. 1' }),
    validity: { from: competence('2020-01') },
    scope: { regime: 'simples_nacional', annexes: ['III'], description: 'test' },
    owner: 'tax-responsibles',
    referenceCaseIds: ['RC-TEST'],
    approval: { status: 'approved', approvedBy: ['reviewer'], approvedAt: '2026-01-01' },
    parameters: { value: '1' },
    ...overrides,
  };
}
