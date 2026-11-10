import type { AnyRuleDefinition } from './rule/rule-definition.js';
import { annexIiiBracketsV1 } from './rules/simples-nacional/annex-iii-brackets.v1.js';
import { annexIiiTaxDistributionV1 } from './rules/simples-nacional/annex-iii-tax-distribution.v1.js';
import { annexVBracketsV1 } from './rules/simples-nacional/annex-v-brackets.v1.js';
import { annexVTaxDistributionV1 } from './rules/simples-nacional/annex-v-tax-distribution.v1.js';
import { factorRV1 } from './rules/simples-nacional/factor-r.v1.js';
import { rbt12V1 } from './rules/simples-nacional/rbt12.v1.js';
import { revenueLimitsV1 } from './rules/simples-nacional/revenue-limits.v1.js';

/**
 * Every version of each Simples Nacional rule shipped with this deploy, grouped by rule.
 * New versions are appended to their list, never edited in place.
 */
export const SIMPLES_NACIONAL_RULES = {
  rbt12: [rbt12V1],
  revenueLimits: [revenueLimitsV1],
  factorR: [factorRV1],
  annexIiiBrackets: [annexIiiBracketsV1],
  annexIiiTaxDistribution: [annexIiiTaxDistributionV1],
  annexVBrackets: [annexVBracketsV1],
  annexVTaxDistribution: [annexVTaxDistributionV1],
} as const;

/** Flat list of every rule version, used by governance checks. */
export const RULE_CATALOG: readonly AnyRuleDefinition[] =
  Object.values(SIMPLES_NACIONAL_RULES).flat();
