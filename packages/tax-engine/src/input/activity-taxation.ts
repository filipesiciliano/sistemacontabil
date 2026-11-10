/**
 * How an activity is taxed, as classified by the user and reviewed by the accountant.
 * The CNAE helps but does not decide this alone (scope §4).
 */
export const ACTIVITY_TAXATIONS = ['annex_iii', 'factor_r', 'annex_iv', 'goods', 'other'] as const;

export type ActivityTaxation = (typeof ACTIVITY_TAXATIONS)[number];
