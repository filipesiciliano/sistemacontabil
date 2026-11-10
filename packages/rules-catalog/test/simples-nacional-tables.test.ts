import { Decimal } from '@platform/shared-types';
import { describe, expect, it } from 'vitest';
import {
  annexIiiBracketsV1,
  annexIiiTaxDistributionV1,
  annexVBracketsV1,
  annexVTaxDistributionV1,
  type BracketTaxShares,
  type Parameter,
  type RevenueBracket,
} from '../src/index.js';

function definedValue<T>(parameter: Parameter<T>): T {
  if (parameter.kind !== 'defined') throw new Error('Expected a defined parameter');
  return parameter.value;
}

function sumOf(values: readonly (string | undefined)[]): string {
  return values
    .reduce((total, value) => total.plus(new Decimal(value ?? '0')), new Decimal(0))
    .toFixed();
}

const bracketTables: [string, readonly RevenueBracket[]][] = [
  ['Annex III', definedValue(annexIiiBracketsV1.parameters.brackets)],
  ['Annex V', definedValue(annexVBracketsV1.parameters.brackets)],
];

const distributionTables: [string, readonly BracketTaxShares[], number][] = [
  ['Annex III', definedValue(annexIiiTaxDistributionV1.parameters.distribution), 6],
  ['Annex V', definedValue(annexVTaxDistributionV1.parameters.distribution), 6],
];

describe('transcribed Simples Nacional tables', () => {
  it.each(bracketTables)(
    '%s brackets are ordered with increasing limits and rates',
    (_name, brackets) => {
      brackets.forEach((bracket, index) => {
        expect(bracket.order).toBe(index + 1);
        const previous = brackets[index - 1];
        if (previous === undefined) return;
        expect(new Decimal(bracket.upperRbt12Limit).gt(previous.upperRbt12Limit)).toBe(true);
        expect(new Decimal(bracket.nominalRate).gt(previous.nominalRate)).toBe(true);
        expect(new Decimal(bracket.deduction).gt(previous.deduction)).toBe(true);
      });
    },
  );

  it.each(distributionTables)(
    '%s tax shares of every bracket add up to 100%%',
    (_name, distribution, bracketCount) => {
      expect(distribution).toHaveLength(bracketCount);
      for (const bracket of distribution) {
        expect(
          sumOf(Object.values(bracket.shares)),
          `bracket ${String(bracket.bracketOrder)}`,
        ).toBe('1');
      }
    },
  );

  it('Annex III ISS cap redistribution shares add up to 100%', () => {
    const cap = definedValue(annexIiiTaxDistributionV1.parameters.issCap);
    for (const bracket of cap.brackets) {
      expect(sumOf(Object.values(bracket.sharesOfRateAboveIss))).toBe('1');
    }
  });

  it('Annex III ISS cap threshold matches the bracket 5 table (ISS share x effective rate = 5%)', () => {
    const cap = definedValue(annexIiiTaxDistributionV1.parameters.issCap);
    const distribution = definedValue(annexIiiTaxDistributionV1.parameters.distribution);
    const [capBracket] = cap.brackets;
    const issShare = distribution.find((b) => b.bracketOrder === capBracket?.bracketOrder)?.shares
      .ISS;
    const issAtThreshold = new Decimal(capBracket?.appliesAboveEffectiveRate ?? '0').times(
      issShare ?? '0',
    );
    expect(issAtThreshold.toDecimalPlaces(7).toFixed()).toBe('0.05');
  });
});
