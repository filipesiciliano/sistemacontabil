import {
  addMonths,
  applyRounding,
  competenceRange,
  monthsBetween,
  type Competence,
  type Decimal,
} from '@platform/shared-types';
import type { MemoryRecorder } from '../memory/memory-recorder.js';
import type { MonthlySeries } from '../revenue/monthly-series.js';
import { sumMonths, type MonthsSum } from '../revenue/sum-months.js';
import type { ServiceAnnex, TaxRuleSet } from '../rules/tax-rule-set.js';

export type FactorRMethod = 'regular' | 'opening_month' | 'cumulative_since_opening';

export type FactorRResult =
  | {
      readonly state: 'computed';
      readonly payroll: Decimal;
      readonly revenue: Decimal;
      /** Ratio before the precision rule (or the value set by a zero-base rule). */
      readonly ratio: Decimal;
      /** Ratio compared with the threshold (truncated to the rule's decimal places). */
      readonly comparedRatio: Decimal;
      readonly annex: ServiceAnnex;
      readonly method: FactorRMethod;
      readonly unconfirmedInputs: readonly string[];
    }
  | { readonly state: 'missing'; readonly missingInputs: readonly string[] };

export interface FactorRInput {
  readonly competence: Competence;
  readonly activityStart: Competence;
  readonly revenueHistory: MonthlySeries;
  readonly payrollHistory: MonthlySeries;
  /** Revenue of the competence itself; only used in the opening month. */
  readonly currentRevenue: MonthsSum;
}

interface Bases {
  readonly method: FactorRMethod;
  readonly payroll: MonthsSum;
  readonly revenue: MonthsSum;
}

function basesFor(input: FactorRInput, windowMonths: number): Bases | undefined {
  const elapsed = monthsBetween(input.activityStart, input.competence);
  if (elapsed < 0) return undefined;
  if (elapsed === 0) {
    return {
      method: 'opening_month',
      payroll: sumMonths(input.payrollHistory, [input.competence]),
      revenue: input.currentRevenue,
    };
  }
  const previous = addMonths(input.competence, -1);
  const months =
    elapsed <= windowMonths
      ? competenceRange(input.activityStart, previous)
      : competenceRange(addMonths(input.competence, -windowMonths), previous);
  return {
    method: elapsed <= windowMonths ? 'cumulative_since_opening' : 'regular',
    payroll: sumMonths(input.payrollHistory, months),
    revenue: sumMonths(input.revenueHistory, months),
  };
}

/**
 * Fator R = payroll / gross revenue (PGDAS-D manual 8.2.1; Resolução CGSN 140/2018, art. 26).
 * Zero bases use fixed ratios; the ratio is truncated to the rule's precision before being compared
 * with the threshold (Annex III when greater or equal, Annex V otherwise).
 */
export function computeFactorR(
  input: FactorRInput,
  rules: TaxRuleSet,
  memory: MemoryRecorder,
): FactorRResult {
  if (rules.factorR === undefined) {
    return {
      state: 'missing',
      missingInputs: [`rule simples-nacional.factor-r (no version at ${input.competence})`],
    };
  }
  const { ruleRef, threshold, windowMonths, decimalPlaces, noPayroll, payrollWithoutRevenue } =
    rules.factorR;
  const bases = basesFor(input, windowMonths);
  if (bases === undefined) {
    return { state: 'missing', missingInputs: ['company.activityStart (after the competence)'] };
  }
  const missing = [
    ...(bases.payroll.state === 'incomplete'
      ? bases.payroll.missing.map((m) => `payrollHistory ${m}`)
      : []),
    ...(bases.revenue.state === 'incomplete'
      ? bases.revenue.missing.map((m) =>
          m === input.competence ? `currentRevenue ${m}` : `revenueHistory ${m}`,
        )
      : []),
  ];
  if (bases.payroll.state !== 'complete' || bases.revenue.state !== 'complete') {
    return { state: 'missing', missingInputs: missing };
  }

  const payroll = bases.payroll.total;
  const revenue = bases.revenue.total;
  const ratio = payroll.isZero()
    ? noPayroll
    : revenue.isZero()
      ? payrollWithoutRevenue
      : payroll.dividedBy(revenue);
  const comparedRatio = applyRounding(ratio, { decimalPlaces, mode: 'truncate' });
  const annex: ServiceAnnex = comparedRatio.greaterThanOrEqualTo(threshold) ? 'III' : 'V';

  memory.record({
    stepId: 'factorR',
    descriptionKey: `memory.factorR.${bases.method}`,
    formula: payroll.isZero()
      ? 'Fator R = fixed ratio for zero payroll'
      : revenue.isZero()
        ? 'Fator R = fixed ratio for payroll without revenue'
        : 'Fator R = payroll / gross revenue, truncated',
    inputs: { payroll: payroll.toFixed(), revenue: revenue.toFixed(), ratio: ratio.toFixed() },
    result: comparedRatio.toFixed(),
    ruleRef,
    rounding: `truncate to ${String(decimalPlaces)} decimal places`,
  });
  memory.record({
    stepId: 'annexByFactorR',
    descriptionKey: `memory.factorR.annex${annex}`,
    formula: 'Annex III when Fator R >= threshold, otherwise Annex V',
    inputs: { factorR: comparedRatio.toFixed(), threshold: threshold.toFixed() },
    result: annex,
    ruleRef,
  });

  return {
    state: 'computed',
    payroll,
    revenue,
    ratio,
    comparedRatio,
    annex,
    method: bases.method,
    unconfirmedInputs: [
      ...bases.payroll.unconfirmed.map((m) => `payrollHistory ${m}`),
      ...bases.revenue.unconfirmed.map((m) => `revenue ${m}`),
    ],
  };
}
