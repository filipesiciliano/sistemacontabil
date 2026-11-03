import { describe, expect, it } from 'vitest';
import { money, moneyToString, MoneyStringSchema } from '../src/index.js';

describe('Money', () => {
  it('keeps exact decimal precision where binary floating point would drift', () => {
    const sum = money('0.1').plus(money('0.2'));
    expect(sum.toFixed()).toBe('0.3');
  });

  it('only accepts decimal strings at the edges', () => {
    expect(MoneyStringSchema.safeParse('1234.56').success).toBe(true);
    expect(MoneyStringSchema.safeParse('1,234.56').success).toBe(false);
    expect(MoneyStringSchema.safeParse('1e3').success).toBe(false);
    expect(MoneyStringSchema.safeParse('').success).toBe(false);
  });

  it('serializes without exponent notation', () => {
    expect(moneyToString(money('0.00000001'))).toBe('0.00000001');
    expect(moneyToString(money('4800000.00'))).toBe('4800000');
  });
});
