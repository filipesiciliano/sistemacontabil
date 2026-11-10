import {
  type BracketTaxShares,
  type IssCapRedistribution,
  type Parameter,
  type RevenueBracket,
  type RuleDefinition,
  ruleVersionRef,
  selectRuleVersion,
  SIMPLES_NACIONAL_RULES,
} from '@platform/rules-catalog';
import { Decimal, type Competence } from '@platform/shared-types';
import type { AnnexTables, IssCapBracket, TaxShares } from './annex-tables.js';
import type { RuleRole, TaxRuleSet } from './tax-rule-set.js';

export interface ResolveOptions {
  /** Non-production only: accept draft rules and flag the result as "rules under review". */
  readonly allowUnapproved?: boolean;
}

export type RuleSetResolution =
  | { readonly status: 'resolved'; readonly rules: TaxRuleSet }
  | { readonly status: 'unresolved'; readonly problems: readonly string[] };

function toShares(shares: BracketTaxShares['shares']): TaxShares {
  return Object.fromEntries(
    Object.entries(shares).map(([tax, share]) => [tax, new Decimal(share)]),
  );
}

function toBrackets(brackets: readonly RevenueBracket[]): AnnexTables['brackets'] {
  return brackets.map((bracket) => ({
    order: bracket.order,
    upperRbt12Limit: new Decimal(bracket.upperRbt12Limit),
    nominalRate: new Decimal(bracket.nominalRate),
    deduction: new Decimal(bracket.deduction),
  }));
}

function toIssCap(cap: IssCapRedistribution): NonNullable<AnnexTables['issCap']> {
  const byBracket = new Map<number, IssCapBracket>(
    cap.brackets.map((bracket) => [
      bracket.bracketOrder,
      {
        appliesAboveEffectiveRate: new Decimal(bracket.appliesAboveEffectiveRate),
        sharesOfRateAboveIss: toShares(bracket.sharesOfRateAboveIss),
      },
    ]),
  );
  return { maxEffectiveIssRate: new Decimal(cap.maxEffectiveIssRate), byBracket };
}

/**
 * Selects, for the competence, one version of every rule the engine needs and extracts its
 * parameters. Any missing version or placeholder parameter makes the rule set unresolved:
 * the engine never calculates with values that have no official source.
 */
