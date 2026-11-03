/**
 * One bracket (faixa) of an annex table. Values are decimal strings; rates are fractions.
 * The catalog never holds real values without an official source (see PLACEHOLDERs).
 */
export interface RevenueBracket {
  readonly order: number;
  /** Upper RBT12 limit of the bracket (inclusive), in BRL. */
  readonly upperRbt12Limit: string;
  /** Nominal rate as a fraction. */
  readonly nominalRate: string;
  /** Amount to deduct (parcela a deduzir), in BRL. */
  readonly deduction: string;
}
