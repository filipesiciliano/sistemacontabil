import {
  addMonths,
  competenceRange,
  monthsBetween,
  type Competence,
  type Decimal,
} from '@platform/shared-types';
import type { MemoryRecorder } from '../memory/memory-recorder.js';
import type { MonthlySeries } from '../revenue/monthly-series.js';
import { sumMonths, type MonthsSum } from '../revenue/sum-months.js';
import type { TaxRuleSet } from '../rules/tax-rule-set.js';

export type Rbt12Method = 'regular' | 'start_of_activity_first_month' | 'start_of_activity_average';

export type Rbt12Result =
  | {
      readonly state: 'computed';
      readonly value: Decimal;
      readonly method: Rbt12Method;
      readonly unconfirmedMonths: readonly Competence[];
    }
  | { readonly state: 'missing'; readonly missingInputs: readonly string[] };

export interface Rbt12Input {
  readonly competence: Competence;
  readonly activityStart: Competence;
  readonly revenueHistory: MonthlySeries;
  /** Revenue of the competence itself; only used in the first month of activity. */
  readonly currentRevenue: MonthsSum;
}

function missingMonths(months: readonly Competence[], label: string): Rbt12Result {
  return { state: 'missing', missingInputs: months.map((month) => `${label} ${month}`) };
}

/**
 * RBT12 used to pick the bracket and in the effective rate formula. In the first 12 months of
 * activity it is proportionalized (RBT12p): first month = period revenue x 12; following months =
 * average of the previous months x 12 (PGDAS-D manual 8.3; LC 123/2006, art. 18, § 2º).
 */
export function computeRbt12(
  input: Rbt12Input,
  rules: TaxRuleSet,
  memory: MemoryRecorder,
): Rbt12Result {
  const { windowMonths, annualizationFactor } = rules.rbt12;
  const elapsed = monthsBetween(input.activityStart, input.competence);
  if (elapsed < 0) {
    return { state: 'missing', missingInputs: ['company.activityStart (after the competence)'] };
  }
  const ruleRef = rules.ruleRefs.rbt12;

  if (elapsed === 0) {
    if (input.currentRevenue.state === 'incomplete') {
      return missingMonths(input.currentRevenue.missing, 'currentRevenue');
    }
    const value = input.currentRevenue.total.times(annualizationFactor);
    memory.record({
      stepId: 'rbt12',
      descriptionKey: 'memory.rbt12.startOfActivityFirstMonth',
      formula: 'RBT12p = period revenue x annualization factor',
      inputs: {
        periodRevenue: input.currentRevenue.total.toFixed(),
        annualizationFactor: annualizationFactor.toFixed(),
      },
      result: value.toFixed(),
      ruleRef,
    });
    return {
      state: 'computed',
      value,
      method: 'start_of_activity_first_month',
      unconfirmedMonths: input.currentRevenue.unconfirmed,
    };
  }

  const previous = addMonths(input.competence, -1);
  if (elapsed < windowMonths) {
    const months = competenceRange(input.activityStart, previous);
    const sum = sumMonths(input.revenueHistory, months);
    if (sum.state === 'incomplete') return missingMonths(sum.missing, 'revenueHistory');
    const average = sum.total.dividedBy(months.length);
    const value = average.times(annualizationFactor);
    memory.record({
      stepId: 'rbt12',
      descriptionKey: 'memory.rbt12.startOfActivityAverage',
      formula: 'RBT12p = (sum of revenue since opening / months) x annualization factor',
      inputs: {
        revenueSinceOpening: sum.total.toFixed(),
        months: String(months.length),
        firstMonth: input.activityStart,
        lastMonth: previous,
        annualizationFactor: annualizationFactor.toFixed(),
      },
      result: value.toFixed(),
      ruleRef,
    });
    return {
      state: 'computed',
      value,
      method: 'start_of_activity_average',
      unconfirmedMonths: sum.unconfirmed,
    };
  }

  const months = competenceRange(addMonths(input.competence, -windowMonths), previous);
  const sum = sumMonths(input.revenueHistory, months);
  if (sum.state === 'incomplete') return missingMonths(sum.missing, 'revenueHistory');
  memory.record({
    stepId: 'rbt12',
    descriptionKey: 'memory.rbt12.regular',
    formula: 'RBT12 = sum of gross revenue of the previous months in the window',
    inputs: {
      firstMonth: months[0] ?? previous,
      lastMonth: previous,
      months: String(months.length),
    },
    result: sum.total.toFixed(),
    ruleRef,
  });
  return {
    state: 'computed',
    value: sum.total,
    method: 'regular',
    unconfirmedMonths: sum.unconfirmed,
  };
}
