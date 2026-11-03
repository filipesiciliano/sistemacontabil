import type { AnyRuleDefinition } from './rule/rule-definition.js';
import { annexIiiBracketsV1 } from './rules/simples-nacional/annex-iii-brackets.v1.js';
import { annexIiiTaxDistributionV1 } from './rules/simples-nacional/annex-iii-tax-distribution.v1.js';
import { annexVBracketsV1 } from './rules/simples-nacional/annex-v-brackets.v1.js';
import { annexVTaxDistributionV1 } from './rules/simples-nacional/annex-v-tax-distribution.v1.js';
import { factorRV1 } from './rules/simples-nacional/factor-r.v1.js';
import { rbt12V1 } from './rules/simples-nacional/rbt12.v1.js';
import { revenueLimitsV1 } from './rules/simples-nacional/revenue-limits.v1.js';

/** Every rule version shipped with this deploy. New versions are appended, never edited in place. */
export const RULE_CATALOG: readonly AnyRuleDefinition[] = [
  rbt12V1,
  revenueLimitsV1,
  factorRV1,
  annexIiiBracketsV1,
  annexVBracketsV1,
  annexIiiTaxDistributionV1,
  annexVTaxDistributionV1,
];
