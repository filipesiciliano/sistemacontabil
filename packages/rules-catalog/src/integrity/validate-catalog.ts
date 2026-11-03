import { collectPlaceholderKeys, isPlaceholder } from '../rule/parameter.js';
import { ruleVersionRef, type AnyRuleDefinition } from '../rule/rule-definition.js';
import { validitiesOverlap } from '../rule/validity.js';
import type { CatalogViolation } from './catalog-violation.js';

function approvalViolations(rule: AnyRuleDefinition): string[] {
  if (rule.approval.status !== 'approved') return [];
  const messages: string[] = [];
  const placeholders = collectPlaceholderKeys(rule);
  if (placeholders.length > 0) {
    messages.push(`approved rule still contains placeholders: ${placeholders.join(', ')}`);
  }
  if (rule.approval.approvedBy.length === 0) messages.push('approved rule without approvers');
  if (rule.approval.approvedAt === undefined) messages.push('approved rule without approval date');
  if (rule.referenceCaseIds.length === 0) messages.push('approved rule without reference cases');
  return messages;
}

function overlapViolations(catalog: readonly AnyRuleDefinition[]): CatalogViolation[] {
  const violations: CatalogViolation[] = [];
  catalog.forEach((rule, index) => {
    catalog.slice(index + 1).forEach((other) => {
      if (rule.id !== other.id) return;
      if (isPlaceholder(rule.validity) || isPlaceholder(other.validity)) return;
      const bothActive =
        rule.approval.status === 'approved' && other.approval.status === 'approved';
      if (bothActive && validitiesOverlap(rule.validity, other.validity)) {
        violations.push({
          ruleRef: ruleVersionRef(other),
          message: `validity overlaps with ${ruleVersionRef(rule)}`,
        });
      }
    });
  });
  return violations;
}

/** Governance checks enforced in CI for every rule in the catalog. */
export function validateCatalog(catalog: readonly AnyRuleDefinition[]): CatalogViolation[] {
  const seen = new Set<string>();
  const violations: CatalogViolation[] = [];

  for (const rule of catalog) {
    const ref = ruleVersionRef(rule);
    if (seen.has(ref)) violations.push({ ruleRef: ref, message: 'duplicated id and version' });
    seen.add(ref);
    if (rule.owner.trim() === '') violations.push({ ruleRef: ref, message: 'missing owner' });
    for (const message of approvalViolations(rule)) violations.push({ ruleRef: ref, message });
  }

  return [...violations, ...overlapViolations(catalog)];
}
