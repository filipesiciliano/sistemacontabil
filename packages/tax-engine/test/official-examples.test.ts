import { describe, expect, it } from 'vitest';
import { calculateAssessment, type AnnexCalculation, type EntryResult } from '../src/index.js';
import { buildInput, entry, payrollFrom, revenueFrom } from './support/assessment-builder.js';
import { amount } from './support/data-points.js';
import { draftRules } from './support/rules.js';

/**
 * Worked examples published in the PGDAS-D manual (Receita Federal, 2018 v4), section 8.
 * They are the first answer key of the engine until the stakeholders' reference cases arrive.
 */

function calculationOf(result: EntryResult | undefined): AnnexCalculation {
  if (result?.outcome !== 'calculated')
    throw new Error(`Entry not calculated: ${JSON.stringify(result)}`);
  return result.calculation;
}

function amounts(calculation: AnnexCalculation): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(calculation.taxAmounts).map(([tax, value]) => [tax, value.toFixed(2)]),
  );
}

// Jul/2017 to Jun/2018, in thousands of BRL (manual examples 4 and 5).
const REVENUE_2017_07 = [10, 30, 25, 35, 40, 60, 50, 60, 40, 50, 50, 50];

describe('PGDAS-D manual, example 4 (Fator R 0.50, Annex III)', () => {
  const result = calculateAssessment(
    buildInput({
      competence: '2018-07',
      activityStart: '2009-01',
      taxation: 'factor_r',
      revenueHistory: revenueFrom('2017-07', REVENUE_2017_07),
      payrollHistory: payrollFrom('2017-07', [15, 15, 15, 15, 15, 30, 15, 15, 15, 30, 35, 35]),
      currentRevenue: [entry(amount('10000'))],
    }),
    draftRules('2018-07'),
  );

  it('computes RBT12 and Fator R as in the manual', () => {
    expect(result.rbt12?.value.toFixed()).toBe('500000');
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.5');
    expect(result.factorR?.annex).toBe('III');
  });

  it('reproduces the effective rate and the amount of each tax', () => {
    const calculation = calculationOf(result.entries[0]);
    expect(calculation.bracketOrder).toBe(3);
    expect(calculation.effectiveRate.toFixed()).toBe('0.09972');
    expect(amounts(calculation)).toEqual({
      IRPJ: '39.89',
      CSLL: '34.90',
      COFINS: '136.02',
      PIS_PASEP: '29.52',
      CPP: '432.78',
      ISS: '324.09',
    });
    expect(calculation.total.toFixed(2)).toBe('997.20');
  });

  it('does not conclude: January to June 2017 (needed for the sublimit check) were not provided', () => {
    expect(result.conclusive).toBe(false);
    expect(result.coverage.missingInputs).toContain('revenueHistory 2017-01');
  });
});

describe('PGDAS-D manual, example 5 (Fator R 0.20, Annex V)', () => {
  const result = calculateAssessment(
    buildInput({
      competence: '2018-07',
      activityStart: '2009-01',
      taxation: 'factor_r',
      revenueHistory: revenueFrom('2017-07', REVENUE_2017_07),
      payrollHistory: payrollFrom('2017-07', [10, 10, 10, 10, 10, 5, 10, 10, 10, 5, 5, 5]),
      currentRevenue: [entry(amount('10000'))],
    }),
    draftRules('2018-07'),
  );

  it('selects Annex V', () => {
    expect(result.factorR?.comparedRatio.toFixed()).toBe('0.2');
    expect(result.factorR?.annex).toBe('V');
  });

  it('reproduces the effective rate and the amount of each tax', () => {
    const calculation = calculationOf(result.entries[0]);
    expect(calculation.effectiveRate.toFixed()).toBe('0.1752');
    expect(amounts(calculation)).toEqual({
      IRPJ: '420.48',
      CSLL: '262.80',
      COFINS: '261.40',
      PIS_PASEP: '56.59',
      CPP: '417.85',
      ISS: '332.88',
    });
    expect(calculation.total.toFixed(2)).toBe('1752.00');
  });
});

describe('PGDAS-D manual, section 8.3 (start of activity, opened in Feb/2018)', () => {
  it('first month: RBT12p = period revenue x 12', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2018-02',
        activityStart: '2018-02',
        taxation: 'annex_iii',
        currentRevenue: [entry(amount('10000'))],
      }),
      draftRules('2018-02'),
    );
    expect(result.rbt12?.method).toBe('start_of_activity_first_month');
    expect(result.rbt12?.value.toFixed()).toBe('120000');
  });

  it('fourth month: RBT12p = average of the previous months x 12, including a month without revenue', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2018-05',
        activityStart: '2018-02',
        taxation: 'annex_iii',
        revenueHistory: revenueFrom('2018-02', [10, 0, 590]),
        currentRevenue: [entry(amount('50000'))],
      }),
      draftRules('2018-05'),
    );
    expect(result.rbt12?.value.toFixed()).toBe('2400000');
    expect(calculationOf(result.entries[0]).bracketOrder).toBe(5);
  });
});
