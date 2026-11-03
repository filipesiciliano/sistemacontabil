import { describe, expect, it } from 'vitest';
import { hasValue, isConfirmed, MISSING, money, type DataPoint, type Money } from '../src/index.js';

describe('DataPoint', () => {
  it('never treats missing data as a value', () => {
    const payroll: DataPoint<Money> = MISSING;
    expect(hasValue(payroll)).toBe(false);
    expect(isConfirmed(payroll)).toBe(false);
  });

  it('distinguishes an informed zero from missing data', () => {
    const payroll: DataPoint<Money> = {
      state: 'informed',
      value: money('0'),
      source: 'manual_entry',
      informedAt: '2026-11-03T12:00:00Z',
    };
    expect(hasValue(payroll)).toBe(true);
    expect(isConfirmed(payroll)).toBe(false);
  });
});
