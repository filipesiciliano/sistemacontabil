import { describe, expect, it } from 'vitest';
import { calculateAssessment, sumRates, computeTaxRates } from '../src/index.js';
import { Decimal } from '@platform/shared-types';
import { buildInput, entry, revenueFrom } from './support/assessment-builder.js';
import { amount } from './support/data-points.js';
import { draftRules } from './support/rules.js';

describe('Annex III ISS cap (5th bracket footnote)', () => {
  const rules = draftRules();
  const annexIii = rules.annexes.III;

  it('keeps the regular shares at or below the cap threshold', () => {
    const rates = computeTaxRates(annexIii, 5, new Decimal('0.1492537'));
    expect(rates?.issCapApplied).toBe(false);
  });

  it('fixes ISS at 5% and redistributes the rest above the threshold', () => {
    const effectiveRate = new Decimal('0.18');
    const rates = computeTaxRates(annexIii, 5, effectiveRate);
    expect(rates?.issCapApplied).toBe(true);
    expect(rates?.rates.ISS?.toFixed()).toBe('0.05');
    expect(rates?.rates.IRPJ?.toFixed()).toBe(new Decimal('0.13').times('0.0602').toFixed());
    expect(rates && sumRates(rates.rates).toFixed()).toBe('0.18');
  });

  it('applies the cap in a full assessment with RBT12 in the 5th bracket', () => {
    // RBT12 = 3,500,000: effective rate = (3,500,000 x 21% - 125,640) / 3,500,000 = 17.41%
    const result = calculateAssessment(
      buildInput({
        competence: '2026-01',
        activityStart: '2020-01',
        taxation: 'annex_iii',
        revenueHistory: revenueFrom('2025-01', [...Array.from({ length: 11 }, () => 290), 310]),
        currentRevenue: [entry(amount('100000'))],
      }),
      rules,
    );
    const [first] = result.entries;
    expect(first?.outcome).toBe('calculated');
    if (first?.outcome !== 'calculated') return;
    expect(first.calculation.bracketOrder).toBe(5);
    expect(first.calculation.issCapApplied).toBe(true);
    expect(first.calculation.taxAmounts.ISS?.toFixed(2)).toBe('5000.00');
  });
});
