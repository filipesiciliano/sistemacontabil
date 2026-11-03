/**
 * Approval happens in the pull request flow (D9). The status recorded here is the result of that
 * review and is checked by the catalog integrity tests.
 */
export const APPROVAL_STATUSES = ['draft', 'in_review', 'approved', 'retired'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface Approval {
  readonly status: ApprovalStatus;
  /** Tax responsibles who approved the rule (required when `approved`). */
  readonly approvedBy: readonly string[];
  /** ISO date of the approval (required when `approved`). */
  readonly approvedAt?: string;
  /** Pull request that carried the approval, e.g. `owner/repo#123`. */
  readonly pullRequest?: string;
}
