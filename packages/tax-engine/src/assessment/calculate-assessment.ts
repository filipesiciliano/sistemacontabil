import { Decimal, toMoney, toRate, type Competence } from '@platform/shared-types';
import { diagnoseCoverage } from '../coverage/diagnose-coverage.js';
import { ENGINE_VERSION } from '../engine-version.js';
import { computeFactorR, type FactorRResult } from '../factor-r/compute-factor-r.js';
import type { AssessmentInput, CurrentRevenueEntry } from '../input/assessment-input.js';
import { MemoryRecorder } from '../memory/memory-recorder.js';
import { computeRbt12, type Rbt12Result } from '../rbt12/compute-rbt12.js';
import { MonthlySeries } from '../revenue/monthly-series.js';
import { sumMonths } from '../revenue/sum-months.js';
import type { ServiceAnnex, TaxRuleSet } from '../rules/tax-rule-set.js';
import type { AnnexCalculation } from './annex-calculation.js';
import type { AssessmentResult } from './assessment-result.js';
import { calculateAnnex } from './calculate-annex.js';
import type { EntryResult } from './entry-result.js';

function isOutOfCoverage(entry: CurrentRevenueEntry): boolean {
  const t = entry.treatments;
  return t.export || t.issWithheld || t.taxSubstitution || t.monophasic;
}

interface EntryContext {
  readonly input: AssessmentInput;
  readonly rules: TaxRuleSet;
  readonly memory: MemoryRecorder;
  readonly rbt12: Rbt12Result | undefined;
  readonly factorR: FactorRResult | undefined;
}

function calculateEntry(entry: CurrentRevenueEntry, context: EntryContext): EntryResult {
  const identity = {
    entryId: entry.entryId,
    establishmentId: entry.establishmentId,
    activityId: entry.activityId,
  };
  const activity = context.input.activities.find(
    (candidate) => candidate.activityId === entry.activityId,
  );
  if (activity === undefined)
    return { ...identity, outcome: 'not_calculated', reason: 'out_of_coverage' };
  if (activity.taxation.state === 'missing') {
    return { ...identity, outcome: 'not_calculated', reason: 'missing_activity_taxation' };
  }
  const taxation = activity.taxation.value;
  if ((taxation !== 'annex_iii' && taxation !== 'factor_r') || isOutOfCoverage(entry)) {
    return { ...identity, outcome: 'not_calculated', reason: 'out_of_coverage' };
  }
  if (entry.amount.state === 'missing')
    return { ...identity, outcome: 'not_calculated', reason: 'missing_amount' };
  if (context.rbt12?.state !== 'computed')
    return { ...identity, outcome: 'not_calculated', reason: 'missing_rbt12' };

  const revenue = entry.amount.value;
  const rbt12 = context.rbt12.value;
  const calculate = (annex: ServiceAnnex, stepPrefix: string): AnnexCalculation | undefined =>
    calculateAnnex(
      { stepPrefix, annex, revenue, rbt12, rounding: context.input.taxAmountRounding },
      context.rules,
      context.memory,
    );

  if (taxation === 'factor_r' && context.factorR?.state !== 'computed') {
    const alternatives = (['III', 'V'] as const)
      .map((annex) => calculate(annex, `entry.${entry.entryId}.scenario${annex}`))
      .filter((calculation): calculation is AnnexCalculation => calculation !== undefined);
    return alternatives.length === 0
      ? { ...identity, outcome: 'not_calculated', reason: 'above_last_bracket' }
      : { ...identity, outcome: 'annex_undetermined', alternatives };
  }

  const annex: ServiceAnnex =
    taxation === 'factor_r' && context.factorR?.state === 'computed'
      ? context.factorR.annex
      : 'III';
  const calculation = calculate(annex, `entry.${entry.entryId}`);
  return calculation === undefined
    ? { ...identity, outcome: 'not_calculated', reason: 'above_last_bracket' }
    : { ...identity, outcome: 'calculated', calculation };
}

function unconfirmedCompanyInputs(input: AssessmentInput): string[] {
  const labels: string[] = [];
  const { activityStart, simplesNacionalOptant, recognitionRegime } = input.company;
  if (activityStart.state === 'informed') labels.push('company.activityStart');
  if (simplesNacionalOptant.state === 'informed') labels.push('company.simplesNacionalOptant');
  if (recognitionRegime.state === 'informed') labels.push('company.recognitionRegime');
  for (const activity of input.activities) {
    if (activity.taxation.state === 'informed')
      labels.push(`activities.${activity.activityId}.taxation`);
  }
  for (const entry of input.currentRevenue) {
    if (entry.amount.state === 'informed') labels.push(`currentRevenue.${entry.entryId}`);
  }
  return labels;
}

