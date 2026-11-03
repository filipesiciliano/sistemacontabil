import type { Approval } from '../rule/approval.js';
import { placeholder } from '../rule/parameter.js';

/** D3: the two stakeholders (accountants) are the tax responsibles for every rule. */
export const TAX_RESPONSIBLES = 'tax-responsibles (stakeholders)';

export const DRAFT_APPROVAL: Approval = { status: 'draft', approvedBy: [] };

export const PLACEHOLDER_VALIDITY = placeholder(
  'PLACEHOLDER_VALIDITY',
  'First competence in which this version applies, confirmed against the official source.',
);
