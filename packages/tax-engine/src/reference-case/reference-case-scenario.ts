/** Minimum scenario list agreed for reference cases (docs/07-casos-de-referencia.md). */
export const REFERENCE_CASE_SCENARIOS = [
  'no_divergence',
  'known_divergence',
  'start_of_activity',
  'bracket_change',
  'month_without_revenue',
  'factor_r_27_99',
  'factor_r_28_00',
] as const;

export type ReferenceCaseScenario = (typeof REFERENCE_CASE_SCENARIOS)[number];