/**
 * Calculates the Simples Nacional assessment of a competence for the POC scope (Annexes III and V
 * with Fator R). Order: coverage diagnosis, RBT12, Fator R, then each revenue entry. Pure: the
 * same input and rules always produce the same result and calculation memory.
 */
export function calculateAssessment(input: AssessmentInput, rules: TaxRuleSet): AssessmentResult {
  const memory = new MemoryRecorder();
  const competence: Competence = input.competence;
  const revenueHistory = new MonthlySeries(input.revenueHistory);
  const payrollHistory = new MonthlySeries(input.payrollHistory);
  const currentRevenue = sumMonths(
    new MonthlySeries(input.currentRevenue.map((entry) => ({ competence, amount: entry.amount }))),
    [competence],
  );

  const coverage = diagnoseCoverage({ input, rules, revenueHistory, currentRevenue }, memory);
  const missingInputs = [...coverage.missingInputs];
  const unconfirmedInputs = unconfirmedCompanyInputs(input);

  const start = input.company.activityStart;
  const rbt12 =
    start.state === 'missing'
      ? undefined
      : computeRbt12(
          { competence, activityStart: start.value, revenueHistory, currentRevenue },
          rules,
          memory,
        );
  if (rbt12?.state === 'missing') missingInputs.push(...rbt12.missingInputs);
  if (rbt12?.state === 'computed')
    unconfirmedInputs.push(...rbt12.unconfirmedMonths.map((m) => `revenueHistory ${m}`));

  const needsFactorR = input.currentRevenue.some((entry) => {
    const activity = input.activities.find(
      (candidate) => candidate.activityId === entry.activityId,
    );
    return activity?.taxation.state !== 'missing' && activity?.taxation.value === 'factor_r';
  });
  const factorR =
    needsFactorR && start.state !== 'missing'
      ? computeFactorR(
          {
            competence,
            activityStart: start.value,
            revenueHistory,
            payrollHistory,
            currentRevenue,
          },
          rules,
          memory,
        )
      : undefined;
  if (factorR?.state === 'missing') missingInputs.push(...factorR.missingInputs);
  if (factorR?.state === 'computed') unconfirmedInputs.push(...factorR.unconfirmedInputs);

  const entries = input.currentRevenue.map((entry) =>
    calculateEntry(entry, { input, rules, memory, rbt12, factorR }),
  );
  const calculated = entries.filter((entry) => entry.outcome === 'calculated');
  const principal = calculated.reduce(
    (total, entry) => total.plus(entry.calculation.total),
    new Decimal(0),
  );
  const principalComplete = calculated.length === entries.length;
  memory.record({
    stepId: 'principal',
    descriptionKey: principalComplete ? 'memory.principal' : 'memory.principalPartial',
    formula: 'Sum of the totals of the calculated entries',
    inputs: { calculatedEntries: String(calculated.length), entries: String(entries.length) },
    result: principal.toFixed(),
  });

  const uniqueMissing = [...new Set(missingInputs)];
  const uniqueUnconfirmed = [...new Set(unconfirmedInputs)];
  return {
    engineVersion: ENGINE_VERSION,
    competence,
    ruleRefs: [
      ...Object.values(rules.ruleRefs),
      ...(factorR?.state === 'computed' && rules.factorR !== undefined
        ? [rules.factorR.ruleRef]
        : []),
    ],
    rulesApproved: rules.allApproved,
    coverage: { ...coverage, missingInputs: uniqueMissing },
    unconfirmedInputs: uniqueUnconfirmed,
    ...(rbt12?.state === 'computed'
      ? { rbt12: { value: toMoney(rbt12.value), method: rbt12.method } }
      : {}),
    ...(factorR?.state === 'computed'
      ? {
          factorR: {
            ratio: toRate(factorR.ratio),
            comparedRatio: toRate(factorR.comparedRatio),
            annex: factorR.annex,
            method: factorR.method,
          },
        }
      : {}),
    entries,
    principal: toMoney(principal),
    principalComplete,
    conclusive:
      coverage.status === 'covered' &&
      uniqueMissing.length === 0 &&
      uniqueUnconfirmed.length === 0 &&
      principalComplete &&
      rules.allApproved,
    memory: memory.toMemory(),
  };
}
