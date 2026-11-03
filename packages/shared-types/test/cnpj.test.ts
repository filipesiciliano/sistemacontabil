import { describe, expect, it } from 'vitest';
import { cnpjRoot, CnpjSchema, cnpj } from '../src/index.js';

describe('Cnpj', () => {
  it('normalizes punctuation and validates check digits', () => {
    expect(cnpj('11.222.333/0001-81')).toBe('11222333000181');
    expect(CnpjSchema.safeParse('11.222.333/0001-82').success).toBe(false);
  });

  it('rejects repeated digits and wrong lengths', () => {
    expect(CnpjSchema.safeParse('00000000000000').success).toBe(false);
    expect(CnpjSchema.safeParse('1122233300018').success).toBe(false);
  });

  it('accepts the alphanumeric format', () => {
    expect(cnpj('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });

  it('exposes the root used for consolidation across establishments', () => {
    expect(cnpjRoot(cnpj('11222333000181'))).toBe('11222333');
  });
});
