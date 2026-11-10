import {
  applyRounding,
  Decimal,
  toMoney,
  toRate,
  type Money,
  type Rate,
  type RoundingPolicy,
} from '@platform/shared-types';
import { DAS_TAXES, type DasTax } from '@platform/rules-catalog';
import { computeTaxRates } from '../distribution/compute-tax-rates.js';
import type { MemoryRecorder } from '../memory/memory-recorder.js';
import { computeEffectiveRate } from '../rate/compute-effective-rate.js';
import { findBracket } from '../rate/find-bracket.js';
import type { ServiceAnnex, TaxRuleSet } from '../rules/tax-rule-set.js';
import type { AnnexCalculation } from './annex-calculation.js';

export interface AnnexCalculationInput {
  readonly stepPrefix: string;
  readonly annex: ServiceAnnex;
  readonly revenue: Decimal;
  readonly rbt12: Decimal;
  readonly rounding: RoundingPolicy;
}

function roundingLabel(policy: RoundingPolicy): string {
  return `${policy.mode} to ${String(policy.decimalPlaces)} decimal places`;
}

/**
 * Applies an annex to a revenue entry: bracket, effective rate, rate of each tax and amount of each
 * tax. Each tax amount is rounded with the given policy and the total is the sum of rounded amounts.
 * Returns undefined when the RBT12 is above the last bracket.
 */
export function calculateAnnex(
  input: AnnexCalculationInput,
  rules: TaxRuleSet,
  memory: MemoryRecorder,
): AnnexCalculation | undefined {
  const tables = rules.annexes[input.annex];
  const bracketsRef =
    input.annex === 'III' ? rules.ruleRefs.annexIiiBrackets : rules.ruleRefs.annexVBrackets;
  const distributionRef =
    input.annex === 'III'
      ? rules.ruleRefs.annexIiiTaxDistribution
      : rules.ruleRefs.annexVTaxDistribution;

  const bracket = findBracket(tables.brackets, input.rbt12);
  if (bracket === undefined) return undefined;
  memory.record({
    stepId: `${input.stepPrefix}.bracket`,
    descriptionKey: 'memory.bracket',
    formula: 'First bracket whose upper RBT12 limit is >= RBT12',
    inputs: { annex: input.annex, rbt12: input.rbt12.toFixed() },
    result: String(bracket.order),
    ruleRef: bracketsRef,
  });

  const effectiveRate = computeEffectiveRate(input.rbt12, bracket, rules.rbt12.zeroRbt12Substitute);
  memory.record({
    stepId: `${input.stepPrefix}.effectiveRate`,
    descriptionKey: 'memory.effectiveRate',
    formula: '((RBT12 x nominal rate) - deduction) / RBT12',
    inputs: {
      rbt12: input.rbt12.toFixed(),
      nominalRate: bracket.nominalRate.toFixed(),
      deduction: bracket.deduction.toFixed(),
    },
    result: effectiveRate.toFixed(),
    ruleRef: bracketsRef,
  });

  const taxRates = computeTaxRates(tables, bracket.order, effectiveRate);
  if (taxRates === undefined) return undefined;

  const amounts: Partial<Record<DasTax, Money>> = {};
  const rates: Partial<Record<DasTax, Rate>> = {};
  let total = new Decimal(0);
  for (const tax of DAS_TAXES) {
    const rate = taxRates.rates[tax];
    if (rate === undefined) continue;
    const amount = applyRounding(input.revenue.times(rate), input.rounding);
    rates[tax] = toRate(rate);
    amounts[tax] = toMoney(amount);
    total = total.plus(amount);
    memory.record({
      stepId: `${input.stepPrefix}.tax.${tax}`,
      descriptionKey: 'memory.taxAmount',
      formula: taxRates.issCapApplied
        ? tax === 'ISS'
          ? 'ISS rate fixed at the cap; amount = revenue x rate'
          : 'rate = (effective rate - ISS cap) x redistribution share; amount = revenue x rate'
        : 'rate = effective rate x share; amount = revenue x rate',
      inputs: { revenue: input.revenue.toFixed(), rate: rate.toFixed() },
      result: amount.toFixed(),
      ruleRef: distributionRef,
      rounding: roundingLabel(input.rounding),
    });
  }

  memory.record({
    stepId: `${input.stepPrefix}.total`,
    descriptionKey: 'memory.entryTotal',
    formula: 'Sum of the rounded tax amounts',
    inputs: { taxes: String(Object.keys(amounts).length) },
    result: total.toFixed(),
  });

  return {
    annex: input.annex,
    bracketOrder: bracket.order,
    nominalRate: toRate(bracket.nominalRate),
    deduction: toMoney(bracket.deduction),
    effectiveRate: toRate(effectiveRate),
    taxRates: rates,
    taxAmounts: amounts,
    total: toMoney(total),
    issCapApplied: taxRates.issCapApplied,
  };
}
