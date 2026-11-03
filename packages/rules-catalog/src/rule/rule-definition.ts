import type { Approval } from './approval.js';
import type { OfficialSource } from './official-source.js';
import type { Parameter } from './parameter.js';
import type { RuleScope } from './rule-scope.js';
import type { RuleValidity } from './validity.js';

/**
 * A versioned tax rule. Required fields mirror the stakeholder scope (§8):
 * identification, official source, validity, scope, owner, tests and approval status.
 */
export interface RuleDefinition<TParameters> {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly officialSource: Parameter<OfficialSource>;
  readonly validity: RuleValidity;
  readonly scope: RuleScope;
  /** Who is responsible for validating the rule (D3: the tax responsibles). */
  readonly owner: string;
  /** Reference case ids (packages/tax-engine/test/reference-cases) that exercise this rule. */
  readonly referenceCaseIds: readonly string[];
  readonly approval: Approval;
  readonly parameters: TParameters;
}

export type AnyRuleDefinition = RuleDefinition<unknown>;

/** Stable reference to the exact rule version used by a calculation (stored in snapshots). */
export function ruleVersionRef(rule: AnyRuleDefinition): string {
  return `${rule.id}@v${String(rule.version)}`;
}
