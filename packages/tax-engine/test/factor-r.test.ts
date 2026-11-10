import { describe, expect, it } from 'vitest';
import { calculateAssessment } from '../src/index.js';
import { buildInput, entry, payrollFrom, revenueFrom } from './support/assessment-builder.js';
import { amount } from './support/data-points.js';
import { draftRules } from './support/rules.js';

const TWELVE_MONTHS_OF_100K = Array.from({ length: 12 }, () => 100);

function assessWithPayroll(
  payrollThousands: readonly number[],
  options: { activityStart?: string } = {},
) {
  return calculateAssessment(
    buildInput({
      competence: '2026-01',
      activityStart: options.activityStart ?? '2020-01',
      taxation: 'factor_r',
      revenueHistory: revenueFrom('2025-01', TWELVE_MONTHS_OF_100K),
      payrollHistory: payrollFrom('2025-01', payrollThousands),
      currentRevenue: [entry(amount('100000'))],
    }),
    draftRules(),
  );
}

describe('Fator R threshold and precision', () => {
  it('27.99% is truncated to 0.27 and goes to Annex V', () => {
    // 335,880 / 1,200,000 = 0.2799
    const result = assessWithPayroll([...Array.from({ length: 11 }, () => 28), 27.88]);
    expect(result.factorR?.ratio.toFixed()).toBe('0.2799');
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.27');
    expect(result.factorR?.annex).toBe('V');
  });

  it('exactly 28.00% goes to Annex III', () => {
    const result = assessWithPayroll(Array.from({ length: 12 }, () => 28));
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.28');
    expect(result.factorR?.annex).toBe('III');
  });

  it('zero payroll uses the fixed ratio 0.01', () => {
    const result = assessWithPayroll(Array.from({ length: 12 }, () => 0));
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.01');
    expect(result.factorR?.annex).toBe('V');
  });

  it('payroll without revenue uses the fixed ratio 0.28', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2026-01',
        activityStart: '2020-01',
        taxation: 'factor_r',
        revenueHistory: revenueFrom(
          '2025-01',
          Array.from({ length: 12 }, () => 0),
        ),
        payrollHistory: payrollFrom(
          '2025-01',
          Array.from({ length: 12 }, () => 5),
        ),
        currentRevenue: [entry(amount('1000'))],
      }),
      draftRules(),
    );
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.28');
    expect(result.factorR?.annex).toBe('III');
  });
});

describe('Fator R at the start of activity', () => {
  it('opening month uses payroll and revenue of the period itself', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2026-01',
        activityStart: '2026-01',
        taxation: 'factor_r',
        payrollHistory: payrollFrom('2026-01', [3]),
        currentRevenue: [entry(amount('10000'))],
      }),
      draftRules(),
    );
    expect(result.factorR?.method).toBe('opening_month');
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.3');
  });

  it('with less than 13 months, uses the sums since opening up to the previous month', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2026-04',
        activityStart: '2026-01',
        taxation: 'factor_r',
        revenueHistory: revenueFrom('2026-01', [10, 20, 30]),
        payrollHistory: payrollFrom('2026-01', [5, 5, 5]),
        currentRevenue: [entry(amount('40000'))],
      }),
      draftRules('2026-04'),
    );
    expect(result.factorR?.method).toBe('cumulative_since_opening');
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.25');
  });
});

describe('Fator R with missing payroll', () => {
  it('never treats missing payroll as zero: shows both annexes and does not conclude', () => {
    const payroll = payrollFrom(
      '2025-01',
      Array.from({ length: 12 }, () => 30),
    ).filter((month) => month.competence !== '2025-06');
    const result = calculateAssessment(
      buildInput({
        competence: '2026-01',
        activityStart: '2020-01',
        taxation: 'factor_r',
        revenueHistory: revenueFrom('2025-01', TWELVE_MONTHS_OF_100K),
        payrollHistory: payroll,
        currentRevenue: [entry(amount('100000'))],
      }),
      draftRules(),
    );
    expect(result.factorR).toBeUndefined();
    expect(result.coverage.missingInputs).toContain('payrollHistory 2025-06');
    const [first] = result.entries;
    expect(first?.outcome).toBe('annex_undetermined');
    if (first?.outcome === 'annex_undetermined') {
      expect(first.alternatives.map((alternative) => alternative.annex)).toEqual(['III', 'V']);
    }
    expect(result.conclusive).toBe(false);
  });
});
