import { describe, expect, it } from 'vitest';
import { cnae, CnaeSchema, formatCnae } from '../src/index.js';

describe('Cnae', () => {
  it('normalizes and formats a subclass', () => {
    const value = cnae('6201-5/01');
    expect(value).toBe('6201501');
    expect(formatCnae(value)).toBe('6201-5/01');
  });

  it('rejects incomplete codes', () => {
    expect(CnaeSchema.safeParse('6201-5').success).toBe(false);
  });
});
