import {
  MISSING,
  money,
  UserIdSchema,
  type Confirmed,
  type DataPoint,
  type Informed,
  type Money,
} from '@platform/shared-types';

const REVIEWER = UserIdSchema.parse('00000000-0000-4000-8000-000000000001');

export function confirmed<T>(value: T): Confirmed<T> {
  return {
    state: 'confirmed',
    value,
    source: 'manual_entry',
    informedAt: '2026-11-10T00:00:00Z',
    confirmedBy: REVIEWER,
    confirmedAt: '2026-11-10T00:00:00Z',
  };
}

export function informed<T>(value: T): Informed<T> {
  return { state: 'informed', value, source: 'manual_entry', informedAt: '2026-11-10T00:00:00Z' };
}

export function amount(literal: string): DataPoint<Money> {
  return confirmed(money(literal));
}

export { MISSING };
