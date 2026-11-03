import { describe, expect, it } from 'vitest';
import { applyRounding, Decimal } from '../src/index.js';

describe('applyRounding', () => {
  const cases: [string, 'half_up' | 'half_even' | 'truncate', string][] = [
    ['2.345', 'half_up', '2.35'],
    ['2.345', 'half_even', '2.34'],
    ['2.355', 'half_even', '2.36'],
    ['2.349', 'truncate', '2.34'],
    ['-2.345', 'half_up', '-2.35'],
    ['-2.349', 'truncate', '-2.34'],
  ];

  it.each(cases)('rounds %s with %s to %s', (input, mode, expected) => {
    expect(applyRounding(new Decimal(input), { decimalPlaces: 2, mode }).toFixed(2)).toBe(expected);
  });

  it('rejects an invalid number of decimal places', () => {
    expect(() => applyRounding(new Decimal('1'), { decimalPlaces: -1, mode: 'half_up' })).toThrow(
      RangeError,
    );
  });
});