export function resolveTaxRuleSet(at: Competence, options: ResolveOptions = {}): RuleSetResolution {
  const problems: string[] = [];
  const refs: Partial<Record<RuleRole, string>> = {};
  let allApproved = true;

  function select<T>(
    role: RuleRole,
    versions: readonly RuleDefinition<T>[],
    optional = false,
  ): RuleDefinition<T> | undefined {
    const selection = selectRuleVersion(versions, at, options);
    if (optional && selection.outcome === 'not_found') return undefined;
    if (selection.outcome !== 'selected') {
      problems.push(`${role}: no selectable version at ${at} (${selection.outcome})`);
      return undefined;
    }
    refs[role] = ruleVersionRef(selection.rule);
    if (selection.rule.approval.status !== 'approved') allApproved = false;
    return selection.rule;
  }

  function value<T>(
    role: RuleRole,
    name: string,
    parameter: Parameter<T> | undefined,
  ): T | undefined {
    if (parameter === undefined) return undefined;
    if (parameter.kind === 'placeholder') {
      problems.push(`${role}.${name}: ${parameter.key}`);
      return undefined;
    }
    return parameter.value;
  }

  const rbt12 = select('rbt12', SIMPLES_NACIONAL_RULES.rbt12)?.parameters;
  const limits = select('revenueLimits', SIMPLES_NACIONAL_RULES.revenueLimits)?.parameters;
  const factorR = select('factorR', SIMPLES_NACIONAL_RULES.factorR, true)?.parameters;
  const iiiBrackets = select(
    'annexIiiBrackets',
    SIMPLES_NACIONAL_RULES.annexIiiBrackets,
  )?.parameters;
  const iiiShares = select(
    'annexIiiTaxDistribution',
    SIMPLES_NACIONAL_RULES.annexIiiTaxDistribution,
  )?.parameters;
  const vBrackets = select('annexVBrackets', SIMPLES_NACIONAL_RULES.annexVBrackets)?.parameters;
  const vShares = select(
    'annexVTaxDistribution',
    SIMPLES_NACIONAL_RULES.annexVTaxDistribution,
  )?.parameters;

  const rbt12Window = value('rbt12', 'windowMonths', rbt12?.windowMonths);
  const annualization = value('rbt12', 'annualizationFactor', rbt12?.annualizationFactor);
  const zeroRbt12 = value('rbt12', 'zeroRbt12Substitute', rbt12?.zeroRbt12Substitute);
  value('rbt12', 'startOfActivityMethod', rbt12?.startOfActivityMethod);
  const limit = value('revenueLimits', 'simplesNacionalLimit', limits?.simplesNacionalLimit);
  const sublimit = value('revenueLimits', 'sublimit', limits?.sublimit);
  const threshold = value('factorR', 'threshold', factorR?.threshold);
  const comparison = value('factorR', 'comparison', factorR?.comparison);
  const factorRWindow = value('factorR', 'windowMonths', factorR?.windowMonths);
  const ratioRounding = value('factorR', 'ratioRounding', factorR?.ratioRounding);
  const zeroBase = value('factorR', 'zeroBase', factorR?.zeroBase);
  value('factorR', 'startOfActivityMethod', factorR?.startOfActivityMethod);
  const iiiBracketValues = value('annexIiiBrackets', 'brackets', iiiBrackets?.brackets);
  const iiiDistribution = value('annexIiiTaxDistribution', 'distribution', iiiShares?.distribution);
  const iiiIssCap = value('annexIiiTaxDistribution', 'issCap', iiiShares?.issCap);
  const vBracketValues = value('annexVBrackets', 'brackets', vBrackets?.brackets);
  const vDistribution = value('annexVTaxDistribution', 'distribution', vShares?.distribution);

  if (comparison !== undefined && comparison !== 'greater_or_equal') {
    problems.push(`factorR.comparison: unsupported "${comparison}"`);
  }

  if (
    problems.length > 0 ||
    rbt12Window === undefined ||
    annualization === undefined ||
    zeroRbt12 === undefined ||
    limit === undefined ||
    sublimit === undefined ||
    iiiBracketValues === undefined ||
    iiiDistribution === undefined ||
    iiiIssCap === undefined ||
    vBracketValues === undefined ||
    vDistribution === undefined ||
    refs.rbt12 === undefined ||
    refs.revenueLimits === undefined ||
    refs.annexIiiBrackets === undefined ||
    refs.annexIiiTaxDistribution === undefined ||
    refs.annexVBrackets === undefined ||
    refs.annexVTaxDistribution === undefined
  ) {
    return { status: 'unresolved', problems };
  }

  const sharesMap = (distribution: readonly BracketTaxShares[]): AnnexTables['sharesByBracket'] =>
    new Map(distribution.map((bracket) => [bracket.bracketOrder, toShares(bracket.shares)]));

  return {
    status: 'resolved',
    rules: {
      ruleRefs: {
        rbt12: refs.rbt12,
        revenueLimits: refs.revenueLimits,
        annexIiiBrackets: refs.annexIiiBrackets,
        annexIiiTaxDistribution: refs.annexIiiTaxDistribution,
        annexVBrackets: refs.annexVBrackets,
        annexVTaxDistribution: refs.annexVTaxDistribution,
      },
      allApproved,
      rbt12: {
        windowMonths: rbt12Window,
        annualizationFactor: new Decimal(annualization),
        zeroRbt12Substitute: new Decimal(zeroRbt12),
      },
      limits: { simplesNacionalLimit: new Decimal(limit), sublimit: new Decimal(sublimit) },
      ...(refs.factorR !== undefined &&
      threshold !== undefined &&
      factorRWindow !== undefined &&
      ratioRounding !== undefined &&
      zeroBase !== undefined
        ? {
            factorR: {
              ruleRef: refs.factorR,
              threshold: new Decimal(threshold),
              windowMonths: factorRWindow,
              decimalPlaces: ratioRounding.decimalPlaces,
              noPayroll: new Decimal(zeroBase.noPayroll),
              payrollWithoutRevenue: new Decimal(zeroBase.payrollWithoutRevenue),
            },
          }
        : {}),
      annexes: {
        III: {
          brackets: toBrackets(iiiBracketValues),
          sharesByBracket: sharesMap(iiiDistribution),
          issCap: toIssCap(iiiIssCap),
        },
        V: { brackets: toBrackets(vBracketValues), sharesByBracket: sharesMap(vDistribution) },
      },
    },
  };
}
