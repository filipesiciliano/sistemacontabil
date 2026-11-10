import type { Decimal } from '@platform/shared-types';
import type { BracketValues } from '../rules/annex-tables.js';

/** Bracket whose inclusive upper limit covers the RBT12; undefined above the last bracket. */
export function findBracket(
  brackets: readonly BracketValues[],
  rbt12: Decimal,
): BracketValues | undefined {
  return brackets.find((bracket) => rbt12.lessThanOrEqualTo(bracket.upperRbt12Limit));
}
