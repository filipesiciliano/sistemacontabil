import { describe, expect, it } from 'vitest';
import { calculateAssessment } from '../src/index.js';
import { buildInput, entry, payrollFrom, revenueFrom } from './support/assessment-builder.js';
import { amount } from './support/data-points.js';
import { draftRules } from './support/rules.js';

describe('determinism', () => {
  it('the same input and rules always produce the same result and memory', () => {
    const input = buildInput({
      competence: '2026-01',
      activityStart: '2020-01',
      taxation: 'factor_r',
      revenueHistory: revenueFrom(
        '2025-01',
        Array.from({ length: 12 }, () => 80),
      ),
      payrollHistory: payrollFrom(
        '2025-01',
        Array.from({ length: 12 }, () => 25),
      ),
      currentRevenue: [entry(amount('80000'))],
    });
    const first = calculateAssessment(input, draftRules());
    const second = calculateAssessment(input, draftRules());
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.memory.steps.length).toBeGreaterThan(5);
  });
});
