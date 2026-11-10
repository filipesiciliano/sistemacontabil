import { Decimal, type Competence } from '@platform/shared-types';
import type { MonthlySeries } from './monthly-series.js';

export type MonthsSum =
  | {
      readonly state: 'complete';
      readonly total: Decimal;
      readonly unconfirmed: readonly Competence[];
    }
  | { readonly state: 'incomplete'; readonly missing: readonly Competence[] };

export function sumMonths(series: MonthlySeries, months: readonly Competence[]): MonthsSum {
  const missing: Competence[] = [];
  const unconfirmed: Competence[] = [];
  let total = new Decimal(0);
  for (const month of months) {
    const value = series.get(month);
    if (value.state === 'missing') {
      missing.push(month);
      continue;
    }
    total = total.plus(value.amount);
    if (!value.confirmed) unconfirmed.push(month);
  }
  return missing.length > 0
    ? { state: 'incomplete', missing }
    : { state: 'complete', total, unconfirmed };
}
