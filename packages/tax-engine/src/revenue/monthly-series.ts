import { Decimal, type Competence, type DataPoint, type Money } from '@platform/shared-types';

export type MonthValue =
  | { readonly state: 'missing' }
  | { readonly state: 'present'; readonly amount: Decimal; readonly confirmed: boolean };

interface MonthlyEntry {
  readonly competence: Competence;
  readonly amount: DataPoint<Money>;
}

/**
 * Consolidates entries per competence (e.g. all establishments of the root CNPJ). A month with no
 * entry, or with any entry still missing, is missing as a whole: absence is never zero.
 */
export class MonthlySeries {
  private readonly months = new Map<string, MonthValue>();

  constructor(entries: readonly MonthlyEntry[]) {
    for (const entry of entries) {
      const current = this.months.get(entry.competence);
      if (current?.state === 'missing') continue;
      if (entry.amount.state === 'missing') {
        this.months.set(entry.competence, { state: 'missing' });
        continue;
      }
      const confirmed = entry.amount.state === 'confirmed';
      this.months.set(entry.competence, {
        state: 'present',
        amount: (current?.amount ?? new Decimal(0)).plus(entry.amount.value),
        confirmed: (current?.confirmed ?? true) && confirmed,
      });
    }
  }

  get(competence: Competence): MonthValue {
    return this.months.get(competence) ?? { state: 'missing' };
  }
}
