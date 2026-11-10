import type { AnnexCalculation } from './annex-calculation.js';

export type NotCalculatedReason =
  | 'missing_amount'
  | 'missing_activity_taxation'
  | 'missing_rbt12'
  | 'out_of_coverage'
  | 'above_last_bracket';

interface EntryIdentity {
  readonly entryId: string;
  readonly establishmentId: string;
  readonly activityId: string;
}

/** Outcome for one segregated revenue entry of the competence. */
export type EntryResult =
  | (EntryIdentity & { readonly outcome: 'calculated'; readonly calculation: AnnexCalculation })
  | (EntryIdentity & {
      /** Fator R could not be computed: both scenarios are shown, none is concluded. */
      readonly outcome: 'annex_undetermined';
      readonly alternatives: readonly AnnexCalculation[];
    })
  | (EntryIdentity & { readonly outcome: 'not_calculated'; readonly reason: NotCalculatedReason });
